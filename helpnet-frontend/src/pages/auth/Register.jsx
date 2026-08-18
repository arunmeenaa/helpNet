import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/authService";
import toast from "react-hot-toast";

import {
  UserRound,
  Building2,
  ArrowLeft,
  Mail,
  Lock,
  MapPin,
} from "lucide-react";

export default function Register() {
  // ==========================================
  // ROLE
  // ==========================================
  const [registerRole, setRegisterRole] = useState(null);

  // ==========================================
  // FORM
  // ==========================================
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    location: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // SELECT ROLE
  // ==========================================
  const selectRole = (role) => {
    setRegisterRole(role);
    setError("");
  };

  // ==========================================
  // REGISTER
  // ==========================================
  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");

  if (!registerRole) {
    toast.error("Please select your account type.");
    return;
  }

  setLoading(true);

  const registerToast = toast.loading(
    "Creating your account..."
  );

  try {
    const data = await registerUser({
      fullName: formData.fullName,
      email: formData.email,
      location: formData.location,
      password: formData.password,
      role: registerRole,
    });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    toast.success(
      `Welcome to HelpNet, ${data.user.fullName}! 🎉`,
      {
        id: registerToast,
      }
    );

    if (data.user.role === "owner") {
      navigate("/owner-dashboard");
    } else {
      navigate("/dashboard");
    }

  } catch (err) {
    console.error("Registration error:", err);

    setError(err.message);

    toast.error(err.message, {
      id: registerToast,
    });

  } finally {
    setLoading(false);
  }
};

  // ==========================================
  // INPUT STYLE
  // ==========================================
  const inputStyle =
    "w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all";

  // ==========================================
  // ROLE SELECTION
  // ==========================================
  if (!registerRole) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <main className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Join HelpNet
              </h1>

              <p className="mt-3 text-gray-500 dark:text-gray-400">
                Choose the type of account you want to create
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* =================================
                  RESIDENT
              ================================= */}

              <button
                type="button"
                onClick={() => selectRole("resident")}
                className="group text-left bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-7 shadow-xl hover:-translate-y-1 hover:border-blue-500 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <UserRound size={32} strokeWidth={2} />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Resident
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Join your apartment community, request help, offer help and
                  connect with your neighbors.
                </p>

                <div className="mt-6 text-blue-600 dark:text-blue-400 font-bold">
                  Create Resident Account →
                </div>
              </button>

              {/* =================================
                  OWNER
              ================================= */}

              <button
                type="button"
                onClick={() => selectRole("owner")}
                className="group text-left bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-7 shadow-xl hover:-translate-y-1 hover:border-purple-500 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Building2 size={32} strokeWidth={2} />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Apartment Owner
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Create and manage an apartment community and handle resident
                  requests.
                </p>

                <div className="mt-6 text-purple-600 dark:text-purple-400 font-bold">
                  Create Owner Account →
                </div>
              </button>
            </div>

            <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // REGISTRATION FORM
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md">
          {/* Back */}
          <button
            type="button"
            onClick={() => {
              setRegisterRole(null);
              setError("");
            }}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
          >
            <ArrowLeft size={17} />
            Change account type
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                registerRole === "owner"
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              {registerRole === "owner" ? (
                <Building2 size={32} />
              ) : (
                <UserRound size={32} />
              )}
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {registerRole === "owner"
                ? "Owner Registration"
                : "Resident Registration"}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {registerRole === "owner"
                ? "Create your apartment owner account"
                : "Create an account and join your community"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="relative">
              <UserRound
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fullName: e.target.value,
                  })
                }
                className={inputStyle}
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
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

            {/* Location */}
            <div className="relative">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                type="text"
                placeholder="City or Neighborhood"
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value,
                  })
                }
                className={inputStyle}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                type="password"
                placeholder="Password (Min 6 chars)"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className={inputStyle}
                required
                minLength={6}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-4 rounded-xl text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-70 ${
                registerRole === "owner"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                  : "bg-gradient-to-r from-blue-600 to-cyan-500"
              }`}
            >
              {loading
                ? "Creating Account..."
                : registerRole === "owner"
                  ? "Register as Owner"
                  : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-blue-600 dark:text-cyan-400 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
