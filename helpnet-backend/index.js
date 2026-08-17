require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const passport = require("passport");
const http = require("http");
const { Server } = require("socket.io");


const connectDB = require("./config/db");

require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const requestRoutes = require("./routes/requestRoutes");
const offerRoutes = require("./routes/offerRoutes");
const messageRoutes = require("./routes/messageRoutes");
const profileRoutes = require("./routes/profileRoutes");


const setupSocket = require("./socket/socket");


const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://help-net-chi.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

setupSocket(io);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://help-net-chi.vercel.app"],
    credentials: true,
  }),
);

// Parse JSON
app.use(express.json());

// Passport
app.use(passport.initialize());

// ================= ROUTES =================

app.use("/api/auth", authRoutes);

app.use("/api/requests", requestRoutes);

app.use("/api/offers", offerRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/admin", adminRoutes);

// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.json({
    message: "HelpNet Backend API is running",
    status: "OK",
  });
});

// ================= 404 HANDLER =================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// ================= START SERVER =================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start HTTP + Socket.IO server
    server.listen(PORT, () => {
      console.log(`🚀 HelpNet server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);

    process.exit(1);
  }
};

startServer();
