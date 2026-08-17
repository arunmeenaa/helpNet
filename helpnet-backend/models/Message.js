const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // ==========================================
    // USERS
    // ==========================================
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // MESSAGE
    // ==========================================
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },

    // ==========================================
    // CHAT / POST CONTEXT
    // ==========================================
    postType: {
      type: String,
      enum: ["request", "offer", "general"],
      default: "general",
    },

    relatedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    postTitle: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // READ STATUS
    // ==========================================
    isRead: {
      type: Boolean,
      default: false,
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

// Unread messages
messageSchema.index({
  receiver: 1,
  isRead: 1,
});

// Apartment messages
messageSchema.index({
  apartmentId: 1,
});

// Conversation lookup
messageSchema.index({
  apartmentId: 1,
  postType: 1,
  relatedPostId: 1,
});

// Conversation participants
messageSchema.index({
  sender: 1,
  receiver: 1,
  postType: 1,
  relatedPostId: 1,
});

module.exports =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);