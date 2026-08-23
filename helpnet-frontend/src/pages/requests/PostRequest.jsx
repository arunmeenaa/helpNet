import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { createRequest } from "../../services/requestService";

export default function PostRequest() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    priority: "Medium",
    visibility: "apartment",
    radius: 2,
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Pull the logged-in user so we know whether they've set an apartment yet.
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const hasApartment = Boolean(user?.apartmentId);

  // If the user has no apartment, "apartment" visibility isn't a valid choice —
  // default them over to "nearby" so the form isn't stuck on a disabled option.
  useEffect(() => {
    if (!hasApartment && formData.visibility === "apartment") {
      setFormData((prev) => ({ ...prev, visibility: "nearby" }));
    }
  }, [hasApartment]);

  const handleVisibilityChange = (visibility) => {
    if (visibility === "apartment") {
      if (!hasApartment) return;
      setFormData((prev) => ({ ...prev, visibility }));
      return;
    }

    if (!navigator.geolocation) {
      setError("Your browser does not support location access. Please use Apartment visibility.");
      return;
    }

    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData((prev) => ({
          ...prev,
          visibility: "nearby",
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
      },
      () => {
        setError("Location access is required for Nearby posts. Please allow location access and try again.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await createRequest({
        ...formData,
        priority: formData.priority.toLowerCase(),
      });

      navigate("/dashboard?tab=requests");
    } catch (err) {
      console.error("POST REQUEST ERROR:", err);

      setError(err.message || "Failed to post request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-xl transform transition-all mt-4 md:mt-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white mb-5 shadow-lg shadow-blue-500/30">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Post a Help Request
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                Request Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="E.g., Need a jumper cable, Need a blood donor..."
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Provide more details about your situation..."
                rows="4"
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white resize-none"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="City, Neighborhood, etc."
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
                  Urgency Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white cursor-pointer"
                  required
                >
                  <option value="High">🔴 High (Emergency)</option>
                  <option value="Medium">🟡 Medium (Important)</option>
                  <option value="Low">🟢 Low (Not Urgent)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Who should see this?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleVisibilityChange("apartment")}
                  disabled={!hasApartment}
                  title={!hasApartment ? "Set your apartment first to use this option" : undefined}
                  className={`p-4 rounded-xl border text-left transition ${
                    !hasApartment
                      ? "border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed"
                      : formData.visibility === "apartment"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="font-bold text-gray-900 dark:text-white">
                    🏢 My Apartment
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Only residents of my apartment
                  </p>

                  {!hasApartment && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2">
                      Set apartment first
                    </p>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleVisibilityChange("nearby")}
                  className={`p-4 rounded-xl border text-left transition ${
                    formData.visibility === "nearby"
                      ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="font-bold text-gray-900 dark:text-white">
                    📍 Nearby
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    People near my location
                  </p>
                </button>
              </div>

              {!hasApartment && (
                <p className="text-xs text-gray-500 mt-2">
                  You haven't set an apartment yet.{" "}
                  <Link
                    to="/profile"
                    className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline"
                  >
                    Set your apartment
                  </Link>{" "}
                  to post requests visible to your building.
                </p>
              )}
            </div>
            {formData.visibility === "nearby" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Search Radius
                </label>
                <select
                  value={formData.radius}
                  onChange={(e) =>
                    setFormData({ ...formData, radius: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
                >
                  <option value={2}>Within 2 km</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={20}>Within 20 km</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Your current location is used only to determine who is nearby.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (formData.visibility === "nearby" && (formData.latitude == null || formData.longitude == null))}
              className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 disabled:opacity-70 transition-all"
            >
              {loading ? "Broadcasting..." : "Broadcast Request"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}