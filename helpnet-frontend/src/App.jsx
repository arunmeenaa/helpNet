import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import LoginSuccess from "./pages/LoginSuccess";
import Home from "./pages/Home";
import AdminProfile from "./pages/AdminProfile";
import PostRequest from "./pages/PostRequest";
import RequestDetails from "./pages/RequestDetails";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import OfferDetails from "./pages/OfferDetails";
import About from "./pages/About";
import ScrollToTop from "./components/ScrollToTop";
import UserProfile from "./pages/UserProfile";
import Register from "./pages/Register";
import AvailableHelp from "./pages/AvailableHelp";
import RequestsFeed from "./pages/RequestsFeed";
import OfferHelp from "./pages/OfferHelp";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ChooseRole from "./pages/ChooseRole";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";
import CreateApartment from "./pages/CreateApartment";
import socket from './socket';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      try {
        const base64Url = urlToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const userData = JSON.parse(window.atob(base64));

        localStorage.setItem("user", JSON.stringify(userData));

        // ✅ FIX: Remove the token from URL without a full page reload
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        // ✅ FIX: Tell the app the user changed without refreshing
        window.dispatchEvent(new Event("local-storage-update"));

        if (userData.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } catch (err) {
        console.error("Token sync failed", err);
      }
    }
  }, [location, navigate]);

  useEffect(() => {
    if (user?.id) {
      // This tells the server: "I am user X, send my messages here"
      socket.emit("join_room", user.id);
      
      socket.on("connect", () => {
        console.log("Connected to socket server:", socket.id);
        socket.emit("join_room", user.id); // Re-join on reconnect
      });
    }
    
    return () => {
      socket.off("connect");
    };
  }, [user?.id]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicOnlyRoute>
              <Home />
            </PublicOnlyRoute>
          } 
        />
        <Route path="/about" element={<About />} />

        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/admin-login" element={<PublicOnlyRoute><AdminLogin /></PublicOnlyRoute>} />
        <Route path="/admin-register" element={<PublicOnlyRoute><AdminRegister /></PublicOnlyRoute>} />
        <Route path="/choose-role" element={<PublicOnlyRoute><ChooseRole /></PublicOnlyRoute>} />

        {/* Help/Request Routes */}
        <Route path="/findHelp" element={<AvailableHelp />} />
        <Route path="/RequestsFeed" element={<RequestsFeed />} />
        <Route path="/requests/:id" element={<RequestDetails />} />
        <Route path="/offer-details/:id" element={<OfferDetails />} />
        <Route path="/request-details/:id" element={<RequestDetails />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/create-apartment"
          element={
            <ProtectedRoute adminOnly={true}>
              <CreateApartment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AdminProfile"
          element={
            <ProtectedRoute adminOnly={true}>
              {/* ✅ FIXED: Stripped out the bare reference error variable; reading directly from storage instead */}
              <AdminProfile currentUser={user} token={localStorage.getItem("token")}/>
            </ProtectedRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:id"
          element={
            <ProtectedRoute allowBoth={true}>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post"
          element={
            <ProtectedRoute adminOnly={false}>
              <PostRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/OfferHelp"
          element={
            <ProtectedRoute>
              <OfferHelp />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;