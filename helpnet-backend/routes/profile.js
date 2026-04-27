const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth'); 
const User = require('../models/user');
const jwt = require('jsonwebtoken'); // ✅ ADD THIS

// ================= GET PROFILE =================
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json(user);

  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ================= SET APARTMENT =================
router.patch('/set-apartment', auth, async (req, res) => {
  try {
    const { apartmentId } = req.body;

    if (!apartmentId || apartmentId.trim().length < 2) {
      return res.status(400).json({ message: 'Invalid apartment' });
    }

    const user = await User.findById(req.user.id);
    user.apartmentId = apartmentId.trim();

    await user.save();

    // ✅ Generate NEW TOKEN with apartmentId
    const token = jwt.sign(
      { id: user._id, apartmentId: user.apartmentId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Apartment set successfully',
      token,
      apartmentId: user.apartmentId
    });

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ================= UPDATE PROFILE =================
router.patch('/', auth, async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.id;

    const filteredUpdates = {};
    const allowed = ['fullName', 'location', 'bio'];

    Object.keys(updates).forEach(key => {
      if (allowed.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: "Database update failed" });
  }
});

module.exports = router;