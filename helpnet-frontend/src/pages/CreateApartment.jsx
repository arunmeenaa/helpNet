import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import toast from "react-hot-toast";
import { Building2, Hash, Sparkles, ArrowRight } from "lucide-react";

export default function CreateApartment() {
  const [formData, setFormData] = useState({
    name: "",
    apartmentId: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    const createToast = toast.loading("Creating your community...");

    try {
      const res = await fetch(`${API_URL}/api/admin/create-apartment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Community created successfully! 🏢", { id: createToast });

      // 🔥 Update user in localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      user.apartmentId = formData.apartmentId;
      localStorage.setItem("user", JSON.stringify(user));
      
      // Notify other components (like Navbar) that the user data changed
      window.dispatchEvent(new Event("authChange"));

      // Send them to the dashboard to see their new empty state
      navigate("/admin");

    } catch (err) {
      toast.error(err.message, { id: createToast });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full pl-12 pr-4 py-3.5 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-900 dark:text-white transition-all backdrop-blur-sm";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 sm:p-10 rounded-[2rem] shadow-2xl w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-purple-500/30">
              <Sparkles size={32} strokeWidth={2} />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Create Community
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Set up your apartment block to generate invite codes for residents.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Apartment Name Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                Building Name
              </label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="e.g., Sunset Towers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputStyle}
                  required
                />
              </div>
            </div>

            {/* Apartment ID Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                Unique Apartment ID
              </label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="e.g., SUNSET-101"
                  value={formData.apartmentId}
                  onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value.toUpperCase().replace(/\s+/g, '-') })}
                  className={inputStyle}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                Residents will use this ID to join your community. Make it memorable!
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Create Apartment"} <ArrowRight size={20} />
            </button>
          </form>

        </div>
      </main>

      <Footer />
    </div>
  );
}