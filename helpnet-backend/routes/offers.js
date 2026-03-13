const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const auth = require('../middleware/auth');

// 1. GET ALL OFFERS (Public Feed)
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find().populate('author', 'fullName').sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET MY OFFERS (Dashboard)
router.get('/me', auth, async (req, res) => {
  try {
    const myOffers = await Offer.find({ author: req.user }).sort({ createdAt: -1 });
    res.json(myOffers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. GET SINGLE OFFER (Just in case you want an Offer Details page later!)
router.get('/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('author', 'fullName email');
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Offer not found' });
    res.status(500).send('Server Error');
  }
});

// 4. CREATE NEW OFFER
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, location, availability } = req.body;
    const newOffer = new Offer({ title, description, category, location, availability, author: req.user });
    const savedOffer = await newOffer.save();
    res.json(savedOffer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 5. DELETE OFFER
router.delete('/:id', auth, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    // SECURITY: Ensure the logged-in user owns this post
    if (offer.author.toString() !== req.user) {
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