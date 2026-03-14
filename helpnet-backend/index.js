const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(express.json());

// 1. IMPROVED CORS: Support both local Vite (5173) and Production (Vercel)
const allowedOrigins = [
  "http://localhost:5173",          // Local Vite
  "http://localhost:3000",          // Local Create React App
  process.env.FRONTEND_URL          // Production Vercel URL
].filter(Boolean); // Removes undefined if FRONTEND_URL isn't set yet

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Import Routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const offerRoutes = require('./routes/offers');
const messageRoutes = require('./routes/messages');

// Connect to MongoDB
// No need to hardcode - it will use Atlas in production and Local in .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB!"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});