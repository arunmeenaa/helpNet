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
      apartmentId: req.user.apartmentId || null,
      postType: cleanPostType,
      relatedPostId: cleanPostType === "general" ? null : relatedPostId,
      postTitle:
        cleanPostType === "general"
          ? "General Inquiry"
          : postTitle?.trim() || relatedPost?.title || "Untitled Post",
    });

    const savedMessage = await newMessage.save();

    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("sender", "fullName name email profilePic")
      .populate("receiver", "fullName name email profilePic")
      .lean();

    // ==========================================
    // SOCKET.IO
    // ==========================================

    const io = req.app.get("io");

    if (io) {
      const payload = populatedMessage || savedMessage;

      // Send actual message to receiver
      io.to(cleanReceiverId.toString()).emit("receive_message", payload);

      // Send notification toast to receiver
      io.to(cleanReceiverId.toString()).emit("notification", {
        type: "new_message",
        title: "New Message",
        message: `${payload.sender?.fullName || "Someone"} sent you a message.`,
        postId: relatedPostId,
        postType: cleanPostType,
        messageId: payload._id,
      });

      // Update sender's chat/inbox in real time
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
      $or: [{ sender: userId }, { receiver: userId }],
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

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        message: "Invalid post ID.",
      });
    }

    if (!["request", "offer", "general"].includes(postType)) {
      return res.status(400).json({
        message: "Invalid post type.",
      });
    }

    const currentUserId = req.user.id;

    const messages = await Message.find({
      postType,
      relatedPostId: postId,

      $or: [
        {
          sender: currentUserId,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: currentUserId,
        },
      ],
    })
      .populate("sender", "fullName name email profilePic")
      .populate("receiver", "fullName name email profilePic")
      .sort({ createdAt: 1 })
      .lean();

    return res.json(messages);
  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid message ID.",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found.",
      });
    }

    // Only the receiver can mark the message as read
    if (message.receiver.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to mark this message as read.",
      });
    }

    message.isRead = true;

    await message.save();

    return res.json({
      message: "Message marked as read.",
      data: message,
    });
  } catch (error) {
    console.error("MARK AS READ ERROR:", error);

    return res.status(500).json({
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
