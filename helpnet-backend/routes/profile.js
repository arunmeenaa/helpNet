const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const User = require('../models/user');

// @route   GET api/profile/me
// routes/profile.js
router.get('/me', auth, async (req, res) => {
  try {
    // 💡 Add lean(false) to ensure we get the fresh doc from the DB
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // 💡 Set headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/profile
// @desc    Update user profile (Dynamic: handles Name, Email, Location, etc.)
// @route   PATCH api/profile
// @desc    Update user profile 
router.patch('/', auth, async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.id;

    // Filter out fields that shouldn't be updated here (like password)
    const filteredUpdates = {};
    const allowed = ['fullName', 'email', 'location', 'bio'];
    
    Object.keys(updates).forEach(key => {
      if (allowed.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // 💡 Use findByIdAndUpdate for a direct write to the DB
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log("🔥 Successfully saved to DB:", user);
    res.json(user);
  } catch (err) {
    console.error("❌ DB Update Error:", err.message);
    res.status(500).json({ message: "Database update failed" });
  }
});

module.exports = router;