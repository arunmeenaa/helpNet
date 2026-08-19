import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import Hero from "../../components/common/Features";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden font-sans">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden -z-10 pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay dark:opacity-10"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/30 dark:bg-blue-600/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse [animation-duration:8s]"></div>
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-teal-500/30 dark:bg-teal-500/15 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse [animation-duration:10s]"></div>
        <div className="absolute bottom-[-10%] left-[30%] w-[450px] h-[450px] bg-purple-500/20 dark:bg-purple-600/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <main className="flex-grow flex flex-col items-center">
        {/* Hero Section */}
        <section className="relative px-6 pt-24 pb-20 lg:pt-32 lg:pb-32 w-full max-w-7xl mx-auto flex flex-col items-center text-center z-10">

          {/* Status Badge — glass pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(31,38,135,0.12)] mb-10 transition-transform hover:scale-105">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tracking-wide">
              Community network is currently active
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6 max-w-4xl">
            Neighbors helping neighbors, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-400 dark:from-blue-400 dark:to-teal-300">
              when it matters most.
            </span>
          </h1>

          {/* Subtitle — glass card */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed px-6 py-4 rounded-2xl bg-white/30 dark:bg-white/[0.03] backdrop-blur-md border border-white/40 dark:border-white/[0.06]">
            HelpNet is a crowdsourced platform connecting people who need assistance with those ready to lend a hand. From everyday favors to emergency support, build a stronger community today.
          </p>

          {/* Call to Action Buttons — glass buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link to="/post" className="w-full sm:w-auto group">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600/90 to-teal-500/90 backdrop-blur-md hover:from-blue-700/90 hover:to-teal-600/90 text-white font-bold text-lg border border-white/30 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                I Need Help
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </Link>

            <Link to="/OfferHelp" className="w-full sm:w-auto group">
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150 text-slate-900 dark:text-white border border-white/60 dark:border-white/10 font-bold text-lg shadow-[0_8px_32px_rgba(31,38,135,0.1)] hover:shadow-[0_8px_32px_rgba(31,38,135,0.18)] hover:border-teal-500/50 dark:hover:border-teal-400/40 hover:bg-white/60 dark:hover:bg-white/10 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                I Can Help
                <svg className="w-5 h-5 text-slate-400 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </Link>
          </div>
        </section>

        <Hero />

        {/* How It Works Section */}
        <section className="w-full py-24 relative z-10 bg-white/20 dark:bg-white/[0.02] backdrop-blur-2xl border-y border-white/40 dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 relative">

            <div className="text-center mb-20">
              <h2 className="text-sm font-bold text-teal-600 dark:text-teal-400 tracking-widest uppercase mb-3">
                Process
              </h2>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                How HelpNet Works
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                A simple, secure way to coordinate community support in three easy steps.
              </p>
            </div>

            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-[55%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-200/60 via-teal-200/60 to-purple-200/60 dark:from-blue-800/40 dark:via-teal-800/40 dark:to-purple-800/40 -z-10"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">

              {/* Step 1 — glass card */}
              <div className="group bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl backdrop-saturate-150 rounded-3xl p-8 border border-white/50 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(31,38,135,0.08)] hover:bg-white/60 dark:hover:bg-white/[0.08] hover:shadow-[0_16px_48px_rgba(59,130,246,0.15)] transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-100/60 dark:bg-blue-400/10 backdrop-blur-md flex items-center justify-center text-blue-600 dark:text-blue-300 mb-8 shadow-inner ring-1 ring-white/60 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 text-center">1. Join the Network</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-center text-sm sm:text-base">
                  Create a free, verified account to ensure trust and safety within your local community.
                </p>
              </div>

              {/* Step 2 — glass card */}
              <div className="group bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl backdrop-saturate-150 rounded-3xl p-8 border border-white/50 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(31,38,135,0.08)] hover:bg-white/60 dark:hover:bg-white/[0.08] hover:shadow-[0_16px_48px_rgba(168,85,247,0.15)] transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100/60 dark:bg-purple-400/10 backdrop-blur-md flex items-center justify-center text-purple-600 dark:text-purple-300 mb-8 shadow-inner ring-1 ring-white/60 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 text-center">2. Post or Browse</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-center text-sm sm:text-base">
                  Post a request if you need a hand, or browse the active feed to see where you can offer your skills.
                </p>
              </div>

              {/* Step 3 — glass card */}
              <div className="group bg-white/40 dark:bg-white/[0.04] backdrop-blur-xl backdrop-saturate-150 rounded-3xl p-8 border border-white/50 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(31,38,135,0.08)] hover:bg-white/60 dark:hover:bg-white/[0.08] hover:shadow-[0_16px_48px_rgba(20,184,166,0.15)] transform hover:-translate-y-2 transition-all duration-300">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-100/60 dark:bg-teal-400/10 backdrop-blur-md flex items-center justify-center text-teal-600 dark:text-teal-300 mb-8 shadow-inner ring-1 ring-white/60 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3 text-center">3. Connect Securely</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-center text-sm sm:text-base">
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