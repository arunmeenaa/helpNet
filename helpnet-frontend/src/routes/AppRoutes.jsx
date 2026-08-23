import { Routes, Route, Navigate } from "react-router-dom";

// Common
import PublicOnlyRoute from "../components/common/PublicOnlyRoute";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Inbox from "../components/common/Inbox";

// Public
import Home from "../pages/public/Home";
import About from "../pages/public/About";

// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Dashboard
import Dashboard from "../pages/dashboard/Dashboard";

// Profile
import Profile from "../pages/profile/Profile";
import UserProfile from "../pages/profile/UserProfile";

// Requests
import AvailableOffers from "../pages/offers/AvailableOffers";
import RequestsFeed from "../pages/requests/RequestsFeed";
import PostRequest from "../pages/requests/PostRequest";
import RequestDetails from "../pages/requests/RequestDetails";

// Offers
import OfferHelp from "../pages/offers/OfferHelp";
import OfferDetails from "../pages/offers/OfferDetails";

// Admin

import OwnerDashboard from "../pages/Owner/OwnerDashboard";
import OwnerProfile from "../pages/Owner/OwnerProfile";
import CreateApartment from "../pages/Owner/CreateApartment";

const AppRoutes = ({ user }) => {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}

      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <Home />
          </PublicOnlyRoute>
        }
      />

      <Route path="/about" element={<About />} />

      {/* ================= AUTH ================= */}

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* ================= REQUESTS ================= */}

      <Route path="/findHelp" element={<AvailableOffers />} />

      <Route path="/RequestsFeed" element={<RequestsFeed />} />

      <Route path="/requests/:id" element={<RequestDetails />} />

      <Route path="/request-details/:id" element={<RequestDetails />} />

      {/* ================= OFFERS ================= */}

      <Route path="/offer-details/:id" element={<OfferDetails />} />

      {/* ================= ADMIN ================= */}

      <Route
        path="/owner-dashboard"
        element={
          <ProtectedRoute ownerOnly>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-apartment"
        element={
          <ProtectedRoute ownerOnly>
            <CreateApartment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner-profile"
        element={
          <ProtectedRoute ownerOnly>
            <OwnerProfile
              currentUser={user}
              token={localStorage.getItem("token")}
            />
          </ProtectedRoute>
        }
      />

      {/* ================= USER ================= */}
      <Route path="/inbox" element={<Inbox />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute residentOnly>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute residentOnly>
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
          <ProtectedRoute residentOnly>
            <PostRequest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/OfferHelp"
        element={
          <ProtectedRoute residentOnly>
            <OfferHelp />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
