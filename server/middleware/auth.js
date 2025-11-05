const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Auth error: No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'test-secret-key-for-testing';
    
    const decoded = jwt.verify(token, jwtSecret);
    
    // Support both token formats: { user: { id: ... } } and { userId: ... }
    const userId = decoded.user?.id || decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('Auth error: No user found with id', userId);
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isDriver: user.isDriver || false,
      driverStatus: user.driverStatus
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log('JWT Error:', error.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('Token Expired Error:', error.message);
      return res.status(401).json({ message: 'Token has expired' });
    }

    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Ensure roles is an array
      const roleArray = Array.isArray(roles) ? roles : [roles];

      if (!roleArray.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};

module.exports = {
  auth,
  requireRole
};
