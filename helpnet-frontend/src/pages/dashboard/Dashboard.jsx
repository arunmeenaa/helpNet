import React, { useState, useEffect } from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import API_URL from "../../api";

import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

import { CheckCircle, RotateCcw, Edit3, Trash2, Building } from "lucide-react";

import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

import {
  getMyRequests,
  updateRequest,
  deleteRequest,
  updateRequestStatus,
} from "../../services/requestService";

import {
  getMyOffers,
  updateOffer,
  deleteOffer,
  updateOfferStatus,
} from "../../services/offerService";

import { getCurrentUser } from "../../services/authService";
import { createJoinRequest } from "../../services/apartmentService";

const socket = io(API_URL);

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Parse user from Token
  const user = token ? jwtDecode(token) : null;
  const localStorageUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEvicted = localStorageUser.isEvicted || false;
  const apartmentIdFromStorage = localStorageUser.apartmentId;
  const [currentUser, setCurrentUser] = useState(null);

  // --- States ---
  const [activeTab, setActiveTab] = useState("requests");
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newApartmentId, setNewApartmentId] = useState("");
  const [hasPendingRequest, setHasPendingRequest] = useState(false); // 💡 State for approval workflow

  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });

  const hasApartment =
    currentUser?.apartmentId || localStorageUser?.apartmentId;

  // URL Tab Checker
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "offers") setActiveTab("offers");
    else if (tab === "requests") setActiveTab("requests");
  }, [location.search]);

  // --- Apartment approval/removal events ---
  useEffect(() => {
    if (user?.id) socket.emit("join_room", user.id);

    const handleApproval = (data) => {
      toast.success("Admin approved your request!");
      const updatedUser = {
        ...localStorageUser,
        apartmentId: data.apartmentId,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
    };

    const handleUserRemoved = (data) => {
      toast.error("You have been removed from the apartment.");
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, apartmentId: null };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("local-storage-update"));
    };

    socket.on("approval_confirmed", handleApproval);
    socket.on("user_removed", handleUserRemoved);

    return () => {
      socket.off("approval_confirmed", handleApproval);
      socket.off("user_removed", handleUserRemoved);
    };
  }, [user?.id, token]);

  // --- Post Action Handlers ---

  const handleUpdateStatus = async (postId, postType, newStatus) => {
    setUpdatingStatusId(postId);

    try {
      if (postType === "requests") {
        await updateRequestStatus(postId, newStatus);
      } else {
        await updateOfferStatus(postId, newStatus);
      }

      setMyPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, status: newStatus } : post,
        ),
      );

      toast.success(`Post marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleUpdatePost = async (e, postId, postType) => {
    e.preventDefault();

    try {
      if (postType === "requests") {
        await updateRequest(postId, editData);
      } else {
        await updateOffer(postId, editData);
      }

      setMyPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, ...editData } : post,
        ),
      );

      setEditingPost(null);

      toast.success("Post updated successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deletePost = async (postId, postType) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      if (postType === "requests") {
        await deleteRequest(postId);
      } else {
        await deleteOffer(postId);
      }

      setMyPosts((prev) => prev.filter((post) => post._id !== postId));

      toast.success("Post deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [requests, offers] = await Promise.all([
          getMyRequests(),
          getMyOffers(),
        ]);

        setMyPosts([
          ...requests.map((r) => ({
            ...r,
            postType: "requests",
            author: r.author?._id || r.author,
          })),

          ...offers.map((o) => ({
            ...o,
            postType: "offers",
            author: o.author?._id || o.author,
          })),
        ]);
      } catch (err) {
        console.error("Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    const fetchFreshUser = async () => {
      try {
        const data = await getCurrentUser();

        setCurrentUser(data);

        // Keep localStorage synchronized
        localStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch fresh user:", err);
      }
    };

    if (token) {
      fetchFreshUser();
    }
  }, [token]);

  // --- Join Apartment Request Action ---
  const handleJoinApartment = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await createJoinRequest(newApartmentId);

      toast.success("Request sent to Admin! Wait for approval.");

      setHasPendingRequest(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        <header className="mb-8">
          {!hasApartment && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    You haven't joined an apartment yet
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can still create and view nearby posts. Join an
                    apartment to access apartment-only posts.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const apartmentId = window.prompt(
                      "Enter your Apartment ID",
                    );

                    if (apartmentId?.trim()) {
                      setNewApartmentId(apartmentId.trim());
                      createJoinRequest(apartmentId.trim())
                        .then(() => {
                          toast.success("Request sent to Admin!");
                          setHasPendingRequest(true);
                        })
                        .catch((err) => {
                          toast.error(err.message);
                        });
                    }
                  }}
                  className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Join Apartment
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white truncate">
              Welcome, {user?.fullName}!
            </h1>
            <button
              type="button"
              onClick={() => navigate("/inbox")}
              className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-colors hover:bg-purple-700"
            >
              Inbox
            </button>
          </div>
        </header>

        <div className="flex items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button
              onClick={() => setActiveTab("requests")}
              className={`pb-4 px-2 font-bold text-sm transition-all ${activeTab === "requests" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400"}`}
            >
              My Requests (
              {myPosts.filter((p) => p.postType === "requests").length})
            </button>
            <button
              onClick={() => setActiveTab("offers")}
              className={`pb-4 px-2 font-bold text-sm transition-all ${activeTab === "offers" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-400"}`}
            >
              My Offers ({myPosts.filter((p) => p.postType === "offers").length})
            </button>
          </div>

          <button
            onClick={() =>
              navigate(activeTab === "requests" ? "/post" : "/OfferHelp")
            }
            className="shrink-0 mb-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
          >
            + New {activeTab === "requests" ? "Request" : "Offer"}
          </button>
        </div>

        {loading ? (
          <p className="text-center py-10 dark:text-gray-400 animate-pulse">
            Loading dashboard...
          </p>
        ) : (
          <div className="grid gap-6 min-w-0 w-full">
            {
              /* MY POSTS SECTION */
              (() => {
                const filtered = myPosts.filter(
                  (p) => p.postType === activeTab,
                );
                return filtered.length > 0 ? (
                  filtered.map((post) => {
                    const isResolved =
                      post.status?.toLowerCase() === "resolved";
                    const isOwner =
                      post.author?.toString() === user?.id?.toString();

                    return (
                      <div
                        key={post._id}
                        className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 
    ${isResolved ? "bg-gray-100 dark:bg-gray-800/40 opacity-60" : "bg-white dark:bg-gray-900 shadow-sm"}
    
  
  `}
                      >
                        {editingPost === post._id ? (
                          <form
                            onSubmit={(e) =>
                              handleUpdatePost(e, post._id, post.postType)
                            }
                            className="space-y-4"
                          >
                            <input
                              className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                              value={editData.title}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  title: e.target.value,
                                })
                              }
                            />
                            <textarea
                              className="w-full p-2.5 border rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                              rows="3"
                              value={editData.description}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  description: e.target.value,
                                })
                              }
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPost(null)}
                                className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-xs font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${post.postType === "offers" ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"}`}
                                >
                                  {post.postType === "offers"
                                    ? "Offer"
                                    : "Request"}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${isResolved ? "bg-gray-300 text-gray-700" : "bg-green-100 text-green-700"}`}
                                >
                                  {post.status || "open"}
                                </span>
                              </div>
                              <h3
                                className={`font-bold text-lg truncate ${isResolved ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}
                              >
                                {post.title}
                              </h3>
                              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2 break-words line-clamp-3">
                                {post.description}
                              </p>

                              <button
                                disabled={updatingStatusId === post._id}
                                onClick={() =>
                                  handleUpdateStatus(
                                    post._id,
                                    post.postType,
                                    isResolved ? "open" : "resolved",
                                  )
                                }
                                className={`mt-4 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${isResolved ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-green-50 text-green-600 border-green-100"}`}
                              >
                                {updatingStatusId === post._id ? (
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : isResolved ? (
                                  <>
                                    <RotateCcw size={14} /> Re-open
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={14} /> Mark Resolved
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingPost(post._id);
                                  setEditData({
                                    title: post.title,
                                    description: post.description,
                                  });
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Edit3 size={20} />
                              </button>
                              <button
                                onClick={() =>
                                  deletePost(post._id, post.postType)
                                }
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 space-y-4">
                    <p className="text-gray-500 text-sm">No {activeTab} yet.</p>
                    <button
                      onClick={() =>
                        navigate(
                          activeTab === "requests" ? "/post" : "/OfferHelp",
                        )
                      }
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20"
                    >
                      + Create {activeTab === "requests" ? "Request" : "Offer"}
                    </button>
                  </div>
                );
              })()
            }
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}