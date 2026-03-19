import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
// 💡 ADD THIS LINE BELOW
import API_URL from "../api"; 

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // Now API_URL will be defined!
      fetch(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => res.json())
      .then((uData) => {
        localStorage.setItem("user", JSON.stringify(uData));
        
        // This "shout" tells the Navbar to flip from "Sign In" to the Profile icon
        window.dispatchEvent(new Event("authChange")); 
        
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error("Login Error:", err);
        navigate("/login");
      });
    }
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