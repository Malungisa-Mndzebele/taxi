const Ride = require('../../models/Ride');
const User = require('../../models/User');

describe('Ride Model', () => {
  let passenger, driver;

  beforeEach(async () => {
    // Create test users
    passenger = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'passenger@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'passenger'
    });
    await passenger.save();

    driver = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'driver@example.com',
      phone: '+0987654321',
      password: 'password123',
      role: 'driver',
      driverProfile: {
        licenseNumber: 'DL123456',
        vehicleInfo: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          plateNumber: 'ABC-123'
        }
      }
    });
    await driver.save();
  });

  describe('Ride Creation', () => {
    it('should create a new ride with valid data', async () => {
      const rideData = {
        passenger: passenger._id,
        pickupLocation: {
          type: 'Point',
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        fare: {
          baseFare: 2.0,
          distanceFare: 23.25,
          timeFare: 7.5,
          surgeMultiplier: 1.0,
          totalFare: 32.75
        },
        payment: {
          method: 'card'
        }
      };

      const ride = new Ride(rideData);
      const savedRide = await ride.save();

      expect(savedRide._id).toBeDefined();
      expect(savedRide.passenger.toString()).toBe(passenger._id.toString());
      expect(savedRide.status).toBe('requested');
      expect(savedRide.distance).toBe(15.5);
      expect(savedRide.estimatedDuration).toBe(25);
      expect(savedRide.fare.totalFare).toBe(32.75);
      expect(savedRide.payment.method).toBe('card');
      expect(savedRide.timeline.requestedAt).toBeDefined();
    });

    it('should require mandatory fields', async () => {
      const ride = new Ride({});
      await expect(ride.save()).rejects.toThrow();
    });

    it('should validate pickup location coordinates', async () => {
      const rideData = {
        passenger: passenger._id,
        pickupLocation: {
          type: 'Point',
          coordinates: [-122.4324], // Invalid: should have 2 coordinates
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        fare: {
          baseFare: 2.0,
          distanceFare: 23.25,
          timeFare: 7.5,
          surgeMultiplier: 1.0,
          totalFare: 32.75
        },
        payment: {
          method: 'card'
        }
      };

      const ride = new Ride(rideData);
      await expect(ride.save()).rejects.toThrow();
    });
  });

  describe('Fare Calculation', () => {
    it('should calculate total fare correctly', async () => {
      const rideData = {
        passenger: passenger._id,
        pickupLocation: {
          type: 'Point',
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 10.0,
        estimatedDuration: 20,
        fare: {
          baseFare: 2.0,
          distanceFare: 15.0,
          timeFare: 6.0,
          surgeMultiplier: 1.5
        },
        payment: {
          method: 'card'
        }
      };

      const ride = new Ride(rideData);
      const totalFare = ride.calculateFare();

      expect(totalFare).toBe(34.5); // (2.0 + 15.0 + 6.0) * 1.5
      expect(ride.fare.totalFare).toBe(34.5);
    });
  });

  describe('Status Updates', () => {
    let ride;

    beforeEach(async () => {
      const rideData = {
        passenger: passenger._id,
        pickupLocation: {
          type: 'Point',
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        fare: {
          baseFare: 2.0,
          distanceFare: 23.25,
          timeFare: 7.5,
          surgeMultiplier: 1.0,
          totalFare: 32.75
        },
        payment: {
          method: 'card'
        }
      };

      ride = new Ride(rideData);
      await ride.save();
    });

    it('should update status to accepted', async () => {
      await ride.updateStatus('accepted');
      
      expect(ride.status).toBe('accepted');
      expect(ride.timeline.acceptedAt).toBeDefined();
    });

    it('should update status to arrived', async () => {
      await ride.updateStatus('arrived');
      
      expect(ride.status).toBe('arrived');
      expect(ride.timeline.arrivedAt).toBeDefined();
    });

    it('should update status to started', async () => {
      await ride.updateStatus('started');
      
      expect(ride.status).toBe('started');
      expect(ride.timeline.startedAt).toBeDefined();
    });

    it('should update status to completed', async () => {
      await ride.updateStatus('completed');
      
      expect(ride.status).toBe('completed');
      expect(ride.timeline.completedAt).toBeDefined();
    });

    it('should update status to cancelled with reason', async () => {
      await ride.updateStatus('cancelled', { reason: 'Passenger cancelled' });
      
      expect(ride.status).toBe('cancelled');
      expect(ride.timeline.cancelledAt).toBeDefined();
      expect(ride.cancellationReason).toBe('Passenger cancelled');
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate ride duration correctly', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes later

      const rideData = {
        passenger: passenger._id,
        pickupLocation: {
          type: 'Point',
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        fare: {
          baseFare: 2.0,
          distanceFare: 23.25,
          timeFare: 7.5,
          surgeMultiplier: 1.0,
          totalFare: 32.75
        },
        payment: {
          method: 'card'
        },
        timeline: {
          requestedAt: new Date(),
          startedAt: startTime,
          completedAt: endTime
        }
      };

      const ride = new Ride(rideData);
      await ride.save();

      expect(ride.duration).toBe(30);
    });

    it('should return null for duration if ride not completed', async () => {
      const rideData = {
        passenger: passenger._id,
        pickupLocation: {
          type: 'Point',
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        fare: {
          baseFare: 2.0,
          distanceFare: 23.25,
          timeFare: 7.5,
          surgeMultiplier: 1.0,
          totalFare: 32.75
        },
        payment: {
          method: 'card'
        }
      };

      const ride = new Ride(rideData);
      await ride.save();

      expect(ride.duration).toBeNull();
    });
  });

  describe('Rating System', () => {
    let ride;

    beforeEach(async () => {
      const rideData = {
        passenger: passenger._id,
        driver: driver._id,
        pickupLocation: {
          type: 'Point',
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        fare: {
          baseFare: 2.0,
          distanceFare: 23.25,
          timeFare: 7.5,
          surgeMultiplier: 1.0,
          totalFare: 32.75
        },
        payment: {
          method: 'card'
        },
        status: 'completed'
      };

      ride = new Ride(rideData);
      await ride.save();
    });

    it('should store passenger rating', async () => {
      ride.rating.passengerRating = 5;
      ride.rating.passengerReview = 'Great driver!';
      await ride.save();

      const updatedRide = await Ride.findById(ride._id);
      expect(updatedRide.rating.passengerRating).toBe(5);
      expect(updatedRide.rating.passengerReview).toBe('Great driver!');
    });

    it('should store driver rating', async () => {
      ride.rating.driverRating = 4;
      ride.rating.driverReview = 'Good passenger';
      await ride.save();

      const updatedRide = await Ride.findById(ride._id);
      expect(updatedRide.rating.driverRating).toBe(4);
      expect(updatedRide.rating.driverReview).toBe('Good passenger');
    });
  });
});
