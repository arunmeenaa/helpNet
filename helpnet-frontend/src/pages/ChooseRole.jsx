import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function ChooseRole() {
  const navigate = useNavigate();

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden px-4">
      
      {/* 💡 Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* 💡 Glassmorphism Container */}
      <div className="bg-gray-900/60 backdrop-blur-2xl border border-gray-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg z-10">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">HelpNet</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Select your account type to continue
          </p>
        </div>

        <div className="space-y-4">
          
          {/* 💡 User Role Card */}
          <button
            onClick={() => navigate("/login")}
            className="group relative w-full flex items-center p-5 sm:p-6 bg-gray-800/40 hover:bg-gray-800 border border-gray-700 hover:border-blue-500/50 rounded-3xl transition-all duration-300 text-left overflow-hidden"
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-cyan-600/0 group-hover:from-blue-600/10 group-hover:to-cyan-600/5 transition-all duration-500" />
            
            {/* Icon Block */}
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mr-4 sm:mr-5 shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <User size={28} strokeWidth={2} />
            </div>
            
            {/* Text Block */}
            <div className="flex-grow z-10">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                Community Member
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Post requests, offer help, and connect with others.
              </p>
            </div>

            {/* Action Arrow */}
            <ArrowRight className="text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all z-10 shrink-0 ml-2" />
          </button>

          {/* 💡 Admin Role Card */}
          <button
            onClick={() => navigate("/admin-login")}
            className="group relative w-full flex items-center p-5 sm:p-6 bg-gray-800/40 hover:bg-gray-800 border border-gray-700 hover:border-purple-500/50 rounded-3xl transition-all duration-300 text-left overflow-hidden"
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/5 transition-all duration-500" />
            
            {/* Icon Block */}
            <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mr-4 sm:mr-5 shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
              <ShieldCheck size={28} strokeWidth={2} />
            </div>
            
            {/* Text Block */}
            <div className="flex-grow z-10">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                Platform Admin
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Manage users, moderate content, and view analytics.
              </p>
            </div>

            {/* Action Arrow */}
            <ArrowRight className="text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all z-10 shrink-0 ml-2" />
          </button>

        </div>
      </div>
      
    </div>
    <Footer/>
    </>
  );
}