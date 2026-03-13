const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // The person sending the message
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // The person receiving the message
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // The actual text of the message
  content: { type: String, required: true },
  
  // Optional: We can link the message to the specific request/offer they are talking about!
  relatedPostId: { type: mongoose.Schema.Types.ObjectId },
  postTitle: { type: String },
  
  // Has the receiver opened this yet?
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);