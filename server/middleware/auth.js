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
    console.log('JWT Secret:', jwtSecret);
    console.log('Token:', token);
    
    const decoded = jwt.verify(token, jwtSecret);
    
    const user = await User.findById(decoded.user.id);
    if (!user) {
      console.log('Auth error: No user found with id', decoded.user.id);
      return res.status(401).json({ message: 'Invalid token' });
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
      return res.status(401).json({ message: 'Invalid token format', error: error.message });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('Token Expired Error:', error.message);
      return res.status(401).json({ message: 'Token has expired', error: error.message });
    }

    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: 'Not authorized for this operation' });
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
