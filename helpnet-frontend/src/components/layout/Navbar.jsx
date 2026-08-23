import { useState, useEffect, useRef } from "react";
import socket, { joinSocketRoom } from "../../socket";
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
  HandHelping,
  Mail,
} from "lucide-react";
import useDarkMode from "../../hooks/useDarkMode";
import API_URL from "../../api";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dark, setDark] = useDarkMode();
  const isAdmin = user && user.role === "admin";
  const dropdownRef = useRef(null);
  const inboxRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const profilePath = user?.role === "owner" ? "/owner-profile" : "/profile";
  const dashboardPath = isAdmin ? "/owner" : "/dashboard";
  const inboxPath = isAdmin ? "/inbox" : "/inbox";
  const hasNoApartment = user?.role === "resident" && !user?.apartmentId;

  // Helper to check if a nav link matches the current route (used for the underline indicator)
  const isActivePath = (path) => location.pathname === path;

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (err) {
      console.error("Unread error:", err.message);
    }
  };

  useEffect(() => {
    joinSocketRoom();

    fetchUnreadCount();

    const handleNewMessage = () => {
      fetchUnreadCount();
    };

    const handleManualUpdate = () => {
      fetchUnreadCount();
    };

    socket.on("receive_message", handleNewMessage);
    window.addEventListener("messagesUpdated", handleManualUpdate);

    return () => {
      socket.off("receive_message", handleNewMessage);
      window.removeEventListener("messagesUpdated", handleManualUpdate);
    };
  }, []);

  const syncUser = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        fetchUnreadCount();
      } catch (err) {
        setUser(null);
      }
    } else {
      setUser(null);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    syncUser();

    window.addEventListener("storage", syncUser);
    window.addEventListener("local-storage-update", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("local-storage-update", syncUser);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setDropdownOpen(false);
      if (inboxRef.current && !inboxRef.current.contains(event.target))
        setInboxOpen(false);
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-toggle")
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/30 dark:bg-gray-950/30 backdrop-blur-3xl backdrop-saturate-150 border-b border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(15,23,42,0.10)] transition-colors duration-300">
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
            {!user && <NavLink to="/" label="Home" active={isActivePath("/")} />}

            <NavLink
              to="/RequestsFeed"
              label="Requests"
              active={isActivePath("/RequestsFeed")}
            />
            <NavLink
              to="/findHelp"
              label="Available Helps"
              active={isActivePath("/findHelp")}
            />
          </div>

          <div className="flex items-center gap-4 border-l border-white/40 dark:border-white/10 pl-6">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
            >
              {dark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {user && !isAdmin && (
                  <div className="relative" ref={inboxRef}>
                    <button
                      type="button"
                      onClick={() => setInboxOpen((isVisible) => !isVisible)}
                      aria-expanded={inboxOpen}
                      aria-label="Open inbox"
                      className="relative p-2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                    >
                      <Mail size={22} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white border-2 border-white dark:border-gray-900 rounded-full text-[9px] leading-none font-bold flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {inboxOpen && (
                      <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-white/50 dark:border-white/10 bg-white/25 dark:bg-gray-900/25 backdrop-blur-3xl backdrop-saturate-150 shadow-2xl shadow-slate-900/20 ring-1 ring-white/30 dark:ring-white/5 z-[100] animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-4 py-4 border-b border-white/40 dark:border-white/10">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                Inbox
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {unreadCount > 0
                                  ? `You have ${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
                                  : "You’re all caught up"}
                              </p>
                            </div>
                            <div className="p-2 rounded-xl bg-blue-100/50 dark:bg-cyan-900/20 backdrop-blur-md text-blue-600 dark:text-cyan-400">
                              <Mail size={18} />
                            </div>
                          </div>
                        </div>
                        <Link
                          to={inboxPath}
                          onClick={() => setInboxOpen(false)}
                          className="m-3 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600/90 to-cyan-500/90 backdrop-blur-md px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:brightness-105 transition-all"
                        >
                          Open Inbox
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/25 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 hover:border-blue-300 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
                      {user?.profilePic ? (
                        // Scenario A: Profile picture exists -> Display the Image asset
                        <img
                          src={`${API_URL}${user.profilePic}`}
                          alt={user.fullName || "My Profile"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Safe layout fallback if a network error prevents the image from loading
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                      ) : null}

                      {/* Scenario B: No profile picture -> Display Initials fallback block */}
                      <span className={user?.profilePic ? "hidden" : "block"}>
                        {user?.fullName?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/25 dark:bg-gray-900/25 backdrop-blur-3xl backdrop-saturate-150 border border-white/50 dark:border-white/10 ring-1 ring-white/30 dark:ring-white/5 rounded-2xl shadow-2xl shadow-slate-900/20 py-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-white/40 dark:border-white/10 mb-2">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {/* Change the 'to' prop here */}
                      <DropdownItem
                        to={dashboardPath}
                        icon={<LayoutDashboard size={18} />}
                        label="Dashboard"
                        badge={isAdmin ? 0 : unreadCount} // Hide unread badge for admins
                        active={isActivePath(dashboardPath)}
                      />
                      <DropdownItem
                        to={profilePath}
                        icon={<User size={18} />}
                        label="My Profile"
                        active={isActivePath(profilePath)}
                      />
                      {!isAdmin && (
                        <>
                          <div className="my-2 px-2 space-y-1">
                            <DropdownItem
                              to="/post"
                              icon={<PlusCircle size={18} />}
                              label="Post Request"
                              highlight="blue"
                              active={isActivePath("/post")}
                            />
                            <DropdownItem
                              to="/OfferHelp"
                              icon={<Inbox size={18} />}
                              label="Offer Requests"
                              highlight="cyan"
                              active={isActivePath("/OfferHelp")}
                            />
                          </div>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50/60 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-gray-900 font-bold px-5 py-2 rounded-full"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => setDark(!dark)} className="p-2">
            {dark ? (
              <Sun size={22} className="text-yellow-500" />
            ) : (
              <Moon size={22} />
            )}
          </button>
          {user && !isAdmin  && (
            <button
              type="button"
              onClick={() => setInboxOpen((isVisible) => !isVisible)}
              aria-expanded={inboxOpen}
              aria-label="Open inbox"
              className="p-2 relative text-gray-600 dark:text-gray-200"
            >
              <Mail size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white border-2 border-white dark:border-gray-950 rounded-full text-[9px] leading-none font-bold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          )}
          <button className="mobile-toggle p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div
          ref={mobileMenuRef}
          className={`absolute top-20 right-4 left-4 md:hidden z-[100] transition-all duration-300 ${open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"}`}
        >
          <div className="bg-white/25 dark:bg-gray-950/25 backdrop-blur-3xl backdrop-saturate-150 border border-white/50 dark:border-white/10 ring-1 ring-white/30 dark:ring-white/5 rounded-3xl shadow-2xl shadow-slate-900/20 p-4 flex flex-col gap-1">
            {user && (
              <div className="flex items-center gap-3 p-3 mb-2 bg-white/25 dark:bg-white/5 backdrop-blur-md rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            {user && !isAdmin  && inboxOpen && (
              <div className="mt-2 rounded-2xl border border-white/40 dark:border-white/10 bg-white/20 dark:bg-gray-900/20 backdrop-blur-2xl p-3">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="p-2 rounded-xl bg-blue-100/50 dark:bg-cyan-900/20 text-blue-600 dark:text-cyan-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Inbox
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {unreadCount > 0
                        ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
                        : "You’re all caught up"}
                    </p>
                  </div>
                </div>
                <Link
                  to={inboxPath}
                  onClick={() => {
                    setInboxOpen(false);
                    setOpen(false);
                  }}
                  className="mt-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600/90 to-cyan-500/90 backdrop-blur-md px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
                >
                  Open Inbox
                </Link>
              </div>
            )}
            {!user && (
              <MobileLink
                to="/"
                icon={<Home size={18} />}
                label="Home"
                active={isActivePath("/")}
              />
            )}{" "}
            <MobileLink
              to="/RequestsFeed"
              icon={<Search size={18} />}
              label="Requests"
              active={isActivePath("/RequestsFeed")}
            />
            <MobileLink
              to="/findHelp"
              icon={<HandHelping size={18} />}
              label="Available Helps"
              active={isActivePath("/findHelp")}
            />
            <div className="h-px bg-white/30 dark:bg-white/10 my-2 mx-2" />
            {user ? (
              <>
                {/* Change the 'to' prop here */}
                <MobileLink
                  to={dashboardPath}
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                  badge={isAdmin ? 0 : unreadCount}
                  active={isActivePath(dashboardPath)}
                />
                <MobileLink
                  to={profilePath}
                  icon={<User size={18} />}
                  label="My Profile"
                  active={isActivePath(profilePath)}
                />
                {!isAdmin && (
                  <>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <Link
                        to="/post"
                        className="bg-blue-600/90 backdrop-blur-md text-white p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                      >
                        <PlusCircle size={18} /> Post Request
                      </Link>
                      <Link
                        to="/OfferHelp"
                        className="bg-cyan-50/60 dark:bg-cyan-900/20 backdrop-blur-md text-cyan-600 p-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Inbox size={18} /> Offer Requests
                      </Link>
                    </div>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-3 flex items-center gap-3 px-4 py-3 text-red-500 font-bold rounded-xl hover:bg-red-50/60 transition-colors"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white p-4 rounded-2xl font-bold text-center mt-2"
              >
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

// Desktop top-level nav link with a sliding underline: full width when active,
// grows from center on hover otherwise.
function NavLink({ to, label, active }) {
  return (
    <Link to={to} className="relative py-1 group">
      <span
        className={`transition-colors ${active ? "text-blue-600 dark:text-cyan-400" : "group-hover:text-blue-600 dark:group-hover:text-cyan-400"}`}
      >
        {label}
      </span>
      <span
        className={`pointer-events-none absolute left-0 -bottom-0.5 h-[2px] w-full origin-center bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
}

function DropdownItem({ to, icon, label, badge, highlight, active }) {
  const styles = {
    blue: "bg-blue-50/60 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl",
    cyan: "bg-cyan-50/60 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-xl",
    default:
      "text-gray-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/5 rounded-lg mx-2",
  };
  return (
    <Link
      to={to}
      className={`relative flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-all ${highlight ? styles[highlight] : styles.default} ${active ? "text-blue-600 dark:text-cyan-400" : ""}`}
    >
      <div className="flex items-center gap-3">
        {icon} <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge > 0 && (
          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {badge}
          </span>
        )}
        {active && (
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
        )}
      </div>
    </Link>
  );
}

function MobileLink({ to, icon, label, badge, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
        active
          ? "text-blue-600 dark:text-cyan-400 bg-white/30 dark:bg-white/5"
          : "text-gray-700 dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="relative font-semibold text-sm">
          {label}
          <span
            className={`absolute left-0 -bottom-1 h-[2px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 ${
              active ? "w-full" : "w-0"
            }`}
          />
        </span>
      </div>
      {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
    </Link>
  );
}