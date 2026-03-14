import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from '../api'; // This tells the file where to get the value

export default function OfferDetails() {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New states for our In-App Messaging
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null); // "success" or "error"

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/offers/${id}`);
        if (!response.ok) throw new Error("Offer not found or server error");
        
        const data = await response.json();
        setOffer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferDetails();
  }, [id]);

  // NEW: Function to send the message to the backend
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    
    setIsSending(true);
    setSendStatus(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: offer.author._id,
          content: messageContent,
          relatedPostId: offer._id, // Connects the message to this specific offer
          postTitle: offer.title
        })
      });

      if (!response.ok) throw new Error("Failed to send message");

      setSendStatus("success");
      setMessageContent(""); // Clear the box
      
      // Hide the form after 3 seconds so they know it worked
      setTimeout(() => {
        setShowMsgForm(false);
        setSendStatus(null);
      }, 3000);

    } catch (err) {
      setSendStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
            <p className="text-red-500 mb-6">{error || "Could not load this offer."}</p>
            <Link to="/findHelp" className="text-teal-600 dark:text-teal-400 font-bold hover:underline">
              ← Back to Available Helps
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    const icons = { Transportation: "🚗", Supplies: "📦", Food: "🍲", Labor: "💪", Services: "🛠️", Equipment: "⚡" };
    return icons[category] || "🤝";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-500/5 dark:bg-teal-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-grow w-full max-w-3xl mx-auto px-6 py-10 lg:py-16 relative z-10">
        
        <Link 
          to="/findHelp" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors mb-8 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Offers
        </Link>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-teal-900/5 dark:shadow-none">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-2xl shadow-sm">
                 {getCategoryIcon(offer.category)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {offer.author?.fullName || "Anonymous"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Posted {new Date(offer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20">
                {offer.category}
              </span>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800 mb-8" />

          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
              {offer.title}
            </h1>
            
            <div className="bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/60 rounded-2xl p-6 mb-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {offer.description}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium bg-teal-50/50 dark:bg-teal-900/10 p-4 rounded-xl border border-teal-100 dark:border-teal-900/30">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg text-teal-600 dark:text-teal-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-0.5">Location</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{offer.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium bg-teal-50/50 dark:bg-teal-900/10 p-4 rounded-xl border border-teal-100 dark:border-teal-900/30">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg text-teal-600 dark:text-teal-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-0.5">Availability</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{offer.availability}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* THE NEW MESSAGING UI SECTION              */}
          {/* ========================================= */}
          
          <div className="flex flex-col gap-4">
            {currentUser?.id === offer.author?._id ? (
              <Link 
                to="/dashboard"
                className="w-full py-4 rounded-xl bg-gray-800 text-white font-bold text-lg hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Manage in Dashboard
              </Link>
            ) : (
              <>
                {/* 1. Show the Message Form if they clicked the button */}
                {showMsgForm ? (
                  <form onSubmit={handleSendMessage} className="bg-gray-50 dark:bg-gray-900 border border-teal-100 dark:border-teal-900/50 p-5 rounded-2xl animate-fade-in-up">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Send a secure message to {offer.author?.fullName}
                    </label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Hi! I'd love to connect regarding your offer..."
                      className="w-full px-4 py-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-teal-500/50 outline-none text-gray-900 dark:text-white resize-none mb-3"
                      rows="3"
                      required
                    ></textarea>
                    
                    <div className="flex gap-3">
                      <button 
                        type="submit" 
                        disabled={isSending}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold shadow-md hover:-translate-y-0.5 disabled:opacity-70 transition-all"
                      >
                        {isSending ? "Sending..." : "Send Message"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowMsgForm(false)}
                        className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-gray-700 transition-all"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Feedback Messages */}
                    {sendStatus === "success" && <p className="text-green-600 dark:text-green-400 text-sm mt-3 font-semibold text-center">Message sent successfully!</p>}
                    {sendStatus === "error" && <p className="text-red-600 dark:text-red-400 text-sm mt-3 font-semibold text-center">Failed to send message. Please try again.</p>}
                  </form>
                ) : (
                  
                  /* 2. Or show the default buttons if the form is hidden */
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setShowMsgForm(true)}
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold text-lg shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Contact Helper
                    </button>
                    
                    <button 
                      onClick={() => navigator.clipboard.writeText(window.location.href)}
                      className="sm:w-auto py-4 px-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 border border-transparent dark:border-gray-700"
                    >
                      Copy Link
                    </button>
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