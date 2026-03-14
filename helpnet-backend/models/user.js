const mongoose = require('mongoose');

// 1. Define the Schema variable
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, default: "" }, 
  bio: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

// 2. Export the model (checking if it exists first to prevent the Overwrite error)
// Ensure "UserSchema" matches the variable name on line 4
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);