import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import toast from "react-hot-toast";
import { 
  Users, Trash2, Search, Mail, ShieldCheck, 
  UserX, Building, ArrowRight, X, Eye 
} from "lucide-react";

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const hasApartment = !!currentUser.apartmentId;
  const [showSetupModal, setShowSetupModal] = useState(!hasApartment);

  // 🔄 Fetch members
  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasApartment) {
      fetchMembers();
    } else {
      setLoading(false);
    }
  }, [hasApartment]);

  // 👁️ View Profile (Navigates to a member's profile page)
  const viewProfile = (userId) => {
    // You can change this route to match wherever your user profiles live
    navigate(`/user/${userId}`);
  };

  // ❌ Remove user
  const removeUser = async (userId) => {
    if (!window.confirm("🚨 WARNING: Are you sure you want to permanently remove this user from your apartment?")) return;

    const deleteToast = toast.loading("Removing user...");
    try {
      const res = await fetch(`${API_URL}/api/admin/remove-user/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("User removed permanently.", { id: deleteToast });
      setMembers(members.filter(m => m._id !== userId));
    } catch (err) {
      toast.error(err.message, { id: deleteToast });
    }
  };

  // 🔍 Filter Logic
  const filteredMembers = useMemo(() => {
    return members.filter(user => 
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 relative overflow-hidden">
      <Navbar />

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm px-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Building size={32} strokeWidth={2} />
            </div>
            
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
              Set Up Your Community
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
              You haven't created an apartment block yet. Set one up now to generate a unique ID so your residents can join!
            </p>
            
            <button
              onClick={() => navigate("/create-apartment")}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-purple-500/30"
            >
              Create Apartment <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Ambient Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="flex-grow px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full relative z-10 flex flex-col">
        
        {!hasApartment ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-10">
            <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Building size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              No Apartment Created Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 text-base sm:text-lg">
              Before you can manage your community and view members, you need to set up your apartment block to generate a unique invite ID.
            </p>
            <button
              onClick={() => navigate("/create-apartment")}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-purple-500/30"
            >
              Create Apartment Now <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <>
            {/* Header & Stats */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <ShieldCheck size={32} />
                </div>
                Admin Dashboard
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Residents</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search residents by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-purple-500/50 outline-none text-gray-900 dark:text-white shadow-sm transition-all"
              />
            </div>

            {/* User List */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                  Loading residents...
                </div>
              ) : members.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Users size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Community is Empty
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    You don't have any residents yet. Share your Apartment ID with your residents so they can join!
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-xl font-mono text-sm text-gray-700 dark:text-gray-300 flex items-center gap-3">
                    ID: <span className="font-bold text-purple-600 dark:text-purple-400">{currentUser.apartmentId}</span>
                  </div>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                  <UserX size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No residents found</p>
                  <p className="text-sm mt-1">We couldn't find anyone matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredMembers.map((user) => {
                    const isMe = user._id === currentUser._id;

                    return (
                      <div key={user._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors gap-4">
                        
                        {/* User Info */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                            {user.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
                              {user.fullName}
                              {isMe && <span className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Owner (You)</span>}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1.5 truncate mt-0.5">
                              <Mail size={14} /> {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          
                          {/* 💡 NEW: View Profile Button */}
                          <button
                            onClick={() => viewProfile(user._id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors"
                          >
                            <Eye size={16} /> <span className="hidden sm:inline">View</span> Profile
                          </button>

                          {/* Remove Button (Hide for the Owner) */}
                          {!isMe && (
                            <button
                              onClick={() => removeUser(user._id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors"
                            >
                              <Trash2 size={16} /> Remove
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}