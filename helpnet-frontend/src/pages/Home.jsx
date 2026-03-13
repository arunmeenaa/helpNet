import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import Hero from "../components/Features"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-teal-500/20 dark:bg-teal-600/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative px-6 pt-20 pb-24 lg:pt-32 lg:pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm mb-8 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Community network is currently active
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
            Neighbors helping neighbors, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              when it matters most.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl leading-relaxed">
            HelpNet is a crowdsourced platform connecting people who need assistance with those ready to lend a hand. From everyday favors to emergency support, build a stronger community today.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* These links will trigger your ProtectedRoute if the user isn't logged in! */}
            <Link to="/post" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                I Need Help
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </Link>
            
            <Link to="/OfferHelp" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 font-bold text-lg shadow-sm hover:border-teal-500 hover:text-teal-600 dark:hover:border-teal-400 dark:hover:text-teal-400 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                I Can Help
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </Link>
          </div>
        </section>
<Hero/>
       {/* How It Works Section */}
        <section className="bg-white dark:bg-gray-900 py-20 border-y border-gray-200/50 dark:border-gray-800/50 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                How HelpNet Works
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                A simple, secure way to coordinate community support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-6 shadow-inner">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Join the Network</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Create a free, verified account to ensure trust and safety within your local community.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 shadow-inner">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Post or Browse</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Post a request if you need a hand, or browse the active feed to see where you can offer your skills.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6 shadow-inner">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Connect Securely</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Reach out directly through the platform to coordinate details and make a real impact.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}