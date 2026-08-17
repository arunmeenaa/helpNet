const express = require("express");

const {
  getProfile,
  setApartment,
  updateProfile,
} = require("../controllers/profileController");

const { auth } = require("../middleware/auth");

const router = express.Router();

// ==========================================
// GET MY PROFILE
// ==========================================
router.get(
  "/me",
  auth,
  getProfile
);

// ==========================================
// SET APARTMENT
// ==========================================
// Kept for existing frontend compatibility.
router.patch(
  "/set-apartment",
  auth,
  setApartment
);

// ==========================================
// UPDATE PROFILE
// ==========================================
router.patch(
  "/",
  auth,
  updateProfile
);

module.exports = router;