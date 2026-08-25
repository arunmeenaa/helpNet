const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
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
    radius: {
      type: Number,
      default: 2,
    },

    locationCoordinates: {
      lat: {
        type: Number,
        required: false,
      },
      lng: {
        type: Number,
        required: false,
      },
    },
    locationUpdatedAt: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      lowercase: true,
      required: true,
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
    visibility: {
      type: String,
      enum: ["apartment", "nearby"],
      default: "apartment",
    },
  },
  {
    timestamps: true,
  },
);

requestSchema.index({
  apartmentId: 1,
});

requestSchema.index({
  apartmentId: 1,
  status: 1,
});

requestSchema.index({
  author: 1,
});

module.exports =
  mongoose.models.Request || mongoose.model("Request", requestSchema);
