import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  User, 
  PlusCircle, 
  Inbox, 
  LogOut, 
  Sun, 
  Moon, 
  ChevronDown,
  Menu, 
  X,    
  Home,
  Search,
  HandHelping
} from "lucide-react"; 
import useDarkMode from "../hooks/useDarkMode";
import API_URL from '../api';

export default function Navbar() {
  const [open, setOpen] = useState(false); // Mobile menu state
  const [dropdownOpen, setDropdownOpen] = useState(false); // Desktop dropdown state
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dark, setDark] = useDarkMode();
  
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Reset menus on navigation
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchUnreadCount();
    }
    setOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Handle outside clicks for both menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-toggle')) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/messages/unread-count`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto relative">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="logo1.png" alt="Logo" className="h-9 w-9 object-contain" />
          <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            HelpNet
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/RequestsFeed" className="hover:text-blue-600 transition-colors">Requests</Link>
            <Link to="/findHelp" className="hover:text-blue-600 transition-colors">Available Helps</Link>
          </div>

          <div className="flex items-center gap-4 border-l border-gray-200 dark:border-gray-800 pl-6">
            <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
              {dark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600" />}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1 pr-3 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800/60 mb-2 text-left">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                    <DropdownItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" badge={unreadCount} />
                    <DropdownItem to="/profile" icon={<User size={18} />} label="My Profile" />
                    <div className="my-2 px-2 space-y-1">
                      <DropdownItem to="/post" icon={<PlusCircle size={18} />} label="Post Request" highlight="blue" />
                      <DropdownItem to="/OfferHelp" icon={<Inbox size={18} />} label="Offer Requests" highlight="cyan" />
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-5 py-2 rounded-full">Sign In</Link>
            )}
          </div>
        </div>
        
        {/* Mobile Toggle & Dark Mode */}
        <div className="flex md:hidden items-center gap-2">
           <button onClick={() => setDark(!dark)} className="p-2 text-gray-600 dark:text-gray-400">
              {dark ? <Sun size={22} /> : <Moon size={22} />}
           </button>
           <button 
             className="mobile-toggle p-2 text-gray-600 dark:text-gray-300 relative" 
             onClick={() => setOpen(!open)}
           >
              {open ? <X size={28} /> : <Menu size={28} />}
              {!open && unreadCount > 0 && <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-950"></span>}
           </button>
        </div>

       {/* Unified Mobile Dropdown Card with Native Slide ✅ */}
<div 
  ref={mobileMenuRef}
  className={`absolute top-20 right-4 left-4 md:hidden z-[100] transition-all duration-300 ease-in-out
    ${open 
      ? "opacity-100 translate-x-0 pointer-events-auto" 
      : "opacity-0 translate-x-10 pointer-events-none"
    }`}
>
  <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-4 flex flex-col gap-1">
    {user && (
      <div className="flex items-center gap-3 p-3 mb-2 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold">
          {user.fullName?.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{user.fullName}</p>
          <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
        </div>
      </div>
    )}

    <MobileLink to="/" icon={<Home size={18}/>} label="Home" />
    <MobileLink to="/RequestsFeed" icon={<Search size={18}/>} label="Requests" />
    <MobileLink to="/findHelp" icon={<HandHelping size={18}/>} label="Available Helps" />

    <div className="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-2" />

    {user ? (
      <>
        <MobileLink to="/dashboard" icon={<LayoutDashboard size={18}/>} label="Dashboard" badge={unreadCount} />
        <MobileLink to="/profile" icon={<User size={18}/>} label="My Profile" />
        
        <div className="mt-3 grid grid-cols-1 gap-2">
          <Link to="/post" className="bg-blue-600 text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95">
            <PlusCircle size={18}/> Post Request
          </Link>
          <Link to="/OfferHelp" className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 p-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
            <Inbox size={18}/> Offer Requests
          </Link>
        </div>

        <button onClick={handleLogout} className="mt-3 flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
          <LogOut size={18}/> Sign Out
        </button>
      </>
    ) : (
      <Link to="/login" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-2xl font-bold text-center mt-2">
        Sign In
      </Link>
    )}
  </div>
</div>
      </div>
    </nav>
  );
}

// Sub-components
function DropdownItem({ to, icon, label, badge, highlight }) {
  const styles = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl",
    cyan: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-xl",
    default: "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg mx-2"
  };
  return (
    <Link to={to} className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-all ${highlight ? styles[highlight] : styles.default}`}>
      <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
      {badge > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{badge}</span>}
    </Link>
  );
}

function MobileLink({ to, icon, label, badge }) {
  return (
    <Link to={to} className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-3">{icon}<span className="font-semibold text-sm">{label}</span></div>
      {badge > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{badge}</span>}
    </Link>
  );
}