// src/components/PublicOnlyRoute.jsx
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const decoded = jwtDecode(token);
      // If they are an admin, send to admin panel, else send to user dashboard
      return decoded.role === "admin" ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
    } catch (err) {
      // If token is invalid/corrupted, clear it and let them see the login page
      localStorage.clear();
      return children;
    }
  }

  // If no token exists, they are free to see Login/Register
  return children;
}