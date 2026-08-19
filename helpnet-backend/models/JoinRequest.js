const mongoose = require("mongoose");

const joinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    apartmentId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

joinRequestSchema.index({
  apartmentId: 1,
  status: 1,
});


joinRequestSchema.index({
  userId: 1,
});


joinRequestSchema.index(
  {
    userId: 1,
    apartmentId: 1,
    status: 1,
  },
  {
    partialFilterExpression: {
      status: "pending",
    },
  }
);

module.exports =
  mongoose.models.JoinRequest ||
  mongoose.model(
    "JoinRequest",
    joinRequestSchema
  );