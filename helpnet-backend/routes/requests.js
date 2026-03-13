const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// ==========================================
// 1. GET ALL REQUESTS (Public Feed)
// Route: GET /api/requests
// ==========================================
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('author', 'fullName')
      .sort({ createdAt: -1 }); // Newest first
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 2. GET MY REQUESTS (Dashboard)
// Route: GET /api/requests/me
// *MUST be placed before /:id so Express doesn't confuse "me" for an ID*
// ==========================================
router.get('/me', auth, async (req, res) => {
  try {
    const myRequests = await Request.find({ author: req.user }).sort({ createdAt: -1 });
    res.json(myRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 3. GET SINGLE REQUEST (Details Page)
// Route: GET /api/requests/:id
// ==========================================
// @route   GET /api/requests/:id
// @desc    Get a single request by ID
router.get('/:id', async (req, res) => {
  try {
    // We populate both fullName and email so the helper can contact the author
    const request = await Request.findById(req.params.id).populate('author', 'fullName email');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(request);
  } catch (err) {
    console.error(err.message);
    // If the ID isn't a valid MongoDB ID format, handle it gracefully
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 4. CREATE NEW REQUEST (Post Form)
// Route: POST /api/requests
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, location, priority } = req.body;

    const newRequest = new Request({
      title,
      description,
      location,
      priority,
      author: req.user
    });

    const savedRequest = await newRequest.save();
    res.json(savedRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 5. UPDATE REQUEST STATUS (Mark Resolved)
// Route: PATCH /api/requests/:id/status
// ==========================================
router.patch('/:id/status', auth, async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // SECURITY: Ensure the logged-in user owns this post
    if (request.author.toString() !== req.user) {
      return res.status(401).json({ message: 'User not authorized to update this post' });
    }

    request.status = 'Resolved';
    await request.save();
    
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 6. DELETE REQUEST
// Route: DELETE /api/requests/:id
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // SECURITY: Ensure the logged-in user owns this post
    if (request.author.toString() !== req.user) {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    await request.deleteOne();
    res.json({ message: 'Request removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;