const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    
    const decoded = jwt.verify(token, jwtSecret);
    
    // Support both token formats: { user: { id: ... } } and { userId: ... }
    const userId = decoded.user?.id || decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    // Ensure userId is properly formatted for Mongoose
    const user = await User.findById(userId.toString());
    if (!user) {
      logger.warn(`Auth error: No user found with id ${userId}`);
      return res.status(401).json({ message: 'User not found or token is invalid' });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Set both id and _id for compatibility with tests
    req.user = {
      id: user.id,
      _id: user._id,
      email: user.email,
      role: user.role,
      isDriver: user.isDriver || false,
      driverStatus: user.driverStatus
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn(`Token Expired Error: ${error.message}`);
      return res.status(401).json({ 
        message: 'Token is not valid',
        code: 'AUTH_EXPIRED',
        error: error.message
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      logger.warn(`JWT Error: ${error.message}`);
      return res.status(401).json({ 
        message: 'Token is not valid',
        code: 'AUTH_INVALID',
        error: error.message
      });
    }

    logger.error('Auth error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Ensure roles is an array
      const roleArray = Array.isArray(roles) ? roles : [roles];

      // If req.user.role exists, check it directly (for testing)
      if (req.user.role && !req.user.id) {
        if (!roleArray.includes(req.user.role)) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
        return next();
      }

      // Otherwise, find user by id
      if (!req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!roleArray.includes(user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      logger.error('Role check error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};

module.exports = {
  auth,
  requireRole
};
