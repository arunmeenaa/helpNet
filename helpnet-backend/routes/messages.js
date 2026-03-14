const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// 1. GET UNREAD COUNT
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({ 
      receiver: req.user.id, // Use .id
      isRead: false 
    });
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. SEND A MESSAGE (FIXED)
router.post('/', auth, async (req, res) => {
  try {
   const { receiverId, content, relatedPostId, postTitle } = req.body;

// 💡 This line safely handles both a string OR the {id: '...'} object
const cleanReceiverId = typeof receiverId === 'object' ? receiverId.id : receiverId;

const newMessage = new Message({
  sender: req.user.id,
  receiver: cleanReceiverId, // ✅ Now it's a valid string ID
  content,
  relatedPostId,
  postTitle
});

    const savedMessage = await newMessage.save();
    res.json(savedMessage);
  } catch (err) {
    // 💡 This logs the "Cast Error" specifically
    console.error("Message Send Error:", err.message); 
    res.status(500).send('Server Error');
  }
});

// 3. GET MY INBOX
router.get('/inbox', auth, async (req, res) => {
  try {
    // req.user.id is standardized by most auth middlewares
    const messages = await Message.find({ receiver: req.user.id })
      .populate('sender', 'fullName')
      .sort({ createdAt: -1 });
      
    res.json(messages);
  } catch (err) {
    console.error("Inbox Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// 4. MARK MESSAGE AS READ
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Ensure we compare string to string
    if (message.receiver.toString() !== req.user.id) {
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