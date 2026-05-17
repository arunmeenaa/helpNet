const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/user');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// ==========================================
// 1. GET UNREAD COUNT
// Handles: GET /api/messages/unread-count
// ==========================================
router.get('/unread-count', auth, async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.json({ count: 0 }); // Keeps the Navbar UI quiet if apartment isn't selected
    }

    const count = await Message.countDocuments({
      receiver: req.user.id,
      apartmentId: req.user.apartmentId,
      isRead: false
    });

    res.json({ count });
  } catch (err) {
    console.error("Unread Count Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 2. SEND MESSAGE (Consolidated)
// Handles: POST /api/messages/send
// ==========================================
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, content, relatedPostId, postTitle } = req.body;

    // 1. Validation: Apartment check
    if (!req.user.apartmentId) {
      return res.status(400).json({ message: "Please join an apartment community first." });
    }

    // 2. Validation: Content check
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    // 3. Validation: Receiver check
    const cleanReceiverId = typeof receiverId === 'object' ? receiverId.id : receiverId;
    if (!mongoose.Types.ObjectId.isValid(cleanReceiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID.' });
    }

    const receiverUser = await User.findById(cleanReceiverId);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    // 4. Validation: Apartment Isolation
    if (receiverUser.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({ message: 'Users must be in the same apartment to chat.' });
    }

    // 5. Create and Save Message
    const newMessage = new Message({
      sender: req.user.id,
      receiver: cleanReceiverId,
      content: content.trim(),
      apartmentId: req.user.apartmentId,
      relatedPostId: relatedPostId || null,
      postTitle: postTitle || "General Inquiry"
    });

    const savedMessage = await newMessage.save();

    // 6. Real-time Trigger (Socket.io) - Placed safely inside 'req' scope
    const io = req.app.get('io');
    if (io) {
      const receiverRoom = cleanReceiverId.toString();
      console.log(`📡 Shouting real-time message to room: ${receiverRoom}`);
      io.to(receiverRoom).emit("receive_message", savedMessage);
    }

    res.status(201).json(savedMessage);

  } catch (err) {
    console.error("SEND ERROR:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 3. GET MY INBOX
// Handles: GET /api/messages/inbox
// ==========================================
router.get('/inbox', auth, async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({ message: "Set apartment first" });
    }

    const messages = await Message.find({
      receiver: req.user.id,
      apartmentId: req.user.apartmentId 
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
// 4. GET CONVERSATION
// Handles: GET /api/messages/conversation/:otherUserId
// ==========================================
router.get('/conversation/:otherUserId', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const messages = await Message.find({
      apartmentId: req.user.apartmentId,
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
// 5. PATCH: MARK AS READ
// Handles: PATCH /api/messages/:id/read
// ==========================================
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.receiver.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    message.isRead = true;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;