import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api"; // 💡 If yours is a named export, change to: import { API_URL } from "../api";
import { 
  Mail, ArrowLeft, Calendar, 
  ShieldCheck, Activity, User as UserIcon 
} from "lucide-react";

export default function UserProfile() {
  const { id } = useParams(); // Grabs the /user/:id parameter from the URL string
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        
        // ✅ CORRECT ENDPOINT: Targets the shared /api/admin/user route tree
        const res = await fetch(`${API_URL}/api/admin/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "User profile could not be loaded.");
        
        setUserData(data);
      } catch (err) {
        console.error("Catch block hit inside UserProfile:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />
      
      {/* Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 font-semibold transition-colors w-fit"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Loading profile data...</p>
          </div>
        ) : error ? (
          /* ERROR STATE (Displays clear details on-screen if endpoint fails) */
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-8 rounded-3xl text-center max-w-md mx-auto">
            <p className="text-red-500 font-bold text-lg mb-2">Profile Unavailable</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-mono bg-white dark:bg-gray-900 p-3 rounded-xl border mt-2">
              {error}
            </p>
          </div>
        ) : userData && (
          /* SUCCESS DISPLAY CONTENT CARD */
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-[2rem] shadow-xl overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative" />
            
            <div className="px-6 sm:px-10 pb-10">
              {/* Avatar profile initial */}
              <div className="relative flex justify-center -mt-16 mb-6">
                <div className="w-32 h-32 bg-gray-900 dark:bg-gray-950 rounded-full p-2">
                 <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center font-bold text-4xl rounded-full shadow-inner overflow-hidden relative">
  {userData?.profilePic ? (
    // Scenario A: Profile picture exists -> Display the Resident's Image
    <img 
      src={`${API_URL}${userData.profilePic}`} 
      alt={userData.fullName || "Resident Profile"} 
      className="w-full h-full object-cover"
      onError={(e) => {
        // Fallback guard if image fails to render over the network
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  ) : null}

  {/* Scenario B: No profile picture -> Display Initials fallback block */}
  <span className={userData?.profilePic ? "hidden" : "flex items-center justify-center"}>
    {userData.fullName?.charAt(0).toUpperCase() || "U"}
  </span>
</div>
                </div>
              </div>

              {/* Identity & Badges */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                  {userData.fullName}
                  {userData.role === "admin" && (
                    <ShieldCheck className="text-purple-500" size={24} />
                  )}
                </h1>
                
                {userData.role === "admin" ? (
                  <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-bold uppercase tracking-wider rounded-full">
                    Apartment Admin
                  </span>
                ) : (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                    Resident
                  </span>
                )}
              </div>

              {/* Profile Details Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-950/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm text-gray-500 dark:text-gray-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{userData.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-950/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Community</p>
                    <p className="text-gray-900 dark:text-white font-medium mt-1">{formatDate(userData.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
                 <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold">
                   <Activity size={16} /> Verified Resident
                 </div>
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}