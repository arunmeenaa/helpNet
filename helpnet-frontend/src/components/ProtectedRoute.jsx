import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = jwtDecode(token);

    if (!user.apartmentId) {
      return <Navigate to="/set-apartment" replace />;
    }

    return children;

  } catch (err) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}