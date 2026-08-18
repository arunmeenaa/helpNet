const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    // ==========================================
    // CHECK AUTH HEADER
    // ==========================================
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "No token, authorization denied",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token, authorization denied",
      });
    }

    // ==========================================
    // VERIFY TOKEN
    // ==========================================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.id) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    // ==========================================
    // GET FRESH USER FROM DATABASE
    // ==========================================
    const user = await User.findById(
      decoded.id
    ).lean();

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // ==========================================
    // ATTACH FRESH USER DATA
    // ==========================================
    req.user = {
      id: user._id,

      // New role terminology
      role: user.role || "resident",

      apartmentId:
        user.apartmentId
          ?.trim()
          .toLowerCase() || null,

      isEvicted:
        user.isEvicted || false,
    };

    next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired",
      });
    }

    return res.status(401).json({
      message:
        "Token is not valid or has expired",
    });
  }
};

// ==========================================
// OWNER AUTHORIZATION
// ==========================================
const isOwner = (req, res, next) => {
  if (
    req.user &&
    req.user.role === "owner"
  ) {
    return next();
  }

  return res.status(403).json({
    message:
      "Access denied. Apartment owners only.",
  });
};

module.exports = {
  auth,
  isOwner,
};