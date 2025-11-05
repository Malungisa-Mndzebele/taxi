const { body, validationResult } = require('express-validator');

// Common validation rules
exports.validate = (method) => {
  switch (method) {
    case 'login': {
      return [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists()
      ];
    }
    case 'register': {
      return [
        body('firstName', 'First name is required').trim().isLength({ min: 2 }),
        body('lastName', 'Last name is required').trim().isLength({ min: 2 }),
        body('email', 'Please include a valid email').isEmail(),
        body('phone', 'Please provide a valid phone number').matches(/^\+?\d{1,15}$/),
        body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        body('role', 'Invalid role').optional().isIn(['passenger', 'driver'])
      ];
    }
    case 'createRide': {
      return [
        body('pickupLocation', 'Pickup location is required').not().isEmpty(),
        body('dropoffLocation', 'Dropoff location is required').not().isEmpty(),
        body('pickupCoordinates', 'Valid pickup coordinates are required').isArray({ min: 2, max: 2 }),
        body('dropoffCoordinates', 'Valid dropoff coordinates are required').isArray({ min: 2, max: 2 })
      ];
    }
    default:
      return [];
  }
};

// Middleware to handle validation errors
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
  
  return res.status(400).json({
    success: false,
    errors: extractedErrors,
  });
};
