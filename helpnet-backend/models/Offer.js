// models/Offer.js
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, default: 'open' }, // 💡 Change from 'Active' to 'open'
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);