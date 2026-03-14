import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Don't forget to import Link!
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from '../api'; // This tells the file where to get the value

export default function AvailableHelp() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Grab the currently logged-in user
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch live offers from MongoDB
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/offers`);
        if (!response.ok) throw new Error("Failed to fetch offers");

        const data = await response.json();
        setOffers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const filteredOffers = offers.filter(
    (offer) =>
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-teal-500/10 dark:bg-teal-600/10 blur-[120px] rounded-full pointer-events-none"></div>

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

          <div className="w-full md:w-96 relative group">
            <input
              type="text"
              placeholder="Search by keyword, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-teal-500/50 outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-teal-600 dark:text-teal-400 font-bold">
            Loading community offers...
          </div>
        )}
        {error && <div className="text-center py-20 text-red-500">{error}</div>}

        {!loading && !error && filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer._id}
                className="group flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                      {getCategoryIcon(offer.category)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {offer.author?.fullName || "Anonymous"}
                      </p>
                      <p className="text-xs font-medium text-teal-600 dark:text-teal-400">
                        {offer.category}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-grow mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 leading-tight">
                    {offer.title}
                  </h3>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">📍 {offer.location}</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">
                        🕒 {offer.availability}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Conditional Logic for the Connect Button */}
                {currentUser?.id === offer.author?._id ? (
                  <Link to="/dashboard">
                    <button className="w-full py-3.5 rounded-xl font-bold text-base bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed transition-all">
                      Manage Your Offer
                    </button>
                  </Link>
                ) : (
                  <Link to={`/offer-details/${offer._id}`}>
                    <button className="w-full py-3.5 rounded-xl font-bold text-base bg-gray-50 text-gray-700 border border-gray-200 hover:bg-teal-600 hover:text-white dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-teal-500 dark:hover:text-gray-950 transition-all duration-300">
                      Connect
                    </button>
                  </Link>
                )}
              </div>
            ))}
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
