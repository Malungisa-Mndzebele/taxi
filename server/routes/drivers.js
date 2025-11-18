const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Ride = require('../models/Ride');
const logger = require('../utils/logger');
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
    logger.error('Get driver status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/drivers/status
// @desc    Update driver status
// @access  Private (Driver)
router.put('/status', [
  auth,
  requireRole(['driver']),
  body('status').optional().isIn(['online', 'offline']).withMessage('Status must be online or offline'),
  body('isOnline').optional().isBoolean().withMessage('isOnline must be a boolean'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, isOnline, isAvailable } = req.body;
    
    // Require at least one field
    if (status === undefined && isOnline === undefined && isAvailable === undefined) {
      return res.status(400).json({ message: 'At least one field (status, isOnline, or isAvailable) is required' });
    }
    
    // Get the driver first
    let driver = await User.findById(req.user.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Ensure driverProfile exists - initialize if needed
    if (!driver.driverProfile) {
      driver.driverProfile = {
        isOnline: false,
        isAvailable: false,
        rating: 5.0,
        totalRides: 0
      };
      driver.markModified('driverProfile');
      await driver.save();
      // Reload to get the saved state
      driver = await User.findById(req.user.id);
    }
    
    // Support both formats: { status: 'online' } or { isOnline: true, isAvailable: true }
    if (status !== undefined) {
      // Old format: { status: 'online' | 'offline' }
      driver.driverStatus = status;
      driver.driverProfile.isOnline = status === 'online';
      driver.driverProfile.isAvailable = status === 'online';
    } else {
      // New format: { isOnline: true/false, isAvailable: true/false }
      if (isOnline !== undefined) {
        driver.driverProfile.isOnline = isOnline;
        driver.driverStatus = isOnline ? 'online' : 'offline';
        // If going offline, also set isAvailable to false
        if (!isOnline) {
          driver.driverProfile.isAvailable = false;
        }
      }
      if (isAvailable !== undefined) {
        driver.driverProfile.isAvailable = isAvailable;
      }
    }
    
    // Mark driverProfile as modified and save
    driver.markModified('driverProfile');
    await driver.save();
    
    // Always use $set to ensure the values are properly saved to the database
    // This is more reliable than relying on markModified + save for nested objects
    const updateData = {};
    if (status !== undefined) {
      updateData.driverStatus = status;
      updateData['driverProfile.isOnline'] = status === 'online';
      updateData['driverProfile.isAvailable'] = status === 'online';
    } else {
      if (isOnline !== undefined) {
        updateData['driverProfile.isOnline'] = isOnline;
        updateData.driverStatus = isOnline ? 'online' : 'offline';
        if (!isOnline) {
          updateData['driverProfile.isAvailable'] = false;
        }
      }
      if (isAvailable !== undefined) {
        updateData['driverProfile.isAvailable'] = isAvailable;
      }
    }
    
    // Use $set to ensure nested object is properly saved
    await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    );
    
    // Reload to get the final state
    const finalDriver = await User.findById(req.user.id);
    if (!finalDriver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Return format based on input format
    if (status !== undefined) {
      // Old format: return status as string and driver object for backward compatibility
      res.json({ 
        message: `Driver status updated successfully to ${finalDriver.driverStatus}`,
        status: finalDriver.driverStatus,
        driver: {
          status: finalDriver.driverStatus,
          isOnline: finalDriver.driverProfile?.isOnline || false,
          isAvailable: finalDriver.driverProfile?.isAvailable || false
        }
      });
    } else {
      // New format: return status object
      res.json({ 
        message: 'Driver status updated successfully',
        status: {
          driverStatus: finalDriver.driverStatus,
          isOnline: finalDriver.driverProfile?.isOnline || false,
          isAvailable: finalDriver.driverProfile?.isAvailable || false
        }
      });
    }
  } catch (error) {
    logger.error('Update driver status error:', error);
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
    logger.error('Update driver location error:', error);
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
    logger.error('Get available drivers error:', error);
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
    logger.error('Get driver rides error:', error);
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
    logger.error('Get driver earnings error:', error);
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
    logger.error('Update driver profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;