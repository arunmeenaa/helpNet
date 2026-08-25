import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useDarkMode from "./hooks/useDarkMode";
import { Toaster, toast } from "react-hot-toast";
import { syncCurrentLocation } from "./services/profileService";
import ScrollToTop from "./components/common/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";
import socket from "./socket";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useDarkMode();

  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser || storedUser === "undefined" || storedUser === "null") {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.warn("Invalid stored user. Clearing it.");

      localStorage.removeItem("user");

      return null;
    }
  };

  const user = getStoredUser();

  const userId = user?.id || user?._id;
  useEffect(() => {
    if (!userId) return;

    const locationSynced = sessionStorage.getItem("location-synced");

    if (locationSynced) {
      console.log("📍 Location already synced this session.");
      return;
    }

    sessionStorage.setItem("location-synced", "true");

    console.log("📍 Syncing location...");

    syncCurrentLocation()
      .then(() => {
        console.log("✅ User location synchronized");
      })
      .catch((error) => {
        console.warn("📍 Location sync skipped:", error.message);

        sessionStorage.removeItem("location-synced");
      });
  }, [userId]);
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

  useEffect(() => {
    if (!userId) {
      console.log("⚠️ No user ID - socket room not joined");
      return;
    }

    const joinRoom = () => {
      socket.emit("join_room", userId);
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
    };
  }, [userId]);

  useEffect(() => {
    const handleConnect = () => {};

    const handleDisconnect = () => {};

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    const apartmentId = user?.apartmentId;

    if (!apartmentId) {
      console.log("⚠️ No apartment ID - apartment room not joined");
      return;
    }

    const joinApartmentRoom = () => {
      socket.emit("join_apartment", apartmentId);
    };

    if (socket.connected) {
      joinApartmentRoom();
    }

    socket.on("connect", joinApartmentRoom);

    return () => {
      socket.off("connect", joinApartmentRoom);
    };
  }, [user?.apartmentId]);

  useEffect(() => {
    const handleNotification = (notification) => {
      if (!notification) return;

      switch (notification.type) {
        case "new_message":
          toast(`💬 ${notification.message || "You received a new message."}`, {
            duration: 5000,
          });
          break;

        case "new_request":
          toast.success(`📋 ${notification.message || "New request nearby."}`, {
            duration: 5000,
          });
          break;

        case "new_offer":
          toast.success(`🤝 ${notification.message || "New offer nearby."}`, {
            duration: 5000,
          });
          break;

        default:
          toast(notification.message || "You have a new notification.", {
            duration: 5000,
          });
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, []);

  return (
    <>
      <ScrollToTop />

      <AppRoutes user={user} />

      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            borderRadius: "12px",
            padding: "14px 18px",
            fontSize: "14px",
            maxWidth: "380px",
          },
        }}
      />
    </>
  );
}

export default App;
