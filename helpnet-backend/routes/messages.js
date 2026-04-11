const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/user');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');


// ==========================================
// 0. GET UNREAD COUNT
// ==========================================
router.get('/unread-count', auth, async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({ message: "Set apartment first" });
    }

    const count = await Message.countDocuments({
      receiver: req.user.id,
      apartmentId: req.user.apartmentId, // ✅ important
      isRead: false
    });

    res.json({ count });

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});
// ==========================================
// 1. SEND MESSAGE
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({ message: "Set apartment first" });
    }

    const { receiverId, content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const cleanReceiverId = typeof receiverId === 'object' ? receiverId.id : receiverId;

    if (!mongoose.Types.ObjectId.isValid(cleanReceiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    const receiverUser = await User.findById(cleanReceiverId);

    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    if (receiverUser.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({ message: 'Not same apartment' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      receiver: cleanReceiverId,
      content: content.trim(),
      apartmentId: req.user.apartmentId // ✅ IMPORTANT
    });

    const savedMessage = await newMessage.save();
    res.json(savedMessage);

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 2. GET CONVERSATION
// ==========================================
router.get('/conversation/:otherUserId', auth, async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({ message: "Set apartment first" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const otherUser = await User.findById(req.params.otherUserId);

    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (otherUser.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      apartmentId: req.user.apartmentId, // ✅ extra safety
      $or: [
        { sender: req.user.id, receiver: req.params.otherUserId },
        { sender: req.params.otherUserId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});
// ==========================================
// 3. GET MY INBOX
// ==========================================
router.get('/inbox', auth, async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({ message: "Set apartment first" });
    }

    const messages = await Message.find({
      receiver: req.user.id,
      apartmentId: req.user.apartmentId // ✅ important for isolation
    })
    .populate('sender', 'fullName')
    .sort({ createdAt: -1 });

    res.json(messages);

  } catch (err) {
    console.error("INBOX ERROR:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});
// ==========================================
// MARK MESSAGE AS READ
// ==========================================
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // ✅ Only receiver can mark as read
    if (message.receiver.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    message.isRead = true;
    await message.save();

    res.json(message);

  } catch (err) {
    console.error("READ ERROR:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;