const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Ensure this path is correct for your project
const User = require('../models/user');

// @route   GET api/profile/me
// @desc    Get current user's profile data
router.get('/me', auth, async (req, res) => {
  try {
    // Find user by ID (from auth middleware) but don't return the password
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/profile
// @desc    Update user profile (like location)
router.patch('/', auth, async (req, res) => {
  try {
    const { location, bio } = req.body;
    let user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update location if provided
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;