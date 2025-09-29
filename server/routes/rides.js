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

    // Create ride request
    const ride = new Ride({
      passenger: req.user._id,
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
      fare,
      payment: {
        method: paymentMethod || 'card'
      }
    });

    await ride.save();

    // Populate passenger details
    await ride.populate('passenger', 'firstName lastName phone profilePicture');

    // Emit to nearby drivers via socket.io
    req.app.get('io').emit('new-ride-request', {
      rideId: ride._id,
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation,
      fare: ride.fare,
      passenger: ride.passenger
    });

    res.status(201).json({
      message: 'Ride requested successfully',
      ride
    });
  } catch (error) {
    console.error('Ride request error:', error);
    res.status(500).json({ message: 'Server error during ride request' });
  }
});

// @route   POST /api/rides/:id/accept
// @desc    Accept a ride request
// @access  Private (Driver)
router.post('/:id/accept', [
  auth,
  requireRole(['driver'])
], async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride is no longer available' });
    }

    // Check if driver is available
    if (!req.user.driverProfile.isAvailable) {
      return res.status(400).json({ message: 'Driver is not available' });
    }

    // Update ride
    ride.driver = req.user._id;
    await ride.updateStatus('accepted');

    // Update driver status
    req.user.driverProfile.isAvailable = false;
    await req.user.save();

    // Populate driver details
    await ride.populate('driver', 'firstName lastName phone profilePicture driverProfile.vehicleInfo');

    // Notify passenger
    req.app.get('io').to(ride.passenger.toString()).emit('ride-accepted', {
      rideId: ride._id,
      driver: ride.driver,
      estimatedArrival: 5 // minutes
    });

    res.json({
      message: 'Ride accepted successfully',
      ride
    });
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/arrive
// @desc    Mark driver as arrived
// @access  Private (Driver)
router.post('/:id/arrive', [
  auth,
  requireRole(['driver'])
], async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({ message: 'Invalid ride status' });
    }

    await ride.updateStatus('arrived');

    // Notify passenger
    req.app.get('io').to(ride.passenger.toString()).emit('driver-arrived', {
      rideId: ride._id
    });

    res.json({
      message: 'Arrival confirmed',
      ride
    });
  } catch (error) {
    console.error('Arrive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/start
// @desc    Start the ride
// @access  Private (Driver)
router.post('/:id/start', [
  auth,
  requireRole(['driver'])
], async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (ride.status !== 'arrived') {
      return res.status(400).json({ message: 'Invalid ride status' });
    }

    await ride.updateStatus('started');

    // Notify passenger
    req.app.get('io').to(ride.passenger.toString()).emit('ride-started', {
      rideId: ride._id
    });

    res.json({
      message: 'Ride started',
      ride
    });
  } catch (error) {
    console.error('Start ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/complete
// @desc    Complete the ride
// @access  Private (Driver)
router.post('/:id/complete', [
  auth,
  requireRole(['driver'])
], async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (ride.status !== 'started') {
      return res.status(400).json({ message: 'Invalid ride status' });
    }

    await ride.updateStatus('completed');

    // Update driver status
    req.user.driverProfile.isAvailable = true;
    req.user.driverProfile.totalRides += 1;
    await req.user.save();

    // Update passenger stats
    const passenger = await User.findById(ride.passenger);
    passenger.passengerProfile.totalRides += 1;
    await passenger.save();

    // Notify passenger
    req.app.get('io').to(ride.passenger.toString()).emit('ride-completed', {
      rideId: ride._id,
      fare: ride.fare
    });

    res.json({
      message: 'Ride completed successfully',
      ride
    });
  } catch (error) {
    console.error('Complete ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/rides/:id/cancel
// @desc    Cancel a ride
// @access  Private (Passenger or Driver)
router.post('/:id/cancel', [
  auth,
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is authorized to cancel
    const isPassenger = ride.passenger.toString() === req.user._id.toString();
    const isDriver = ride.driver && ride.driver.toString() === req.user._id.toString();
    
    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(400).json({ message: 'Ride cannot be cancelled' });
    }

    await ride.updateStatus('cancelled', { reason: req.body.reason });

    // If driver cancelled, make them available again
    if (isDriver) {
      req.user.driverProfile.isAvailable = true;
      await req.user.save();
    }

    // Notify the other party
    const otherPartyId = isPassenger ? ride.driver : ride.passenger;
    if (otherPartyId) {
      req.app.get('io').to(otherPartyId.toString()).emit('ride-cancelled', {
        rideId: ride._id,
        reason: req.body.reason
      });
    }

    res.json({
      message: 'Ride cancelled successfully',
      ride
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/active
// @desc    Get active rides for current user
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const activeStatuses = ['requested', 'accepted', 'arrived', 'started'];
    
    let rides;
    if (req.user.role === 'driver') {
      rides = await Ride.find({
        driver: req.user._id,
        status: { $in: activeStatuses }
      }).populate('passenger', 'firstName lastName phone profilePicture');
    } else {
      rides = await Ride.find({
        passenger: req.user._id,
        status: { $in: activeStatuses }
      }).populate('driver', 'firstName lastName phone profilePicture driverProfile.vehicleInfo');
    }

    res.json({ rides });
  } catch (error) {
    console.error('Get active rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/history
// @desc    Get ride history for current user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let rides;
    if (req.user.role === 'driver') {
      rides = await Ride.find({
        driver: req.user._id,
        status: { $in: ['completed', 'cancelled'] }
      })
      .populate('passenger', 'firstName lastName phone profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    } else {
      rides = await Ride.find({
        passenger: req.user._id,
        status: { $in: ['completed', 'cancelled'] }
      })
      .populate('driver', 'firstName lastName phone profilePicture driverProfile.vehicleInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    }

    res.json({ rides });
  } catch (error) {
    console.error('Get ride history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/rides/:id
// @desc    Get ride details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('passenger', 'firstName lastName phone profilePicture')
      .populate('driver', 'firstName lastName phone profilePicture driverProfile.vehicleInfo');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is authorized to view this ride
    const isPassenger = ride.passenger._id.toString() === req.user._id.toString();
    const isDriver = ride.driver && ride.driver._id.toString() === req.user._id.toString();
    
    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ ride });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
