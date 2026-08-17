const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    // ==========================================
    // REQUEST DETAILS
    // ==========================================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // PRIORITY
    // ==========================================
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      lowercase: true,
      required: true,
    },

    // ==========================================
    // STATUS
    // ==========================================
    status: {
      type: String,
      enum: ["open", "resolved", "cancelled"],
      default: "open",
    },

    // ==========================================
    // AUTHOR
    // ==========================================
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // APARTMENT
    // ==========================================
    apartmentId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

// Apartment feed
requestSchema.index({
  apartmentId: 1,
});

// Apartment + status feed
requestSchema.index({
  apartmentId: 1,
  status: 1,
});

// User's own requests
requestSchema.index({
  author: 1,
});

module.exports =
  mongoose.models.Request ||
  mongoose.model("Request", requestSchema);