const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// ==========================================
// 1. SEND A MESSAGE
// Route: POST /api/messages
// ==========================================
router.get('/unread-count', auth, async (req, res) => {
  try {
    // .countDocuments is much faster than .find() 
    // because it doesn't pull the actual message data
    const count = await Message.countDocuments({ 
      receiver: req.user, 
      isRead: false 
    });
    
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, relatedPostId, postTitle } = req.body;

    // You can't message yourself!
    if (receiverId === req.user) {
      return res.status(400).json({ message: "You cannot message yourself." });
    }

    const newMessage = new Message({
      sender: req.user,
      receiver: receiverId,
      content,
      relatedPostId,
      postTitle
    });

    const savedMessage = await newMessage.save();
    res.json(savedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 2. GET MY INBOX (Received Messages)
// Route: GET /api/messages/inbox
// ==========================================
router.get('/inbox', auth, async (req, res) => {
  try {
    // Find messages where the logged-in user is the receiver
    // We populate the sender's name so we know who it's from!
    const messages = await Message.find({ receiver: req.user })
      .populate('sender', 'fullName')
      .sort({ createdAt: -1 }); // Newest first
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 3. MARK MESSAGE AS READ
// Route: PATCH /api/messages/:id/read
// ==========================================
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Only the receiver can mark it as read
    if (message.receiver.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    message.isRead = true;
    await message.save();
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;