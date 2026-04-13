const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async function(req, res, next) {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Faster query
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id,
      role: user.role, // 👈 Add this
      apartmentId: user.apartmentId?.trim() || null,
      isEvicted: user.isEvicted // 👈 Add this so the frontend can show the red message
    };
    console.log("AUTH USER:", req.user);

    next();

  } catch (err) {
    res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};