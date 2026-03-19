const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // password is NOT required so Google Auth users can be saved
  password: {
    type: String,
  },
  location: {
    type: String,
  },
  // We'll keep googleId to distinguish between email and social logins
  googleId: {
    type: String,
  },
  // Default to true now since we removed the OTP step
  isVerified: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
