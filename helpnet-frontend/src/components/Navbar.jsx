import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useDarkMode from "../hooks/useDarkMode";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0); // <-- NEW STATE
  
  const [dark, setDark] = useDarkMode(); 
  
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in & Fetch Unread Messages
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUnreadCount(); // <-- FETCH COUNT ON ROUTE CHANGE
    } else {
      setUser(null);
    }
    setOpen(false); 
  }, [location]);

  // NEW: Function to get just the number of unread messages
 // Inside Navbar.jsx, update the fetchUnreadCount function:

const fetchUnreadCount = async () => {
  if (!user) return;
  
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:5000/api/messages/unread-count", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    const data = await response.json();
    setUnreadCount(data.count); // We now get a simple { count: X } object
  } catch (err) {
    console.error("Error fetching unread count", err);
  }
};
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUnreadCount(0);
    navigate("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="logo1.png" 
              alt="HelpNet Logo" 
              className="h-9 w-9 object-contain group-hover:scale-105 transition-transform duration-300" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              HelpNet
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <Link to="/" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                Home
              </Link>
              <Link to="/RequestsFeed" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                Requests
              </Link>
              <Link to="/findHelp" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                Available Helps
              </Link>
            </div>

            <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-800 pl-6">
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDark(!dark)}
                aria-label="Toggle Dark Mode"
                className="p-2.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-cyan-400 dark:hover:bg-gray-800/50 transition-all duration-300"
              >
                {dark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Conditional Auth Rendering (Desktop) */}
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" title="My Profile">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-sm shadow-sm hover:shadow-md transition-shadow">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                  </Link>

                  {/* DASHBOARD LINK WITH BADGE */}
                  <Link to="/dashboard" className="relative text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                    Dashboard
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950 animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link to="/post">
                    <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-300">
                      Post Help Request
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register">
                    <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-5 py-2.5 rounded-full hover:scale-105 transition-all duration-300">
                      Join Free
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            onClick={() => setOpen(true)}
            aria-label="Open Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {/* Small dot for mobile hamburger if messages exist */}
            {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-gray-950 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col md:hidden 
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800/60">
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Menu
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
            aria-label="Close Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-2 p-6 overflow-y-auto font-medium">
          <Link to="/" className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <Link to="/RequestsFeed" className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            Requests
          </Link>
          <Link to="/findHelp" className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
            Available Helps
          </Link>

          <div className="h-px bg-gray-100 dark:bg-gray-800/60 my-2"></div>

          {/* Conditional Auth Rendering (Mobile) */}
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-3 mb-2 border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-lg font-bold">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-none mb-1">Signed in as</p>
                  <p className="font-bold text-gray-900 dark:text-white leading-none truncate max-w-[150px]">{user.fullName}</p>
                </div>
              </Link>
              
              {/* MOBILE DASHBOARD LINK WITH BADGE */}
              <Link to="/dashboard" className="flex justify-between items-center px-4 py-3 rounded-xl text-blue-600 dark:text-cyan-400 font-bold bg-blue-50 dark:bg-gray-800 transition-colors">
                <span>My Dashboard</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              
              <Link to="/post" className="mt-2">
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
                  Post Help Request
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="mt-2">
                <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold py-3.5 rounded-xl transition-all hover:scale-[1.02]">
                  Join Free
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}