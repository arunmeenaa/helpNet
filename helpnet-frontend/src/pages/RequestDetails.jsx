import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from '../api';
import toast from "react-hot-toast";

export default function RequestDetails() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Messaging States
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchRequestDetails = async () => {
      // Guard against undefined ID
      if (!id || id === "undefined") {
        setError("Invalid Request ID provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/requests/${id}`);
        if (!response.ok) throw new Error("Request not found");
        const data = await response.json();
        setRequest(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequestDetails();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    
    setIsSending(true);
    const loadingToast = toast.loading("Sending message...");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: request.author._id,
          content: messageContent,
          relatedPostId: request._id,
          postTitle: request.title
        })
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast.success("Message sent! They can view it in their dashboard.", { id: loadingToast });
      setMessageContent("");
      setShowMsgForm(false);
    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar /><div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div><Footer />
    </div>
  );

  if (error || !request) return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar /><div className="flex-grow flex items-center justify-center text-center p-8"><h2 className="text-2xl font-bold dark:text-white">{error}</h2><Link to="/RequestsFeed" className="text-blue-600 mt-4 block">← Back to Feed</Link></div><Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative transition-colors duration-300">
      <Navbar />
      <main className="flex-grow w-full max-w-3xl mx-auto px-6 py-10 lg:py-16 relative z-10">
        
        <Link to="/RequestsFeed" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 mb-8 group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Requests
        </Link>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-blue-900/5">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold text-xl">
                {request.author?.fullName?.charAt(0) || "?"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{request.author?.fullName || "Anonymous"}</h3>
                <p className="text-sm text-gray-500">Posted {new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${request.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                {request.priority} Priority
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">{request.title}</h1>
          <div className="bg-gray-50 dark:bg-gray-950/50 rounded-2xl p-6 mb-8 text-lg text-gray-700 dark:text-gray-300">{request.description}</div>

          {/* Action Section */}
          <div className="flex flex-col gap-4">
            {currentUser?.id === request.author?._id ? (
              <Link to="/dashboard" className="w-full py-4 rounded-xl bg-gray-800 text-white font-bold text-center">Manage in Dashboard</Link>
            ) : (
              <>
                {showMsgForm ? (
                  <form onSubmit={handleSendMessage} className="bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-5 rounded-2xl">
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="I can help you with this! Let's connect..."
                      className="w-full p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl mb-3 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4" required
                    />
                    <div className="flex gap-3">
                      <button type="submit" disabled={isSending} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                        {isSending ? "Sending..." : "Send Message"}
                      </button>
                      <button type="button" onClick={() => setShowMsgForm(false)} className="px-6 py-3 bg-gray-200 dark:bg-gray-800 dark:text-white rounded-xl">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => setShowMsgForm(true)} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-lg">
                      Contact
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="px-8 py-4 bg-gray-100 dark:bg-gray-800 dark:text-white rounded-xl">Copy Link</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}