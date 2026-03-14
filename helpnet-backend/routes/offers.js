const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const auth = require('../middleware/auth');

// ==========================================
// 1. GET ALL OFFERS (Public Feed)
// ==========================================
router.get('/', async (req, res) => {
  try {
    // 💡 THE FIX: Filter out resolved offers
    const offers = await Offer.find({ 
      status: { $ne: 'resolved' } 
    })
    .populate('author', 'fullName')
    .sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 2. GET MY OFFERS (Dashboard)
// ==========================================
router.get('/me', auth, async (req, res) => {
  try {
    const myOffers = await Offer.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json(myOffers);
  } catch (err) {
    console.error("Dashboard Offers Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 3. GET SINGLE OFFER (For OfferDetails.jsx)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const item = await Offer.findById(req.params.id).populate('author', 'fullName');
    if (!item) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    res.json(item);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Invalid ID format' });
    }
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 4. CREATE NEW OFFER
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, location, availability } = req.body;
    
    const newOffer = new Offer({ 
      title, 
      description, 
      category, 
      location, 
      availability, 
      author: req.user.id 
    });

    const savedOffer = await newOffer.save();
    res.json(savedOffer);
  } catch (err) {
    console.error("Create Offer Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 5. UPDATE OFFER (Content & Status)
// ==========================================
// UPDATE OFFER (Title, Description, and Status)
// routes/offers.js AND routes/requests.js

router.patch('/:id', auth, async (req, res) => {
  try {
    const { title, description, location, status } = req.body;
    
    // 1. Find the document
    let item = await Request.findById(req.params.id); // or Offer.findById
    if (!item) return res.status(404).json({ message: 'Post not found' });

    // 2. Security: Ensure the user owns this post
    if (item.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 3. THE FIX: Explicitly update each field if it exists in req.body
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description; // THIS IS THE KEY LINE
    if (location !== undefined) item.location = location;
    
    if (status) {
      item.status = status.toLowerCase().trim();
    }

    // 4. Save and return the result
    const updatedItem = await item.save();
    res.json(updatedItem);

  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 6. DELETE OFFER
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    if (offer.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await offer.deleteOne();
    res.json({ message: 'Offer removed successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;