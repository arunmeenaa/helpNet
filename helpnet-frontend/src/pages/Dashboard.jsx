import React, { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, RotateCcw, Edit3, Trash2, Send, Building, AlertTriangle } from "lucide-react"; // Added Building, AlertTriangle
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const socket = io(API_URL);

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  // 💡 Parse user from both Token and LocalStorage to catch the 'isEvicted' flag
  const user = token ? jwtDecode(token) : null;
  const localStorageUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isEvicted = localStorageUser.isEvicted || false;
  const apartmentIdFromStorage = localStorageUser.apartmentId;
  // ==========================================
  // 🚨 GATEKEEPER: IF USER HAS NO APARTMENT
  // ==========================================
  

  const chatContainerRef = useRef(null);

  // --- States ---
  const [activeTab, setActiveTab] = useState("requests");
  const [myPosts, setMyPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newApartmentId, setNewApartmentId] = useState(""); // 💡 Added for Join Form

  // Chat States
  const [conversation, setConversation] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // Post Action States
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });

  // URL Tab Checker
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "messages") setActiveTab("messages");
    else if (tab === "offers") setActiveTab("offers");
    else if (tab === "requests") setActiveTab("requests");
  }, [location.search]);

  const replyingToRef = useRef(replyingTo);
  useEffect(() => {
    replyingToRef.current = replyingTo;
  }, [replyingTo]);

  // --- REAL-TIME SOCKET CONNECTION ---
  useEffect(() => {
    if (user?.id) {
      socket.emit("join_room", user.id);
    }
    const handleReceiveMessage = (newMsg) => {
      const senderId = (newMsg.sender?._id || newMsg.sender)?.toString();
      setMessages((prev) => [newMsg, ...prev]);
      if (replyingToRef.current === senderId) {
        setConversation((prev) => [...prev, newMsg]);
      } else {
        toast(`New message from ${newMsg.sender?.fullName || "someone"}!`);
      }
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [user?.id]);

  // --- Fetching Data ---
 // --- Fetching Data ---
  // --- Fetching Data ---
useEffect(() => {
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    // 💡 1. STOP if user already has no apartment in LocalStorage
    // This prevents broken requests from even firing
    if (!apartmentIdFromStorage) {
      setLoading(false);
      return;
    }

    try {
      const [reqRes, offerRes, msgRes] = await Promise.all([
        fetch(`${API_URL}/api/requests/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/offers/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // 💡 2. HANDLE EVICTION (403)
      if (reqRes.status === 403 || offerRes.status === 403) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...storedUser, apartmentId: null, isEvicted: true };
        
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Notify Navbar to stop its own background requests
        window.dispatchEvent(new Event("local-storage-update"));
        
        toast.error("You are no longer part of this community.");
        setLoading(false);
        return; 
      }

      if (reqRes.ok && offerRes.ok && msgRes.ok) {
        const requests = await reqRes.json();
        const offers = await offerRes.json();
        const messagesData = await msgRes.json();

        setMyPosts([
          ...requests.map(r => ({ ...r, postType: "requests", author: r.author?._id || r.author })),
          ...offers.map(o => ({ ...o, postType: "offers", author: o.author?._id || o.author }))
        ]);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [navigate, token, apartmentIdFromStorage]); // apartmentIdFromStorage is a dependency

  // --- Join Apartment Action ---
  const handleJoinApartment = async (e) => {
    e.preventDefault();
    if (!newApartmentId.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/set-apartment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apartmentId: newApartmentId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // 💡 Update local storage and reset the eviction flag
      const updatedUser = { ...localStorageUser, apartmentId: data.apartmentId, isEvicted: false };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("token", data.token);

      toast.success("Welcome back to a community! 🎉");
      window.location.reload(); 
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

 // ==========================================
  // 🚨 GATEKEEPER: IF USER HAS NO APARTMENT
  // ==========================================
  if (!apartmentIdFromStorage) {
    const isAdmin = localStorageUser.role === "admin";

    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
          
          {/* Ambient Background Glows */}
          <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[120px] pointer-events-none ${isAdmin ? 'bg-purple-500/10' : 'bg-blue-500/10'}`} />
          <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[120px] pointer-events-none ${isAdmin ? 'bg-indigo-500/10' : 'bg-cyan-500/10'}`} />

          <div className="max-w-md w-full relative group">
            {/* Soft Outer Glow */}
            <div className={`absolute -inset-1 rounded-[2.6rem] blur opacity-20 transition duration-1000 ${isAdmin ? 'bg-gradient-to-r from-purple-600 to-indigo-500' : 'bg-gradient-to-r from-blue-600 to-cyan-500'}`}></div>
            
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-white/20 dark:border-gray-800/50 text-center animate-in fade-in zoom-in duration-500">
              
              {/* 🚨 Eviction Notice (Only show if previously evicted) */}
              {isEvicted && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3 text-left">
                  <AlertTriangle className="text-red-500 shrink-0 mt-1" size={18} />
                  <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                    You were removed from your previous community. Please {isAdmin ? "re-register your apartment" : "join a new one"}.
                  </p>
                </div>
              )}

              {/* Dynamic Icon based on Role */}
              <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-lg transition-transform hover:rotate-6 ${isAdmin ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                {isAdmin ? <Building size={40} className="animate-pulse" /> : <Building size={40} />}
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {isAdmin ? "Set Up Apartment" : "Join a Community"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 mb-8">
                {isAdmin 
                  ? "As an admin, you need to register an Apartment ID to start managing your community." 
                  : "Please enter the Apartment ID provided by your building manager to reconnect."}
              </p>

              <form onSubmit={handleJoinApartment} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">
                    {isAdmin ? "Create Apartment ID" : "Apartment ID"}
                  </label>
                  <input
                    type="text"
                    placeholder={isAdmin ? "e.g. SKYLINE-7" : "e.g. SUNSET-402"}
                    className={`w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 transition-all uppercase font-mono tracking-widest dark:text-white ${isAdmin ? 'focus:ring-purple-500' : 'focus:ring-blue-500'}`}
                    value={newApartmentId}
                    onChange={(e) => setNewApartmentId(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg ${isAdmin ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
                >
                  {loading ? "Processing..." : isAdmin ? "Register Apartment" : "Join Apartment"} 
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white truncate">
            Welcome, {user?.fullName}!
          </h1>
        </header>

        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
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
          <button
            onClick={() => setActiveTab("messages")}
            className={`pb-4 px-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "messages" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-400"}`}
          >
            Inbox{" "}
            {messages.filter((m) => !m.isRead).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {messages.filter((m) => !m.isRead).length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <p className="text-center py-10 dark:text-gray-400 animate-pulse">
            Loading dashboard...
          </p>
        ) : (
          <div className="grid gap-6 min-w-0 w-full">
            {activeTab === "messages" ? (
              groupedMessages.length > 0 ? (
                groupedMessages.map((msg) => {
                  const otherUser = msg.otherUser;
                  const isChatOpen = replyingTo === (otherUser?._id || otherUser)?.toString();

                  // Check if there are ANY unread messages in this specific conversation
                  const hasUnread = messages.some(
                    (m) =>
                      !m.isRead &&
                      (m.sender?._id || m.sender)?.toString() === (otherUser?._id || otherUser)?.toString()
                  );

                  return (
                    <div
                      key={msg._id}
                      className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 ${isChatOpen ? "ring-2 ring-blue-500 bg-white dark:bg-gray-900 shadow-lg" : !hasUnread ? "bg-white dark:bg-gray-900 shadow-sm" : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-md ring-1 ring-blue-500/20"}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-gray-800 dark:text-gray-200 block truncate">
                            Chat with {otherUser?.fullName}
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate italic">
                            Re: {msg.postTitle || "General Inquiry"}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            openConversation(
                              (otherUser?._id || otherUser)?.toString(),
                              msg._id,
                              msg.isRead,
                            )
                          }
                          className="shrink-0 text-[10px] font-black uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          {isChatOpen ? "Close Chat" : "View Chat"}
                        </button>
                      </div>

                      {isChatOpen ? (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div
                            ref={chatContainerRef}
                            className="space-y-3 max-h-80 overflow-y-auto mb-4 p-2 flex flex-col no-scrollbar"
                          >
                            {loadingChat ? (
                              <div className="flex justify-center py-4">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : (
                              <>
                                {conversation.map((chat) => (
                                  <div
                                    key={chat._id}
                                    className={`flex w-full mb-1 ${chat.sender?._id === user?.id || chat.sender === user?.id ? "justify-end" : "justify-start"}`}
                                  >
                                    <div
                                      className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                                        chat.sender?._id === user?.id ||
                                        chat.sender === user?.id
                                          ? "bg-blue-600 text-white rounded-tr-none"
                                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700"
                                      }`}
                                    >
                                      {chat.content}
                                      <div
                                        className={`text-[9px] mt-1 opacity-70 ${chat.sender?._id === user?.id || chat.sender === user?.id ? "text-right" : "text-left"}`}
                                      >
                                        {new Date(
                                          chat.createdAt,
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>

                          <form
                            onSubmit={(e) =>
                              handleReply(
                                e,
                                (otherUser?._id || otherUser)?.toString(),
                                msg.relatedPostId,
                                msg.postTitle,
                              )
                            }
                            className="flex gap-2 sticky bottom-0 bg-inherit pt-2"
                          >
                            <input
                              autoFocus
                              className="flex-grow p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                              placeholder="Type a message..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                            />
                            <button
                              type="submit"
                              disabled={!replyContent.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                            >
                              <Send size={18} />
                            </button>
                          </form>
                        </div>
                      ) : (
                        <p
                          className={`text-sm ${hasUnread ? "font-semibold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"} truncate mt-2`}
                        >
                          {msg.content}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-10 text-gray-500">
                  Your inbox is empty.
                </p>
              )
            ) : (
              /* MY POSTS SECTION */
              (() => {
                const filtered = myPosts.filter(
                  (p) => p.postType === activeTab,
                );
                return filtered.length > 0 ? (
                  filtered.map((post) => {
                    const isResolved =
                      post.status?.toLowerCase() === "resolved";
                      const isOwner = post.author?.toString() === user?.id?.toString();

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
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
