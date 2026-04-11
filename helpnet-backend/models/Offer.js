const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },

  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  },

  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  apartmentId: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }

}, { timestamps: true });

// ✅ Index for fast queries
offerSchema.index({ apartmentId: 1 });

module.exports = mongoose.model('Offer', offerSchema);