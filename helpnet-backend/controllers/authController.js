const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Apartment = require("../models/Apartment");
const generateToken = require("../utils/generateToken");

// ==========================================
// REGISTER
// POST /api/auth/register
// ==========================================
const register = async (req, res) => {
  try {
    const { fullName, email, password, location } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ==========================================
    // CHECK EXISTING USER
    // ==========================================
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // ==========================================
    // CREATE USER
    // ==========================================
    const newUser = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      location: location ? location.trim() : "",
      apartmentId: null,
      isVerified: true,
      role: "user",
      isEvicted: false,
    });

    await newUser.save();

    // ==========================================
    // GENERATE TOKEN
    // ==========================================
    const token = generateToken(newUser);

    // ==========================================
    // RESPONSE
    // ==========================================
    res.status(201).json({
      token,

      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        apartmentId: newUser.apartmentId || null,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// ==========================================
// LOGIN
// POST /api/auth/login
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ==========================================
    // FIND USER
    // ==========================================
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // GOOGLE ACCOUNT CHECK
    // ==========================================
    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    // ==========================================
    // PASSWORD CHECK
    // ==========================================
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // GENERATE TOKEN
    // ==========================================
    const token = generateToken(user);

    // ==========================================
    // RESPONSE
    // ==========================================
    res.json({
      token,

      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        apartmentId: user.apartmentId || null,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
};

// ==========================================
// GET CURRENT USER
// GET /api/auth/me
// ==========================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// SET APARTMENT
// PATCH /api/auth/set-apartment
// ==========================================
// ==========================================
// SET APARTMENT
// PATCH /api/auth/set-apartment
// ==========================================
const setApartment = async (req, res) => {
  try {
    const { apartmentId } = req.body;

    // ==========================================
    // VALIDATE INPUT
    // ==========================================
    if (
      !apartmentId ||
      apartmentId.trim().length < 2
    ) {
      return res.status(400).json({
        message: "Apartment ID is required.",
      });
    }

    const cleanApartmentId =
      apartmentId.trim().toLowerCase();

    // ==========================================
    // CHECK IF APARTMENT EXISTS
    // ==========================================
    const apartment = await Apartment.findOne({
      apartmentId: cleanApartmentId,
    });

    if (!apartment) {
      return res.status(404).json({
        message:
          "Apartment not found. Please enter a valid apartment ID.",
      });
    }

    // ==========================================
    // FIND USER
    // ==========================================
    const user = await User.findById(
      req.user.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

  
    user.apartmentId = cleanApartmentId;
    user.isEvicted = false;

    await user.save();

    // ==========================================
    // GENERATE NEW TOKEN
    // ==========================================
    const token = generateToken(user);

    // ==========================================
    // RESPONSE
    // ==========================================
    return res.json({
      message:
        "Apartment found and assigned successfully.",
      token,
      apartmentId: user.apartmentId,
      apartment: {
        id: apartment._id,
        name: apartment.name,
        apartmentId: apartment.apartmentId,
      },
    });
  } catch (error) {
    console.error(
      "Set apartment error:",
      error
    );

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// GOOGLE CALLBACK
// GET /api/auth/google/callback
// ==========================================
const googleCallback = async (req, res) => {
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${frontendURL}/login?error=google-auth-failed`);
    }

    // ==========================================
    // GENERATE TOKEN
    // ==========================================
    const token = generateToken(user);

    // ==========================================
    // ADMIN
    // ==========================================
    if (user.role === "admin") {
      return res.redirect(`${frontendURL}/admin?token=${token}`);
    }

    // ==========================================
    // USER WITHOUT APARTMENT
    // ==========================================
    if (!user.apartmentId) {
      return res.redirect(`${frontendURL}/set-apartment?token=${token}`);
    }

    // ==========================================
    // NORMAL USER
    // ==========================================
    return res.redirect(`${frontendURL}/dashboard?token=${token}`);
  } catch (error) {
    console.error("Google callback error:", error);

    return res.redirect(`${frontendURL}/login?error=google-auth-failed`);
  }
};

module.exports = {
  register,
  login,
  getMe,
  setApartment,
  googleCallback,
};
