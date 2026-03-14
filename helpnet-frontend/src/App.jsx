import { Routes, Route } from "react-router-dom";

import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import PostRequest from "./pages/PostRequest";
import RequestDetails from "./pages/RequestDetails";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import OfferDetails from "./pages/OfferDetails";
import About from "./pages/About";
import ScrollToTop from "./components/ScrollToTop";
import Register from "./pages/Register";
import AvailableHelp from "./pages/AvailableHelp";
import RequestsFeed from "./pages/RequestsFeed";
import OfferHelp from "./pages/OfferHelp";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/findHelp" element={<AvailableHelp />} />
        <Route path="RequestsFeed" element={<RequestsFeed />} />
        <Route path="/requests/:id" element={<RequestDetails />} />
        <Route
          path="/contact/:receiverId"
          element={
            <ProtectedRoute>
              <RequestDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/RequestDetails"
          element={
            <ProtectedRoute>
              <RequestDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offer-details/:id"
          element={
            <ProtectedRoute>
              <OfferDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request-details/:id"
          element={
            <ProtectedRoute>
              <RequestDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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

        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <PostRequest />
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
      </Routes>
    </div>
  );
}

export default App;
