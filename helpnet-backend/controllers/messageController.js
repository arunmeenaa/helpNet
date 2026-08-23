const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const Request = require("../models/Request");
const Offer = require("../models/Offer");

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

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, relatedPostId, postTitle, postType } =
      req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message cannot be empty.",
      });
    }

    const cleanReceiverId =
      typeof receiverId === "object"
        ? receiverId.id || receiverId._id
        : receiverId;

    if (!cleanReceiverId || !mongoose.Types.ObjectId.isValid(cleanReceiverId)) {
      return res.status(400).json({
        message: "Invalid receiver ID.",
      });
    }

    if (cleanReceiverId.toString() === req.user.id.toString()) {
      return res.status(400).json({
        message: "You cannot send a message to yourself.",
      });
    }

    const allowedPostTypes = ["request", "offer", "general"];
    const cleanPostType = postType || "general";

    if (!allowedPostTypes.includes(cleanPostType)) {
      return res.status(400).json({
        message: "Invalid post type.",
      });
    }

    if (cleanPostType === "general" && relatedPostId) {
      return res.status(400).json({
        message: "General conversations cannot have a post ID.",
      });
    }

    if (cleanPostType !== "general" && !relatedPostId) {
      return res.status(400).json({
        message: "A request or offer ID is required.",
      });
    }

    if (relatedPostId && !mongoose.Types.ObjectId.isValid(relatedPostId)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    const receiverUser = await User.findById(cleanReceiverId);

    if (!receiverUser) {
      return res.status(404).json({
        message: "Receiver not found.",
      });
    }

    let relatedPost = null;

    if (cleanPostType === "request") {
      relatedPost = await Request.findById(relatedPostId);
      if (!relatedPost) {
        return res.status(404).json({ message: "Request not found." });
      }
    }

    if (cleanPostType === "offer") {
      relatedPost = await Offer.findById(relatedPostId);
      if (!relatedPost) {
        return res.status(404).json({ message: "Offer not found." });
      }
    }

    if (relatedPost) {
      // Apartment posts are restricted to the same apartment.
      if (
        relatedPost.visibility === "apartment" &&
        relatedPost.apartmentId?.toString() !== req.user.apartmentId?.toString()
      ) {
        return res.status(403).json({
          message:
            "You cannot message users about posts from another apartment.",
        });
      }

      // Nearby posts are restricted by the post owner's location/radius.
      if (relatedPost.visibility === "nearby") {
        const senderUser = await User.findById(req.user.id).lean();

        const lat1 = senderUser?.coordinates?.lat;
        const lng1 = senderUser?.coordinates?.lng;
        const lat2 = relatedPost.locationCoordinates?.lat;
        const lng2 = relatedPost.locationCoordinates?.lng;

        if (
          !Number.isFinite(lat1) ||
          !Number.isFinite(lng1) ||
          !Number.isFinite(lat2) ||
          !Number.isFinite(lng2)
        ) {
          return res.status(403).json({
            message: "Location is required to contact a nearby post.",
          });
        }

        const toRad = (value) => (value * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;

        const distanceKm =
          6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        if (distanceKm > Number(relatedPost.radius || 2)) {
          return res.status(403).json({
            message: "You are outside this post's nearby radius.",
          });
        }
      }
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver: cleanReceiverId,
      content: content.trim(),
      apartmentId: req.user.apartmentId,
      postType: cleanPostType,
      relatedPostId: cleanPostType === "general" ? null : relatedPostId,
      postTitle:
        cleanPostType === "general"
          ? "General Inquiry"
          : postTitle?.trim() || relatedPost?.title || "Untitled Post",
    });

    const savedMessage = await newMessage.save();

    // FIX 2: Populate sender and receiver so frontend helper utilities receive valid objects
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "fullName name email")
      .populate("receiver", "fullName name email")
      .lean();

    const io = req.app.get("io");

    // FIX 3: Broadcast to both receiver and sender rooms
    if (io) {
      const payload = populatedMessage || savedMessage;
      io.to(cleanReceiverId.toString()).emit("receive_message", payload);
      io.to(req.user.id.toString()).emit("receive_message", payload);
    }

    return res.status(201).json(populatedMessage || savedMessage);
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const getInbox = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
      .populate("sender", "fullName email profilePic")
      .populate("receiver", "fullName email profilePic")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error("GET INBOX ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getConversation = async (req, res) => {
  try {
    const { otherUserId, postType, postId } = req.params;

    // ==========================================
    // VALIDATE USER ID
    // ==========================================
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // ==========================================
    // VALIDATE POST TYPE
    // ==========================================
    if (!["request", "offer"].includes(postType)) {
      return res.status(400).json({
        message: "Invalid post type",
      });
    }

    // ==========================================
    // VALIDATE POST ID
    // ==========================================
    if (!mongoose.Types.ObjectId.isValid(postId)) {
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
    const otherUser = await User.findById(otherUserId).lean();

    if (!otherUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // APARTMENT ISOLATION
    // ==========================================
    if (otherUser.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Users must be in the same apartment to chat.",
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
    console.error("CONVERSATION ERROR:", error.message);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

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
    if (message.receiver.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    // Apartment isolation
    if (message.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    message.isRead = true;

    await message.save();

    res.json(message);
  } catch (error) {
    console.error("Mark as read error:", error.message);

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
