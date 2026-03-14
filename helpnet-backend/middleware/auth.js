const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Extract the actual token string
  const token = authHeader.split(' ')[1];

 // auth.js
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // Change this line:
  req.user = { id: decoded.id }; // Wrap it in an object
  
  next();
} catch (err) {
  res.status(401).json({ message: 'Token is not valid or has expired' });
}
};