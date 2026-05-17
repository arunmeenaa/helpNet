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
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProfile({currentUser,token}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState([]);
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
              <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-6 shadow-lg shadow-purple-500/20">
                {user.fullName?.charAt(0) || "A"}
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
