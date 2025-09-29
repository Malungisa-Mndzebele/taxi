const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');
const Ride = require('../../models/Ride');
const jwt = require('jsonwebtoken');

describe('Ride Routes', () => {
  let passenger, driver, passengerToken, driverToken;

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
        },
        isOnline: true,
        isAvailable: true
      }
    });
    await driver.save();

    // Create tokens
    passengerToken = jwt.sign({ userId: passenger._id }, process.env.JWT_SECRET || 'test-secret');
    driverToken = jwt.sign({ userId: driver._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('POST /api/rides/request', () => {
    it('should create a new ride request', async () => {
      const rideData = {
        pickupLocation: {
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideData)
        .expect(201);

      expect(response.body.message).toBe('Ride requested successfully');
      expect(response.body.ride.passenger.toString()).toBe(passenger._id.toString());
      expect(response.body.ride.status).toBe('requested');
      expect(response.body.ride.fare.totalFare).toBeDefined();
    });

    it('should reject ride request from driver', async () => {
      const rideData = {
        pickupLocation: {
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(rideData)
        .expect(403);

      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should reject ride request without authentication', async () => {
      const rideData = {
        pickupLocation: {
          coordinates: [-122.4324, 37.78825],
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/rides/request')
        .send(rideData)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    it('should reject ride request with invalid data', async () => {
      const rideData = {
        pickupLocation: {
          coordinates: [-122.4324], // Invalid: should have 2 coordinates
          address: 'San Francisco, CA'
        },
        dropoffLocation: {
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco Airport, CA'
        },
        distance: 15.5,
        estimatedDuration: 25,
        paymentMethod: 'card'
      };

      const response = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/rides/:id/accept', () => {
    let ride;

    beforeEach(async () => {
      ride = new Ride({
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
      });
      await ride.save();
    });

    it('should accept ride request', async () => {
      const response = await request(app)
        .post(`/api/rides/${ride._id}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.message).toBe('Ride accepted successfully');
      expect(response.body.ride.driver.toString()).toBe(driver._id.toString());
      expect(response.body.ride.status).toBe('accepted');
    });

    it('should reject acceptance from passenger', async () => {
      const response = await request(app)
        .post(`/api/rides/${ride._id}/accept`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(403);

      expect(response.body.message).toBe('Insufficient permissions');
    });

    it('should reject acceptance when driver is not available', async () => {
      driver.driverProfile.isAvailable = false;
      await driver.save();

      const response = await request(app)
        .post(`/api/rides/${ride._id}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(400);

      expect(response.body.message).toBe('Driver is not available');
    });

    it('should reject acceptance of non-existent ride', async () => {
      const fakeRideId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post(`/api/rides/${fakeRideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(404);

      expect(response.body.message).toBe('Ride not found');
    });

    it('should reject acceptance of already accepted ride', async () => {
      ride.status = 'accepted';
      await ride.save();

      const response = await request(app)
        .post(`/api/rides/${ride._id}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(400);

      expect(response.body.message).toBe('Ride is no longer available');
    });
  });

  describe('POST /api/rides/:id/arrive', () => {
    let ride;

    beforeEach(async () => {
      ride = new Ride({
        passenger: passenger._id,
        driver: driver._id,
        status: 'accepted',
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
          acceptedAt: new Date()
        }
      });
      await ride.save();
    });

    it('should mark driver as arrived', async () => {
      const response = await request(app)
        .post(`/api/rides/${ride._id}/arrive`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.message).toBe('Arrival confirmed');
      expect(response.body.ride.status).toBe('arrived');
    });

    it('should reject arrival from passenger', async () => {
      const response = await request(app)
        .post(`/api/rides/${ride._id}/arrive`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(403);

      expect(response.body.message).toBe('Not authorized');
    });

    it('should reject arrival for wrong driver', async () => {
      const otherDriver = new User({
        firstName: 'Other',
        lastName: 'Driver',
        email: 'other@example.com',
        phone: '+1111111111',
        password: 'password123',
        role: 'driver'
      });
      await otherDriver.save();

      const otherDriverToken = jwt.sign({ userId: otherDriver._id }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .post(`/api/rides/${ride._id}/arrive`)
        .set('Authorization', `Bearer ${otherDriverToken}`)
        .expect(403);

      expect(response.body.message).toBe('Not authorized');
    });
  });

  describe('GET /api/rides/active', () => {
    let ride;

    beforeEach(async () => {
      ride = new Ride({
        passenger: passenger._id,
        driver: driver._id,
        status: 'accepted',
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
      });
      await ride.save();
    });

    it('should return active rides for passenger', async () => {
      const response = await request(app)
        .get('/api/rides/active')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.rides).toHaveLength(1);
      expect(response.body.rides[0]._id.toString()).toBe(ride._id.toString());
    });

    it('should return active rides for driver', async () => {
      const response = await request(app)
        .get('/api/rides/active')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.rides).toHaveLength(1);
      expect(response.body.rides[0]._id.toString()).toBe(ride._id.toString());
    });

    it('should return empty array when no active rides', async () => {
      ride.status = 'completed';
      await ride.save();

      const response = await request(app)
        .get('/api/rides/active')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.rides).toHaveLength(0);
    });
  });

  describe('GET /api/rides/history', () => {
    let completedRide, cancelledRide;

    beforeEach(async () => {
      completedRide = new Ride({
        passenger: passenger._id,
        driver: driver._id,
        status: 'completed',
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
          completedAt: new Date()
        }
      });
      await completedRide.save();

      cancelledRide = new Ride({
        passenger: passenger._id,
        status: 'cancelled',
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
          surgeMultiplier: 1.0,
          totalFare: 23.0
        },
        payment: {
          method: 'card'
        },
        timeline: {
          requestedAt: new Date(),
          cancelledAt: new Date()
        }
      });
      await cancelledRide.save();
    });

    it('should return ride history for passenger', async () => {
      const response = await request(app)
        .get('/api/rides/history')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.rides).toHaveLength(2);
    });

    it('should return ride history for driver', async () => {
      const response = await request(app)
        .get('/api/rides/history')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.rides).toHaveLength(1); // Only completed ride has driver
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/rides/history?page=1&limit=1')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.rides).toHaveLength(1);
    });
  });
});
