import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function PublicOnlyRoute({
  children,
}) {
  const token =
    localStorage.getItem("token");

  // ==========================================
  // NO TOKEN
  // ==========================================
  if (!token) {
    return children;
  }

  // ==========================================
  // CHECK TOKEN
  // ==========================================
  try {
    const decoded = jwtDecode(token);

    // ==========================================
    // ADMIN
    // ==========================================
    if (decoded.role === "admin") {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    // ==========================================
    // NORMAL USER
    // ==========================================
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  } catch (error) {
    console.error(
      "PublicOnlyRoute token error:",
      error
    );

    // Invalid/expired token
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return children;
  }
}