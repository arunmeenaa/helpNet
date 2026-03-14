import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from '../api'; // This tells the file where to get the value

export default function RequestDetails() {
  const { id } = useParams(); // Grabs the ID from the URL
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/requests/${id}`);
        if (!response.ok) {
          throw new Error("Request not found or server error");
        }
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-cyan-400"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
            <p className="text-red-500 mb-6">{error || "Could not load this request."}</p>
            <Link to="/requests" className="text-blue-600 dark:text-cyan-400 font-bold hover:underline">
              ← Back to Feed
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-red-500/5 dark:bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-grow w-full max-w-3xl mx-auto px-6 py-10 lg:py-16 relative z-10">
        
        <Link 
          to="/RequestsFeed" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors mb-8 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Requests
        </Link>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-blue-900/5 dark:shadow-none">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-800 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold text-xl shadow-sm">
                {request.author?.fullName ? request.author.fullName.charAt(0) : "?"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {request.author?.fullName || "Anonymous"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Posted {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                {request.status || "Active"}
              </span>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                request.priority === "High" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400" :
                request.priority === "Medium" ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400" :
                "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400"
              }`}>
                {request.priority} Priority
              </span>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800 mb-8" />

          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
              {request.title}
            </h1>
            
            <div className="bg-gray-50 dark:bg-gray-950/50 border border-gray-100 dark:border-gray-800/60 rounded-2xl p-6 mb-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {request.description}
            </div>

            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium bg-blue-50/50 dark:bg-cyan-900/10 p-4 rounded-xl border border-blue-100 dark:border-cyan-900/30">
              <div className="p-2 bg-blue-100 dark:bg-cyan-900/50 rounded-lg text-blue-600 dark:text-cyan-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-0.5">Location</span>
                <span className="text-gray-900 dark:text-white font-semibold">{request.location}</span>
              </div>
            </div>
          </div>

         <div className="flex flex-col sm:flex-row gap-4">
            
            {/* Conditional Button Logic */}
            {currentUser?.id === request.author?._id ? (
              <Link 
                to="/dashboard"
                className="flex-1 py-4 rounded-xl bg-gray-800 text-white font-bold text-lg hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Manage in Dashboard
              </Link>
            ) : (
              <a 
                href={`mailto:${request.author?.email}?subject=I can help with: ${request.title}`}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Message Requester
              </a>
            )}
            
            <button 
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="sm:w-auto py-4 px-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 border border-transparent dark:border-gray-700"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Copy Link
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}