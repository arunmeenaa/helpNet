import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

export default function SetApartment() {
  const [apartmentId, setApartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apartmentId.trim()) return;

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/set-apartment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apartmentId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
      
      {/* 🔥 Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-teal-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />

      {/* 🔥 Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-[#020617] border border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          Join Your Apartment
        </h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Enter your apartment/building ID to connect with your neighbors
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Input */}
          <input
            type="text"
            placeholder="e.g. arun1"
            value={apartmentId}
            onChange={(e) => setApartmentId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
          />

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </form>
      </div>
    </div>
  );
}