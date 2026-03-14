const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// ==========================================
// 1. GET ALL REQUESTS (Public Feed)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('author', 'fullName')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 2. GET MY REQUESTS (Dashboard)
// ==========================================
router.get('/me', auth, async (req, res) => {
  try {
    const myRequests = await Request.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json(myRequests);
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 3. GET SINGLE REQUEST
// ==========================================
// ==========================================
// 1. GET ALL REQUESTS (Public Feed)
// ==========================================
router.get('/', async (req, res) => {
  try {
    // 💡 THE FIX: Filter out resolved requests
    const requests = await Request.find({ status: { $ne: 'resolved' } }) 
      .populate('author', 'fullName')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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
    res.json(savedRequest);
  } catch (err) {
    console.error("Create Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 5. UPDATE REQUEST CONTENT (For Edit Button)
// Route: PATCH /api/requests/:id
// ==========================================
// ==========================================
// 5. UPDATE REQUEST CONTENT (For Edit Button & Status Toggle)
// ==========================================
// ==========================================
// 5. UPDATE REQUEST CONTENT (For Edit Button & Status Toggle)
// ==========================================
// ==========================================
// 5. UPDATE REQUEST (Handles Content & Status)
// ==========================================
router.patch('/:id', auth, async (req, res) => {
  try {
    // 1. Find the post
    let request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // 2. Check Ownership (req.user.id comes from auth middleware)
    if (request.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // 3. Update fields if they exist in req.body
    const { title, description, location, priority, status } = req.body;
    
    if (title) request.title = title;
    if (description) request.description = description;
    if (location) request.location = location;
    if (priority) request.priority = priority;
    if (status) request.status = status.toLowerCase().trim(); // Ensure it saves as 'resolved'

    // 4. Save and return the UPDATED document
    const updatedRequest = await request.save();
    res.json(updatedRequest);

  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 7. DELETE REQUEST
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await request.deleteOne();
    res.json({ message: 'Request removed successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;