const express = require("express");

const {
  getUnreadCount,
  sendMessage,
  getInbox,
  getConversation,
  markAsRead,
} = require("../controllers/messageController");

const { auth } = require("../middleware/auth");

const router = express.Router();

// ==========================================
// UNREAD COUNT
// ==========================================
router.get(
  "/unread-count",
  auth,
  getUnreadCount
);

// ==========================================
// SEND MESSAGE
// ==========================================
router.post(
  "/send",
  auth,
  sendMessage
);

// ==========================================
// INBOX
// ==========================================
router.get(
  "/inbox",
  auth,
  getInbox
);

// ==========================================
// POST-SPECIFIC CONVERSATION
// ==========================================
router.get(
  "/conversation/:otherUserId/:postType/:postId",
  auth,
  getConversation
);

// ==========================================
// MARK AS READ
// ==========================================
router.patch(
  "/:id/read",
  auth,
  markAsRead
);

module.exports = router;