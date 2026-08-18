import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/10 dark:bg-cyan-500/10 blur-[120px] rounded-full mix-blend-overlay dark:mix-blend-lighten pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-900/10 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Subtle overlay texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 dark:bg-gray-800/50 backdrop-blur-md border border-white/30 dark:border-gray-700/50 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-bold tracking-wide text-white dark:text-gray-200 uppercase">
              Community First
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight lg:leading-[1.1] mb-6 drop-shadow-md tracking-tight">
            Get Help From Neighbors
            <span className="block text-yellow-300 dark:text-cyan-400 mt-2">
              In Emergency Situations
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-blue-50 dark:text-gray-300 mb-10 max-w-2xl font-medium leading-relaxed drop-shadow-sm">
            HelpNet connects people in local communities to request and offer
            help instantly when it matters most. Fast, reliable, and built on trust.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center lg:justify-start">
            
            {/* Primary Button: Need Help */}
            <Link to="/findHelp" className="w-full sm:w-auto">
              <button className="group relative w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg 
                             bg-white text-blue-600 dark:bg-gray-800 dark:text-cyan-400 
                             shadow-xl shadow-blue-900/20 dark:shadow-none 
                             hover:shadow-2xl hover:shadow-blue-900/40 hover:-translate-y-1 
                             border border-transparent dark:border-gray-700 dark:hover:border-cyan-500/50
                             transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Find Help</span>
              </button>
            </Link>

            {/* Secondary Button: Offer Help */}
            <Link to="/OfferHelp" className="w-full sm:w-auto">
              <button className="group relative w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg 
                             bg-transparent text-white 
                             border-2 border-white/70 dark:border-gray-600
                             hover:bg-white hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-cyan-400 dark:hover:border-gray-800
                             hover:-translate-y-1 hover:shadow-xl
                             transition-all duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Offer Help</span>
              </button>
            </Link>

          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none flex justify-center relative">
          {/* Subtle backdrop glow for the image */}
          <div className="absolute inset-0 bg-white/20 dark:bg-cyan-500/10 blur-[80px] rounded-full scale-75"></div>
          
          <img
            src="logo1.png"
            alt="Neighbors helping each other illustration"
            className="w-72 sm:w-96 lg:w-[500px] object-contain relative z-10 
                     drop-shadow-2xl dark:brightness-90 
                     hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              // Graceful fallback if image is missing
              e.target.style.display = 'none';
            }}
          />
        </div>

      </div>
    </section>
  );
}