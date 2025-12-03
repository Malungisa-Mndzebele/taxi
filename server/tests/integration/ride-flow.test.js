const request = require('supertest');
const { app } = require('../../test-server');
const User = require('../../models/User');
const Ride = require('../../models/Ride');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

describe('Ride Flow Integration Tests', () => {
  let passenger, driver, passengerToken, driverToken;

  beforeEach(async () => {
    // Create test users
    passenger = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: `passenger.${Date.now()}@example.com`,
      phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'passenger',
      passengerProfile: {
        rating: 5.0,
        totalRides: 0
      },
      currentLocation: {
        type: 'Point',
        coordinates: [-122.4324, 37.78825],
        address: 'San Francisco, CA'
      }
    });
    await passenger.save();

    driver = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: `driver.${Date.now()}@example.com`,
      phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
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
        isAvailable: true,
        rating: 5.0,
        totalRides: 0
      },
      currentLocation: {
        type: 'Point',
        coordinates: [-122.4300, 37.7900],
        address: 'Near San Francisco, CA'
      }
    });
    await driver.save();

    // Create tokens
    passengerToken = jwt.sign({ userId: passenger._id }, process.env.JWT_SECRET || 'test-secret');
    driverToken = jwt.sign({ userId: driver._id }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('Complete Ride Flow', () => {
    it('should complete a full ride from request to completion', async () => {
      // Set driver online via API to ensure proper initialization
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ isOnline: true, isAvailable: true })
        .expect(200);

      // Step 1: Passenger requests a ride
      const rideRequestData = {
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

      const requestResponse = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideRequestData)
        .expect(201);

      const rideId = requestResponse.body.ride._id || requestResponse.body.ride.id;
      expect(requestResponse.body.ride.status).toBe('requested');

      // Step 2: Driver accepts the ride
      const acceptResponse = await request(app)
        .post(`/api/rides/${rideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(acceptResponse.body.ride.status).toBe('accepted');
      const driverId = acceptResponse.body.ride.driver._id || acceptResponse.body.ride.driver;
      expect(driverId.toString()).toBe(driver._id.toString());

      // Verify driver is no longer available
      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.driverProfile.isAvailable).toBe(false);

      // Step 3: Driver arrives at pickup location
      const arriveResponse = await request(app)
        .post(`/api/rides/${rideId}/arrive`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(arriveResponse.body.ride.status).toBe('arrived');

      // Step 4: Driver starts the ride
      const startResponse = await request(app)
        .post(`/api/rides/${rideId}/start`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(startResponse.body.ride.status).toBe('started');

      // Step 5: Driver completes the ride
      const completeResponse = await request(app)
        .post(`/api/rides/${rideId}/complete`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(completeResponse.body.ride.status).toBe('completed');

      // Verify driver is available again
      const finalDriver = await User.findById(driver._id);
      expect(finalDriver.driverProfile.isAvailable).toBe(true);
      expect(finalDriver.driverProfile.totalRides).toBe(1);

      // Verify passenger stats updated
      const finalPassenger = await User.findById(passenger._id);
      expect(finalPassenger.passengerProfile.totalRides).toBe(1);
    });

    it('should handle ride cancellation flow', async () => {
      // Set driver online via API to ensure proper initialization
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ isOnline: true, isAvailable: true })
        .expect(200);

      // Step 1: Passenger requests a ride
      const rideRequestData = {
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

      const requestResponse = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideRequestData)
        .expect(201);

      const rideId = requestResponse.body.ride._id || requestResponse.body.ride.id;

      // Step 2: Driver accepts the ride
      await request(app)
        .post(`/api/rides/${rideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      // Step 3: Passenger cancels the ride
      const cancelResponse = await request(app)
        .post(`/api/rides/${rideId}/cancel`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ reason: 'Change of plans' })
        .expect(200);

      expect(cancelResponse.body.ride.status).toBe('cancelled');
      expect(cancelResponse.body.ride.cancellationReason).toBe('Change of plans');

      // Verify driver is available again
      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.driverProfile.isAvailable).toBe(true);
    });

    it('should handle driver cancellation flow', async () => {
      // Set driver online via API to ensure proper initialization
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ isOnline: true, isAvailable: true })
        .expect(200);

      // Step 1: Passenger requests a ride
      const rideRequestData = {
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

      const requestResponse = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideRequestData)
        .expect(201);

      const rideId = requestResponse.body.ride._id || requestResponse.body.ride.id;

      // Step 2: Driver accepts the ride
      await request(app)
        .post(`/api/rides/${rideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      // Step 3: Driver cancels the ride
      const cancelResponse = await request(app)
        .post(`/api/rides/${rideId}/cancel`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ reason: 'Emergency' })
        .expect(200);

      expect(cancelResponse.body.ride.status).toBe('cancelled');
      expect(cancelResponse.body.ride.cancellationReason).toBe('Emergency');

      // Verify driver is available again
      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.driverProfile.isAvailable).toBe(true);
    });
  });

  describe('Rating System Integration', () => {
    let completedRide;

    beforeEach(async () => {
      // Create a completed ride
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
          method: 'card',
          status: 'completed'
        },
        timeline: {
          requestedAt: new Date(),
          acceptedAt: new Date(),
          arrivedAt: new Date(),
          startedAt: new Date(),
          completedAt: new Date()
        }
      });
      await completedRide.save();

      // Update user stats
      driver.driverProfile.totalRides = 1;
      await driver.save();
      passenger.passengerProfile.totalRides = 1;
      await passenger.save();
    });

    it('should handle passenger rating driver', async () => {
      const ratingData = {
        rideId: completedRide._id,
        rating: 5,
        review: 'Excellent driver!'
      };

      const response = await request(app)
        .post('/api/users/rating')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(ratingData)
        .expect(200);

      expect(response.body.message).toBe('Rating submitted successfully');

      // Verify rating was saved
      const updatedRide = await Ride.findById(completedRide._id);
      expect(updatedRide.rating.passengerRating).toBe(5);
      expect(updatedRide.rating.passengerReview).toBe('Excellent driver!');

      // Verify driver's overall rating was updated
      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.driverProfile.rating).toBe(5);
    });

    it('should handle driver rating passenger', async () => {
      const ratingData = {
        rideId: completedRide._id,
        rating: 4,
        review: 'Good passenger'
      };

      const response = await request(app)
        .post('/api/users/rating')
        .set('Authorization', `Bearer ${driverToken}`)
        .send(ratingData)
        .expect(200);

      expect(response.body.message).toBe('Rating submitted successfully');

      // Verify rating was saved
      const updatedRide = await Ride.findById(completedRide._id);
      expect(updatedRide.rating.driverRating).toBe(4);
      expect(updatedRide.rating.driverReview).toBe('Good passenger');

      // Verify passenger's overall rating was updated
      const updatedPassenger = await User.findById(passenger._id);
      expect(updatedPassenger.passengerProfile.rating).toBe(4);
    });

    it('should calculate average rating correctly', async () => {
      // Create another completed ride
      const secondRide = new Ride({
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
          method: 'card',
          status: 'completed'
        },
        timeline: {
          requestedAt: new Date(),
          acceptedAt: new Date(),
          arrivedAt: new Date(),
          startedAt: new Date(),
          completedAt: new Date()
        }
      });
      await secondRide.save();

      // Update driver stats
      driver.driverProfile.totalRides = 2;
      await driver.save();

      // Rate first ride
      await request(app)
        .post('/api/users/rating')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId: completedRide._id,
          rating: 5,
          review: 'Excellent driver!'
        })
        .expect(200);

      // Rate second ride
      await request(app)
        .post('/api/users/rating')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          rideId: secondRide._id,
          rating: 3,
          review: 'Average driver'
        })
        .expect(200);

      // Verify average rating
      const updatedDriver = await User.findById(driver._id);
      expect(updatedDriver.driverProfile.rating).toBe(4); // (5 + 3) / 2
    });
  });

  describe('Driver Status Management', () => {
    it('should handle driver going online/offline', async () => {
      // Driver goes offline
      const offlineResponse = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ isOnline: false })
        .expect(200);

      expect(offlineResponse.body.status.isOnline).toBe(false);
      expect(offlineResponse.body.status.isAvailable).toBe(false);

      // Driver goes online
      const onlineResponse = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ isOnline: true, isAvailable: true })
        .expect(200);

      expect(onlineResponse.body.status.isOnline).toBe(true);
      expect(onlineResponse.body.status.isAvailable).toBe(true);
    });

    it('should handle driver availability toggle', async () => {
      // Driver becomes unavailable
      const unavailableResponse = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ isOnline: true, isAvailable: false })
        .expect(200);

      expect(unavailableResponse.body.status.isAvailable).toBe(false);

      // Driver becomes available
      const availableResponse = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ isOnline: true, isAvailable: true })
        .expect(200);

      expect(availableResponse.body.status.isAvailable).toBe(true);
    });
  });

  describe('Location Updates', () => {
    it('should handle user location updates', async () => {
      const newLocation = {
        coordinates: [-122.4000, 37.8000],
        address: 'New Location, CA'
      };

      const response = await request(app)
        .put('/api/users/location')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(newLocation)
        .expect(200);

      expect(response.body.message).toBe('Location updated successfully');
      expect(response.body.location.coordinates).toEqual(newLocation.coordinates);
      expect(response.body.location.address).toBe(newLocation.address);

      // Verify location was saved
      const updatedUser = await User.findById(passenger._id);
      expect(updatedUser.currentLocation.coordinates).toEqual(newLocation.coordinates);
      expect(updatedUser.currentLocation.address).toBe(newLocation.address);
    });
  });
});
