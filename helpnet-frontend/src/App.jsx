import { useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import ScrollToTop from "./components/common/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";

import socket from "./socket";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");

  const user = storedUser ? JSON.parse(storedUser) : null;

  // ==========================================
  // GOOGLE LOGIN TOKEN HANDLING
  // ==========================================

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const urlToken = params.get("token");

    if (!urlToken) return;

    try {
      localStorage.setItem("token", urlToken);

      const base64Url = urlToken.split(".")[1];

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

      const userData = JSON.parse(window.atob(base64));

      localStorage.setItem("user", JSON.stringify(userData));

      window.history.replaceState({}, document.title, window.location.pathname);

      window.dispatchEvent(new Event("local-storage-update"));

      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Token sync failed:", error);
    }
  }, [location.search, navigate]);

  // ==========================================
  // SOCKET.IO
  // ==========================================

  useEffect(() => {
    if (!user?.id) return;

    const joinRoom = () => {
      socket.emit("join_room", user.id);
    };

    joinRoom();

    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
    };
  }, [user?.id]);

  return (
    <>
      <ScrollToTop />

      <AppRoutes user={user} />

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
