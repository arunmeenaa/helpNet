import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import socket from "../socket";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import {
  Users,
  Trash2,
  Search,
  Mail,
  ShieldCheck,
  UserX,
  Building,
  ArrowRight,
  X,
  Eye,
  Loader2,
} from "lucide-react";

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const hasApartment = !!currentUser.apartmentId;
  const [showSetupModal, setShowSetupModal] = useState(!hasApartment);

  // 🔄 Fetch members
  // console.log("Current Admin User:", currentUser);
  const fetchMembers = async () => {
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

  // 🔄 Join Admin Room & Listen for requests
  useEffect(() => {
    if (hasApartment) {
      fetchMembers();
      fetchPendingRequests();

      // Join the admin room for this specific apartment
      socket.emit("join_room", `admin_${currentUser.apartmentId}`);

      // Listen for new requests
      const handleNewRequest = (data) => {
        toast("🔔 New join request received!", { icon: "✨" });
        console.log("Socket Data Received:", data);

        if (!data.request || !data.request.userId) {
          console.error(
            "DEBUG: Socket request is missing userId or is unpopulated!",
          );
        }
        // Update the state immediately
        setPendingRequests((prev) => [data.request, ...prev]);
      };

      socket.on("new_join_request", handleNewRequest);

      // Cleanup on unmount
      return () => {
        socket.off("new_join_request", handleNewRequest);
      };
    } else {
      setLoading(false);
    }
  }, [hasApartment, currentUser.apartmentId]);

  // 👁️ View Profile (Navigates to a member's profile page)
// Inside your member list management component (e.g., AdminDashboard.jsx)
const viewProfile = (userId) => {
  console.log("🎯 View Profile Clicked! Target User ID:", userId);
  
  if (!userId) {
    console.error("❌ Mismatch: Target user identity object key field is missing or undefined.");
    return;
  }
  
  // Routes to the lowercase routing declaration path matching App.jsx parameters
  navigate(`/user/${userId}`); 
};



  // ❌ Remove user
  const removeUser = async (userId) => {
    if (
      !window.confirm(
        "🚨 WARNING: Are you sure you want to permanently remove this user from your apartment?",
      )
    )
      return;

    const deleteToast = toast.loading("Removing user...");
    try {
      const res = await fetch(`${API_URL}/api/admin/remove-user/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("User removed permanently.", { id: deleteToast });
      setMembers(members.filter((m) => m._id !== userId));
    } catch (err) {
      toast.error(err.message, { id: deleteToast });
    }
  };
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
    if (hasApartment) {
      const roomName = `admin_${currentUser.apartmentId}`;
      // console.log("Attempting to join room:", roomName); // ADD THIS
      socket.emit("join_room", roomName);
      fetchMembers();
      fetchPendingRequests(); // 💡 Add this here!
    } else {
      setLoading(false);
    }
  }, [hasApartment]);
  // Approve Handler
  const handleApprove = async (requestId, userId) => {
    setApprovingId(requestId); // Set the specific ID to show spinner
    try {
      const res = await fetch(`${API_URL}/api/admin/approve-join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, userId }),
      });

      if (!res.ok) throw new Error("Approval failed");

      toast.success("Resident approved!");
      fetchPendingRequests();
      fetchMembers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApprovingId(null); // Reset to null regardless of success/fail
    }
  };
  const handleReject = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this request?"))
      return;

    setRejectingId(requestId); // Trigger spinner
    try {
      const res = await fetch(`${API_URL}/api/admin/reject-join`, {
        method: "DELETE", // Or POST, depending on your backend
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      if (!res.ok) throw new Error("Rejection failed");

      toast.success("Request rejected.");
      fetchPendingRequests(); // Refresh the list
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRejectingId(null); // Clear spinner
    }
  };
  // 🔍 Filter Logic
  const filteredMembers = useMemo(() => {
    return members.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [members, searchQuery]);
  const uniqueRequests = useMemo(() => {
    const seen = new Set();
    return pendingRequests.filter((req) => {
      if (seen.has(req._id)) return false;
      seen.add(req._id);
      return true;
    });
  }, [pendingRequests]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 relative overflow-hidden">
      <Navbar />

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm px-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Building size={32} strokeWidth={2} />
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
              Set Up Your Community
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              You haven't created an apartment block yet. Set one up now to
              generate a unique ID so your residents can join!
            </p>

            <button
              onClick={() => navigate("/create-apartment")}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-500/30"
            >
              Create Apartment <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-grow px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full relative z-10 flex flex-col">
        {!hasApartment ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-10">
            <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Building size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              No Apartment Created Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-base sm:text-lg">
              Before you can manage your community and view members, you need to
              set up your apartment block to generate a unique invite ID.
            </p>
            <button
              onClick={() => navigate("/create-apartment")}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-purple-500/30"
            >
              Create Apartment Now <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <>
            {/* Header & Stats */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <ShieldCheck size={32} />
                </div>
                Admin Dashboard
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Total Residents
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {members.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search residents by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-900 dark:text-white shadow-sm transition-all"
              />
            </div>

            {uniqueRequests.length > 0 && (
              <div className="mb-10 bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-200 dark:border-amber-900/30">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  Pending Join Requests ({uniqueRequests.length})
                </h2>
                <div className="space-y-4">
                  {uniqueRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-white dark:bg-gray-900 p-4 rounded-xl flex justify-between items-center shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {req.userId?.fullName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {req.userId?.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {/* Approve Button */}
                        <button
                          disabled={!!rejectingId || !!approvingId} // Disable both buttons if one is loading
                          onClick={() =>
                            handleApprove(req._id, req.userId?._id)
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700"
                        >
                          {approvingId === req._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </button>
                        {/* Reject Button */}
                        <button
                          disabled={!!rejectingId || !!approvingId} // Disable both buttons if one is loading
                          onClick={() => handleReject(req._id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200"
                        >
                          {rejectingId === req._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Reject"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
           {/* User List Container */}
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
  {loading ? (
    <div className="p-10 text-center text-gray-500 flex flex-col items-center">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
      Loading residents...
    </div>
  ) : members.length === 0 ? (
    <div className="p-16 text-center flex flex-col items-center">
      <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Users size={40} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Your Community is Empty
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        You don't have any residents yet. Share your Apartment ID
        with your residents so they can join!
      </p>
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl font-mono text-sm text-gray-700 dark:text-gray-300 flex items-center gap-3">
        ID:{" "}
        <span className="font-bold text-purple-600 dark:text-purple-400">
          {currentUser.apartmentId}
        </span>
      </div>
    </div>
  ) : filteredMembers.length === 0 ? (
    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
      <UserX size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
      <p className="text-lg font-medium text-gray-900 dark:text-white">
        No residents found
      </p>
      <p className="text-sm mt-1">
        We couldn't find anyone matching "{searchQuery}"
      </p>
    </div>
  ) : (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {/* 🌟 FIX: Renamed 'user' to 'member' to prevent variable shadowing crashes */}
      {filteredMembers.map((member) => {
        const isMe = member._id === currentUser._id;

        return (
          <div
            key={member._id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-4"
          >
            {/* Resident Info info */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-inner shrink-0 overflow-hidden border-2 border-white dark:border-gray-900 shadow-md">
  {member?.profilePic ? (
    // Scenario A: Resident has uploaded a picture -> Load the Image asset
    <img  
      src={`${API_URL}${member.profilePic}`} 
      alt={member.fullName || "Member Profile"} 
      className="w-full h-full object-cover"
      onError={(e) => {
        // Fallback protection if file path fails to load over the network
        e.target.style.display = 'none';
        
        // Find the fallback text container and make sure it takes up flex center layout
        const fallbackSpan = e.target.parentElement.querySelector('.fallback-text');
        if (fallbackSpan) {
          fallbackSpan.classList.remove('hidden');
          fallbackSpan.classList.add('block');
        }
      }}
    />
  ) : null}

  {/* Scenario B: No profile picture -> Display Initials layout */}
  <span className={member?.profilePic ? "hidden" : "block"}>
    {member.fullName?.charAt(0).toUpperCase() || "M"}
  </span>
</div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                  {member.fullName}
                  {isMe && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Owner (You)
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate mt-0.5">
                  <Mail size={14} /> {member.email}
                </p>
              </div>
            </div>

            {/* Actions UI Section */}
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              {/* View Profile Button targeting renamed member parameter */}
              <button
                onClick={() => viewProfile(member._id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
              >
                <Eye size={16} />{" "}
                <span className="hidden sm:inline">View</span> Profile
              </button>

              {/* Remove Button (Hide for the Owner) */}
              {!isMe && (
                <button
                  onClick={() => removeUser(member._id)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors"
                >
                  <Trash2 size={16} /> Remove
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
