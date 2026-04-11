const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },

  priority: { 
  type: String, 
  enum: ['high', 'medium', 'low'],
  lowercase: true // ✅ AUTO FIX
},

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

// ✅ Performance boost
requestSchema.index({ apartmentId: 1 });

module.exports = mongoose.model('Request', requestSchema);