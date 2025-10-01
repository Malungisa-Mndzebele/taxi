const express = require('express');
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Calculate fare based on distance and time
const calculateFare = (distance, duration, surgeMultiplier = 1.0) => {
  const baseFare = 2.0; // Base fare
  const perKmRate = 1.5; // Rate per kilometer
  const perMinuteRate = 0.3; // Rate per minute

  const distanceFare = distance * perKmRate;
  const timeFare = duration * perMinuteRate;
  const totalFare = (baseFare + distanceFare + timeFare) * surgeMultiplier;

  return {
    baseFare,
    distanceFare,
    timeFare,
    surgeMultiplier,
    totalFare: Math.round(totalFare * 100) / 100 // Round to 2 decimal places
  };
};

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

    // Calculate fare
    const fare = calculateFare(distance, estimatedDuration);

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
      fare: fare.totalFare,
      fareBreakdown: fare,
      paymentMethod: paymentMethod || 'cash'
    });

    await ride.save();

    // Find nearby drivers
    const nearbyDrivers = await User.find({
      role: 'driver',
      isDriver: true,
      driverStatus: 'online',
      currentLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: pickupLocation.coordinates
          },
          $maxDistance: 5000 // 5 kilometers
        }
      }
    });

    res.json({
      message: 'Ride requested successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation,
        distance: ride.distance,
        estimatedDuration: ride.estimatedDuration,
        fare: ride.fare,
        fareBreakdown: ride.fareBreakdown,
        paymentMethod: ride.paymentMethod
      },
      availableDrivers: nearbyDrivers.length
    });
  } catch (error) {
    console.error('Request ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/rides/:rideId
// @desc    Get ride details
// @access  Private
router.get('/:rideId', auth, async (req, res) => {
  try {
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
    console.error('Get ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/rides/:rideId/accept
// @desc    Accept a ride request (Driver)
// @access  Private
router.put('/:rideId/accept', [auth, requireRole(['driver'])], async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('passenger', 'firstName lastName phone')
      .exec();

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({ message: 'Ride is no longer available' });
    }

    // Check if driver is online and available
    const driver = await User.findById(req.user.id);
    if (!driver.isDriver || driver.driverStatus !== 'online') {
      return res.status(400).json({ message: 'Driver must be online to accept rides' });
    }

    ride.driver = req.user.id;
    ride.status = 'accepted';
    ride.acceptedAt = Date.now();

    await ride.save();

    res.json({
      message: 'Ride accepted successfully',
      ride: {
        id: ride.id,
        status: ride.status,
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
    console.error('Accept ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/rides/:rideId/arrive
// @desc    Mark driver as arrived at pickup location
// @access  Private (Driver)
router.put('/:rideId/arrive', [auth, requireRole(['driver'])], async (req, res) => {
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
    ride.arrivedAt = Date.now();
    await ride.save();

    res.json({
      message: 'Marked as arrived successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        arrivedAt: ride.arrivedAt
      }
    });
  } catch (error) {
    console.error('Mark arrival error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/rides/:rideId/start
// @desc    Start the ride
// @access  Private (Driver)
router.put('/:rideId/start', [auth, requireRole(['driver'])], async (req, res) => {
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

    ride.status = 'in_progress';
    ride.startedAt = Date.now();
    await ride.save();

    res.json({
      message: 'Ride started successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        startedAt: ride.startedAt
      }
    });
  } catch (error) {
    console.error('Start ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/rides/:rideId/complete
// @desc    Complete the ride
// @access  Private (Driver)
router.put('/:rideId/complete', [
  auth,
  requireRole(['driver']),
  body('endLocation.coordinates').isArray({ min: 2, max: 2 }).withMessage('Invalid end location coordinates'),
  body('endLocation.address').notEmpty().withMessage('End location address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    if (ride.status !== 'in_progress') {
      return res.status(400).json({ message: 'Cannot complete ride in current status' });
    }

    const { endLocation } = req.body;

    ride.status = 'completed';
    ride.completedAt = Date.now();
    ride.endLocation = {
      type: 'Point',
      coordinates: endLocation.coordinates,
      address: endLocation.address
    };

    // Calculate actual duration
    ride.actualDuration = Math.round((ride.completedAt - ride.startedAt) / 1000 / 60); // in minutes

    await ride.save();

    res.json({
      message: 'Ride completed successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        completedAt: ride.completedAt,
        endLocation: ride.endLocation,
        actualDuration: ride.actualDuration
      }
    });
  } catch (error) {
    console.error('Complete ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/rides/:rideId/cancel
// @desc    Cancel a ride
// @access  Private (Passenger or Driver)
router.put('/:rideId/cancel', [
  auth,
  body('reason').optional().isString().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
    ride.cancelledAt = Date.now();
    ride.cancelledBy = isPassenger ? 'passenger' : 'driver';
    ride.cancellationReason = req.body.reason || 'No reason provided';

    await ride.save();

    res.json({
      message: 'Ride cancelled successfully',
      ride: {
        id: ride.id,
        status: ride.status,
        cancelledAt: ride.cancelledAt,
        cancelledBy: ride.cancelledBy,
        cancellationReason: ride.cancellationReason
      }
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;