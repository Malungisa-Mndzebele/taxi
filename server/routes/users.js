const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone, profilePicture } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;
    if (profilePicture) updates.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/location
// @desc    Update user location
// @access  Private
router.put('/location', [
  auth,
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Invalid coordinates'),
  body('address').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coordinates, address } = req.body;

    req.user.currentLocation = {
      type: 'Point',
      coordinates,
      address,
      lastUpdated: new Date()
    };

    await req.user.save();

    res.json({
      message: 'Location updated successfully',
      location: req.user.currentLocation
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/nearby-drivers
// @desc    Get nearby available drivers
// @access  Private (Passenger)
router.get('/nearby-drivers', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const drivers = await User.find({
      role: 'driver',
      'driverProfile.isOnline': true,
      'driverProfile.isAvailable': true,
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).select('firstName lastName profilePicture driverProfile.rating driverProfile.vehicleInfo currentLocation');

    res.json({ drivers });
  } catch (error) {
    console.error('Get nearby drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/rating
// @desc    Rate a user after ride completion
// @access  Private
router.post('/rating', [
  auth,
  body('rideId').isMongoId().withMessage('Valid ride ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString().isLength({ max: 500 }).withMessage('Review must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, rating, review } = req.body;
    const Ride = require('../models/Ride');

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is authorized to rate
    const isPassenger = ride.passenger.toString() === req.user._id.toString();
    const isDriver = ride.driver && ride.driver.toString() === req.user._id.toString();
    
    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed rides' });
    }

    // Update rating based on user role
    if (isPassenger) {
      ride.rating.driverRating = rating;
      ride.rating.driverReview = review;
      
      // Update driver's overall rating
      const driver = await User.findById(ride.driver);
      const totalRides = driver.driverProfile.totalRides;
      const currentRating = driver.driverProfile.rating;
      const newRating = ((currentRating * (totalRides - 1)) + rating) / totalRides;
      driver.driverProfile.rating = Math.round(newRating * 10) / 10;
      await driver.save();
    } else {
      ride.rating.passengerRating = rating;
      ride.rating.passengerReview = review;
      
      // Update passenger's overall rating
      const passenger = await User.findById(ride.passenger);
      const totalRides = passenger.passengerProfile.totalRides;
      const currentRating = passenger.passengerProfile.rating;
      const newRating = ((currentRating * (totalRides - 1)) + rating) / totalRides;
      passenger.passengerProfile.rating = Math.round(newRating * 10) / 10;
      await passenger.save();
    }

    await ride.save();

    res.json({
      message: 'Rating submitted successfully',
      rating: {
        rating,
        review
      }
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put('/password', [
  auth,
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    req.user.isActive = false;
    await req.user.save();

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
