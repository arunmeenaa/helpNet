import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import API_URL from "../../api";
import socket from "../../socket";
import toast from "react-hot-toast";
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
  Sparkles,
} from "lucide-react";

import {
  getMyApartment,
  getMembers,
  getPendingJoinRequests,
  removeMember,
  approveJoinRequest,
  rejectJoinRequest,
} from "../../services/ownerService";

export default function OwnerDashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  const [apartment, setApartment] = useState(null);
  const [checkingApartment, setCheckingApartment] = useState(true);
  const hasApartment = !!apartment;

  const [showSetupModal, setShowSetupModal] = useState(false);

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadApartment = async () => {
      try {
        setCheckingApartment(true);
        const data = await getMyApartment();
        setApartment(data.apartment);

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        storedUser.apartmentId = data.apartment.apartmentId;
        setCurrentUser(storedUser);
        localStorage.setItem("user", JSON.stringify(storedUser));
      } catch (error) {
        setApartment(null);
        setShowSetupModal(true);
      } finally {
        setCheckingApartment(false);
      }
    };

    loadApartment();
  }, []);

  useEffect(() => {
    if (hasApartment) {
      fetchMembers();
      fetchPendingRequests();

      socket.emit("join_room", `admin_${apartment.apartmentId}`);

      const handleNewRequest = (data) => {
        toast("🔔 New join request received!", { icon: "✨" });

        if (!data.request || !data.request.userId) {
          console.error(
            "DEBUG: Socket request is missing userId or is unpopulated!",
          );
        }
        setPendingRequests((prev) => [data.request, ...prev]);
      };

      socket.on("new_join_request", handleNewRequest);

      return () => {
        socket.off("new_join_request", handleNewRequest);
      };
    } else {
      setLoading(false);
    }
  }, [hasApartment, apartment?.apartmentId]);

  const viewProfile = (userId) => {
    if (!userId) return;
    navigate(`/user/${userId}`);
  };

  const removeUser = async (userId) => {
    if (
      !window.confirm(
        "🚨 WARNING: Are you sure you want to permanently remove this user from your apartment?",
      )
    ) {
      return;
    }

    const deleteToast = toast.loading("Removing user...");

    try {
      await removeMember(userId);
      toast.success("User removed permanently.", { id: deleteToast });
      setMembers((prev) => prev.filter((member) => member._id !== userId));
    } catch (err) {
      toast.error(err.message || "Failed to remove user", { id: deleteToast });
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const data = await getPendingJoinRequests();
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || "Failed to load join requests");
    }
  };

  const handleApprove = async (requestId, userId) => {
    setApprovingId(requestId);
    try {
      await approveJoinRequest(requestId, userId);
      toast.success("Resident approved!");
      await fetchPendingRequests();
      await fetchMembers();
    } catch (err) {
      toast.error(err.message || "Approval failed");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this request?")) {
      return;
    }

    setRejectingId(requestId);
    try {
      await rejectJoinRequest(requestId);
      toast.success("Request rejected.");
      await fetchPendingRequests();
    } catch (err) {
      toast.error(err.message || "Rejection failed");
    } finally {
      setRejectingId(null);
    }
  };

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

  if (checkingApartment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl">
          <Loader2 className="animate-spin text-purple-400" size={44} />
          <p className="text-sm font-semibold text-slate-300">
            Verifying community access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden font-sans">
      <Navbar />

      {/* Ambient Glass Glow Orbs */}
      <div className="absolute top-12 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md px-4 animate-in fade-in duration-300">
          <div className="bg-white/70 dark:bg-slate-900/70 border border-white/60 dark:border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-2xl max-w-md w-full text-center relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-inner">
              <Building size={32} strokeWidth={2} />
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              Set Up Your Community
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
              You haven't created an apartment block yet. Set one up now to
              generate a unique ID so your residents can join!
            </p>

            <button
              onClick={() => navigate("/create-apartment")}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-500/25"
            >
              Create Apartment <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full relative z-10 flex flex-col">
        {!hasApartment ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16">
            <div className="max-w-lg w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 p-10 rounded-3xl shadow-2xl flex flex-col items-center">
              <div className="w-20 h-20 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 shadow-inner">
                <Building size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                No Apartment Created Yet
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm sm:text-base leading-relaxed">
                Before you can manage your community and view members, you need
                to set up your apartment block to generate a unique invite ID.
              </p>
              <button
                onClick={() => navigate("/create-apartment")}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-base transition-all active:scale-95 shadow-xl shadow-purple-500/25"
              >
                Create Apartment Now <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header & Stats */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3.5 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20 backdrop-blur-md">
                  <ShieldCheck size={30} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Manage your apartment members and pending join requests
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 p-5 rounded-2xl shadow-xl shadow-slate-900/5 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-cyan-400 rounded-xl border border-blue-500/20">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      Total Residents
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {members.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search residents by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none text-slate-900 dark:text-white placeholder-slate-400 shadow-xl shadow-slate-900/5 transition-all text-sm font-medium"
              />
            </div>

            {/* Pending Join Requests */}
            {uniqueRequests.length > 0 && (
              <div className="mb-8 bg-amber-500/10 dark:bg-amber-900/20 backdrop-blur-2xl p-6 rounded-3xl border border-amber-500/30 dark:border-amber-700/30 shadow-xl">
                <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  Pending Join Requests ({uniqueRequests.length})
                </h2>
                <div className="space-y-3">
                  {uniqueRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {req.userId?.fullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {req.userId?.email}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          disabled={!!rejectingId || !!approvingId}
                          onClick={() =>
                            handleApprove(req._id, req.userId?._id)
                          }
                          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center min-w-[80px]"
                        >
                          {approvingId === req._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </button>
                        <button
                          disabled={!!rejectingId || !!approvingId}
                          onClick={() => handleReject(req._id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl font-bold text-xs transition-all flex items-center justify-center min-w-[80px]"
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

            {/* User List Glass Container */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
                  <span className="text-sm font-semibold">
                    Loading residents...
                  </span>
                </div>
              ) : members.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20 shadow-inner">
                    <Users size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Your Community is Empty
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-6 text-xs sm:text-sm">
                    You don't have any residents yet. Share your Apartment ID
                    with your residents so they can join!
                  </p>
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/60 dark:border-white/10 px-5 py-2.5 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm">
                    ID:{" "}
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {currentUser.apartmentId}
                    </span>
                  </div>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                  <UserX size={44} className="text-slate-400 mb-3" />
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    No residents found
                  </p>
                  <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                    We couldn't find anyone matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/40 dark:divide-white/5">
                  {filteredMembers.map((member) => {
                    const isMe = member._id === currentUser._id;

                    return (
                      <div
                        key={member._id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 hover:bg-white/50 dark:hover:bg-white/5 transition-all backdrop-blur-sm gap-4"
                      >
                        {/* Resident Info */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0 overflow-hidden border border-white/20">
                            {member?.profilePic ? (
                              <img
                                src={`${API_URL}${member.profilePic}`}
                                alt={member.fullName || "Member Profile"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  const fallbackSpan =
                                    e.target.parentElement.querySelector(
                                      ".fallback-text",
                                    );
                                  if (fallbackSpan) {
                                    fallbackSpan.classList.remove("hidden");
                                    fallbackSpan.classList.add("block");
                                  }
                                }}
                              />
                            ) : null}

                            <span
                              className={`fallback-text ${
                                member?.profilePic ? "hidden" : "block"
                              }`}
                            >
                              {member.fullName?.charAt(0).toUpperCase() || "M"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate text-sm sm:text-base">
                              {member.fullName}
                              {isMe && (
                                <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                  Owner (You)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate mt-0.5 font-medium">
                              <Mail size={13} /> {member.email}
                            </p>
                          </div>
                        </div>

                        {/* Actions UI Section */}
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <button
                            onClick={() => viewProfile(member._id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-cyan-400 border border-blue-500/20 rounded-xl transition-all"
                          >
                            <Eye size={15} />
                            <span>View Profile</span>
                          </button>

                          {!isMe && (
                            <button
                              onClick={() => removeUser(member._id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl transition-all"
                            >
                              <Trash2 size={15} /> Remove
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