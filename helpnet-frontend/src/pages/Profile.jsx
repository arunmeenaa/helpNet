import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import { toast } from "react-hot-toast";

export default function Profile() {
  const [stats, setStats] = useState({ requests: 0, offers: 0 });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [location, setLocation] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const [requestsRes, offersRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/requests/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/offers/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } }) 
        ]);

        if (requestsRes.ok && offersRes.ok && userRes.ok) {
          const rData = await requestsRes.json();
          const oData = await offersRes.json();
          const uData = await userRes.json(); 
          
          setStats({ 
            requests: Array.isArray(rData) ? rData.length : 0, 
            offers: Array.isArray(oData) ? oData.length : 0 
          });

          setUserData(uData);
          setLocation(uData.location || ""); 
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullProfile();
  }, [navigate]);

  const handleUpdateLocation = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ location })
      });

      if (res.ok) {
        const updatedUser = { ...userData, location };
        setUserData(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
        toast.success("Location updated! 📍");
      }
    } catch (err) {
      toast.error("Failed to update location.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow w-full max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-blue-900/5 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          {/* Header Banner */}
          <div className="h-40 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 relative">
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 sm:left-12 sm:translate-x-0">
              <div className="w-28 h-28 rounded-3xl bg-white dark:bg-gray-900 p-1.5 shadow-2xl rotate-3">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-4xl font-black text-blue-600 dark:text-blue-400 uppercase -rotate-3">
                  {userData.fullName ? userData.fullName.charAt(0) : "U"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-20 pb-10 px-8 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div className="flex-grow">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {userData.fullName || "Community Member"}
                </h1>
                
                {/* ✉️ Email Section: Visible but neat */}
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {userData.email || "No email provided"}
                </p>

                {/* 📍 Location Pill Section */}
                <div className="mt-4 flex items-center justify-center sm:justify-start gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-blue-200 dark:border-blue-900">
                      <input 
                        className="bg-transparent text-sm px-3 py-1.5 outline-none dark:text-white w-44"
                        placeholder="Enter neighborhood..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        autoFocus
                      />
                      <button onClick={handleUpdateLocation} className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setIsEditing(true)}
                      className="group flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-full cursor-pointer hover:shadow-md transition-all"
                    >
                      <span className="text-blue-600 dark:text-blue-400 text-sm">📍</span>
                      <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {location || "Add Location"}
                      </span>
                      <svg className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </div>
                  )}
                </div>
              </div>
              
              <Link to="/dashboard" className="w-full sm:w-auto">
                <button className="w-full px-8 py-3 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg">
                  Dashboard
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">{stats.requests}</div>
                <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Requests</div>
              </div>
              <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <div className="text-3xl font-black text-teal-600 dark:text-teal-400 mb-1">{stats.offers}</div>
                <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Offers</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2026'}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full sm:w-auto px-8 py-3 text-red-600 font-black text-sm uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}