import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API_URL from "../api";
import toast from "react-hot-toast";

export default function SetApartment() {
  const [apartment, setApartment] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const loadingToast = toast.loading("Saving apartment...");

    try {
      const res = await fetch(`${API_URL}/api/profile/set-apartment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ apartmentId: apartment }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ✅ IMPORTANT: update token
      localStorage.setItem("token", data.token);

      toast.success("Apartment set successfully 🎉", { id: loadingToast });

      navigate("/dashboard");

    } catch (err) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Enter Your Apartment
          </h2>

          <input
            type="text"
            placeholder="e.g. GreenHeights"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 dark:bg-gray-800"
          />

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
          >
            Save
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}