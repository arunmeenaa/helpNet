const express = require("express");

const {
  getProfile,
  setApartment,
  
} = require("../controllers/profileController");
const { uploadProfilePic } = require("../controllers/adminController");
const upload = require("../middleware/upload");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, getProfile);

router.patch("/set-apartment", auth, setApartment);

router.post(
  "/upload-profile-pic",
  auth,
  upload.single("profilePic"),
  uploadProfilePic,
);

module.exports = router;
