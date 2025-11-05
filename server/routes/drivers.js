const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Ride = require('../models/Ride');
const router = express.Router();

// @route   GET /api/drivers/status
// @desc    Get driver status
// @access  Private (Driver)
router.get('/status', [auth, requireRole(['driver'])], async (req, res) => {
  try {
    const driver = await User.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({ 
      status: driver.driverStatus || 'offline',
      isOnline: driver.driverProfile?.isOnline || false,
      isAvailable: driver.driverProfile?.isAvailable || false
    });
  } catch (error) {
    console.error('Get driver status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/drivers/status
// @desc    Update driver status
// @access  Private (Driver)
router.put('/status', [
  auth,
  requireRole(['driver']),
  body('status').isIn(['online', 'offline']).withMessage('Status must be online or offline')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const driver = await User.findByIdAndUpdate(
      req.user.id,
      { 
        driverStatus: status,
        'driverProfile.isOnline': status === 'online',
        'driverProfile.isAvailable': status === 'online'
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({ 
      message: `Driver status updated to ${status}`,
      status: driver.driverStatus,
      isOnline: driver.driverProfile?.isOnline,
      isAvailable: driver.driverProfile?.isAvailable
    });
  } catch (error) {
    console.error('Update driver status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/drivers/location
// @desc    Update driver location
// @access  Private (Driver)
router.put('/location', [
  auth,
  requireRole(['driver']),
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('address').optional().isString().withMessage('Address must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { coordinates, address } = req.body;

    // Validate coordinate values
    const [longitude, latitude] = coordinates;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Invalid coordinate values' });
    }

    const driver = await User.findByIdAndUpdate(
      req.user.id,
      {
        currentLocation: {
          type: 'Point',
          coordinates,
          address: address || '',
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({
      message: 'Location updated successfully',
      location: driver.currentLocation
    });
  } catch (error) {
    console.error('Update driver location error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/drivers/available
// @desc    Get available drivers near a location
// @access  Private
router.get('/available', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    // Find available drivers within radius
    const drivers = await User.find({
      role: 'driver',
      isDriver: true,
      driverStatus: 'online',
      'driverProfile.isAvailable': true,
      'currentLocation.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: parseInt(radius)
        }
      }
    }).select('firstName lastName phone currentLocation driverProfile.rating driverProfile.vehicleInfo');

    res.json({
      message: 'Available drivers fetched successfully',
      count: drivers.length,
      drivers: drivers.map(driver => ({
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        location: driver.currentLocation,
        rating: driver.driverProfile?.rating || 5.0,
        vehicle: driver.driverProfile?.vehicleInfo
      }))
    });
  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/drivers/rides
// @desc    Get driver's ride history
// @access  Private (Driver)
router.get('/rides', [auth, requireRole(['driver'])], async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const query = { driver: req.user.id };
    if (status) {
      query.status = status;
    }

    const rides = await Ride.find(query)
      .populate('passenger', 'firstName lastName phone profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Ride.countDocuments(query);

    res.json({
      message: 'Rides fetched successfully',
      rides,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get driver rides error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/drivers/earnings
// @desc    Get driver's earnings summary
// @access  Private (Driver)
router.get('/earnings', [auth, requireRole(['driver'])], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      driver: req.user.id,
      status: 'completed'
    };

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const rides = await Ride.find(query);

    const totalEarnings = rides.reduce((sum, ride) => sum + (ride.fare || 0), 0);
    const totalRides = rides.length;

    res.json({
      message: 'Earnings fetched successfully',
      earnings: {
        total: totalEarnings,
        totalRides,
        averagePerRide: totalRides > 0 ? totalEarnings / totalRides : 0
      }
    });
  } catch (error) {
    console.error('Get driver earnings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/drivers/profile
// @desc    Update driver profile
// @access  Private (Driver)
router.put('/profile', [
  auth,
  requireRole(['driver']),
  body('licenseNumber').optional().isString().withMessage('License number must be a string'),
  body('vehicleInfo.make').optional().isString().withMessage('Vehicle make must be a string'),
  body('vehicleInfo.model').optional().isString().withMessage('Vehicle model must be a string'),
  body('vehicleInfo.year').optional().isInt({ min: 1900, max: 2100 }).withMessage('Vehicle year must be valid'),
  body('vehicleInfo.color').optional().isString().withMessage('Vehicle color must be a string'),
  body('vehicleInfo.plateNumber').optional().isString().withMessage('Plate number must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { licenseNumber, vehicleInfo } = req.body;
    const updateData = {};

    if (licenseNumber) {
      updateData['driverProfile.licenseNumber'] = licenseNumber;
    }

    if (vehicleInfo) {
      if (vehicleInfo.make) updateData['driverProfile.vehicleInfo.make'] = vehicleInfo.make;
      if (vehicleInfo.model) updateData['driverProfile.vehicleInfo.model'] = vehicleInfo.model;
      if (vehicleInfo.year) updateData['driverProfile.vehicleInfo.year'] = vehicleInfo.year;
      if (vehicleInfo.color) updateData['driverProfile.vehicleInfo.color'] = vehicleInfo.color;
      if (vehicleInfo.plateNumber) updateData['driverProfile.vehicleInfo.plateNumber'] = vehicleInfo.plateNumber;
    }

    const driver = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json({
      message: 'Driver profile updated successfully',
      driver: {
        id: driver.id,
        driverProfile: driver.driverProfile
      }
    });
  } catch (error) {
    console.error('Update driver profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;