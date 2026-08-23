import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  LogIn,
  MapPin,
  MessageSquare,
  Search,
  ShieldAlert,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { getOffers } from "../../services/offerService";
import { getInbox } from "../../services/messageService";
import { syncCurrentLocation } from "../../services/profileService";
import SkeletonCard from "../../components/common/SkeletonCard";
import { jwtDecode } from "jwt-decode";

export default function AvailableHelp() {
  const [offers, setOffers] = useState([]);
  const [existingChats, setExistingChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Safely decode JWT token
  const currentUser = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        // Update user's GPS location first
        await syncCurrentLocation();

        const [offersData, messagesData] = await Promise.all([
          getOffers(),
          getInbox().catch(() => []),
        ]);

        if (isMounted) {
          setOffers(Array.isArray(offersData) ? offersData : []);

          setExistingChats(Array.isArray(messagesData) ? messagesData : []);
        }
      } catch (err) {
        console.error("FETCH DATA ERROR:", err);

        if (err?.status === 401 || err?.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          if (isMounted) {
            navigate("/login");
          }

          return;
        }

        if (isMounted) {
          setError(err?.message || "Failed to fetch offers");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [navigate, token]);

  // Unauthenticated view gate
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-md w-full relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2.6rem] blur opacity-20 group-hover:opacity-30 transition duration-1000" />
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white/20 dark:border-gray-800/50 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-blue-500/20 rounded-3xl rotate-12 animate-pulse" />
                <div className="relative w-full h-full bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <ShieldAlert size={44} strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">
                Community Access Only
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-10 px-2">
                This community feed is private. Join your neighbors by signing
                in to view and offer help in your apartment.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/25 group"
                >
                  <LogIn
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                  Sign In to Continue
                </button>
                <Link
                  to="/register"
                  className="block py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Don't have an account?{" "}
                  <span className="underline decoration-2 underline-offset-4">
                    Register
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

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredOffers = offers.filter((offer) => {
    if (!normalizedSearch) return true;

    return [offer.title, offer.category, offer.location, offer.availability]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

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

      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-600/10 blur-[120px] rounded-full pointer-events-none" />

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

          <label className="w-full md:w-96 relative group">
            <span className="sr-only">Search offers</span>
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by keyword, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
            />
          </label>
        </div>

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

        {!loading && !error && filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => {
              // 1. Bulletproof ID extraction (handles both _id and id)
              const offerId = offer._id || offer.id;
              const authorId =
                offer.author?._id || offer.author?.id || offer.author;
              const currentUserId = currentUser?.id || currentUser?._id;

              const isOwner =
                Boolean(currentUserId) &&
                String(currentUserId) === String(authorId);

              // 2. More resilient chat matching (handles case-sensitivity and nested IDs)
              const activeChat = existingChats.find((message) => {
                const relatedId =
                  message.relatedPostId?._id ||
                  message.relatedPostId?.id ||
                  message.relatedPostId;
                const postType = message.postType || message.type || "";

                return (
                  postType.toLowerCase() === "offer" &&
                  Boolean(relatedId) &&
                  String(relatedId) === String(offerId)
                );
              });

              const chatId = activeChat?._id || activeChat?.id;

              return (
                <div
                  key={offerId} // Updated key
                  className={`group relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-2 focus-within:ring-teal-500/40 sm:p-6 ${
                    isOwner
                      ? "border-teal-300 bg-gradient-to-br from-teal-50 via-white to-cyan-50 shadow-[0_12px_35px_rgba(20,184,166,0.16)] ring-1 ring-teal-500/20 dark:border-teal-500/50 dark:from-teal-950/50 dark:via-gray-900 dark:to-cyan-950/30"
                      : "border-gray-200/80 bg-white/90 dark:border-gray-800 dark:bg-gray-900/90"
                  }`}
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-400/15 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                  {isOwner && (
                    <div className="absolute right-5 top-0 z-20 rounded-b-xl bg-teal-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-teal-500/20">
                      Yours
                    </div>
                  )}

                  <div className="relative z-10 mb-6 flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                        isOwner
                          ? "bg-gradient-to-br from-teal-600 to-cyan-500 text-white shadow-teal-500/25"
                          : "border border-teal-100 bg-teal-50 dark:border-teal-900/50 dark:bg-teal-950/40"
                      }`}
                    >
                      {getCategoryIcon(offer.category)}
                    </div>
                    <div className="min-w-0 pt-1">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {offer.author?.fullName || "Anonymous"}
                        {isOwner && (
                          <span className="ml-2 text-[10px] font-black uppercase tracking-wide text-teal-600">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="mt-1 truncate text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        {offer.category || "Community help"}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 mb-7 flex-grow">
                    <h3
                      className={`mb-4 line-clamp-2 text-xl font-black leading-tight tracking-tight transition-colors ${
                        isOwner
                          ? "text-teal-700 dark:text-teal-400"
                          : "text-gray-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-cyan-400"
                      }`}
                    >
                      {offer.title || "Untitled offer"}
                    </h3>

                    <div className="space-y-2.5">
                      <div
                        className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-sm font-semibold ${
                          isOwner
                            ? "border-teal-200/70 bg-teal-100/60 text-teal-700 dark:border-teal-800/50 dark:bg-teal-900/30 dark:text-teal-300"
                            : "border-gray-100 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
                        }`}
                      >
                        <MapPin size={16} className="shrink-0 text-teal-500" />
                        <span className="truncate">
                          {offer.location || "Location not specified"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5 px-1 text-sm text-gray-500 dark:text-gray-400">
                        <Clock3
                          size={16}
                          className="mt-0.5 shrink-0 text-teal-500"
                        />
                        <span className="line-clamp-2">
                          {offer.availability || "Availability not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mb-4">
                    {offer.visibility === "nearby" ? (
                      <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                        📍 Nearby · within {offer.radius || 2} km
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        🏢 Your Apartment
                      </span>
                    )}
                  </div>

                  {/* Contextual Action Handlers (Updated with offerId and chatId) */}
                  {isOwner ? (
                    <Link
                      to="/dashboard"
                      className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-500/20 transition-all hover:-translate-y-0.5 hover:bg-teal-700"
                    >
                      Manage Your Offer
                      <ArrowRight size={17} />
                    </Link>
                  ) : activeChat ? (
                    <Link
                      to={`/inbox`} // Updated to use safe chatId
                      className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-700"
                    >
                      <MessageSquare size={17} />
                      Inbox
                    </Link>
                  ) : (
                    <Link
                      to={`/offer-details/${offerId}`} // Updated to use safe offerId
                      className="relative z-10 flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white py-3.5 text-sm font-black text-teal-700 transition-all hover:-translate-y-0.5 hover:bg-teal-600 hover:text-white dark:border-teal-900 dark:bg-gray-800 dark:text-teal-300 dark:hover:bg-teal-500 dark:hover:text-gray-950"
                    >
                      Connect
                      <ArrowRight size={17} />
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
