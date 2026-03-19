import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from '../api'; 
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const loginToast = toast.loading('Authenticating...');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user.fullName || 'User'}! 🎉`, { id: loginToast });
      
      // Delay redirect slightly so user can see the success toast
      setTimeout(() => navigate("/dashboard"), 1000);

    } catch (err) {
      setError(err.message);
      toast.error(err.message, { id: loginToast });
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = () => {
    // Redirects directly to the backend route we created
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const inputStyle = "w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Please sign in to your HelpNet account
            </p>
          </div>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 mb-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-200 font-semibold shadow-sm active:scale-[0.98]"
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google Logo" />
            Continue with Google
          </button>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="hello@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputStyle}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputStyle}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="text-blue-600 dark:text-cyan-400 font-bold hover:underline">Create one now</Link>
          </p>

        </div>
      </main>
      <Footer />
    </div>
  );
}