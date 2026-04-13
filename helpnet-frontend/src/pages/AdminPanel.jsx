import React, { useEffect, useState } from "react";
import API_URL from "../api";

export default function AdminPanel() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/admin/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setMembers(data);
    };

    fetchMembers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Apartment Members</h2>

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m._id} className="p-4 rounded-xl bg-gray-900 text-white">
            <p>{m.fullName}</p>
            <p className="text-sm text-gray-400">{m.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}