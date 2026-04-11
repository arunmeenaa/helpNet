const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// ==========================================
// 1. GET ALL REQUESTS
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({ message: "Set apartment first" });
    }

    const requests = await Request.find({ 
      apartmentId: req.user.apartmentId,
      status: { $ne: 'resolved' } 
    })
    .populate('author', 'fullName')
    .sort({ createdAt: -1 });

    res.json(requests);

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 2. GET MY REQUESTS
// ==========================================
router.get('/me', auth, async (req, res) => {
  try {
    const myRequests = await Request.find({ author: req.user.id })
      .sort({ createdAt: -1 });

    res.json(myRequests);

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 3. GET SINGLE REQUEST
// ==========================================
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const item = await Request.findById(req.params.id)
      .populate('author', 'fullName');

    if (!item) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (item.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(item);

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 4. CREATE REQUEST
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, location, priority } = req.body;

    // ✅ VALIDATION (THIS FIXES YOUR 500)
    if (!title || !description || !location || !priority) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!req.user.apartmentId) {
      return res.status(400).json({
        message: "Set apartment first"
      });
    }

    const newRequest = new Request({
      title,
      description,
      location,
      priority,
      author: req.user.id,
      apartmentId: req.user.apartmentId
    });

    const savedRequest = await newRequest.save();

    const populatedRequest = await savedRequest.populate('author', 'fullName');

    res.status(201).json(populatedRequest);

  } catch (err) {
    console.error("CREATE REQUEST ERROR:", err.message); // 🔥 ADD THIS
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// ==========================================
// 5. UPDATE REQUEST
// ==========================================
router.patch('/:id', auth, async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (request.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // ✅ SAFE UPDATE
    const allowedFields = ['title', 'description', 'location', 'priority', 'status'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        request[field] = req.body[field];
      }
    });

    const updatedRequest = await request.save();
    res.json(updatedRequest);

  } catch (err) {
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

    if (request.author.toString() !== req.user.id.toString())  {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (request.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await request.deleteOne();

    res.json({ message: 'Request removed successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;