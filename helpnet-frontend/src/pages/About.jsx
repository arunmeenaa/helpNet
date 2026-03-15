import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
// 1. Import Lucide Icons
import { Users, Target, Megaphone, MapPin, Zap, HeartHandshake } from "lucide-react";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300 relative overflow-hidden">
        
        {/* Modernized Dynamic Hero Section */}
        <section className="relative overflow-hidden text-center py-28 px-6 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800/50">
          {/* Subtle multi-point light gradients for depth */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <span className="px-5 py-2 mb-8 text-xs font-bold tracking-widest text-blue-700 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/40 rounded-full shadow-sm border border-blue-100/50 dark:border-blue-800/50">
              Community First
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter text-gray-950 dark:text-white leading-tight">
              About HelpNet
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl font-normal">
              HelpNet is a community-driven platform that connects neighbors
              to request and offer help during urgent situations. Our goal is
              to build stronger communities through quick support and trust.
            </p>
          </div>
        </section>

        {/* Mission Section with Subtler Background Blend */}
        <section className="relative overflow-hidden">
          {/* Add a very subtle light source here for depth */}
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-teal-500/5 dark:bg-teal-600/5 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-32 grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="space-y-7">
              <div className="flex items-center gap-4 text-cyan-600 dark:text-cyan-400">
                <Target size={32} />
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tight">
                  Our Mission
                </h2>
              </div>
              <div className="w-24 h-1.5 bg-cyan-500 rounded-full mb-8"></div>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                In many emergency situations, the fastest help often comes from
                people nearby. HelpNet enables communities to connect instantly
                so that help can reach those who need it most.
              </p>
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                Whether it's finding a blood donor, borrowing essential items,
                or getting help in urgent situations, HelpNet makes it easier
                for neighbors to support each other.
              </p>
            </div>

            {/* Graphic Container with Softened Glow */}
            <div className="relative flex justify-center group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 dark:from-cyan-500 dark:to-blue-600 rounded-3xl blur-[60px] opacity-15 group-hover:opacity-30 transition duration-700"></div>
              <div className="relative w-full max-w-sm aspect-square bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100/50 dark:border-gray-800/50 rounded-3xl shadow-xl flex flex-col items-center justify-center transform transition duration-500 hover:-translate-y-2 hover:shadow-cyan-500/10">
                <div className="p-9 bg-blue-50/50 dark:bg-blue-900/30 rounded-full mb-8 shadow-inner text-blue-600 dark:text-blue-400">
                  <HeartHandshake size={72} strokeWidth={1.25} />
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  Stronger Together
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Clean and Professional */}
        <section className="py-24 lg:py-32 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-950 dark:text-white tracking-tighter mb-5 leading-tight">
                How HelpNet Works
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-xl font-normal leading-relaxed">
                Getting and giving help should be seamless. Here's our simple three-step process.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
              {/* Step 1 */}
              <div className="group relative bg-gray-50/50 dark:bg-gray-800/20 p-10 rounded-3xl border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-18 h-18 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Megaphone size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-950 dark:text-white mb-4 tracking-tight leading-snug">
                  Post a Request
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  Quickly post what you need. Provide basic details so your community knows exactly how to assist.
                </p>
              </div>

              {/* Step 2 */}
              <div className="group relative bg-gray-50/50 dark:bg-gray-800/20 p-10 rounded-3xl border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-18 h-18 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <MapPin size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-950 dark:text-white mb-4 tracking-tight leading-snug">
                  Find Nearby Help
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  Our system alerts neighbors in your vicinity. Local visibility ensures the fastest possible response.
                </p>
              </div>

              {/* Step 3 */}
              <div className="group relative bg-gray-50/50 dark:bg-gray-800/20 p-10 rounded-3xl border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-18 h-18 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Zap size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-950 dark:text-white mb-4 tracking-tight leading-snug">
                  Get Quick Response
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                  Connect directly with community members who are ready and willing to step in and support you.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}