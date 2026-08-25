const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
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
      default: "",
    },

    coordinates: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },

    locationUpdatedAt: {
      type: Date,
      default: null,
    },

    radius: {
      type: Number,
      default: 2,
      min: 1,
      max: 20,
    },

    visibility: {
      type: String,
      enum: ["apartment", "nearby"],
      default: "apartment",
    },

    status: {
      type: String,
      enum: ["open", "resolved", "cancelled"],
      default: "open",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    apartmentId: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

// Apartment feed
offerSchema.index({
  apartmentId: 1,
  status: 1,
});

// User's own offers
offerSchema.index({
  author: 1,
});

module.exports = mongoose.models.Offer || mongoose.model("Offer", offerSchema);
