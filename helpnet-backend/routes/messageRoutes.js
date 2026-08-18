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

router.get("/unread-count", auth, getUnreadCount);

router.post("/send", auth, sendMessage);

router.get("/inbox", auth, getInbox);

router.get(
  "/conversation/:otherUserId/:postType/:postId",
  auth,
  getConversation,
);

router.patch("/:id/read", auth, markAsRead);

module.exports = router;
