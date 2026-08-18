const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC INFORMATION
    // ==========================================
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // AUTHENTICATION
    // ==========================================
    password: {
      type: String,
    },

    googleId: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // ROLE
    // ==========================================
    role: {
      type: String,
      enum: ["resident", "owner"],
      default: "resident",
    },

    // ==========================================
    // APARTMENT
    // ==========================================
    apartmentId: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },

    isEvicted: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // PROFILE
    // ==========================================
    location: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    profilePic: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

UserSchema.index({
  apartmentId: 1,
});

// ==========================================
// EXPORT
// ==========================================

module.exports =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);