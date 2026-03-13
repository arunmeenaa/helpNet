const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  priority: { type: String, required: true }, // High, Medium, Low
  status: { type: String, default: 'Active' }, // Active, Resolved
  // This securely links the post to the specific user who created it!
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);