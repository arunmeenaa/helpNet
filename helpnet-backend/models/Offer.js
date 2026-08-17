const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    // ==========================================
    // OFFER DETAILS
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
offerSchema.index({
  apartmentId: 1,
});

// Apartment + status feed
offerSchema.index({
  apartmentId: 1,
  status: 1,
});

// User's own offers
offerSchema.index({
  author: 1,
});

module.exports =
  mongoose.models.Offer ||
  mongoose.model("Offer", offerSchema);