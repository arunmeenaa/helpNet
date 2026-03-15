import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import { toast } from "react-hot-toast";

export default function Profile() {
  const [stats, setStats] = useState({ requests: 0, offers: 0 });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  
  const [editingField, setEditingField] = useState(null); 
  const [tempValue, setTempValue] = useState("");

  const navigate = useNavigate();

useEffect(() => {
  const fetchFullProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      // 💡 Fetch User, Requests, and Offers at the same time
      const [userRes, requestsRes, offersRes] = await Promise.all([
        fetch(`${API_URL}/api/profile/me?t=${Date.now()}`, { 
          headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' } 
        }),
        fetch(`${API_URL}/api/requests/me`, { 
          headers: { Authorization: `Bearer ${token}` } 
        }),
        fetch(`${API_URL}/api/offers/me`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);

      if (userRes.ok && requestsRes.ok && offersRes.ok) {
        const uData = await userRes.json();
        const rData = await requestsRes.json();
        const oData = await offersRes.json();

        // Update Stats
        setStats({ 
          requests: Array.isArray(rData) ? rData.length : 0, 
          offers: Array.isArray(oData) ? oData.length : 0 
        });
        
        // Update Profile
        setUserData(uData);
        localStorage.setItem("user", JSON.stringify(uData));
      }
    } catch (err) { 
      console.error("Sync Error:", err); 
    } finally {
      setLoading(false);
    }
  };
  fetchFullProfile();
}, [navigate]);

  const startEditing = (field, value) => {
    setEditingField(field);
    setTempValue(value || "");
  };

  const detectLocation = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      if (data.city && data.region) {
        setTempValue(`${data.city}, ${data.region}`);
        toast.success("Location detected! Don't forget to save. ✨");
      }
    } catch (err) {
      toast.error("Failed to detect location.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async (field) => {
    if (isUpdating) return;
    if (field === 'email' && !tempValue.includes("@")) return toast.error("Invalid email");
    if (!tempValue.trim()) return toast.error("Field cannot be empty");

    const token = localStorage.getItem("token");
    setIsUpdating(true);
    
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ [field]: tempValue })
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = { ...userData, [field]: tempValue };
        setUserData(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditingField(null);
        toast.success(`${field.replace(/([A-Z])/g, ' $1')} updated!`);
      } else {
        toast.error(data.message || "Update failed.");
      }
    } catch (err) { 
      toast.error("Connection error."); 
    } finally { 
      setIsUpdating(false); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const EditableField = ({ label, value, fieldName, icon }) => {
    const isThisEditing = editingField === fieldName;
    
    return (
      <div className="group py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
          {label}
        </label>
        
        <div className="flex items-center justify-between gap-4 h-10">
          {isThisEditing ? (
            <div className="flex-grow flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
              <input 
                autoFocus
                className="flex-grow bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg outline-none border border-blue-200 dark:border-blue-800 text-sm dark:text-white"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                disabled={isUpdating}
              />
              
              {fieldName === 'location' && (
                <button 
                  onClick={detectLocation}
                  className="p-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg hover:scale-110 transition-transform"
                >
                  🪄
                </button>
              )}

              <button 
                onClick={() => handleUpdate(fieldName)}
                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isUpdating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : "✓"}
              </button>
              <button onClick={() => setEditingField(null)} className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs font-bold">✕</button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-lg">{icon}</span>
                <span className={`text-sm font-semibold truncate ${!value ? 'text-gray-400 italic' : 'text-gray-700 dark:text-gray-200'}`}>
                  {value || `Add ${label}`}
                </span>
              </div>
              <button 
                onClick={() => startEditing(fieldName, value)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all text-blue-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow w-full max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-500 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-900 p-1 shadow-xl">
                <div className="w-full h-full rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl font-black text-blue-600 uppercase">
                  {/* Dynamic Initial: Shows tempValue while editing name */}
                  {(editingField === 'fullName' ? tempValue : userData.fullName)?.charAt(0) || "U"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-10 px-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
              <div className="w-full max-w-sm">
                <EditableField label="Full Name" value={userData.fullName} fieldName="fullName" icon="👤" />
                <EditableField label="Email Address" value={userData.email} fieldName="email" icon="✉️" />
                <EditableField label="Location" value={userData.location} fieldName="location" icon="📍" />
              </div>
              
              <Link to="/dashboard" className="w-full md:w-auto">
                <button className="w-full px-6 py-3 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg">
                  Dashboard
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 my-8">
              <div className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="text-2xl font-black text-blue-600">{stats.requests}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Requests</div>
              </div>
              <div className="p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="text-2xl font-black text-teal-600">{stats.offers}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Offers</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-gray-50 dark:border-gray-800">
              <button onClick={handleLogout} className="px-6 py-2.5 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                Sign Out
              </button>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                Joined {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recent'}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}