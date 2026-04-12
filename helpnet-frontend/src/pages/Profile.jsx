import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import { toast } from "react-hot-toast";

export default function Profile() {
  const [stats, setStats] = useState({ requests: 0, offers: 0 });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const [userRes, requestsRes, offersRes] = await Promise.all([
          fetch(`${API_URL}/api/profile/me?t=${Date.now()}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
            },
          }),
          fetch(`${API_URL}/api/requests/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/offers/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.ok && requestsRes.ok && offersRes.ok) {
          const uData = await userRes.json();
          const rData = await requestsRes.json();
          const oData = await offersRes.json();

          setStats({
            requests: Array.isArray(rData) ? rData.length : 0,
            offers: Array.isArray(oData) ? oData.length : 0,
          });

          setUserData(uData);
          localStorage.setItem("user", JSON.stringify(uData));
        }
      } catch (err) {
        console.error("Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const startEditing = (field, value) => {
    setEditingField(field);
    setTempValue(value || "");
  };

  

  const handleUpdate = async (field) => {
    if (isUpdating) return;
    if (field === "email") return toast.error("Email cannot be changed.");
    if (!tempValue.trim()) return toast.error("Field cannot be empty");

    const token = localStorage.getItem("token");
    setIsUpdating(true);

    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: tempValue }),
      });

      if (res.ok) {
        const updatedUser = { ...userData, [field]: tempValue };
        setUserData(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditingField(null);
        toast.success(`${field.replace(/([A-Z])/g, " $1")} updated!`);
        window.dispatchEvent(new Event("authChange"));
      } else {
        toast.error("Update failed.");
      }
    } catch (err) {
      toast.error("Connection error.");
    } finally {
      setIsUpdating(false);
    }
  };

  const EditableField = ({ label, value, fieldName, icon }) => {
    const isThisEditing = editingField === fieldName;
    const isLocked = fieldName === 'email' || fieldName === 'apartmentId';
    
    return (
      <div className="group py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
          {label}{" "}
          {isLocked && (
            <span className="ml-2 normal-case font-normal text-gray-500">
              (Verified)
            </span>
          )}
        </label>

        {/* 💡 min-w-0 on the flex container is key to preventing horizontal scroll */}
        <div className="flex items-center justify-between gap-4 min-h-[40px] min-w-0">
          {isThisEditing ? (
            <div className="flex-grow flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200 min-w-0">
              <input
                autoFocus
                className="flex-grow w-full min-w-0 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg outline-none border border-blue-200 dark:border-blue-800 text-sm dark:text-white"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                disabled={isUpdating}
              />

              

              <button
                onClick={() => handleUpdate(fieldName)}
                className="p-1.5 shrink-0 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "✓"
                )}
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="p-1.5 shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs font-bold"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              {/* 💡 min-w-0 and overflow-hidden on this wrapper prevents long emails from pushing the card out */}
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <span className="text-lg shrink-0">{icon}</span>
                <span className={`text-sm font-semibold truncate 
  ${
    fieldName === "apartmentId"
      ? "text-blue-600 dark:text-blue-400 font-bold"
      : !value
      ? "text-gray-400 italic"
      : isLocked
      ? "text-gray-500 dark:text-gray-400"
      : "text-gray-700 dark:text-gray-200"
  }
`}>
                  {value || `Add ${label}`}
                </span>
              </div>

              {!isLocked ? (
                <button
                  onClick={() => startEditing(fieldName, value)}
                  className="shrink-0 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all text-blue-500"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              ) : (
                <span className="shrink-0 opacity-40 grayscale">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </span>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Banner: Responsive height */}
          <div className="h-24 md:h-32 bg-gradient-to-br from-blue-600 to-indigo-500 relative">
            <div className="absolute -bottom-8 md:bottom-[-2.5rem] left-6 md:left-8">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-white dark:bg-gray-900 p-1 shadow-xl">
                <div className="w-full h-full rounded-xl md:rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl md:text-3xl font-black text-blue-600 uppercase">
                  {(editingField === "fullName"
                    ? tempValue
                    : userData.fullName
                  )?.charAt(0) || "U"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 md:pt-16 pb-8 px-6 md:px-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8 mb-8">
              <div className="w-full min-w-0">
                <EditableField
                  label="Full Name"
                  value={userData.fullName}
                  fieldName="fullName"
                  icon="👤"
                />
                <EditableField
                  label="Email Address"
                  value={userData.email}
                  fieldName="email"
                  icon="✉️"
                />
               
                <EditableField
                  label="Apartment ID"
                  value={userData.apartmentId}
                  fieldName="apartmentId"
                  icon="🏢"
                />
              </div>

              <Link to="/dashboard" className="w-full md:w-auto">
                <button className="w-full px-8 py-3 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                  Dashboard
                </button>
              </Link>
            </div>

            {/* Stats: Side-by-side but breathable */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 my-8">
              <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="text-xl md:text-2xl font-black text-blue-600">
                  {stats.requests}
                </div>
                <div className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Requests
                </div>
              </div>
              <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="text-xl md:text-2xl font-black text-teal-600">
                  {stats.offers}
                </div>
                <div className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  Offers
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-50 dark:border-gray-800">
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto px-6 py-2.5 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              >
                Sign Out
              </button>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                Joined{" "}
                {userData.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Recent"}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
