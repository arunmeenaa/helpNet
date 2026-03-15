const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const auth = require('../middleware/auth');

// ==========================================
// 1. GET ALL OFFERS (Public Feed)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find({ 
      status: { $ne: 'resolved' } 
    })
    .populate('author', 'fullName')
    .sort({ createdAt: -1 });

    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
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
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 3. GET SINGLE OFFER
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
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: 'Server Error' });
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
    
    // 💡 THE FIX: Populate here so the frontend highlight works immediately
    const populatedOffer = await savedOffer.populate('author', 'fullName');
    
    res.status(201).json(populatedOffer);
  } catch (err) {
    console.error("Create Offer Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 5. UPDATE OFFER (Content & Status)
// ==========================================
// backend/routes/offers.js

router.patch('/:id', auth, async (req, res) => {
  try {
    const { title, description, location, status, category, availability } = req.body;
    
    // 1. MUST use Offer, not Request
    let item = await Offer.findById(req.params.id); 
    if (!item) return res.status(404).json({ message: 'Offer not found' });

    // 2. Match the structure from your auth.js (req.user.id)
    if (item.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (location !== undefined) item.location = location;
    if (category !== undefined) item.category = category;
    if (availability !== undefined) item.availability = availability;
    
    if (status) {
      item.status = status.toLowerCase().trim();
    }

    const updatedItem = await item.save();
    res.json(updatedItem); // This ensures the frontend gets valid JSON

  } catch (err) {
    console.error("PATCH Error:", err.message);
    // 💡 IMPORTANT: Send JSON even on error to stop the frontend SyntaxError
    res.status(500).json({ message: 'Server Error', error: err.message });
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
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;