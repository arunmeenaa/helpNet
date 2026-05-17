import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// 🌟 FIX: Added allowBoth flag option parameter defaulting to false
export default function ProtectedRoute({ children, adminOnly = false, allowBoth = false }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role; // Assuming your JWT payload includes 'role'
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");

    // 1. ADMIN PROTECTION
    // If the route is adminOnly, but the user is NOT an admin, block them.
    if (adminOnly && userRole !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    // 🌟 2. RESIDENT PROTECTION MODIFIED (Allows bypass if allowBoth is true)
    // If the user IS an admin, but the page doesn't explicitly welcome both, redirect them to admin dashboard
    if (!adminOnly && !allowBoth && userRole === "admin") {
      return <Navigate to="/admin" replace />;
    }

    // 3. APARTMENT LOGIC (Residents only)
    // If user is a resident and missing an apartment, force them to Dashboard/SetApartment
    if (userRole !== "admin" && !localUser.apartmentId) {
      const allowedPaths = ["/dashboard", "/set-apartment"];
      if (!allowedPaths.includes(location.pathname)) {
        return <Navigate to="/dashboard" replace />;
      }
    }

    // If all checks pass
    return children;

  } catch (err) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
}