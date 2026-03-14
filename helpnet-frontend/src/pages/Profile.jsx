import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api"; // 👈 ADD THIS IMPORT

export default function Profile() {
  const [stats, setStats] = useState({ requests: 0, offers: 0 });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetching from the fixed /me endpoints
        const [requestsRes, offersRes] = await Promise.all([
          fetch(`${API_URL}/api/requests/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/offers/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (requestsRes.ok && offersRes.ok) {
          const requestsData = await requestsRes.json();
          const offersData = await offersRes.json();
          
          // These will now contain the actual posts linked to the user ID
          setStats({ 
            requests: Array.isArray(requestsData) ? requestsData.length : 0, 
            offers: Array.isArray(offersData) ? offersData.length : 0 
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <div className="flex-grow w-full max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-500 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-3xl font-bold text-gray-700 dark:text-gray-200 uppercase">
                  {user.fullName ? user.fullName.charAt(0) : "U"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {user.fullName || "Community Member"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {user.email || "No email provided"}
                </p>
              </div>
              
              <Link to="/dashboard">
                <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                  Go to Dashboard
                </button>
              </Link>
            </div>

            <hr className="border-gray-100 dark:border-gray-800 mb-8" />

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Community Impact</h3>
            
            {loading ? (
              <div className="animate-pulse flex gap-4">
                <div className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
                <div className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
                  <div className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400 mb-1">{stats.requests}</div>
                  <div className="text-sm font-semibold text-blue-800/70 dark:text-cyan-500/70 uppercase tracking-wide">Requests Posted</div>
                </div>
                <div className="p-6 rounded-2xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 text-center">
                  <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mb-1">{stats.offers}</div>
                  <div className="text-sm font-semibold text-teal-800/70 dark:text-teal-500/70 uppercase tracking-wide">Offers Made</div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 italic">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}</p>
              <button 
                onClick={handleLogout}
                className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}