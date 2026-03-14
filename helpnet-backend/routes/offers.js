const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const auth = require('../middleware/auth');

// ==========================================
// 1. GET ALL OFFERS (Public Feed)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find()
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
// 3. GET SINGLE OFFER
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
// 5. UPDATE OFFER CONTENT (For Edit Button)
// Route: PATCH /api/offers/:id
// ==========================================
// ==========================================
// 5. UPDATE REQUEST CONTENT (For Edit Button & Status Toggle)
// ==========================================
// routes/offers.js

// ==========================================
// UPDATE OFFER (Content & Status)
// ==========================================
router.patch('/:id', auth, async (req, res) => {
  try {
    let offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    // Ensure the person updating is the owner
    if (offer.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const { title, description, location, status } = req.body;
    
    if (title) offer.title = title;
    if (description) offer.description = description;
    if (location) offer.location = location;
    
    // 💡 This is the magic line for the dashboard button
    if (status) offer.status = status.toLowerCase().trim(); 

    const updatedOffer = await offer.save();
    res.json(updatedOffer);

  } catch (err) {
    console.error("Offer Update Error:", err.message);
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
      return res.status(401).json({ message: 'Not authorized to delete this offer' });
    }

    await offer.deleteOne();
    res.json({ message: 'Offer removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;