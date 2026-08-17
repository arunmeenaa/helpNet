const express = require("express");
const passport = require("passport");

const {
  register,
  login,
  getMe,
  setApartment,
  googleCallback,
} = require("../controllers/authController");

const { auth } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", auth, getMe);

router.patch("/set-apartment", auth, setApartment);

router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));


router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  googleCallback
);

module.exports = router;