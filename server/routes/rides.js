const express = require('express');
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const fareCalculator = require('../services/fareCalculator');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/rides/request
// @desc    Request a new ride
// @access  Private (Passenger)
router.post('/request', [
  auth,
  requireRole(['passenger']),
  body('pickupLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Invalid pickup coordinates'),
  body('pickupLocation.address').notEmpty().withMessage('Pickup address is required'),
  body('dropoffLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Invalid dropoff coordinates'),
  body('dropoffLocation.address').notEmpty().withMessage('Dropoff address is required'),
  body('distance').isNumeric().withMessage('Distance must be a number'),
  body('estimatedDuration').isNumeric().withMessage('Estimated duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickupLocation, dropoffLocation, distance, estimatedDuration, paymentMethod } = req.body;

    // Calculate fare using fare calculator service
    const fare = fareCalculator.calculateFare(distance, estimatedDuration);

    // Create new ride request
    const ride = new Ride({
      passenger: req.user.id,
      pickupLocation: {
        type: 'Point',
        coordinates: pickupLocation.coordinates,
        address: pickupLocation.address
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: dropoffLocation.coordinates,
        address: dropoffLocation.address
      },
      distance,
      estimatedDuration,
      fare: {
        baseFare: fare.baseFare,
        distanceFare: fare.distanceFare,
        timeFare: fare.timeFare,
        surgeMultiplier: fare.surgeMultiplier,
        totalFare: fare.totalFare
      },
      payment: {
        method: paymentMethod || 'cash',
        status: 'pending'
      }
    });

    await ride.save();

    // Find nearby drivers (handle geospatial query errors gracefully)
    let nearbyDrivers = [];
    try {
      nearbyDrivers = await User.find({
        role: 'driver',
        isDriver: true,
        'driverProfile.isOnline': true,
        'driverProfile.isAvailable': true,
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: pickupLocation.coordinates
            },
            $maxDistance: 5000 // 5 kilometers
          }
        }
      }).limit(10);
    } catch (geoError) {
      // If geospatial query fails (e.g., no index), fall back to simple query
      logger.warn('Geospatial query failed, using fallback:', geoError.message);
      nearbyDrivers = await User.find({
        role: 'driver',
        isDriver: true,
        'driverProfile.isOnline': true,
        'driverProfile.isAvailable': true
      }).limit(10);
    }

    // Populate passenger for response
    await ride.populate('passenger', 'firstName lastName phone');

    res.status(201).json({
      message: 'Ride requested successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        passenger: ride.passenger,
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation,
        distance: ride.distance,
        estimatedDuration: ride.estimatedDuration,
        fare: ride.fare,
        payment: ride.payment
      },
      availableDrivers: nearbyDrivers.length
    });
  } catch (error) {
    logger.error('Request ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/rides/active
// @desc    Get active rides for user
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const activeStatuses = ['requested', 'accepted', 'arrived', 'started'];
    let query = { status: { $in: activeStatuses } };

    // Filter by user role
    if (req.user.role === 'passenger') {
      query.passenger = req.user.id;
    } else if (req.user.role === 'driver') {
      query.driver = req.user.id;
    }

    const rides = await Ride.find(query)
      .populate('passenger', 'firstName lastName phone profilePicture')
      .populate('driver', 'firstName lastName phone profilePicture driverStatus')
      .sort({ createdAt: -1 })
      .exec();

    res.json({ rides });
  } catch (error) {
    logger.error('Get active rides error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/rides/available
// @desc    Get available rides for driver
// @access  Private (Driver)
router.get('/available', [auth, requireRole(['driver'])], async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'requested' })
      .populate('passenger', 'firstName lastName phone profilePicture')
      .sort({ createdAt: -1 })
      .exec();

    res.json({ rides });
  } catch (error) {
    logger.error('Get available rides error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/rides/history
// @desc    Get ride history for user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const completedStatuses = ['completed', 'cancelled'];
    let query = { status: { $in: completedStatuses } };

    // Filter by user role
    if (req.user.role === 'passenger') {
      query.passenger = req.user.id;
    } else if (req.user.role === 'driver') {
      query.driver = req.user.id;
    }

    const rides = await Ride.find(query)
      .populate('passenger', 'firstName lastName phone profilePicture')
      .populate('driver', 'firstName lastName phone profilePicture')
      .sort({ completedAt: -1, cancelledAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Ride.countDocuments(query);

    res.json({
      rides,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get ride history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/rides/:rideId
// @desc    Get ride details
// @access  Private
router.get('/:rideId', auth, async (req, res) => {
  try {
    // Check if rideId is a valid ObjectId, otherwise return 404
    if (!req.params.rideId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const ride = await Ride.findById(req.params.rideId)
      .populate('passenger', 'firstName lastName phone profilePicture')
      .populate('driver', 'firstName lastName phone profilePicture driverStatus')
      .exec();

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is either the passenger or driver
    if (ride.passenger._id.toString() !== req.user.id && 
        (!ride.driver || ride.driver._id.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this ride' });
    }

    res.json({ ride });
  } catch (error) {
    logger.error('Get ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/rides/:rideId/accept
// @desc    Accept a ride request (Driver)
// @access  Private
const acceptRideHandler = async (req, res) => {
  try {
    // Validate rideId
    if (!req.params.rideId || req.params.rideId === 'undefined') {
      return res.status(400).json({ message: 'Invalid ride ID' });
    }
    
    const ride = await Ride.findById(req.params.rideId)
      .populate('passenger', 'firstName lastName phone')
      .exec();

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride is no longer available' });
    }

    // Check if driver is online and available
    // Use raw data as the source of truth (actual database state)
    const rawDriver = await User.findById(req.user.id).lean();
    if (!rawDriver || rawDriver.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can accept rides' });
    }
    
    // Load as Mongoose document for later operations
    let driver = await User.findById(req.user.id);
    if (!driver || driver.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can accept rides' });
    }
    
    // Use raw data as the source of truth - it's the actual database state
    const driverProfile = rawDriver.driverProfile;
    
    if (!driverProfile) {
      // Initialize driverProfile if it doesn't exist
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $set: {
            'driverProfile.isOnline': false,
            'driverProfile.isAvailable': false,
            'driverProfile.rating': 5.0,
            'driverProfile.totalRides': 0
          }
        },
        { new: true }
      );
      return res.status(400).json({ 
        message: 'Driver profile not initialized. Please set driver status first.'
      });
    }
    
    // Check if driver is online - use raw data (database state)
    const isOnline = driverProfile.isOnline === true;
    if (!isOnline) {
      return res.status(400).json({ 
        message: 'Driver must be online to accept rides',
        debug: { 
          isOnline: driverProfile.isOnline,
          driverStatus: rawDriver.driverStatus,
          driverProfile: driverProfile
        }
      });
    }
    
    // Check if driver is available - use raw data (database state)
    const isAvailable = driverProfile.isAvailable === true;
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'Driver is not available',
        debug: { 
          isAvailable: driverProfile.isAvailable,
          isOnline: driverProfile.isOnline,
          driverProfile: driverProfile
        }
      });
    }
    
    // Sync to Mongoose document for later operations
    if (!driver.driverProfile) {
      driver.driverProfile = {
        isOnline: driverProfile.isOnline || false,
        isAvailable: driverProfile.isAvailable || false,
        rating: driverProfile.rating || 5.0,
        totalRides: driverProfile.totalRides || 0,
        licenseNumber: driverProfile.licenseNumber,
        vehicleInfo: driverProfile.vehicleInfo
      };
      driver.markModified('driverProfile');
      await driver.save();
      // Reload driver after sync
      driver = await User.findById(req.user.id);
    }

    ride.driver = req.user.id;
    ride.status = 'accepted';
    ride.timeline.acceptedAt = new Date();

    // Mark driver as unavailable
    driver.driverProfile.isAvailable = false;
    driver.markModified('driverProfile');
    await driver.save();

    await ride.save();

    // Populate driver for response
    await ride.populate('driver', 'firstName lastName phone');
    await ride.populate('passenger', 'firstName lastName phone');

    res.json({
      message: 'Ride accepted successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        driver: ride.driver,
        passenger: {
          firstName: ride.passenger.firstName,
          lastName: ride.passenger.lastName,
          phone: ride.passenger.phone
        },
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation
      }
    });
  } catch (error) {
    logger.error('Accept ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

router.put('/:rideId/accept', [auth, requireRole(['driver'])], acceptRideHandler);
router.post('/:rideId/accept', [auth, requireRole(['driver'])], acceptRideHandler);

// @route   POST /api/rides/:rideId/arrive
// @desc    Mark driver as arrived at pickup location
// @access  Private (Driver)
router.post('/:rideId/arrive', [auth, requireRole(['driver'])], async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({ message: 'Cannot mark arrival for this ride status' });
    }

    ride.status = 'arrived';
    ride.timeline.arrivedAt = new Date();
    await ride.save();

    res.json({
      message: 'Arrival confirmed',
      ride: {
        id: ride.id,
        status: ride.status,
        arrivedAt: ride.timeline.arrivedAt
      }
    });
  } catch (error) {
    logger.error('Mark arrival error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/rides/:rideId/start
// @route   POST /api/rides/:rideId/start (for backward compatibility)
// @desc    Start the ride
// @access  Private (Driver)
const startRideHandler = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    if (ride.status !== 'arrived') {
      return res.status(400).json({ message: 'Cannot start ride in current status' });
    }

    ride.status = 'started';
    ride.timeline.startedAt = new Date();
    await ride.save();

    res.json({
      message: 'Ride started successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        startedAt: ride.timeline.startedAt
      }
    });
  } catch (error) {
    logger.error('Start ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

router.put('/:rideId/start', [auth, requireRole(['driver'])], startRideHandler);
router.post('/:rideId/start', [auth, requireRole(['driver'])], startRideHandler);

// @route   PUT /api/rides/:rideId/complete
// @route   POST /api/rides/:rideId/complete (for backward compatibility)
// @desc    Complete the ride
// @access  Private (Driver)
const completeRideHandler = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    if (ride.status !== 'started') {
      return res.status(400).json({ message: 'Cannot complete ride in current status' });
    }

    ride.status = 'completed';
    ride.timeline.completedAt = new Date();
    ride.payment.status = 'completed';
    ride.payment.paidAt = new Date();

    // Update driver and passenger stats
    const driver = await User.findById(ride.driver);
    if (driver && driver.driverProfile) {
      driver.driverProfile.totalRides = (driver.driverProfile.totalRides || 0) + 1;
      driver.driverProfile.isAvailable = true;
      await driver.save();
    }

    const passenger = await User.findById(ride.passenger);
    if (passenger && passenger.passengerProfile) {
      passenger.passengerProfile.totalRides = (passenger.passengerProfile.totalRides || 0) + 1;
      await passenger.save();
    }

    await ride.save();

    res.json({
      message: 'Ride completed successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        completedAt: ride.timeline.completedAt,
        payment: ride.payment
      }
    });
  } catch (error) {
    logger.error('Complete ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

router.put('/:rideId/complete', [auth, requireRole(['driver'])], completeRideHandler);
router.post('/:rideId/complete', [auth, requireRole(['driver'])], completeRideHandler);

// @route   PUT /api/rides/:rideId/cancel
// @route   POST /api/rides/:rideId/cancel (for backward compatibility)
// @desc    Cancel a ride
// @access  Private (Passenger or Driver)
const cancelRideHandler = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is either the passenger or the assigned driver
    const isPassenger = ride.passenger.toString() === req.user.id;
    const isDriver = ride.driver && ride.driver.toString() === req.user.id;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Not authorized to cancel this ride' });
    }

    // Check if ride can be canceled
    const nonCancelableStates = ['completed', 'cancelled'];
    if (nonCancelableStates.includes(ride.status)) {
      return res.status(400).json({ message: 'Ride cannot be cancelled in current status' });
    }

    ride.status = 'cancelled';
    ride.timeline.cancelledAt = new Date();
    ride.cancellationReason = req.body.reason || 'No reason provided';

    // If driver was assigned, make them available again
    if (ride.driver) {
      const driver = await User.findById(ride.driver);
      if (driver && driver.driverProfile) {
        driver.driverProfile.isAvailable = true;
        await driver.save();
      }
    }

    await ride.save();

    res.json({
      message: 'Ride cancelled successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        cancelledAt: ride.timeline.cancelledAt,
        cancellationReason: ride.cancellationReason
      }
    });
  } catch (error) {
    logger.error('Cancel ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

router.put('/:rideId/cancel', [auth, body('reason').optional().isString().withMessage('Reason must be a string')], cancelRideHandler);
router.post('/:rideId/cancel', [auth, body('reason').optional().isString().withMessage('Reason must be a string')], cancelRideHandler);

// @route   PUT /api/rides/:rideId/status
// @desc    Update ride status (for backward compatibility)
// @access  Private (Driver)
router.put('/:rideId/status', [auth, requireRole(['driver']), body('status').notEmpty().withMessage('Status is required')], async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    // Map status values
    const statusMap = {
      'in-progress': 'started',
      'in_progress': 'started'
    };

    const mappedStatus = statusMap[status] || status;

    // Validate status transition
    const validStatuses = ['accepted', 'arrived', 'started', 'completed', 'cancelled'];
    if (!validStatuses.includes(mappedStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    ride.status = mappedStatus;
    
    // Update timeline
    if (mappedStatus === 'started' && !ride.timeline.startedAt) {
      ride.timeline.startedAt = new Date();
    } else if (mappedStatus === 'completed' && !ride.timeline.completedAt) {
      ride.timeline.completedAt = new Date();
      ride.payment.status = 'completed';
      ride.payment.paidAt = new Date();

      // Update driver and passenger stats
      const driver = await User.findById(ride.driver);
      if (driver && driver.driverProfile) {
        driver.driverProfile.totalRides = (driver.driverProfile.totalRides || 0) + 1;
        driver.driverProfile.isAvailable = true;
        await driver.save();
      }

      const passenger = await User.findById(ride.passenger);
      if (passenger && passenger.passengerProfile) {
        passenger.passengerProfile.totalRides = (passenger.passengerProfile.totalRides || 0) + 1;
        await passenger.save();
      }
    }

    await ride.save();

    res.json({
      message: 'Ride status updated successfully',
      ride: {
        id: ride.id,
        status: ride.status
      }
    });
  } catch (error) {
    logger.error('Update ride status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;