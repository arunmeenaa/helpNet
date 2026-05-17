const express = require("express");
const router = express.Router();
// 💡 Correct imports: Import only once!
const { auth, isAdmin } = require("../middleware/auth"); 
const Apartment = require("../models/Apartment");
const User = require("../models/user"); 
const JoinRequest = require("../models/JoinRequest");
const Request = require('../models/Request'); // 👈 Ensure this points to your file!
const Offer = require('../models/Offer');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// ✅ Create apartment

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Generates a unique filename: timestamp + original extension
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  }
});

// File Filter to allow only images
// backend/routes/admin.js

const fileFilter = (req, file, cb) => {
  // 1. Read file characteristics
  const mimeType = file.mimetype.toLowerCase();
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  // 2. Define standard whitelisted image extensions
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  // 3. Validation matching sequence
  if (mimeType.startsWith("image/") || allowedExtensions.includes(fileExtension)) {
    cb(null, true); // Accept file safely
  } else {
    // Pass a clean validation message back to the pipeline instead of a terminal crash exception
    cb(new Error("Invalid format! Only image files (JPG, PNG, WEBP) are allowed."), false);
  }
};

// backend/routes/admin.js

// 1. Keep your multer instantiation setup line
const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }).single("profilePic");

// 2. Rewrite the route declaration block to isolate upload processes
router.post("/upload-profile-pic", auth, (req, res, next) => {
  upload(req, res, async function (err) {
    // 🔒 CATCH MULTER/FILE FILTER VALIDATION ERRORS CLEANLY
    if (err) {
      console.error("Multer validation intercepted:", err.message);
      return res.status(400).json({ message: err.message });
    }

    // 🔒 CHECK IF NO FILE WAS CHOSEN
    if (!req.file) {
      return res.status(400).json({ message: "Please select an image file to upload." });
    }

    try {
      const imagePath = `/uploads/${req.file.filename}`;
      
      // 🌟 MONGODB UPDATE (With the modern 'returnDocument' replacement option fixed!)
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { profilePic: imagePath },
        { returnDocument: "after" } // 👈 Fixes your Mongoose deprecation warning!
      ).select("-password");

      // Optional: Socket.io real-time update broadcast hook
      try {
        const io = req.app.get("io");
        if (io && updatedUser.apartmentId) {
          io.to(updatedUser.apartmentId.toString()).emit("resident_profile_updated", updatedUser);
        }
      } catch (socketErr) {
        console.warn("Real-time broadcast skipped safely:", socketErr.message);
      }

      // Success payload delivery
      return res.json({ 
        message: "Profile picture updated successfully!", 
        user: updatedUser 
      });

    } catch (dbErr) {
      console.error("Database update transaction failed:", dbErr);
      return res.status(500).json({ message: "Database lookup error encountered." });
    }
  });
});


router.post('/create-apartment', auth, async (req, res) => {
  try {
    const { name, apartmentId } = req.body;
    const exists = await Apartment.findOne({ apartmentId });
    if (exists) return res.status(400).json({ message: "Apartment already exists" });

    const newApartment = new Apartment({
      name,
      apartmentId,
      owner: req.user.id
    });

    await newApartment.save();
    
    // Update the user
    const user = await User.findById(req.user.id);
    user.role = "admin";
    user.apartmentId = apartmentId;
    await user.save();

    res.json({ message: "Apartment created 👑", apartmentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get user profile (Admin only)
// backend/routes/admin.js


router.get("/user/:id", auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select("-password");
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    // 🔒 SHARED SECURITY CHECK: 
    // It blocks access if the person looking doesn't live in the same building complex
    if (targetUser.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({ message: "Access denied. Not a member of this community complex." });
    }
    
    res.json(targetUser);
  } catch (err) {
    console.error("Error in shared user profile lookup:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get members (Admin only)
router.get("/members", auth, isAdmin, async (req, res) => {
  try {
    // ✅ FIXED: Filter by apartmentId AND ensure the user's role is Not Equal ($ne) to "admin"
    const members = await User.find({ 
      apartmentId: req.user.apartmentId,
      role: { $ne: "admin" } 
    }).select("fullName email createdAt profilePic");
    
    res.json(members);
  } catch (err) {
    console.error("Error fetching members:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Remove user
// ✅ Remove user
router.delete("/remove-user/:id", auth, isAdmin, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found." });
    if (targetUser.apartmentId !== req.user.apartmentId) return res.status(403).json({ message: "Access denied." });

    // 1. Update user statuses
    targetUser.apartmentId = null;
    targetUser.isEvicted = true;
    await targetUser.save();

    // 🌟 2. DATABASE CLEANUP: Delete all requests and offers created by this user
    // Double-check if your schema fields are named 'creator', 'userId', or 'sender' and match them below
    const deletedRequests = await Request.deleteMany({ author: targetUser._id });
    const deletedOffers = await Offer.deleteMany({ author: targetUser._id });
    
    console.log(`🧹 Cascaded Cleanup: Deleted ${deletedRequests.deletedCount} requests and ${deletedOffers.deletedCount} offers for evicted user ${targetUser._id}`);

    // 3. Get the 'io' instance
    const io = req.app.get('io');
    
    // 4. Emit the event to the user who was removed
    if (io) {
      const userRoom = targetUser._id.toString();
      io.to(userRoom).emit("user_removed", { 
        message: "You have been removed from the community." 
      });

      // 🌟 5. Tell everyone else in the apartment feed to refresh and drop the deleted cards immediately
      io.emit("feed_updated");
    }

    res.json({ message: "User removed and community posts cleared successfully." });
  } catch (err) {
    console.error("Error in remove-user endpoint:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Request to join (Users) - Note: auth only, not isAdmin
// helpnet-backend/routes/admin.js

router.post('/join-requests', auth, async (req, res) => {
  try {
    const { apartmentId } = req.body;
    const existing = await JoinRequest.findOne({ userId: req.user.id, status: 'pending' });
    if (existing) return res.status(400).json({ message: "Request already pending." });

    // 1. Save to DB first
    const newRequest = new JoinRequest({ userId: req.user.id, apartmentId ,status: 'pending'});
    await newRequest.save();
    //await newRequest.populate('userId', 'fullName email');
    // 2. NOW emit the event to the admin
    const populatedRequest = await JoinRequest.findById(newRequest._id).populate('userId', 'fullName email'); 
    const io = req.app.get('io');
    const roomName = `admin_${apartmentId}`;
    
    console.log("Attempting to emit to room:", roomName); 
    io.to(`admin_${apartmentId}`).emit("new_join_request", { 
      message: "New join request received!",
      request: populatedRequest // This now has userId.fullName inside it
    });
    
    io.to(roomName).emit("new_join_request", { 
      message: "New join request received!",
      request: populatedRequest 
    });

    res.status(201).json({ message: "Request submitted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/reject-join', auth, async (req, res) => {
  try {
    const { requestId } = req.body;

    // 1. Find the request first so we have the userId
    const request = await JoinRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // 2. Get the IO instance and notify the specific user
    const io = req.app.get('io');
    io.to(request.userId.toString()).emit("request_rejected", { 
        message: "Your join request has been rejected by the admin." 
    });

    // 3. Now delete the request
    await JoinRequest.findByIdAndDelete(requestId);
    
    res.json({ message: "Request rejected successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get pending requests (Admin only)
router.get('/join-requests', auth, isAdmin, async (req, res) => {
  try {
    const requests = await JoinRequest.find({ 
      apartmentId: req.user.apartmentId, 
      status: 'pending' 
    }).populate('userId', 'fullName email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Approve user (Admin only)
// ✅ Approve user (Admin only)
router.post('/approve-join', auth, isAdmin, async (req, res) => {
  try {
    const { requestId, userId } = req.body;
    
    // 1. Update Database
    await User.findByIdAndUpdate(userId, { apartmentId: req.user.apartmentId });
    await JoinRequest.findByIdAndUpdate(requestId, { status: 'approved' });

    // 2. Get the 'io' instance we attached to the app
    const io = req.app.get('io');
    
    // 3. Emit the event
    if (io) {
      io.to(userId).emit("approval_confirmed", { 
        message: "You have been approved!",
        apartmentId: req.user.apartmentId 
      });
    }

    res.json({ message: "User approved successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;