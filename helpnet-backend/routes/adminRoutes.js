const express = require("express");

const {
  uploadProfilePic,
  createApartment,
  getUserProfile,
  getMembers,
  removeUser,
  createJoinRequest,
  rejectJoinRequest,
  getPendingJoinRequests,
  approveJoinRequest,
} = require("../controllers/adminController");

const { auth, isAdmin } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// ==========================================
// PROFILE PICTURE
// ==========================================
router.post(
  "/upload-profile-pic",
  auth,
  upload.single("profilePic"),
  uploadProfilePic
);

// ==========================================
// CREATE APARTMENT
// ==========================================
router.post(
  "/create-apartment",
  auth,
  createApartment
);

// ==========================================
// GET USER PROFILE
// ADMIN ONLY
// ==========================================
router.get(
  "/user/:id",
  auth,
  isAdmin,
  getUserProfile
);

// ==========================================
// GET MEMBERS
// ADMIN ONLY
// ==========================================
router.get(
  "/members",
  auth,
  isAdmin,
  getMembers
);

// ==========================================
// REMOVE USER
// ADMIN ONLY
// ==========================================
router.delete(
  "/remove-user/:id",
  auth,
  isAdmin,
  removeUser
);

// ==========================================
// CREATE JOIN REQUEST
// NORMAL USER
// ==========================================
router.post(
  "/join-requests",
  auth,
  createJoinRequest
);

// ==========================================
// REJECT JOIN REQUEST
// ADMIN ONLY
// ==========================================
router.delete(
  "/reject-join",
  auth,
  isAdmin,
  rejectJoinRequest
);

// ==========================================
// GET PENDING JOIN REQUESTS
// ADMIN ONLY
// ==========================================
router.get(
  "/join-requests",
  auth,
  isAdmin,
  getPendingJoinRequests
);

// ==========================================
// APPROVE JOIN REQUEST
// ADMIN ONLY
// ==========================================
router.post(
  "/approve-join",
  auth,
  isAdmin,
  approveJoinRequest
);

module.exports = router;