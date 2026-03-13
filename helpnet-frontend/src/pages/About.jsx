import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function About() {
  return (
    <><Navbar/>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center py-24 px-6 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <span className="px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-blue-900 uppercase bg-white/90 rounded-full shadow-sm backdrop-blur-sm">
            Community First
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
            About HelpNet
          </h1>
          <p className="text-lg md:text-xl text-blue-50 leading-relaxed max-w-2xl font-medium">
            HelpNet is a community-driven platform that connects neighbors
            to request and offer help during urgent situations. Our goal is
            to build stronger communities through quick support and trust.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Our Mission
          </h2>
          <div className="w-20 h-1.5 bg-cyan-500 rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            In many emergency situations, the fastest help often comes from
            people nearby. HelpNet enables communities to connect instantly
            so that help can reach those who need it most.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Whether it's finding a blood donor, borrowing essential items,
            or getting help in urgent situations, HelpNet makes it easier
            for neighbors to support each other.
          </p>
        </div>

        {/* Improved Graphic Container */}
        <div className="relative flex justify-center group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative w-full max-w-sm aspect-square bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center transform transition duration-500 hover:-translate-y-2 hover:shadow-cyan-500/20">
            <div className="p-8 bg-blue-50 dark:bg-gray-800 rounded-full mb-6 shadow-inner text-7xl">
              🤝
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Stronger Together
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              How HelpNet Works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Getting and giving help should be seamless. Here's our simple three-step process.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {/* Step 1 */}
            <div className="group relative bg-gray-50 dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                📢
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Post a Request
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Quickly post what you need. Provide basic details so your community knows exactly how to assist.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group relative bg-gray-50 dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/40 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                📍
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Find Nearby Help
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our system alerts neighbors in your vicinity. Local visibility ensures the fastest possible response.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group relative bg-gray-50 dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/40 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Get Quick Response
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Connect directly with community members who are ready and willing to step in and support you.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
    <Footer/>
    </>
  );
}