const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport'); // 1. Import Passport
const profileRoutes = require('./routes/profile');

require('dotenv').config();

const app = express();

app.use(express.json());

// 2. Initialize Passport Middleware
app.use(passport.initialize()); 

// 3. IMPROVED CORS: Support both local Vite (5173) and Production (Vercel)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://help-net-chi.vercel.app" // You can also hardcode this if FRONTEND_URL is acting up
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Import Routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const offerRoutes = require('./routes/offers');
const messageRoutes = require('./routes/messages');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB!"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});