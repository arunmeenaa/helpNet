// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();


app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));

// Import your new Auth Routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests'); // DID YOU ADD THIS?
const offerRoutes = require('./routes/offers');
const messageRoutes = require('./routes/messages');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB!"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Use the routes (This makes your endpoints available at /api/auth/register and /api/auth/login)
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes); // DID YOU ADD THIS?
app.use('/api/offers', offerRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});