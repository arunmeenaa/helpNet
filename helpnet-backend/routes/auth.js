const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const passport = require('passport');

const router = express.Router();

const GoogleStrategy = require('passport-google-oauth20').Strategy;

// --- GOOGLE STRATEGY CONFIGURATION ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // 💡 IMPORTANT: Switch this to your Render URL when you deploy!
    callbackURL: process.env.NODE_ENV === "production" 
  ? "https://helpnet-gw14.onrender.com/api/auth/google/callback" 
  : "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Check if user already exists in DB
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        // 2. If not, create them (No password needed for Google users)
        user = new User({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isVerified: true 
        });
        await user.save();
      } else if (!user.googleId) {
        // 3. If user exists but didn't have a googleId, link it now
        user.googleId = profile.id;
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));
// --- 1. REGISTER ROUTE (Direct Save) ---
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.getSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and Save User Immediately
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      location,
      isVerified: true // Set to true by default since we removed OTP
    });

    await newUser.save();

    // Generate Token so they are logged in immediately after registering
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      token, 
      user: { id: newUser._id, fullName: newUser.fullName, email: newUser.email },
      message: "Registration successful!" 
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// --- 2. LOGIN ROUTE (Simplified) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(200).json({ 
      token, 
      user: { id: user._id, fullName: user.fullName, email: user.email } 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// --- 3. GOOGLE AUTH ROUTES (Keep these as they are fast and verified) ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }), 
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const frontendURL = process.env.FRONTEND_URL || "https://help-net-chi.vercel.app";
    res.redirect(`${frontendURL}/login-success?token=${token}`);
  }
);

module.exports = router;