import { Routes, Route, useLocation, useNavigate } from "react-router-dom"; // Added useLocation, useNavigate
import { useEffect } from "react"; // Added useEffect
import { Toaster } from "react-hot-toast";
import LoginSuccess from "./pages/LoginSuccess";
import Home from "./pages/Home";
import PostRequest from "./pages/PostRequest";
import RequestDetails from "./pages/RequestDetails";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import OfferDetails from "./pages/OfferDetails";
import SetApartment from "./pages/SetApartment"; 
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

function App() {
  const location = useLocation();
  const navigate = useNavigate();
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const userData = JSON.parse(window.atob(base64));
      
      localStorage.setItem("user", JSON.stringify(userData));

      // ✅ FIX: Remove the token from URL without a full page reload
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // ✅ FIX: Tell the app the user changed without refreshing
      window.dispatchEvent(new Event("local-storage-update"));

      if (userData.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      console.error("Token sync failed", err);
    }
  }
}, [location, navigate]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop />

      <Routes>
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/findHelp" element={<AvailableHelp />} />
        <Route path="RequestsFeed" element={<RequestsFeed />} />
        <Route path="/requests/:id" element={<RequestDetails />} />
        <Route path="/choose-role" element={<ChooseRole />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        
        {/* Protected Routes */}
        <Route 
          path="/user/:id" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
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
        <Route path="/set-apartment" element={<SetApartment />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* ... Rest of your routes ... */}
        <Route path="/post" element={<ProtectedRoute><PostRequest /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/OfferHelp" element={<ProtectedRoute><OfferHelp /></ProtectedRoute>} />
        <Route path="/offer-details/:id" element={<ProtectedRoute><OfferDetails /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;