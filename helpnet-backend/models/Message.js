const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  content: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 1
  },

  relatedPostId: { type: mongoose.Schema.Types.ObjectId },
  postTitle: { type: String },

  isRead: { type: Boolean, default: false },

  apartmentId: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  }

}, { timestamps: true });

// ✅ Indexes
messageSchema.index({ receiver: 1 });
messageSchema.index({ apartmentId: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);