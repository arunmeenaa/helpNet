const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const passport = require('passport');
const auth = require('../middleware/auth'); // ✅ ADD THIS

const router = express.Router();
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === "production" 
    ? "https://helpnet-gw14.onrender.com/api/auth/google/callback" 
    : "http://localhost:5000/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let email = profile.emails[0].value.toLowerCase().trim();
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        fullName: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isVerified: true
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email:email.toLowerCase().trim(),
      password: hashedPassword,
      location,
      isVerified: true
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, apartmentId: newUser.apartmentId || null }, // ✅ INCLUDE
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        apartmentId: newUser.apartmentId || null
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ 
   email: email.toLowerCase().trim() 
});

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, apartmentId: user.apartmentId || null }, // ✅ INCLUDE
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        apartmentId: user.apartmentId || null
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

// ================= SET APARTMENT =================
router.patch('/set-apartment', auth, async (req, res) => {
  try {
    const { apartmentId } = req.body;

    if (!apartmentId || apartmentId.trim().length < 2) {
      return res.status(400).json({ message: 'Apartment required' });
    }

    const user = await User.findById(req.user.id);
    user.apartmentId = apartmentId.trim().toLowerCase();
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

// ================= GOOGLE AUTH =================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {

    const token = jwt.sign(
      { id: req.user._id, apartmentId: req.user.apartmentId || null }, // ✅ INCLUDE
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const frontendURL = process.env.FRONTEND_URL || "https://help-net-chi.vercel.app";

    res.redirect(`${frontendURL}/login-success?token=${token}`);
  }
);

module.exports = router;