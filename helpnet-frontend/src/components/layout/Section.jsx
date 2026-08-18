import React from "react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      
      {/* Decorative ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Subtle overlay pattern (optional depth) */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/40 pointer-events-none"></div>

      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
        
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
          Need Help or Want to Help Others?
        </h2>
        
        <p className="text-lg md:text-xl text-blue-50 dark:text-gray-300 mb-10 max-w-2xl font-medium leading-relaxed drop-shadow-sm">
          Join HelpNet today and connect with people in your community who
          are ready to support each other during emergencies.
        </p>
        
        <Link to="/login">
          <button
            className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full font-bold text-lg 
                       bg-white text-blue-600 dark:bg-gray-950 dark:text-cyan-400 
                       shadow-xl shadow-blue-900/20 dark:shadow-none 
                       hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 
                       border border-transparent dark:border-gray-800 dark:hover:border-cyan-500/50
                       transition-all duration-300"
          >
            <span>Join HelpNet</span>
            <svg 
              className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </Link>

      </div>
    </section>
  );
}