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
      required: true,
      trim: true,
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
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
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
  mongoose.models.Request ||
  mongoose.model("Request", requestSchema);