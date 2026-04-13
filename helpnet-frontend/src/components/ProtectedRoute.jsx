import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    // 💡 Get the fresh user data from localStorage where 'apartmentId' might have been set to null
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");

    // 👑 ADMIN ACCESS
    if (decoded.role === "admin") {
      return children;
    }

    // 👤 USER LOGIC
    // 1. If they have no apartment and aren't already on the Dashboard or SetApartment
    if (!localUser.apartmentId) {
      const allowedPaths = ["/dashboard", "/set-apartment"];
      
      if (!allowedPaths.includes(location.pathname)) {
        // Force them to the dashboard so they see the "Join Community" / "Evicted" screen
        return <Navigate to="/dashboard" replace />;
      }
    }

    return children;

  } catch (err) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }
}