const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const passport = require('passport');
const {auth} = require('../middleware/auth'); // ✅ ADD THIS

const router = express.Router();
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === "production" 
    ? "https://helpnet-gw14.onrender.com/api/auth/google/callback" 
    : "http://localhost:5000/api/auth/google/callback",
  passReqToCallback: true // 🚨 1. YOU MUST ADD THIS LINE
},
// 🚨 2. ADD 'req' AS THE FIRST PARAMETER HERE
async (req, accessToken, refreshToken, profile, done) => {
  try {
    // 🚨 3. GRAB THE ROLE FROM THE GOOGLE STATE
    const role = req.query.state || "user"; 

    let email = profile.emails[0].value.toLowerCase().trim();
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        fullName: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isVerified: true,
        role: role === "admin" ? "admin" : "user" // ✅ Now this works safely!
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
    const { fullName, email, password, location, role } = req.body;

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
      isVerified: true,
      role: role === "admin" ? "admin" : "user"
    });

    await newUser.save();

   const token = jwt.sign(
  { 
    id: newUser._id, 
    apartmentId: newUser.apartmentId || null,
    role: newUser.role   // ✅ FIX
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

    res.status(201).json({ 
      token, 
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        apartmentId: newUser.apartmentId || null,
        role: newUser.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    // Fetch fresh data from DB, not from token
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
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
  { 
    id: user._id, 
    apartmentId: user.apartmentId || null,
    role: user.role   // ✅ FIX
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

    res.json({
  token,
  user: {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    apartmentId: user.apartmentId,
    role: user.role   // ✅ ADD THIS
  }
});

  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});
console.log("DEBUG - Auth variable is:", auth);
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
  { 
    id: user._id, 
    apartmentId: user.apartmentId,
    role: user.role   // ✅ FIX
  },
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
router.get('/google', (req, res, next) => {
  const role = req.query.role || "user";

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: role   // ✅ PASS ROLE
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {

    const loginRole = req.query.state || "user";

    // ❌ BLOCK if trying admin but not admin
    if (loginRole === "admin" && req.user.role !== "admin") {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=not-admin`);
    }

    const token = jwt.sign(
  { 
    id: req.user._id, 
    apartmentId: req.user.apartmentId || null,
    role: req.user.role   // ✅ ADD THIS
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

    // ✅ redirect based on role
    if (req.user.role === "admin") {
      res.redirect(`${frontendURL}/admin?token=${token}`);
    } else if (!req.user.apartmentId) {
      res.redirect(`${frontendURL}/set-apartment?token=${token}`);
    } else {
      res.redirect(`${frontendURL}/dashboard?token=${token}`);
    }
  }
);

module.exports = router;