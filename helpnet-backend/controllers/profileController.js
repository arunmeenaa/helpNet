const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent browser/proxy caching of profile data
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const setApartment = async (req, res) => {
  try {
    const { apartmentId } = req.body;

    if (!apartmentId || apartmentId.trim().length < 2) {
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

    user.apartmentId = apartmentId.trim().toLowerCase();

    await user.save();

    // Use the same JWT structure everywhere
    const token = generateToken(user);

    res.json({
      message: "Apartment set successfully",
      token,
      apartmentId: user.apartmentId,
    });
  } catch (error) {
    console.error("Set apartment error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user.id;

    // Only allow these fields to be changed
    const allowedFields = ["fullName", "location", "bio"];

    const filteredUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
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
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      message: "Database update failed",
    });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, source = "gps" } = req.body;

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!["gps", "manual"].includes(source)) {
      return res.status(400).json({
        message: "Invalid location source.",
      });
    }
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        message: "Invalid coordinates.",
      });
    }
    if (
      source === "gps" &&
      (!Number.isFinite(Number(latitude)) ||
        !Number.isFinite(Number(longitude)))
    ) {
      return res.status(400).json({
        message: "Valid GPS coordinates are required.",
      });
    }
    if (
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))
    ) {
      return res.status(400).json({
        message: "Valid coordinates are required.",
      });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          coordinates: {
            lat: Number(latitude),
            lng: Number(longitude),
          },
          locationSource: source,
          ...(accuracy !== undefined && {
            locationAccuracy: Number(accuracy),
          }),
          locationUpdatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

 

    return res.json({
      message: "Location updated successfully.",
      coordinates: user.coordinates,
      locationUpdatedAt: user.locationUpdatedAt,
    });
  } catch (error) {
    console.error("UPDATE LOCATION ERROR:", error);

    return res.status(500).json({
      message: "Failed to update location.",
    });
  }
};

module.exports = {
  getProfile,
  setApartment,
  updateProfile,
  updateLocation,
};
