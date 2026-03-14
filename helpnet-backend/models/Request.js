const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  priority: { type: String, required: true }, 
  // 💡 CHANGE THESE TWO LINES:
  status: { type: String, default: 'open' }, // Change 'Active' to 'open'
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);