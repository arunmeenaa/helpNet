const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
role: {
  type: String,
  enum: ["user", "admin"],
  default: "user"
},


  apartmentId: {
    type: String,
    default: null,
    trim: true,
    lowercase: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
  },

  location: {
    type: String,
  },

  googleId: {
    type: String,
  },

  isVerified: {
    type: Boolean,
    default: true,
  },

isEvicted: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

// ✅ Index for fast filtering
UserSchema.index({ apartmentId: 1 });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);