import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // Check if the user is logged in by looking for the token
  const token = localStorage.getItem("token");

  // If there is no token, instantly redirect them to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If they have a token, let them see the page they requested!
  return children;
}