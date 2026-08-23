import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { getRequests } from "../../services/requestService";
import { getInbox } from "../../services/messageService";
import { syncCurrentLocation } from "../../services/profileService";
import socket from "../../socket";
import SkeletonCard from "../../components/common/SkeletonCard";
import { jwtDecode } from "jwt-decode";
import {
  ArrowRight,
  CalendarDays,
  HandHeart,
  LogIn,
  MapPin,
  MessageSquare,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";

const getId = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value._id || value.id || null;
};

const sameId = (first, second) =>
  first != null && second != null && String(first) === String(second);

const normalizePriority = (value) => {
  const priority = String(value || "")
    .trim()
    .toLowerCase();

  if (priority === "high") return "High";
  if (priority === "medium" || priority === "moderate") return "Medium";
  if (priority === "low") return "Low";

  return "Low";
};

export default function RequestsFeed() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [activeConversations, setActiveConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const apartmentId = storedUser?.apartmentId;

  const decodedToken = token ? jwtDecode(token) : null;
  const currentUserId =
    decodedToken?.id || decodedToken?.sub || getId(storedUser);

  // ==========================================
  // 🚨 GUEST GUARD
  // ==========================================
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-md w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-[2.6rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-10 md:p-12 border border-white/20 dark:border-gray-800/50 text-center animate-in fade-in zoom-in duration-700">
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
                Neighbor requests are visible only to verified residents. Sign
                in to see what’s happening in your apartment.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/25 group"
                >
                  <LogIn
                    size={22}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Sign In to View Feed
                </button>

                <Link
                  to="/register"
                  className="block py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                  New to HelpNet?{" "}
                  <span className="underline decoration-2 underline-offset-4 font-black">
                    Join now
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const fetchRequests = useCallback(async () => {
  try {
    await syncCurrentLocation();

    const [requestsData, inboxResponse] = await Promise.allSettled([
      getRequests(),
      getInbox(),
    ]);

    if (requestsData.status === "fulfilled") {
      setRequests(requestsData.value || []);
    } else {
      throw requestsData.reason;
    }

    if (inboxResponse.status === "fulfilled") {
      const rawInbox = Array.isArray(inboxResponse.value)
        ? inboxResponse.value
        : inboxResponse.value?.messages ||
          inboxResponse.value?.data ||
          [];

      const conversedPostIds = rawInbox
        .map(
          (msg) =>
            msg.relatedPostId ||
            msg.postId ||
            msg.post?._id ||
            msg.requestId ||
            msg.offerId
        )
        .filter(Boolean);

      setActiveConversations(conversedPostIds.map(String));
    }

    setError("");
  } catch (err) {
    console.error("FETCH REQUESTS ERROR:", err);

    if (
      err.message?.includes("removed") ||
      err.message?.includes("evicted")
    ) {
      toast.error(
        "Access Denied: You have been removed from this apartment community.",
        {
          duration: 5000,
          id: "eviction-alert",
        }
      );

      const updatedUser = {
        ...storedUser,
        apartmentId: null,
        isEvicted: true,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("local-storage-update"));

      setTimeout(() => {
        navigate("/dashboard");
      }, 0);

      return;
    }

    setError(err.message || "Failed to fetch requests");
  } finally {
    setLoading(false);
  }
}, [navigate]);

  useEffect(() => {
    fetchRequests();

    const handleFeedRefresh = () => {
      fetchRequests();
    };

    socket.on("feed_updated", handleFeedRefresh);
    socket.on("user_removed", handleFeedRefresh);

    return () => {
      socket.off("feed_updated", handleFeedRefresh);
      socket.off("user_removed", handleFeedRefresh);
    };
  }, [fetchRequests]);

  

  const filteredRequests = requests.filter((req) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const title = String(req.title || "").toLowerCase();
    const location = String(req.location || "").toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      title.includes(normalizedSearch) ||
      location.includes(normalizedSearch);
    const matchesPriority =
      filterPriority === "All" ||
      normalizePriority(req.priority) === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityStyles = (level) => {
    const priority = normalizePriority(level);

    if (priority === "High") {
      return "border-red-200 bg-red-50 text-red-700 shadow-sm shadow-red-500/10 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400";
    }

    if (priority === "Medium") {
      return "border-amber-200 bg-amber-50 text-amber-700 shadow-sm shadow-amber-500/10 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400";
    }

    return "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
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

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl">
            <p className="text-red-500 font-medium">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm font-bold text-blue-600 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => {
              const authorId = getId(req.author);
              const isOwner = sameId(currentUserId, authorId);
              const hasMessaged = activeConversations.includes(String(req._id));

              return (
                <div
                  key={req._id}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/50 sm:p-6 ${
                    isOwner
                      ? "border-blue-300 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-[0_12px_35px_rgba(59,130,246,0.16)] ring-1 ring-blue-500/20 dark:border-blue-500/50 dark:from-blue-950/50 dark:via-gray-900 dark:to-cyan-950/30"
                      : "border-gray-200/80 bg-white/90 dark:border-gray-800 dark:bg-gray-900/90"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${
                      isOwner
                        ? "bg-blue-400/25 opacity-100"
                        : "bg-cyan-400/15 opacity-0"
                    }`}
                  />

                  {isOwner && (
                    <div className="absolute right-5 top-0 z-20 rounded-b-xl bg-blue-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20">
                      Yours
                    </div>
                  )}

                  <div className="relative z-10 mb-6 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-sm ${
                          isOwner
                            ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-blue-500/25"
                            : "border border-blue-100 bg-blue-50 text-blue-600 dark:border-cyan-900/50 dark:bg-cyan-950/40 dark:text-cyan-400"
                        }`}
                      >
                        {req.author?.fullName
                          ? req.author.fullName.charAt(0)
                          : "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                          {req.author?.fullName || "Anonymous"}
                          {isOwner && (
                            <span className="ml-2 text-[10px] font-black uppercase tracking-wide text-blue-500">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <CalendarDays size={13} />
                          {new Date(req.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider sm:px-3 sm:text-xs ${getPriorityStyles(req.priority)}`}
                    >
                      {normalizePriority(req.priority)}
                    </span>
                  </div>

                  <div className="relative z-10 mb-7 flex-grow">
                    <h3
                      className={`mb-4 line-clamp-2 text-xl font-black leading-tight tracking-tight transition-colors ${
                        isOwner
                          ? "text-blue-700 dark:text-blue-400"
                          : "text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-cyan-400"
                      }`}
                    >
                      {req.title}
                    </h3>
                    <div
                      className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-sm font-semibold ${
                        isOwner
                          ? "border-blue-200/70 bg-blue-100/60 text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-gray-100 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
                      }`}
                    >
                      <MapPin
                        size={16}
                        className="shrink-0 text-blue-500 dark:text-cyan-400"
                      />
                      <span className="truncate">{req.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs font-bold">
                    {req.visibility === "nearby" ? (
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                        📍 Nearby · within {req.radius || 2} km
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        🏢 Your Apartment
                      </span>
                    )}
                  </div>

                  {/* ACTION BUTTON DECISION */}
                  {isOwner ? (
                    <Link
                      to="/dashboard"
                      className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      Manage My Request
                      <ArrowRight size={17} />
                    </Link>
                  ) : hasMessaged ? (
                    <button
                      onClick={() => navigate("/inbox")}
                      className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      <MessageSquare size={18} />
                      Open Inbox
                    </button>
                  ) : (
                    <Link
                      to={`/request-details/${req._id}`}
                      className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    >
                      <HandHeart size={18} />I Can Help
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No active requests
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your filters.
              </p>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
