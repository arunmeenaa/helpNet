import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from '../components/Loading';
import API_URL from '../api'; // This tells the file where to get the value
import SkeletonCard from '../components/SkeletonCard'; // Adjust path if needed

export default function RequestsFeed() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  // Fetch live requests from MongoDB
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${API_URL}/api/requests`);
        if (!response.ok) throw new Error("Failed to fetch requests");
        
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Filter logic
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "All" || req.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityStyles = (level) => {
    if (level === "High") return "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
    if (level === "Medium") return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    return "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
      <Navbar />

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header & Controls Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="px-4 py-1.5 text-xs font-bold tracking-widest text-blue-600 dark:text-cyan-400 uppercase bg-blue-100 dark:bg-cyan-900/30 rounded-full mb-4 inline-block">
              Community Needs
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              Help Requests
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Browse urgent and everyday requests from your neighbors. Step in and make a difference today.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group w-full sm:w-72">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white"
              />
            </div>

            <div className="relative group w-full sm:w-48">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-gray-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
 {/* Replace the old loading spinner with this skeleton grid */}
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

       {/* Requests Grid */}
{!loading && !error && filteredRequests.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredRequests.map((req) => {
      // 💡 Check if the current user is the owner
      const isOwner = currentUser?.id === req.author?._id;

      return (
        <div 
          key={req._id} 
          className={`group flex flex-col h-full rounded-3xl p-6 sm:p-8 transition-all duration-300 relative border ${
            isOwner 
              ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-400 dark:border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.2)] ring-2 ring-blue-500/20" 
              : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl"
          }`}
        >
          {/* 💡 "Your Post" Badge for clarity */}
          {isOwner && (
            <div className="absolute -top-3 left-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest z-20">
              Your Request
            </div>
          )}
          
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                isOwner ? "bg-blue-600 text-white shadow-md" : "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-800 text-blue-600 dark:text-cyan-400"
              }`}>
                {req.author?.fullName ? req.author.fullName.charAt(0) : "?"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {req.author?.fullName || "Anonymous"} 
                  {isOwner && <span className="ml-2 text-[10px] text-blue-500">(You)</span>}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border ${getPriorityStyles(req.priority)}`}>
              {req.priority}
            </span>
          </div>

          <div className="flex-grow mb-6">
            <h3 className={`text-xl font-bold mb-3 line-clamp-2 leading-tight transition-colors ${
              isOwner ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400"
            }`}>
              {req.title}
            </h3>
            <div className={`flex items-center gap-2 text-sm font-medium p-3 rounded-xl ${
              isOwner ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
            }`}>
              <span className="truncate">📍 {req.location}</span>
            </div>
          </div>

          {isOwner ? (
            <Link to="/dashboard">
              <button className="w-full py-3.5 rounded-xl font-bold text-base bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">
                Manage My Request
              </button>
            </Link>
          ) : (
            <Link to={`/request-details/${req._id}`}>
              <button className="w-full py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all">
                I Can Help
              </button>
            </Link>
          )}
        </div>
      );
    })}
  </div>
        ) : !loading && !error && (
          <div className="text-center py-20 px-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active requests</h3>
            <p className="text-gray-500 dark:text-gray-400">It looks like there are no help requests matching your current filters.</p>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}