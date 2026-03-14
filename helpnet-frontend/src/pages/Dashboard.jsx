import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api"; 
import { toast } from "react-hot-toast"; 

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("requests");
  const [myPosts, setMyPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null); // Track which button is loading
  const [editingPost, setEditingPost] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [reqRes, offerRes, msgRes] = await Promise.all([
          fetch(`${API_URL}/api/requests/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/offers/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const requests = await reqRes.json();
        const offers = await offerRes.json();
        const messagesData = await msgRes.json();

        const taggedRequests = Array.isArray(requests) ? requests.map(r => ({ ...r, postType: 'requests' })) : [];
        const taggedOffers = Array.isArray(offers) ? offers.map(o => ({ ...o, postType: 'offers' })) : [];

        setMyPosts([...taggedRequests, ...taggedOffers]);
        setMessages(messagesData);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (postId, postType, newStatus) => {
  setUpdatingStatusId(postId);
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${API_URL}/api/${postType}/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus.toLowerCase() })
    });

    if (res.ok) {
      const result = await res.json();
      
      // 💡 LOGIC FIX: Some backends return { message, post } 
      // We need to find the actual post object
      const updatedPost = result.post || result; 

      setMyPosts(prevPosts => 
        prevPosts.map(p => 
          p._id === postId 
            ? { ...p, status: newStatus.toLowerCase(), postType } // Manually force the status update
            : p
        )
      );
      toast.success(`Post is now ${newStatus}!`);
    }
  } catch (err) {
    toast.error("Failed to update status.");
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
        setMyPosts(myPosts.filter((post) => post._id !== postId));
        toast.success("Post removed! 🗑️");
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUpdate = async (e, postId, postType) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/${postType}/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        const updatedDoc = await res.json();
        setMyPosts(myPosts.map(p => p._id === postId ? { ...p, ...updatedDoc, postType } : p));
        setEditingPost(null);
        toast.success("Post updated! ✨");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const markAsRead = async (msgId) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/api/messages/${msgId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(messages.map((m) => (m._id === msgId ? { ...m, isRead: true } : m)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Welcome, {user?.fullName}!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your community activity and messages.</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-8">
          <button onClick={() => setActiveTab("requests")} className={`pb-4 px-2 font-bold text-sm transition-all ${activeTab === "requests" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
            My Requests ({myPosts.filter(p => p.postType === 'requests').length})
          </button>
          <button onClick={() => setActiveTab("offers")} className={`pb-4 px-2 font-bold text-sm transition-all ${activeTab === "offers" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-400 hover:text-gray-600"}`}>
            My Offers ({myPosts.filter(p => p.postType === 'offers').length})
          </button>
          <button onClick={() => setActiveTab("messages")} className={`pb-4 px-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === "messages" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-400 hover:text-gray-600"}`}>
            Inbox {messages.filter((m) => !m.isRead).length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{messages.filter((m) => !m.isRead).length}</span>}
          </button>
        </div>

        {loading ? (
          <p className="text-center py-10 dark:text-gray-400">Loading your data...</p>
        ) : (
          <div className="grid gap-6">
            {activeTab === "messages" ? (
               messages.length > 0 ? messages.map((msg) => (
                <div key={msg._id} className={`p-6 rounded-2xl border transition-all ${msg.isRead ? "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800" : "bg-teal-50/30 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/50 shadow-md ring-1 ring-teal-500/20"}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-teal-600 dark:text-teal-400">From: {msg.sender?.fullName}</span>
                    <span className="text-xs text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 italic">Re: {msg.postTitle || "General Inquiry"}</p>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{msg.content}</p>
                  {!msg.isRead && (
                    <button onClick={() => markAsRead(msg._id)} className="mt-4 text-xs bg-teal-600 text-white px-3 py-1 rounded-md">Mark as Read</button>
                  )}
                </div>
              )) : <p className="text-center py-10 text-gray-500">Your inbox is empty.</p>
            ) : (
              (() => {
                const filtered = myPosts.filter(p => p.postType === activeTab);
                
                const sorted = [...filtered].sort((a, b) => {
                  const statusA = (a.status || 'open').toLowerCase();
                  const statusB = (b.status || 'open').toLowerCase();
                  if (statusA === 'resolved' && statusB !== 'resolved') return 1;
                  if (statusA !== 'resolved' && statusB === 'resolved') return -1;
                  return 0;
                });

                return sorted.length > 0 ? sorted.map((post) => {
                  const isOffer = post.postType === 'offers';
                  const isResolved = post.status?.toLowerCase().trim() === 'resolved';

                  return (
                    <div key={`${post._id}-${post.status}`} className={`p-6 rounded-2xl border transition-all duration-300 ${
                      isResolved 
                        ? "bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-60 shadow-none" 
                        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm"
                    }`}>
                      {editingPost === post._id ? (
                        <form onSubmit={(e) => handleUpdate(e, post._id, post.postType)} className="space-y-4">
                           <input 
                            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                            value={editData.title}
                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                          />
                          <textarea 
                            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white"
                            rows="3"
                            value={editData.description}
                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                          />
                          <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Save</button>
                            <button type="button" onClick={() => setEditingPost(null)} className="bg-gray-200 dark:bg-gray-700 px-4 py-1.5 rounded-lg text-sm font-bold">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${isOffer ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                                {isOffer ? 'Offer' : 'Request'}
                              </span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${isResolved ? 'bg-gray-300 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                                {post.status || 'open'}
                              </span>
                            </div>

                            <h3 className={`font-bold text-lg ${isResolved ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{post.description}</p>
                            
                            {/* 💡 THE FIX: Dynamic Button Logic */}
                            <button 
                              disabled={updatingStatusId === post._id}
                              onClick={() => handleUpdateStatus(post._id, post.postType, isResolved ? 'open' : 'resolved')}
                              className={`mt-4 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                                isResolved 
                                  ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' // Styling for re-opening
                                  : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' // Styling for resolving
                              } ${updatingStatusId === post._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {updatingStatusId === post._id ? (
                                <span>Processing...</span>
                              ) : isResolved ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  <span>Re-open Post</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Mark as Resolved</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button onClick={() => { setEditingPost(post._id); setEditData({ title: post.title, description: post.description }); }} className="p-2 text-gray-400 hover:text-blue-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                            <button onClick={() => deletePost(post._id, post.postType)} className="p-2 text-gray-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : <p className="text-center py-10 text-gray-500">You haven't posted any {activeTab} yet.</p>;
              })()
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}