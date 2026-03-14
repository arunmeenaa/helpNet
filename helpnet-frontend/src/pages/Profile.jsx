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
  
  // 1. We'll use userData to hold everything about the user
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
          setLocation(uData.location || "Location not set");
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
        // Update both the local state and localStorage so it stays fresh
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

      <div className="flex-grow w-full max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-900/5 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-500 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-3xl font-bold text-gray-700 dark:text-gray-200 uppercase">
                  {userData.fullName ? userData.fullName.charAt(0) : "U"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {userData.fullName || "Community Member"}
                </h1>
                
                <div className="mt-2 flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input 
                        className="text-sm p-1.5 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        autoFocus
                      />
                      <button onClick={handleUpdateLocation} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg font-bold">Save</button>
                      <button onClick={() => setIsEditing(false)} className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-lg font-bold">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                        <span className="text-blue-500 text-lg">📍</span> {location}
                      </p>
                      <button 
                        onClick={() => setIsEditing(true)} 
                        className="text-[10px] text-blue-600 font-bold uppercase hover:underline"
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <Link to="/dashboard">
                <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                  Go to Dashboard
                </button>
              </Link>
            </div>

            <hr className="border-gray-100 dark:border-gray-800 mb-8" />

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">Your Community Impact</h3>
            
            {loading ? (
              <div className="animate-pulse flex gap-4">
                <div className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
                <div className="flex-1 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
                  <div className="text-3xl font-extrabold text-blue-600 dark:text-cyan-400 mb-1">{stats.requests}</div>
                  <div className="text-[10px] font-bold text-blue-800/70 dark:text-cyan-500/70 uppercase tracking-widest">Requests</div>
                </div>
                <div className="p-6 rounded-2xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/30 text-center">
                  <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 mb-1">{stats.offers}</div>
                  <div className="text-[10px] font-bold text-teal-800/70 dark:text-teal-500/70 uppercase tracking-widest">Offers</div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 italic">Member since {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'recently'}</p>
              <button 
                onClick={handleLogout}
                className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2"
              >
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