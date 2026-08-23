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
    // Coordinates of the person who created the post.
    // [longitude, latitude] is kept as a simple pair so existing
    // location strings remain backward compatible.
    locationCoordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
      },
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
