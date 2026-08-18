import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({
  children,
  ownerOnly = false,
  residentOnly = false,
  allowBoth = false,
}) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // ==========================================
  // NO TOKEN
  // ==========================================
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role;

    // ==========================================
    // INVALID ROLE
    // ==========================================
    if (!["owner", "resident"].includes(role)) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }

    // ==========================================
    // OWNER ONLY
    // ==========================================
    if (ownerOnly && role !== "owner") {
      return <Navigate to="/dashboard" replace />;
    }

    // ==========================================
    // RESIDENT ONLY
    // ==========================================
    if (residentOnly && role !== "resident") {
      return (
        <Navigate
          to="/owner-dashboard"
          replace
        />
      );
    }

    // ==========================================
    // BOTH OWNER + RESIDENT
    // ==========================================
    if (allowBoth) {
      return children;
    }

    // ==========================================
    // RESIDENT APARTMENT CHECK
    // ==========================================
    if (role === "resident") {
      const localUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      if (!localUser.apartmentId) {
        const allowedPaths = [
          "/dashboard",
          "/set-apartment",
        ];

        if (!allowedPaths.includes(location.pathname)) {
          return (
            <Navigate
              to="/dashboard"
              replace
            />
          );
        }
      }
    }

    // ==========================================
    // DEFAULT
    // ==========================================
    return children;

  } catch (error) {
    console.error(
      "ProtectedRoute error:",
      error
    );

    localStorage.clear();

    return <Navigate to="/login" replace />;
  }
}