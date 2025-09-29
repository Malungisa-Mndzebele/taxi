const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/drivers/profile
// @desc    Update driver profile
// @access  Private (Driver)
router.put('/profile', [
  auth,
  requireRole(['driver']),
  body('licenseNumber').optional().isString().withMessage('License number must be a string'),
  body('vehicleInfo.make').optional().isString().withMessage('Vehicle make must be a string'),
  body('vehicleInfo.model').optional().isString().withMessage('Vehicle model must be a string'),
  body('vehicleInfo.year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid vehicle year'),
  body('vehicleInfo.color').optional().isString().withMessage('Vehicle color must be a string'),
  body('vehicleInfo.plateNumber').optional().isString().withMessage('Plate number must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { licenseNumber, vehicleInfo } = req.body;

    if (licenseNumber) {
      req.user.driverProfile.licenseNumber = licenseNumber;
    }

    if (vehicleInfo) {
      req.user.driverProfile.vehicleInfo = {
        ...req.user.driverProfile.vehicleInfo,
        ...vehicleInfo
      };
    }

    await req.user.save();

    res.json({
      message: 'Driver profile updated successfully',
      driverProfile: req.user.driverProfile
    });
  } catch (error) {
    console.error('Update driver profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/drivers/status
// @desc    Update driver online/offline status
// @access  Private (Driver)
router.put('/status', [
  auth,
  requireRole(['driver']),
  body('isOnline').isBoolean().withMessage('isOnline must be a boolean'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isOnline, isAvailable } = req.body;

    req.user.driverProfile.isOnline = isOnline;
    
    // If going offline, also set as unavailable
    if (!isOnline) {
      req.user.driverProfile.isAvailable = false;
    } else if (isAvailable !== undefined) {
      req.user.driverProfile.isAvailable = isAvailable;
    }

    await req.user.save();

    res.json({
      message: 'Driver status updated successfully',
      status: {
        isOnline: req.user.driverProfile.isOnline,
        isAvailable: req.user.driverProfile.isAvailable
      }
    });
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/drivers/stats
// @desc    Get driver statistics
// @access  Private (Driver)
router.get('/stats', [
  auth,
  requireRole(['driver'])
], async (req, res) => {
  try {
    const Ride = require('../models/Ride');
    
    const totalRides = await Ride.countDocuments({
      driver: req.user._id,
      status: 'completed'
    });

    const totalEarnings = await Ride.aggregate([
      {
        $match: {
          driver: req.user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$fare.totalFare' }
        }
      }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRides = await Ride.countDocuments({
      driver: req.user._id,
      status: 'completed',
      'timeline.completedAt': { $gte: today }
    });

    const todayEarnings = await Ride.aggregate([
      {
        $match: {
          driver: req.user._id,
          status: 'completed',
          'timeline.completedAt': { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$fare.totalFare' }
        }
      }
    ]);

    res.json({
      stats: {
        totalRides,
        totalEarnings: totalEarnings[0]?.total || 0,
        todayRides,
        todayEarnings: todayEarnings[0]?.total || 0,
        rating: req.user.driverProfile.rating,
        isOnline: req.user.driverProfile.isOnline,
        isAvailable: req.user.driverProfile.isAvailable
      }
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/drivers/earnings
// @desc    Get driver earnings history
// @access  Private (Driver)
router.get('/earnings', [
  auth,
  requireRole(['driver'])
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const Ride = require('../models/Ride');
    
    const rides = await Ride.find({
      driver: req.user._id,
      status: 'completed'
    })
    .populate('passenger', 'firstName lastName')
    .select('fare timeline.completedAt passenger')
    .sort({ 'timeline.completedAt': -1 })
    .skip(skip)
    .limit(limit);

    const totalEarnings = await Ride.aggregate([
      {
        $match: {
          driver: req.user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$fare.totalFare' }
        }
      }
    ]);

    res.json({
      rides,
      totalEarnings: totalEarnings[0]?.total || 0,
      page,
      limit
    });
  } catch (error) {
    console.error('Get driver earnings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/drivers/requests
// @desc    Get available ride requests for driver
// @access  Private (Driver)
router.get('/requests', [
  auth,
  requireRole(['driver'])
], async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Current location is required' });
    }

    const Ride = require('../models/Ride');
    
    // Find nearby ride requests
    const rideRequests = await Ride.find({
      status: 'requested',
      pickupLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    })
    .populate('passenger', 'firstName lastName profilePicture passengerProfile.rating')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({ rideRequests });
  } catch (error) {
    console.error('Get ride requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
