import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({
  children,
  ownerOnly = false,
  residentOnly = false,
  allowBoth = false,
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role;

    // Validate role
    if (!["owner", "resident"].includes(role)) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }

    // Owner-only route
    if (ownerOnly && role !== "owner") {
      return <Navigate to="/dashboard" replace />;
    }

    // Resident-only route
    if (residentOnly && role !== "resident") {
      return <Navigate to="/owner-dashboard" replace />;
    }

    // Both owner and resident are allowed
    if (allowBoth) {
      return children;
    }

    return children;
  } catch (error) {
    console.error("ProtectedRoute error:", error);

    localStorage.clear();

    return <Navigate to="/login" replace />;
  }
}