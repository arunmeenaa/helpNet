import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from '../api'; 
import SkeletonCard from '../components/SkeletonCard';
import { jwtDecode } from "jwt-decode";
import { LogIn, Search, ShieldAlert } from "lucide-react"; 

export default function RequestsFeed() {
  const navigate = useNavigate(); 
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const apartmentId = storedUser.apartmentId;

  const isAdmin = storedUser?.role === "admin";
  // 💡 FIXED: Define currentUserId here so it is available to the entire component
  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId = decodedToken?.id || decodedToken?.sub;

  // ==========================================
  // 🚨 GUEST GUARD (Premium Glassmorphism Alert)
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Animated Background Blurs */}
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-md w-full relative group">
            {/* Outer Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-[2.6rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 md:p-12 border border-white/20 dark:border-gray-800/50 text-center animate-in fade-in zoom-in duration-700">
              
              {/* Centered Security Icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-purple-500/20 rounded-3xl -rotate-6 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-purple-500/40">
                  <Search size={44} strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 leading-tight">
                Community Feed Restricted
              </h2>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-10 px-2">
                Neighbor requests are visible only to verified residents. Sign in to see what’s happening in your apartment.
              </p>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate("/login")} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/25 group"
                >
                  <LogIn size={22} className="group-hover:translate-x-1 transition-transform" /> 
                  Sign In to View Feed
                </button>
                
                <Link to="/register" className="block py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
                  New to HelpNet? <span className="underline decoration-2 underline-offset-4 font-black">Join now</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ==========================================
  // 👤 FETCH LOGIC
  // ==========================================
  useEffect(() => {
    const fetchRequests = async () => {
      if (!apartmentId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 403) {
          const updatedUser = { ...storedUser, apartmentId: null, isEvicted: true };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          window.dispatchEvent(new Event("local-storage-update"));
          navigate("/dashboard");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch requests");
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token, apartmentId, navigate]);

  if (!apartmentId) {
     navigate("/dashboard");
     return null;
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "All" || req.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityStyles = (level) => {
    if (level === "High") return "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
    if (level === "Medium") return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    return "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      {/* Decorative Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="px-4 py-1.5 text-xs font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase bg-blue-100 dark:bg-cyan-900/30 rounded-full mb-4 inline-block">
              Community Needs
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Help Requests
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white"
            />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>
        </div>

        {/* State Handling */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl">
            <p className="text-red-500 font-medium">⚠️ {error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 text-sm font-bold text-blue-600 underline">Try Again</button>
          </div>
        )}

        {/* Requests Grid */}
        {!loading && !error && filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => {
              const isOwner = currentUserId?.toString() === (req.author?._id?.toString() || req.author?.toString());

              return (
                <div 
                  key={req._id} 
                  className={`group flex flex-col h-full rounded-3xl p-6 sm:p-8 transition-all duration-300 relative border ${
                    isOwner 
                      ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.2)] ring-2 ring-blue-500/20" 
                      : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl"
                  }`}
                >
                  {isOwner && (
                    <div className="absolute -top-3 left-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest z-20">
                      Your Request
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isOwner ? "bg-blue-600 text-white shadow-md" : "bg-blue-100 dark:bg-gray-800 text-blue-600 dark:text-cyan-400"
                      }`}>
                        {req.author?.fullName ? req.author.fullName.charAt(0) : "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {req.author?.fullName || "Anonymous"} 
                          {isOwner && <span className="ml-2 text-[10px] text-blue-500">(You)</span>}
                        </p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border ${getPriorityStyles(req.priority)}`}>
                      {req.priority}
                    </span>
                  </div>

                  <div className="flex-grow mb-6">
                    <h3 className={`text-xl font-bold mb-3 line-clamp-2 leading-tight transition-colors ${
                      isOwner ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-white group-hover:text-blue-600"
                    }`}>
                      {req.title}
                    </h3>
                    <div className={`flex items-center gap-2 text-sm font-medium p-3 rounded-xl ${
                      isOwner ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                    }`}>
                      <span className="truncate">📍 {req.location}</span>
                    </div>
                  </div>

                  {isOwner ? (
  <Link to="/dashboard">
    <button className="w-full py-3.5 rounded-xl font-bold text-base bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all">
      Manage My Request
    </button>
  </Link>
) : !isAdmin ? ( // 👈 ONLY show "I Can Help" if NOT an admin
  <Link to={`/request-details/${req._id}`}>
    <button className="w-full py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:scale-[1.02] transition-all">
      I Can Help
    </button>
  </Link>
) : (
  <div className="w-full py-3.5 rounded-xl text-center text-gray-400 text-sm font-medium border border-dashed">
    View Only
  </div>
)}
                </div>
              );
            })}
          </div>
        ) : !loading && !error && (
          <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active requests</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}