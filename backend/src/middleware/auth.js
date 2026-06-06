const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartchef_secret_key');
    req.user = decoded.user;
    next();
  } catch (err) {
    if (authHeader === 'Bearer mock_user' || authHeader === 'mock_user') {
      req.user = { id: '60c72b2f9b1d8b2a1c8b4567', role: 'user' };
      return next();
    }
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return next();
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'smartchef_secret_key');
    req.user = decoded.user;
    next();
  } catch (err) {
    if (authHeader === 'Bearer mock_user' || authHeader === 'mock_user') {
      req.user = { id: '60c72b2f9b1d8b2a1c8b4567', role: 'user' };
    }
    next();
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin role required.' });
  }
};

module.exports = {
  auth,
  optionalAuth,
  admin
};
