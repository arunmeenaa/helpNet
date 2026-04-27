import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, ShieldAlert, HandHelping, Search, Shield } from "lucide-react"; // Don't forget to import Link!
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from '../api'; // This tells the file where to get the value
import Loading from '../components/Loading';
import SkeletonCard from '../components/SkeletonCard'; // Adjust path if needed
import { jwtDecode } from "jwt-decode";



export default function AvailableHelp() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  

  // 1. Grab the currently logged-in user
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const hasApartment = !!storedUser.apartmentId;
  const navigate = useNavigate();
  const currentUser = token ? jwtDecode(token) : null;
 if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
        <Navbar />
        
        {/* Main takes up all remaining space minus Navbar/Footer */}
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          
          {/* Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-md w-full relative group">
            {/* The "Glow" behind the card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.6rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white/20 dark:border-gray-800/50 text-center animate-in fade-in zoom-in duration-500">
              
              {/* Security Icon with animated Ring */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-blue-500/20 rounded-3xl rotate-12 animate-pulse"></div>
                <div className="relative w-full h-full bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <ShieldAlert size={44} strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">
                Community Access Only
              </h2>
              
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-10 px-2">
                This community feed is private. Join your neighbors by signing in to view and offer help in your apartment.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/25 group"
                >
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" /> 
                  Sign In to Continue
                </button>
                
                <Link 
                  to="/register" 
                  className="block py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Don't have an account? <span className="underline decoration-2 underline-offset-4">Register</span>
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  
  }
useEffect(() => {
    // Only attempt to fetch if they have an apartment
    if (!hasApartment) {
      setLoading(false);
      return;
    }

    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/offers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOffers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [hasApartment, token]);
  
  // Fetch live offers from MongoDB
  useEffect(() => {
  const fetchOffers = async () => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    // 💡 1. STOP: If no token or no apartment, don't even try to fetch
    if (!token || !storedUser.apartmentId) {
      setLoading(false);
      return; 
    }

    try {
      const res = await fetch(`${API_URL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 💡 2. HANDLE EVICTION: If server returns 401/403
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token"); // Optional: clear token if 401
        navigate("/login"); 
        return;
      }

      const data = await res.json();
      setOffers(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchOffers();
},  []);

  const filteredOffers = offers.filter(
    (offer) =>
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getCategoryIcon = (category) => {
    const icons = {
      Transportation: "🚗",
      Supplies: "📦",
      Food: "🍲",
      Labor: "💪",
      Services: "🛠️",
      Equipment: "⚡",
    };
    return icons[category] || "🤝";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="px-4 py-1.5 text-xs font-bold tracking-widest text-teal-600 dark:text-teal-400 uppercase bg-teal-100 dark:bg-teal-900/30 rounded-full mb-4 inline-block">
              Community Offers
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Available Support
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Browse offers from neighbors who are ready to lend a hand, share
              supplies, or provide essential services.
            </p>
          </div>

          <div className="w-full md:w-96 relative group">
            <input
              type="text"
              placeholder="Search by keyword, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-teal-500/50 outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

  {/* Replace the old loading spinner with this skeleton grid */}
{loading && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
)}
        {error && (
  <div className="text-center py-20 px-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl">
    <p className="text-red-500 font-medium">⚠️ {error}</p>
    <button 
      onClick={() => window.location.reload()} 
      className="mt-4 text-sm font-bold text-teal-600 underline"
    >
      Try Again
    </button>
  </div>
)}

        {/* Offers Grid */}
{!loading && !error && filteredOffers.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredOffers.map((offer) => {
  // 💡 THE FIX: Standardize both IDs to strings for a perfect match
  const currentUserId = currentUser?.id;
  const authorId = offer.author?._id || offer.author;
  const isOwner = currentUserId?.toString() === authorId?.toString();

  return (
    <div 
      key={offer._id} 
      className={`group flex flex-col h-full rounded-3xl p-6 sm:p-8 transition-all duration-300 relative border ${
        isOwner 
          ? "bg-teal-50/50 dark:bg-teal-900/10 border-teal-400 dark:border-teal-500 shadow-[0_0_25px_rgba(20,184,166,0.2)] ring-2 ring-teal-500/20" 
          : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl"
      }`}
    >
          {/* 💡 "Your Offer" Badge */}
          {isOwner && (
            <div className="absolute -top-3 left-6 bg-teal-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest z-20">
              Your Offer
            </div>
          )}
          
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform duration-300 ${
                isOwner ? "bg-teal-600 text-white scale-110" : "bg-teal-50 dark:bg-teal-500/10"
              }`}>
                {getCategoryIcon(offer.category)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {offer.author?.fullName || "Anonymous"} 
                  {isOwner && <span className="ml-2 text-[10px] text-teal-600 font-bold">(You)</span>}
                </p>
                <p className="text-xs font-medium text-teal-600 dark:text-teal-400">
                  {offer.category}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-grow mb-6">
            <h3 className={`text-xl font-bold mb-4 line-clamp-2 leading-tight transition-colors ${
              isOwner ? "text-teal-700 dark:text-teal-400" : "text-gray-900 dark:text-white group-hover:text-teal-600"
            }`}>
              {offer.title}
            </h3>

            <div className="space-y-2.5">
              <div className={`flex items-start gap-2.5 text-sm p-2 rounded-lg ${
                isOwner ? "bg-teal-100/50 dark:bg-teal-900/30 text-teal-700" : "text-gray-600 dark:text-gray-400"
              }`}>
                <span>📍 {offer.location}</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-gray-500 px-2">
                <span>🕒 {offer.availability}</span>
              </div>
            </div>
          </div>

          {/* 💡 Button Logic */}
          {isOwner ? (
            <Link to="/dashboard">
              <button className="w-full py-3.5 rounded-xl font-bold text-base bg-teal-600 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-700 hover:-translate-y-0.5 transition-all">
                Manage Your Offer
              </button>
            </Link>
          ) : (
            <Link to={`/offer-details/${offer._id}`}>
              <button className="w-full py-3.5 rounded-xl font-bold text-base bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-500 dark:hover:text-gray-950 transition-all duration-300">
                Connect
              </button>
            </Link>
          )}
        </div>
      );
    })}
  </div>
        ) : (
          !loading &&
          !error && (
            <div className="text-center py-20 px-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No offers found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                We couldn't find any offers matching your search.
              </p>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
