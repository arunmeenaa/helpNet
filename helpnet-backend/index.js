const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const http = require('http'); 
const { Server } = require('socket.io'); 
const profileRoutes = require('./routes/profile');
const adminRoutes = require("./routes/admin");

require('dotenv').config();

const app = express();

// Create HTTP server to wrap the Express app
const server = http.createServer(app); 

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://help-net-chi.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ==========================================
// 🚨 1. CORS GOES FIRST! 
// ==========================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://help-net-chi.vercel.app"
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

// ==========================================
// 🚨 2. BODY PARSER GOES SECOND
// ==========================================
app.use(express.json());
app.use(passport.initialize()); 

// ==========================================
// 🚨 3. ROUTES GO THIRD
// ==========================================
app.use("/api/admin", adminRoutes);

// 💡 4. Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  // User joins a private room named after their User ID
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their private room`);
  });

  // Listen for real-time messages
  socket.on('send_message', (data) => {
    socket.to(data.receiverId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected');
  });
});

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

// CRITICAL: Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`🚀 Real-time Server running on port ${PORT}`);
});