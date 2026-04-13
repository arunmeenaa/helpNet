import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import toast from "react-hot-toast";

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    adminKey: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Creating admin account...");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: "admin",              // 👑 request admin role
          adminKey: formData.adminKey // 🔐 send key
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // ✅ Save login
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Admin account created 👑", { id: toastId });

      setTimeout(() => {
        navigate("/admin");
      }, 1000);

    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-900 dark:text-white transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
               Admin Register
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Create your apartment admin account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className={inputStyle}
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={inputStyle}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={inputStyle}
              required
            />

            {/* 🔐 Admin Key */}
            <input
              type="password"
              placeholder="Enter Admin Key"
              value={formData.adminKey}
              onChange={(e) =>
                setFormData({ ...formData, adminKey: e.target.value })
              }
              className={inputStyle}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? "Creating..." : "Register as Admin"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already an admin?{" "}
            <Link
              to="/admin-login"
              className="text-purple-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Login
            </Link>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
}