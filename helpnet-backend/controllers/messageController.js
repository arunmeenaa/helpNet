const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const Request = require("../models/Request");
const Offer = require("../models/Offer");
// ==========================================
// GET UNREAD COUNT
// GET /api/messages/unread-count
// ==========================================
const getUnreadCount = async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.json({ count: 0 });
    }

    const count = await Message.countDocuments({
      receiver: req.user.id,
      apartmentId: req.user.apartmentId,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error("Unread Count Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// SEND MESSAGE
// POST /api/messages/send
// ==========================================
const sendMessage = async (req, res) => {
  try {
    const {
      receiverId,
      content,
      relatedPostId,
      postTitle,
      postType,
    } = req.body;

    // ==========================================
    // APARTMENT CHECK
    // ==========================================
    if (!req.user.apartmentId) {
      return res.status(400).json({
        message:
          "Please join an apartment community first.",
      });
    }

    // ==========================================
    // CONTENT VALIDATION
    // ==========================================
    if (
      !content ||
      content.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Message cannot be empty.",
      });
    }

    // ==========================================
    // RECEIVER ID
    // ==========================================
    const cleanReceiverId =
      typeof receiverId === "object"
        ? receiverId.id
        : receiverId;

    if (
      !cleanReceiverId ||
      !mongoose.Types.ObjectId.isValid(
        cleanReceiverId
      )
    ) {
      return res.status(400).json({
        message: "Invalid receiver ID.",
      });
    }

    // ==========================================
    // PREVENT SELF CHAT
    // ==========================================
    if (
      cleanReceiverId.toString() ===
      req.user.id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot send a message to yourself.",
      });
    }

    // ==========================================
    // POST TYPE
    // ==========================================
    const allowedPostTypes = [
      "request",
      "offer",
      "general",
    ];

    const cleanPostType =
      postType || "general";

    if (
      !allowedPostTypes.includes(
        cleanPostType
      )
    ) {
      return res.status(400).json({
        message: "Invalid post type.",
      });
    }

    // ==========================================
    // GENERAL CHAT
    // ==========================================
    if (
      cleanPostType === "general" &&
      relatedPostId
    ) {
      return res.status(400).json({
        message:
          "General conversations cannot have a post ID.",
      });
    }

    // ==========================================
    // REQUEST / OFFER ID
    // ==========================================
    if (
      cleanPostType !== "general" &&
      !relatedPostId
    ) {
      return res.status(400).json({
        message:
          "A request or offer ID is required.",
      });
    }

    if (
      relatedPostId &&
      !mongoose.Types.ObjectId.isValid(
        relatedPostId
      )
    ) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    // ==========================================
    // FIND RECEIVER
    // ==========================================
    const receiverUser =
      await User.findById(cleanReceiverId);

    if (!receiverUser) {
      return res.status(404).json({
        message: "Receiver not found.",
      });
    }

    // ==========================================
    // APARTMENT ISOLATION
    // ==========================================
    if (
      receiverUser.apartmentId !==
      req.user.apartmentId
    ) {
      return res.status(403).json({
        message:
          "Users must be in the same apartment to chat.",
      });
    }

    // ==========================================
    // VERIFY RELATED POST
    // ==========================================

    let relatedPost = null;

    if (
      cleanPostType === "request"
    ) {
      relatedPost =
        await Request.findById(
          relatedPostId
        );

      if (!relatedPost) {
        return res.status(404).json({
          message: "Request not found.",
        });
      }
    }

    if (
      cleanPostType === "offer"
    ) {
      relatedPost =
        await Offer.findById(
          relatedPostId
        );

      if (!relatedPost) {
        return res.status(404).json({
          message: "Offer not found.",
        });
      }
    }

    // ==========================================
    // POST MUST BELONG TO SAME APARTMENT
    // ==========================================
    if (
      relatedPost &&
      relatedPost.apartmentId !==
        req.user.apartmentId
    ) {
      return res.status(403).json({
        message:
          "You cannot message users about posts from another apartment.",
      });
    }

    // ==========================================
    // CREATE MESSAGE
    // ==========================================
    const newMessage = new Message({
      sender: req.user.id,

      receiver: cleanReceiverId,

      content: content.trim(),

      apartmentId:
        req.user.apartmentId,

      postType: cleanPostType,

      relatedPostId:
        cleanPostType === "general"
          ? null
          : relatedPostId,

      postTitle:
        cleanPostType === "general"
          ? "General Inquiry"
          : (
              postTitle?.trim() ||
              relatedPost.title
            ),
    });

    const savedMessage =
      await newMessage.save();

    // ==========================================
    // REAL-TIME NOTIFICATION
    // ==========================================
    const io = req.app.get("io");

    if (io) {
      const receiverRoom =
        cleanReceiverId.toString();

      io.to(receiverRoom).emit(
        "receive_message",
        savedMessage
      );
    }

    // ==========================================
    // RESPONSE
    // ==========================================
    res.status(201).json(
      savedMessage
    );
  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// GET MY INBOX
// GET /api/messages/inbox
// ==========================================
const getInbox = async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({
        message: "Set apartment first",
      });
    }

    const messages = await Message.find({
      receiver: req.user.id,
      apartmentId: req.user.apartmentId,
    })
      .populate("sender", "fullName")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error(
      "INBOX ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// GET CONVERSATION
//
// GET
// /api/messages/conversation/:otherUserId/:postType/:postId
//
// Example:
// /conversation/USER_ID/request/REQUEST_ID
// /conversation/USER_ID/offer/OFFER_ID
// ==========================================
const getConversation = async (req, res) => {
  try {
    const {
      otherUserId,
      postType,
      postId,
    } = req.params;

    // ==========================================
    // VALIDATE USER ID
    // ==========================================
    if (
      !mongoose.Types.ObjectId.isValid(
        otherUserId
      )
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // ==========================================
    // VALIDATE POST TYPE
    // ==========================================
    if (
      !["request", "offer"].includes(postType)
    ) {
      return res.status(400).json({
        message: "Invalid post type",
      });
    }

    // ==========================================
    // VALIDATE POST ID
    // ==========================================
    if (
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return res.status(400).json({
        message: "Invalid post ID",
      });
    }

    // ==========================================
    // APARTMENT CHECK
    // ==========================================
    if (!req.user.apartmentId) {
      return res.status(400).json({
        message: "Set apartment first",
      });
    }

    // ==========================================
    // FIND OTHER USER
    // ==========================================
    const otherUser = await User.findById(
      otherUserId
    ).lean();

    if (!otherUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // APARTMENT ISOLATION
    // ==========================================
    if (
      otherUser.apartmentId !==
      req.user.apartmentId
    ) {
      return res.status(403).json({
        message:
          "Users must be in the same apartment to chat.",
      });
    }

    // ==========================================
    // GET ONLY THIS SPECIFIC THREAD
    // ==========================================
    const messages = await Message.find({
      apartmentId: req.user.apartmentId,

      postType,

      relatedPostId: postId,

      $or: [
        {
          sender: req.user.id,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: req.user.id,
        },
      ],
    })
      .populate("sender", "fullName")
      .populate("receiver", "fullName")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error(
      "CONVERSATION ERROR:",
      error.message
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// MARK MESSAGE AS READ
// PATCH /api/messages/:id/read
// ==========================================
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    // Only receiver can mark it as read
    if (
      message.receiver.toString() !==
      req.user.id.toString()
    ) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // Apartment isolation
    if (
      message.apartmentId !==
      req.user.apartmentId
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    message.isRead = true;

    await message.save();

    res.json(message);
  } catch (error) {
    console.error(
      "Mark as read error:",
      error.message
    );

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getUnreadCount,
  sendMessage,
  getInbox,
  getConversation,
  markAsRead,
};