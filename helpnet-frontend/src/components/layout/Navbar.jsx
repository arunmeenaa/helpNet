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

import LocationSelector from "../common/LocationSelector";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dark, setDark] = useDarkMode();

  const dropdownRef = useRef(null);
  const inboxRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === "admin";
  const profilePath = user?.role === "owner" ? "/owner-profile" : "/profile";
  const dashboardPath = isAdmin ? "/owner" : "/dashboard";
  const inboxPath = "/inbox";

  const isActivePath = (path) => location.pathname === path;

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUnreadCount(0);
      return;
    }

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
    } catch (error) {
      console.error("Unread error:", error.message);
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

    if (!storedUser) {
      setUser(null);
      setUnreadCount(0);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUnreadCount();
    } catch {
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }

      if (inboxRef.current && !inboxRef.current.contains(event.target)) {
        setInboxOpen(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-toggle")
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menus whenever the route changes
  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
    setInboxOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setUnreadCount(0);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/40 bg-white/30 shadow-[0_8px_32px_rgba(15,23,42,0.10)] backdrop-blur-xl backdrop-saturate-150 transition-colors duration-300 dark:border-white/10 dark:bg-gray-950/30">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:py-4">
        {/* Logo: never shrinks, so nothing can overlap it */}
        <Link to="/" className="group flex shrink-0 items-center gap-2 sm:gap-3">
          <img
            src="logo1.png"
            alt="HelpNet logo"
            className="h-9 w-9 shrink-0 object-contain"
          />

          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
            HelpNet
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-300">
            {!user && (
              <NavLink to="/" label="Home" active={isActivePath("/")} />
            )}

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

          <div className="hidden min-w-0 items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-white/5 lg:flex">
            <LocationSelector />
          </div>

          <div className="flex items-center gap-4 border-l border-white/40 pl-6 dark:border-white/10">
            <button
              type="button"
              onClick={() => setDark(!dark)}
              className="rounded-full p-2 transition-colors hover:bg-white/40 dark:hover:bg-white/5"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {!isAdmin && (
                  <div className="relative" ref={inboxRef}>
                    <button
                      type="button"
                      onClick={() => setInboxOpen((value) => !value)}
                      aria-expanded={inboxOpen}
                      aria-label="Open inbox"
                      className="relative p-2 text-gray-500 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-cyan-400"
                    >
                      <Mail size={22} />

                      {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
                    </button>

                    {inboxOpen && (
                      <InboxDropdown
                        unreadCount={unreadCount}
                        inboxPath={inboxPath}
                        onClose={() => setInboxOpen(false)}
                      />
                    )}
                  </div>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((value) => !value)}
                    className="flex items-center gap-2 rounded-full border border-white/40 bg-white/25 p-1 pr-3 backdrop-blur-md transition-all hover:border-blue-300 dark:border-white/10 dark:bg-white/5"
                    aria-expanded={dropdownOpen}
                    aria-label="Open account menu"
                  >
                    <ProfileAvatar user={user} />

                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <AccountDropdown
                      user={user}
                      isAdmin={isAdmin}
                      dashboardPath={dashboardPath}
                      profilePath={profilePath}
                      unreadCount={unreadCount}
                      isActivePath={isActivePath}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-gray-900/90 px-5 py-2 font-bold text-white backdrop-blur-md dark:bg-white/90 dark:text-gray-900"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile controls: icon buttons only (location moved to its own row below) */}
        <div className="flex shrink-0 items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={() => setDark(!dark)}
            aria-label="Toggle dark mode"
            className="shrink-0 p-2 text-gray-800 dark:text-white"
          >
            {dark ? (
              <Sun size={22} className="text-yellow-500" />
            ) : (
              <Moon size={22} className="text-gray-800 dark:text-white" />
            )}
          </button>

          {user && !isAdmin && (
            <button
              type="button"
              onClick={() => {
                setInboxOpen((value) => !value);
                setOpen(true);
              }}
              aria-expanded={inboxOpen}
              aria-label="Open inbox"
              className="mobile-toggle relative shrink-0 p-2 text-gray-800 dark:text-white"
            >
              <Mail size={22} />

              {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
            </button>
          )}

          <button
            type="button"
            className="mobile-toggle shrink-0 p-2 text-gray-800 dark:text-white"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? (
              <X size={28} className="text-gray-800 dark:text-white" />
            ) : (
              <Menu size={28} className="text-gray-800 dark:text-white" />
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        <div
          ref={mobileMenuRef}
          className={`absolute left-4 right-4 top-full z-[100] mt-2 transition-all duration-300 md:hidden ${
            open
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-10 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1 rounded-3xl border border-white/50 bg-white p-4 shadow-2xl backdrop-blur-3xl backdrop-saturate-150 dark:border-white/10 dark:bg-gray-950">
            {user && (
              <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/25 p-3 backdrop-blur-md dark:bg-white/5">
                <ProfileAvatar user={user} size="large" />

                <div className="overflow-hidden">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                    {user.fullName}
                  </p>

                  <p className="truncate text-[10px] text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            {user && !isAdmin && inboxOpen && (
              <div className="mt-2 rounded-2xl border border-white/40 bg-white/20 p-3 backdrop-blur-2xl dark:border-white/10 dark:bg-gray-900/20">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="rounded-xl bg-blue-100/50 p-2 text-blue-600 dark:bg-cyan-900/20 dark:text-cyan-400">
                    <Mail size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Inbox
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {unreadCount > 0
                        ? `${unreadCount} unread message${
                            unreadCount === 1 ? "" : "s"
                          }`
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
                  className="mt-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600/90 to-cyan-500/90 px-4 py-3 text-sm font-bold text-white shadow-lg"
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
                onClick={() => setOpen(false)}
              />
            )}

            <MobileLink
              to="/RequestsFeed"
              icon={<Search size={18} />}
              label="Requests"
              active={isActivePath("/RequestsFeed")}
              onClick={() => setOpen(false)}
            />

            <MobileLink
              to="/findHelp"
              icon={<HandHelping size={18} />}
              label="Available Helps"
              active={isActivePath("/findHelp")}
              onClick={() => setOpen(false)}
            />

            <div className="mx-2 my-2 h-px bg-white/30 dark:bg-white/10" />

            {user ? (
              <>
                <MobileLink
                  to={dashboardPath}
                  icon={<LayoutDashboard size={18} />}
                  label="Dashboard"
                  badge={isAdmin ? 0 : unreadCount}
                  active={isActivePath(dashboardPath)}
                  onClick={() => setOpen(false)}
                />

                <MobileLink
                  to={profilePath}
                  icon={<User size={18} />}
                  label="My Profile"
                  active={isActivePath(profilePath)}
                  onClick={() => setOpen(false)}
                />

                {!isAdmin && (
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <Link
                      to="/post"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600/90 p-3.5 font-bold text-white shadow-lg"
                    >
                      <PlusCircle size={18} />
                      Post Request
                    </Link>

                    <Link
                      to="/OfferHelp"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-cyan-50/60 p-3.5 font-bold text-cyan-600 dark:bg-cyan-900/20"
                    >
                      <Inbox size={18} />
                      Offer Requests
                    </Link>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-red-500 transition-colors hover:bg-red-50/60"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-2xl bg-gray-900/90 p-4 text-center font-bold text-white dark:bg-white/90 dark:text-gray-900"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-only location row: gets the full width, so it can't collide with the logo */}
      <div className="border-t border-white/30 px-4 py-2 md:hidden dark:border-white/10">
        <div className="min-w-0 max-w-full">
          <LocationSelector />
        </div>
      </div>
    </nav>
  );
}

function ProfileAvatar({ user, size = "normal" }) {
  const sizeClass = size === "large" ? "h-10 w-10" : "h-8 w-8";

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white`}
    >
      {user?.profilePic ? (
        <img
          src={`${API_URL}${user.profilePic}`}
          alt={user.fullName || "My Profile"}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";

            const fallback = event.currentTarget.nextElementSibling;

            if (fallback) {
              fallback.style.display = "block";
            }
          }}
        />
      ) : null}

      <span className={user?.profilePic ? "hidden" : "block"}>
        {user?.fullName?.charAt(0).toUpperCase() || "U"}
      </span>
    </div>
  );
}

function UnreadBadge({ count }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[9px] font-bold leading-none text-white dark:border-gray-950">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function InboxDropdown({ unreadCount, inboxPath, onClose }) {
  return (
    <div className="absolute right-0 z-[100] mt-3 w-80 overflow-hidden rounded-2xl border border-white/50 bg-white/25 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-gray-900/25">
      <div className="border-b border-white/40 px-4 py-4 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Inbox
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {unreadCount > 0
                ? `You have ${unreadCount} unread message${
                    unreadCount === 1 ? "" : "s"
                  }`
                : "You’re all caught up"}
            </p>
          </div>

          <div className="rounded-xl bg-blue-100/50 p-2 text-blue-600 dark:bg-cyan-900/20 dark:text-cyan-400">
            <Mail size={18} />
          </div>
        </div>
      </div>

      <Link
        to={inboxPath}
        onClick={onClose}
        className="m-3 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600/90 to-cyan-500/90 px-4 py-3 text-sm font-bold text-white shadow-lg"
      >
        Open Inbox
      </Link>
    </div>
  );
}

function AccountDropdown({
  user,
  isAdmin,
  dashboardPath,
  profilePath,
  unreadCount,
  isActivePath,
  onLogout,
}) {
  return (
    <div className="absolute right-0 z-[100] mt-3 w-64 rounded-2xl border border-white/50 bg-white py-2 shadow-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-gray-900">
      <div className="mb-2 border-b border-white/40 px-4 py-3 dark:border-white/10">
        <p className="truncate text-sm font-bold text-gray-800 dark:text-gray-100">
          {user.fullName}
        </p>

        <p className="truncate text-[11px] text-gray-500">{user.email}</p>
      </div>

      <DropdownItem
        to={dashboardPath}
        icon={<LayoutDashboard size={18} />}
        label="Dashboard"
        badge={isAdmin ? 0 : unreadCount}
        active={isActivePath(dashboardPath)}
      />

      <DropdownItem
        to={profilePath}
        icon={<User size={18} />}
        label="My Profile"
        active={isActivePath(profilePath)}
      />

      {!isAdmin && (
        <div className="my-2 space-y-1 px-2">
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
      )}

      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50/60 dark:hover:bg-red-900/20"
      >
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} className="group relative py-1">
      <span
        className={`transition-colors ${
          active
            ? "text-blue-600 dark:text-cyan-400"
            : "group-hover:text-blue-600 dark:group-hover:text-cyan-400"
        }`}
      >
        {label}
      </span>

      <span
        className={`pointer-events-none absolute -bottom-0.5 left-0 h-[2px] w-full origin-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-transform duration-300 ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
}

function DropdownItem({ to, icon, label, badge = 0, highlight, active }) {
  const styles = {
    blue: "rounded-xl bg-blue-50/60 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    cyan: "rounded-xl bg-cyan-50/60 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
    default:
      "mx-2 rounded-lg text-gray-600 hover:bg-white/40 dark:text-gray-300 dark:hover:bg-white/5",
  };

  return (
    <Link
      to={to}
      className={`relative flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-all ${
        highlight ? styles[highlight] : styles.default
      } ${active ? "text-blue-600 dark:text-cyan-400" : ""}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-2">
        {badge > 0 && (
          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}

        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
        )}
      </div>
    </Link>
  );
}

function MobileLink({ to, icon, label, badge = 0, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${
        active
          ? "bg-white/30 text-blue-600 dark:bg-white/5 dark:text-cyan-400"
          : "text-gray-700 hover:bg-white/30 dark:text-gray-200 dark:hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}

        <span className="relative text-sm font-semibold">
          {label}

          <span
            className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300 ${
              active ? "w-full" : "w-0"
            }`}
          />
        </span>
      </div>

      {badge > 0 && (
        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}