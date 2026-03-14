import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api"; // <-- Your magic variable

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("posts");
  const [myPosts, setMyPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      try {
        // Fetch both Requests and Offers simultaneously
        const [reqRes, offerRes, msgRes] = await Promise.all([
          fetch(`${API_URL}/api/requests/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/offers/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const requests = await reqRes.json();
        const offers = await offerRes.json();
        const messages = await msgRes.json();

        // Combine them into one list
        setMyPosts([...requests, ...offers]);
        setMessages(messages);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const markAsRead = async (msgId) => {
    const token = localStorage.getItem("token");
    try {
      // Updated to use API_URL
      await fetch(`${API_URL}/api/messages/${msgId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(
        messages.map((m) => (m._id === msgId ? { ...m, isRead: true } : m)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const handleReply = async (e, originalMsg) => {
    e.preventDefault();
    setIsSendingReply(true);
    const token = localStorage.getItem("token");

    try {
      // Updated to use API_URL
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: originalMsg.sender._id,
          content: replyText,
          relatedPostId: originalMsg.relatedPostId,
          postTitle: originalMsg.postTitle,
        }),
      });

      if (response.ok) {
        setReplyText("");
        setReplyingTo(null);
        toast.success("Reply sent successfully! ✉️"); // Much cleaner than an alert box
      
      }
    } catch (err) {
      console.error("Failed to send reply", err);
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Welcome, {user?.fullName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your community activity and messages.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-4 px-2 font-bold text-sm transition-all ${activeTab === "posts" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            My Posts ({myPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`pb-4 px-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "messages" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            Inbox
            {messages.filter((m) => !m.isRead).length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {messages.filter((m) => !m.isRead).length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <p className="text-center py-10 dark:text-gray-400">
            Loading your data...
          </p>
        ) : (
          <div className="grid gap-6">
            {activeTab === "posts" ? (
              myPosts.length > 0 ? (
                myPosts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <h3 className="font-bold text-lg dark:text-white">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {post.category} • {post.location}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">
                  You haven't posted anything yet.
                </p>
              )
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-6 rounded-2xl border transition-all ${
                    msg.isRead
                      ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                      : "bg-teal-50/30 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/50 shadow-md ring-1 ring-teal-500/20"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      From: {msg.sender?.fullName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">
                    Re: {msg.postTitle || "General Inquiry"}
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    {msg.content}
                  </p>

                  <div className="mt-4 flex justify-between items-center">
                    {!msg.isRead ? (
                      <button
                        onClick={() => markAsRead(msg._id)}
                        className="text-xs font-bold text-teal-600 hover:underline"
                      >
                        Mark as Read
                      </button>
                    ) : (
                      <span></span>
                    )}

                    <button
                      onClick={() => {
                        if (!msg.isRead) markAsRead(msg._id);
                        setReplyingTo(msg._id);
                        setReplyText(
                          `Hi ${msg.sender?.fullName.split(" ")[0]}, `,
                        );
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-teal-600 hover:text-white transition-all"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                      Reply
                    </button>
                  </div>

                  {replyingTo === msg._id && (
                    <form
                      onSubmit={(e) => handleReply(e, msg)}
                      className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800"
                    >
                      <textarea
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        rows="3"
                        placeholder="Write your response..."
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="px-3 py-1.5 text-xs font-bold text-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSendingReply}
                          className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 disabled:opacity-50"
                        >
                          {isSendingReply ? "Sending..." : "Send Reply"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-gray-500">
                Your inbox is empty.
              </p>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}