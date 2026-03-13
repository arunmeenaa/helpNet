const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get token from header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Extract the actual token string
  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach the user ID to the request so our routes can use it
    req.user = decoded.id;
    next(); // Move on to the actual route!
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid or has expired' });
  }
};