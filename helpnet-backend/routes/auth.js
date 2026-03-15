const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');

const router = express.Router();

// 💡 Debug log to see if your .env is actually loading
console.log("Email Config Check:", {
  user: process.env.EMAIL_USER ? "LOADED" : "MISSING",
  pass: process.env.EMAIL_PASS ? "LOADED" : "MISSING"
});

// ✅ Improved Transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // MUST be the 16-character code with NO spaces
  }
});

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      fullName, email, password: hashedPassword, location, verificationCode, isVerified: false
    });

    // ✅ SAVE THE USER FIRST
    await newUser.save();

    // 💡 REMOVE 'AWAIT' HERE (Fire and Forget)
    // This sends the email in the background while the response goes to the user immediately
    const mailOptions = {
      from: `"HelpNet" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email - HelpNet",
      html: `<h3>Your code is: <b>${verificationCode}</b></p>`
    };

    transporter.sendMail(mailOptions).catch(err => {
      console.error("Background Email Error:", err);
    });

    // ✅ RESPONSE SENT IMMEDIATELY (Spinner stops in 1 second)
    res.status(201).json({ message: "Verification code sent!" });

  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ... Keep Verify and Login routes the same as you have them ...

// 2. VERIFY EMAIL ROUTE ✅ (New)
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verificationCode !== code) return res.status(400).json({ message: "Invalid code" });

    user.isVerified = true;
    user.verificationCode = null; // Clear code
    await user.save();

    // Now that they are verified, give them their first token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ 
      token, 
      user: { id: user._id, fullName: user.fullName, email: user.email },
      message: "Email verified successfully!" 
    });
  } catch (error) {
    res.status(500).json({ message: "Verification error" });
  }
});

// 3. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // ✅ Block login if not verified
    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });

  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;