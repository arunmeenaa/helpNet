import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
// 💡 ADD THIS LINE BELOW
import { getCurrentUser } from "../../services/authService";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

useEffect(() => {
  const token = searchParams.get("token");

  if (!token) {
    navigate("/login");
    return;
  }

  const finalizeLogin = async () => {
    try {
      // Save token first because apiClient reads it
      // automatically from localStorage.
      localStorage.setItem("token", token);

      const userData = await getCurrentUser();

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      window.dispatchEvent(
        new Event("authChange")
      );

      // Redirect based on actual role
      if (userData.role === "owner") {
        navigate("/owner-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("Login Error:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    }
  };

  finalizeLogin();
}, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-gray-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Finalizing login...</p>
      </div>
    </div>
  );
}