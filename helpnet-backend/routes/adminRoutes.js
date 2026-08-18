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
  getMyApartment,
} = require("../controllers/adminController");

const { auth, isOwner } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post(
  "/upload-profile-pic",
  auth,
  isOwner,
  upload.single("profilePic"),
  uploadProfilePic
);

router.get("/my-apartment", auth, isOwner, getMyApartment);

router.post("/create-apartment", auth, isOwner, createApartment);

router.get("/user/:id", auth, isOwner, getUserProfile);

router.get("/members", auth, isOwner, getMembers);

router.delete("/remove-user/:id", auth, isOwner, removeUser);

router.post("/join-requests", auth, createJoinRequest);

router.delete("/reject-join", auth, isOwner, rejectJoinRequest);

router.get("/join-requests", auth, isOwner, getPendingJoinRequests);

router.post("/approve-join", auth, isOwner, approveJoinRequest);

module.exports = router;
