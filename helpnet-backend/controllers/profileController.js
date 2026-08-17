const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// ==========================================
// GET MY PROFILE
// GET /api/profile/me
// ==========================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent browser/proxy caching of profile data
    res.setHeader(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// SET APARTMENT
// PATCH /api/profile/set-apartment
//
// NOTE:
// This endpoint is kept temporarily for
// frontend compatibility.
//
// New frontend code should preferably use:
// PATCH /api/auth/set-apartment
// ==========================================
const setApartment = async (req, res) => {
  try {
    const { apartmentId } = req.body;

    if (
      !apartmentId ||
      apartmentId.trim().length < 2
    ) {
      return res.status(400).json({
        message: "Invalid apartment",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.apartmentId = apartmentId
      .trim()
      .toLowerCase();

    await user.save();

    // Use the same JWT structure everywhere
    const token = generateToken(user);

    res.json({
      message: "Apartment set successfully",
      token,
      apartmentId: user.apartmentId,
    });
  } catch (error) {
    console.error(
      "Set apartment error:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// PATCH /api/profile
// ==========================================
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.id;

    // Only allow these fields to be changed
    const allowedFields = [
      "fullName",
      "location",
      "bio",
    ];

    const filteredUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (
      Object.keys(filteredUpdates).length === 0
    ) {
      return res.status(400).json({
        message: "No valid fields provided",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: filteredUpdates,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    res.status(500).json({
      message: "Database update failed",
    });
  }
};

module.exports = {
  getProfile,
  setApartment,
  updateProfile,
};