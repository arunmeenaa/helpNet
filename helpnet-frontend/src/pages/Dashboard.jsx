import React, { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, RotateCcw, Edit3, Trash2, Send } from "lucide-react";
// 💡 1. Import Socket.IO Client
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

// 💡 2. Connect to the backend socket outside the component
const socket = io(API_URL);

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  const chatContainerRef = useRef(null);

  // --- States ---
  const [activeTab, setActiveTab] = useState("requests");
  const [myPosts, setMyPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chat States
  const [conversation, setConversation] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // Post Action States
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });

  // 💡 FIX: Safely separated URL Tab Checker
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "messages") {
      setActiveTab("messages");
    } else if (tab === "offers") {
      setActiveTab("offers");
    } else if (tab === "requests") {
      setActiveTab("requests");
    }
  }, [location.search]);

  // 💡 3. We use a Ref to keep track of who we are chatting with inside the Socket event
  const replyingToRef = useRef(replyingTo);
  useEffect(() => {
    replyingToRef.current = replyingTo;
  }, [replyingTo]);

  // --- REAL-TIME SOCKET CONNECTION ---
  useEffect(() => {
    if (user?.id) {
      // Tell the server this user is online and join their private room
      socket.emit("join_room", user.id);
    }

    // Listen for incoming messages
    const handleReceiveMessage = (newMsg) => {
      const senderId = (newMsg.sender?._id || newMsg.sender)?.toString();

      // 1. Instantly add the new message to the general Inbox preview
      setMessages((prev) => [newMsg, ...prev]);

      // 2. If the user is currently looking at the chat with this person:
      if (replyingToRef.current === senderId) {
        setConversation((prev) => [...prev, newMsg]);

        // Optionally mark it as read immediately since they are staring at it
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/api/messages/${newMsg._id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(() => {
            setMessages((prev) =>
              prev.map((m) =>
                m._id === newMsg._id ? { ...m, isRead: true } : m,
              ),
            );
          })
          .catch((err) => console.log(err));
      } else {
        // Only show a toast notification if they aren't actively in the chat
        toast(`New message from ${newMsg.sender?.fullName || "someone"}!`);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    // Cleanup the listener when the component unmounts
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [user?.id]);

  // Precise Scroll Logic
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversation, replyingTo]);

  // --- Logic: Group Messages for Inbox ---
  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach((msg) => {
      const otherUser = msg.sender?._id === user.id ? msg.receiver : msg.sender;

      const otherId = (otherUser?._id || otherUser)?.toString();
      if (
        otherId &&
        (!groups[otherId] ||
          new Date(msg.createdAt) > new Date(groups[otherId].createdAt))
      ) {
        groups[otherId] = { ...msg, otherUser };
      }
    });
    return Object.values(groups);
  }, [messages, user?.id]);

  // --- Fetching Data ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      try {
        const [reqRes, offerRes, msgRes] = await Promise.all([
          fetch(`${API_URL}/api/requests/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/offers/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/messages/inbox`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!reqRes.ok || !offerRes.ok || !msgRes.ok) {
          throw new Error("API failed");
        }

        const requests = await reqRes.json();
        const offers = await offerRes.json();
        const messagesData = await msgRes.json();
        setMyPosts([
          ...(Array.isArray(requests)
            ? requests.map((r) => ({
                ...r,
                postType: "requests",
                author: r.author?._id || r.author,
              }))
            : []),
          ...(Array.isArray(offers)
            ? offers.map((o) => ({
                ...o,
                postType: "offers",
                author: o.author?._id || o.author,
              }))
            : []),
        ]);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (err) {
        console.error("Dashboard Load Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  // --- Chat Actions ---
  const openConversation = async (otherUserId, msgId, isRead) => {
    if (replyingTo === otherUserId) return setReplyingTo(null);

    setReplyingTo(otherUserId);
    setLoadingChat(true);
    const token = localStorage.getItem("token");

    // Auto Mark as Read logic
    if (!isRead && msgId) {
      try {
        await fetch(`${API_URL}/api/messages/${msgId}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages((prev) =>
          prev.map((m) => (m._id === msgId ? { ...m, isRead: true } : m)),
        );
      } catch (err) {
        console.error("Auto-read failed", err);
      }
    }

    try {
      const res = await fetch(
        `${API_URL}/api/messages/conversation/${otherUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setConversation(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error loading chat history.");
    } finally {
      setLoadingChat(false);
    }
  };

  const handleReply = async (e, otherUserId, relatedPostId, postTitle) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: otherUserId,
          content: replyContent,
          relatedPostId,
          postTitle,
        }),
      });

      if (res.ok) {
        const savedMsg = await res.json();

        // Update local flow immediately
        setConversation((prev) => [
          ...prev,
          { ...savedMsg, sender: { _id: user.id } },
        ]);
        setReplyContent("");

        // 💡 4. EMIT REAL-TIME MESSAGE TO BACKEND
        socket.emit("send_message", {
          ...savedMsg,
          receiverId: otherUserId,
        });
      }
    } catch (err) {
      toast.error("Failed to send message.");
    }
  };

  // --- Post Management Actions ---
  const handleUpdateStatus = async (postId, postType, newStatus) => {
    const post = myPosts.find((p) => p._id === postId); // ✅ FIRST

    if (post?.author !== user?.id) {
      toast.error("You are not the owner of this post");
      setUpdatingStatusId(null);
      return;
    }

    setUpdatingStatusId(postId);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/${postType}/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error();

      const result = await res.json();

      setMyPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, ...result, status: newStatus } : p,
        ),
      );

      toast.success(`Post marked as ${newStatus}!`);
    } catch (err) {
      toast.error("Update failed.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const deletePost = async (postId, postType) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/${postType}/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMyPosts(myPosts.filter((p) => p._id !== postId));
        toast.success("Post removed!");
      }
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const handleUpdatePost = async (e, postId, postType) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/${postType}/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        const updatedDoc = await res.json();
        setMyPosts(
          myPosts.map((p) => (p._id === postId ? { ...p, ...updatedDoc } : p)),
        );
        setEditingPost(null);
        toast.success("Updated!");
      }
    } catch (err) {
      toast.error("Connection error.");
    }
  };

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
    
    ${
      isOwner
        ? post.postType === "offers"
          ? "ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-900/10"
          : "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/10"
        : ""
    }
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
