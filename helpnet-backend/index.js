const express = require('express');
const path = require("path");
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();

// 1. IMPORT ALL ROUTES AT THE TOP
const authRoutes = require('./routes/auth');
const adminRoutes = require("./routes/admin");
const requestRoutes = require('./routes/requests');
const offerRoutes = require('./routes/offers');
const messageRoutes = require('./routes/messages');
const profileRoutes = require('./routes/profile');


const app = express();
const server = http.createServer(app); 

// 2. INITIALIZE SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://help-net-chi.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
app.set('io', io);
// 3. MIDDLEWARE
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors({
  origin: ["http://localhost:5173", "https://help-net-chi.vercel.app"],
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize()); 

// 4. MOUNT ROUTES (Organized)
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// 5. SOCKET CONNECTION LOGIC
io.on('connection', (socket) => {
 // console.log('⚡ User connected:', socket.id);
  socket.on('join_room', (userId) => {
    socket.join(userId);
  });
  socket.on('send_message', (data) => {
    socket.to(data.receiverId).emit('receive_message', data);
  });
});

// 6. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB!"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// 7. START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Real-time Server running on port ${PORT}`);
});

