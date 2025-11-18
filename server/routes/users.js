const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email address'),
  body('phone').optional().matches(/^\+?\d{1,15}$/).withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, profilePicture } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    
    if (email) {
      // Check if email is already in use by another user
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updates.email = email.toLowerCase();
    }
    
    if (phone) {
      // Check if phone is already in use by another user
      const existingUser = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number already in use' });
      }
      updates.phone = phone;
    }
    
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isDriver: user.isDriver,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/location
// @desc    Update user location
// @access  Private
router.put('/location', [
  auth,
  body('coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('latitude').optional().custom((value) => {
    if (value !== undefined && typeof value !== 'number') {
      throw new Error('Latitude must be a number');
    }
    return true;
  }).isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude').optional().custom((value) => {
    if (value !== undefined && typeof value !== 'number') {
      throw new Error('Longitude must be a number');
    }
    return true;
  }).isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('address').optional().isString().withMessage('Address must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return first error message for better test compatibility
      const firstError = errors.array()[0];
      const errorMessage = firstError.msg || firstError.message || 'Validation error';
      
      return res.status(400).json({ 
        message: errorMessage,
        errors: errors.array() 
      });
    }

    const { coordinates, latitude, longitude, address } = req.body;
    
    let locationData = {};
    
    // Support both formats: { coordinates: [lng, lat], address } or { latitude, longitude }
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      // New format: { coordinates: [longitude, latitude], address: '...' }
      const [lng, lat] = coordinates;
      
      // Validate coordinate types
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        return res.status(400).json({ message: 'Latitude and longitude must be numbers' });
      }
      
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return res.status(400).json({ message: 'Invalid coordinate values' });
      }
      locationData.currentLocation = {
        type: 'Point',
        coordinates: [lng, lat],
        address: address || '',
        lastUpdated: new Date()
      };
    } else if (latitude !== undefined && longitude !== undefined) {
      // Old format: { latitude, longitude }
      
      // Validate types first
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'Latitude and longitude must be numbers' });
      }
      
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ message: 'Invalid latitude value' });
      }
      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: 'Invalid longitude value' });
      }
      locationData.currentLocation = {
        type: 'Point',
        coordinates: [longitude, latitude],  // GeoJSON format: [longitude, latitude]
        lastUpdated: new Date()
      };
    } else {
      return res.status(400).json({ message: 'Coordinates or latitude/longitude are required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      locationData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Location updated successfully',
      location: user.currentLocation
    });
  } catch (error) {
    logger.error('Update location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ message: 'Invalid preferences format' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the provided preferences
    for (const [key, value] of Object.entries(preferences)) {
      user.preferences.set(key, value);
    }

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: Object.fromEntries(user.preferences)
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/users/device-token
// @desc    Add or update device token
// @access  Private
router.put('/device-token', auth, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Device token is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add token if it doesn't exist
    if (!user.deviceTokens.includes(token)) {
      user.deviceTokens.push(token);
      await user.save();
    }

    res.json({
      message: 'Device token updated successfully',
      deviceTokens: user.deviceTokens
    });
  } catch (error) {
    logger.error('Update device token error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/users/device-token
// @desc    Remove device token
// @access  Private
router.delete('/device-token', auth, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Device token is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove token if it exists
    const tokenIndex = user.deviceTokens.indexOf(token);
    if (tokenIndex > -1) {
      user.deviceTokens.splice(tokenIndex, 1);
      await user.save();
    }

    res.json({
      message: 'Device token removed successfully',
      deviceTokens: user.deviceTokens
    });
  } catch (error) {
    logger.error('Remove device token error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/users/rating
// @desc    Submit a rating for a ride
// @access  Private
router.post('/rating', [
  auth,
  body('rideId').notEmpty().withMessage('Ride ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString().withMessage('Review must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, rating, review } = req.body;
    const Ride = require('../models/Ride');

    // Find the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is passenger or driver
    const isPassenger = ride.passenger.toString() === req.user.id;
    const isDriver = ride.driver && ride.driver.toString() === req.user.id;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Not authorized to rate this ride' });
    }

    // Check if ride is completed
    if (ride.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed rides' });
    }

    // Update rating based on user role
    if (isPassenger) {
      ride.rating.passengerRating = rating;
      if (review) ride.rating.passengerReview = review;
      await ride.save(); // Save ride first so rating is included in query

      // Update driver's overall rating
      if (ride.driver) {
        const driver = await User.findById(ride.driver);
        if (driver && driver.driverProfile) {
          // Calculate average rating - include the ride we just saved
          const completedRides = await Ride.find({
            driver: ride.driver,
            status: 'completed',
            'rating.passengerRating': { $exists: true, $ne: null }
          });

          const totalRating = completedRides.reduce((sum, r) => sum + (r.rating.passengerRating || 0), 0);
          const avgRating = completedRides.length > 0 ? totalRating / completedRides.length : rating;
          driver.driverProfile.rating = Math.round(avgRating * 10) / 10;
          await driver.save();
        }
      }
    } else if (isDriver) {
      ride.rating.driverRating = rating;
      if (review) ride.rating.driverReview = review;
      await ride.save(); // Save ride first so rating is included in query

      // Update passenger's overall rating
      if (ride.passenger) {
        const passenger = await User.findById(ride.passenger);
        if (passenger && passenger.passengerProfile) {
          // Calculate average rating - include the ride we just saved
          const completedRides = await Ride.find({
            passenger: ride.passenger,
            status: 'completed',
            'rating.driverRating': { $exists: true, $ne: null }
          });

          const totalRating = completedRides.reduce((sum, r) => sum + (r.rating.driverRating || 0), 0);
          const avgRating = completedRides.length > 0 ? totalRating / completedRides.length : rating;
          passenger.passengerProfile.rating = Math.round(avgRating * 10) / 10;
          await passenger.save();
        }
      }
    } else {
      await ride.save();
    }

    res.json({
      message: 'Rating submitted successfully',
      rating: {
        rideId: ride.id,
        rating: isPassenger ? ride.rating.passengerRating : ride.rating.driverRating,
        review: isPassenger ? ride.rating.passengerReview : ride.rating.driverReview
      }
    });
  } catch (error) {
    logger.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;