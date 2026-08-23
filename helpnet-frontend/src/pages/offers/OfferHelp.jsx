import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { createOffer } from "../../services/offerService";

export default function OfferHelp() {
  const [formData, setFormData] = useState({
  title: "",
  description: "",
  category: "",
  location: "",
  availability: "",
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
    await createOffer(formData);

    navigate("/dashboard?tab=offers");

  } catch (err) {
    console.error("CREATE OFFER ERROR:", err);

    setError(
      err.message || "Failed to post offer. Please try again."
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-xl transform transition-all mt-4 md:mt-8 mb-8">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white mb-5 shadow-lg shadow-teal-500/30">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Offer Your Help
            </h2>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">What are you offering?</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="E.g., Can provide a ride, Extra baby formula..."
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-teal-500/50 outline-none text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Details & Conditions</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Provide more details..."
                rows="4"
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-teal-500/50 outline-none text-gray-900 dark:text-white resize-none"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-teal-500/50 outline-none text-gray-900 dark:text-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Select a category...</option>
                  <option value="Transportation">🚗 Transportation</option>
                  <option value="Supplies">📦 Supplies & Goods</option>
                  <option value="Food">🍲 Food & Water</option>
                  <option value="Labor">💪 Physical Labor</option>
                  <option value="Services">🛠️ Skills & Services</option>
                  <option value="Equipment">⚡ Tools & Equipment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Location / Area</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Neighborhood or Zip"
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-teal-500/50 outline-none text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Your Availability</label>
              <input
                type="text"
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                placeholder="E.g., Today after 5 PM, Weekends only..."
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-teal-500/50 outline-none text-gray-900 dark:text-white"
                required
              />
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
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="font-bold text-gray-900 dark:text-white">🏢 My Apartment</div>
                  <p className="text-xs text-gray-500 mt-1">Only residents of my apartment</p>

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
                  <div className="font-bold text-gray-900 dark:text-white">📍 Nearby</div>
                  <p className="text-xs text-gray-500 mt-1">People within your selected radius</p>
                </button>
              </div>

              {!hasApartment && (
                <p className="text-xs text-gray-500 mt-2">
                  You haven't set an apartment yet.{" "}
                  <Link
                    to="/profile"
                    className="text-teal-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Set your apartment
                  </Link>{" "}
                  to offer help visible to your building.
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
                  onChange={(e) => setFormData({ ...formData, radius: Number(e.target.value) })}
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white"
                >
                  <option value={2}>Within 2 km</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={20}>Within 20 km</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Your current location is used to determine nearby visibility.</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || (formData.visibility === "nearby" && (formData.latitude == null || formData.longitude == null))}
              className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold text-lg shadow-lg hover:-translate-y-0.5 disabled:opacity-70 transition-all"
            >
              {loading ? "Posting Offer..." : "Post Offer"}
            </button>
          </form>

        </div>
      </main>
      <Footer />
    </div>
  );
}