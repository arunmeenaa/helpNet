const express = require('express');
const router = express.Router();
const Request = require('../models/Request'); // Ensure this model exists
const auth = require('../middleware/auth');

// ==========================================
// 1. GET ALL REQUESTS (Public Feed)
// ==========================================
router.get('/', async (req, res) => {
  try {
    // Exclude resolved requests and populate author details
    const requests = await Request.find({ 
      status: { $ne: 'resolved' } 
    })
    .populate('author', 'fullName')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Fetch All Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 2. GET MY REQUESTS (Dashboard)
// ==========================================
router.get('/me', auth, async (req, res) => {
  try {
    const myRequests = await Request.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    res.json(myRequests);
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 3. GET SINGLE REQUEST
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    // 💡 FIXED: Changed 'Offer' to 'Request'
    const item = await Request.findById(req.params.id).populate('author', 'fullName');
    
    if (!item) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.json(item);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 4. CREATE NEW REQUEST
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, location, priority } = req.body;
    
    const newRequest = new Request({
      title,
      description,
      location,
      priority,
      author: req.user.id 
    });

    const savedRequest = await newRequest.save();
    
    // 💡 ADDED: Populate author so highlight works immediately on frontend
    const populatedRequest = await savedRequest.populate('author', 'fullName');
    
    res.status(201).json(populatedRequest);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message)[0];
      return res.status(400).json({ message });
    }
    console.error("Create Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 5. UPDATE REQUEST (Handles Content & Status)
// ==========================================
router.patch('/:id', auth, async (req, res) => {
  try {
    const { title, description, location, status, priority } = req.body;
    
    let request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Authorization check
    if (request.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update fields if they exist in request body
    if (title) request.title = title;
    if (description) request.description = description;
    if (location) request.location = location;
    if (priority) request.priority = priority;
    if (status) request.status = status.toLowerCase();

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 6. DELETE REQUEST
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Authorization check
    if (request.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await request.deleteOne();
    res.json({ message: 'Request removed successfully' });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;