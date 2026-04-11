const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// ==========================================
// 1. GET ALL OFFERS (Apartment Feed ONLY)
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({ message: "Set apartment first" });
    }

    const offers = await Offer.find({ 
      apartmentId: req.user.apartmentId,
      status: { $ne: 'resolved' } 
    })
    .populate('author', 'fullName')
    .sort({ createdAt: -1 });

    res.json(offers);

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 2. GET MY OFFERS
// ==========================================
router.get('/me', auth, async (req, res) => {
  try {
    const myOffers = await Offer.find({ author: req.user.id })
      .sort({ createdAt: -1 });

    res.json(myOffers);

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 3. GET SINGLE OFFER
// ==========================================
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const item = await Offer.findById(req.params.id)
      .populate('author', 'fullName');

    if (!item) {
      return res.status(404).json({ message: 'Offer not found' });
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
// 4. CREATE OFFER
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({ message: "Set apartment first" });
    }

    const { title, description, location } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newOffer = new Offer({ 
      title, 
      description, 
      location,
      author: req.user.id,
      apartmentId: req.user.apartmentId
    });

    const savedOffer = await newOffer.save();
    const populatedOffer = await savedOffer.populate('author', 'fullName');

    res.status(201).json(populatedOffer);

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 5. UPDATE OFFER
// ==========================================
router.patch('/:id', auth, async (req, res) => {
  try {
    let item = await Offer.findById(req.params.id);

    if (!item) return res.status(404).json({ message: 'Offer not found' });

   if (item.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (item.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // ✅ SAFE UPDATE
    const allowedFields = ['title', 'description', 'location', 'status'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    const updatedItem = await item.save();
    res.json(updatedItem);

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 6. DELETE OFFER
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    if (offer.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (offer.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await offer.deleteOne();

    res.json({ message: 'Offer removed successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;