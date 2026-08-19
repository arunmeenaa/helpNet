const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
   
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

    role: {
      type: String,
      enum: ["resident", "owner"],
      default: "resident",
    },

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


UserSchema.index({
  apartmentId: 1,
});


module.exports =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);