import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Mail, Lock } from "lucide-react";

import API_URL from "../../api";
import { loginUser } from "../../services/authService";
export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // LOGIN
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const loginToast = toast.loading("Authenticating...");

    try {
      const data = await loginUser(formData.email, formData.password);

      // ==========================================
      // SAVE AUTH DATA
      // ==========================================
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ==========================================
      // GET ACTUAL ROLE
      // ==========================================
      const actualRole = data.user.role;

      // ==========================================
      // SUCCESS MESSAGE
      // ==========================================
      toast.success(
        actualRole === "owner"
          ? `Welcome ${data.user.fullName}! 👑`
          : `Welcome back, ${data.user.fullName}! 🎉`,
        {
          id: loginToast,
        },
      );

      
      if (actualRole === "owner") {
        navigate("/owner-dashboard");
      } else if (actualRole === "resident") {
        navigate("/dashboard");
      } else if (actualRole === "admin") {
       
        navigate("/owner-dashboard");
      } else {
        throw new Error(`Invalid account role: ${actualRole || "undefined"}`);
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(err.message);

      toast.error(err.message, {
        id: loginToast,
      });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  // ==========================================
  // INPUT STYLE
  // ==========================================
  const inputStyle =
    "w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white transition-all";

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 sm:p-10 rounded-[2rem] shadow-2xl w-full max-w-md">
          {/* ==================================
              HEADER
          ================================== */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Sign in to your HelpNet account
            </p>
          </div>

          {/* ==================================
              GOOGLE LOGIN
          ================================== */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 mb-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-200 font-semibold shadow-sm active:scale-[0.98]"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-5 h-5"
              alt="Google Logo"
            />
            Continue with Google
          </button>

          {/* ==================================
              DIVIDER
          ================================== */}
          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800" />

            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Or
            </span>

            <div className="flex-grow border-t border-gray-200 dark:border-gray-800" />
          </div>

          {/* ==================================
              ERROR
          ================================== */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          {/* ==================================
              LOGIN FORM
          ================================== */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />

              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className={inputStyle}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />

              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className={inputStyle}
                required
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          {/* ==================================
              REGISTER
          ================================== */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 dark:text-cyan-400 font-bold hover:underline"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
