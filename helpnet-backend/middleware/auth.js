const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 1. The Authentication Middleware
const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user._id,
      role: user.role,
      apartmentId: user.apartmentId?.trim() || null,
      isEvicted: user.isEvicted 
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};

// 2. The Admin Check Middleware
const isAdmin = (req, res, next) => {
  // We rely on 'auth' running first to set req.user
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};

// 3. Export BOTH functions so the route file can find them
module.exports = { auth, isAdmin };