import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import socket from "../socket";
import API_URL from "../api";

import {
  User,
  Mail,
  Shield,
  LogOut,
  KeyRound,
  Building,
  ChevronRight,
  Search,
  Camera
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProfile({currentUser,token}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/admin-login");
  };

  const uniqueRequests = useMemo(() => {
  const seen = new Set();
  return pendingRequests.filter((req) => {
    if (seen.has(req._id)) return false;
    seen.add(req._id);
    return true;
  });
}, [pendingRequests]);

const fetchPendingRequests = async () => {
  try {
    const res = await fetch(`${API_URL}/api/admin/join-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    setPendingRequests(data);
  } catch (err) {
    console.error("Error fetching requests:", err);
  }
};
useEffect(() => {
  // 1. Fetch initial records from DB on component mount
  fetchPendingRequests();

  // 2. Listen for real-time join events from new registrations
  const handleNewRequest = (newUser) => {
    console.log("📨 Real-time request caught on profile:", newUser);
    
    // Ensure the user signing up belongs to this specific admin's apartment building
    if (newUser.apartmentId === currentUser?.apartmentId) {
      setPendingRequests((prev) => [newUser, ...prev]);
      toast.info(`New resident request from ${newUser.fullName}`);
    }
  };

  socket.on("new_join_request", handleNewRequest);

  return () => {
    socket.off("new_join_request", handleNewRequest);
  };
}, [currentUser?.apartmentId, token]);

  const fetchMembers = async () => {
    const token = localStorage.getItem("token"); // 💡 Fix: Retrieve token here
    try {
      const res = await fetch(`${API_URL}/api/admin/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [members, searchQuery]);
  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Client-side restriction: Max file weight limit 2MB
  if (file.size > 2 * 1024 * 1024) {
    alert("File is too large! Maximum size allowed is 2MB.");
    return;
  }

  // Pack the file stream inside a standard multi-part FormData container
  const formData = new FormData();
  formData.append("profilePic", file);

  try {
    setUploading(true);
    const token = localStorage.getItem("token");
    
    // Fire the stream directly into your backend upload route destination endpoint
    const res = await fetch(`${API_URL}/api/admin/upload-profile-pic`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}` 
        // ⚠️ CRITICAL REMINDER: Do NOT add 'Content-Type' header here. 
        // The browser must calculate the mult-part boundary layout automatically.
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload operation failed.");

    // Update your local state context configuration instantly so the new picture renders
    // Note: Ensure your page utilizes standard user/setValues state hooks!
    if (typeof setUser === "function") {
      setUser(data.user);
    } else if (typeof setUserData === "function") {
      setUserData(data.user);
    }
    
    // Sync local storage so the Navbar avatar changes instantly as well
    localStorage.setItem("user", JSON.stringify(data.user));
    
    alert("Admin profile picture updated successfully!");
  } catch (err) {
    console.error("Admin upload operation intercepted:", err.message);
    alert(err.message);
  } finally {
    setUploading(false);
  }
};
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <Shield className="text-purple-500" /> Admin Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Personal Info */}
          <div className="md:col-span-1">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
              <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-purple-500/20 overflow-hidden relative group">
  {user?.profilePic ? (
    // Scenario A: Admin has a profile picture -> Render the image asset cleanly
    <img 
      src={`${API_URL}${user.profilePic}`} 
      alt={user.fullName || "Admin Profile"} 
      className="w-full h-full object-cover"
    />
  ) : (
    // Scenario B: No profile picture -> Display Initials + Clickable Hover Upload Layer
    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:from-purple-700 hover:to-indigo-600 transition-all duration-200 relative">
      
      {/* Fallback initial letter text */}
      <span className="group-hover:opacity-0 transition-opacity duration-200">
        {user.fullName?.charAt(0) || "A"}
      </span>

      {/* Hover overlay that reads "Upload" and displays a camera icon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-purple-900/90 text-white rounded-2xl">
        <Camera size={20} />
        <span className="text-[9px] font-bold tracking-wider uppercase">Upload</span>
      </div>

      {/* Hidden native input processing the multi-part payload stream */}
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} // Reuses the same client-side upload handler function
        className="hidden" 
        disabled={uploading}
      />
    </label>
  )}

  {/* Small centered spinner block that activates while an active file stream upload takes place */}
  {uploading && (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )}
</div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {user.fullName}
              </h2>
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full text-xs font-bold uppercase tracking-widest">
                Administrator
              </span>

              <div className="mt-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Email
                  </label>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                    <Mail size={18} />
                    <span className="text-sm truncate">{user.email}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Apartment ID
                  </label>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                    <Building size={18} />
                    <span className="text-sm uppercase font-mono tracking-wider">
                      {user.apartmentId || "Not Set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Stats */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase">
                  Residents
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                  {members.length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase">
                  Pending Needs
                </p>
                <p className="text-3xl font-black text-purple-600 mt-1">{uniqueRequests.length}</p>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xl space-y-2">
              {/* <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300">
                    <KeyRound size={20} />
                  </div>

                  <span className="font-bold text-gray-900 dark:text-white">
                    Change Admin Password
                  </span>
                </div>

                <ChevronRight
                  size={20}
                  className="text-gray-400 group-hover:translate-x-1 transition-transform"
                />
              </button> */}

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                    <LogOut size={20} />
                  </div>

                  <span className="font-bold text-red-600 dark:text-red-400">
                    Logout
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
