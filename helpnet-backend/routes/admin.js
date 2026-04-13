const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Apartment = require("../models/Apartment");
const User = require("../models/user");

// ✅ Create apartment (only once)
// ✅ Create apartment (only once)
router.post('/create-apartment', auth, async (req, res) => {
  try {
    // 💡 Removed adminKey from req.body
    const { name, apartmentId } = req.body;

    const exists = await Apartment.findOne({ apartmentId });
    if (exists) {
      return res.status(400).json({ message: "Apartment already exists" });
    }

    const newApartment = new Apartment({
      name,
      apartmentId,
      owner: req.user.id // Uses the ID from your auth middleware
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
// ✅ Get a specific user's profile (for Admin viewing)
router.get("/user/:id", auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);

    // Make sure the person requesting is actually an admin
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Find the user by the ID passed in the URL
    const targetUser = await User.findById(req.params.id).select("-password");

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional security check: Make sure the target user belongs to the same apartment
    if (targetUser.apartmentId !== admin.apartmentId) {
      return res.status(403).json({ message: "User does not belong to your apartment." });
    }

    res.json(targetUser);

  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get all members of apartment
router.get("/members", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Not admin" });
    }

    const members = await User.find({
      apartmentId: user.apartmentId
    }).select("fullName email createdAt");

    res.json(members);

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
// ✅ Remove a resident from the apartment
// ✅ Remove a resident from the apartment (KEEPING their account)
router.delete("/remove-user/:id", auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);

    // 1. Verify the requester is an admin
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // 2. Prevent the admin from removing themselves
    if (req.params.id === admin._id.toString()) {
      return res.status(400).json({ message: "You cannot remove yourself." });
    }

    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Security check: Only allow removal if they are in your apartment
    if (targetUser.apartmentId !== admin.apartmentId) {
      return res.status(403).json({ message: "This user is not in your apartment." });
    }

    // 4. THE FIX: Remove the apartment link and set the eviction flag
    targetUser.apartmentId = null; 
    targetUser.isEvicted = true; // This lets us show them the "You were removed" message
    
    await targetUser.save();

    res.json({ message: "User successfully removed from the apartment community." });

  } catch (err) {
    console.error("Error removing user:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;