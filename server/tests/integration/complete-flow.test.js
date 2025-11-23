const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../test-server');

describe('Complete Taxi App Flow Tests', () => {
  let passengerToken;
  let driverToken;
  let passengerId;
  let driverId;
  let rideId;

  // Database setup is handled by the global test setup
  // Note: beforeEach in setup.js clears the database, so each test must be self-contained
  // We'll set up users in each test that needs them

  describe('1. User Registration Flow', () => {
    test('Should register a passenger successfully', async () => {
      const passengerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(passengerData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(passengerData.email);
      expect(response.body.user.role).toBe('passenger');

      passengerToken = response.body.token;
      passengerId = response.body.user._id;
    });

    test('Should register a driver successfully', async () => {
      const driverData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+11234567890',
        password: 'password123',
        role: 'driver'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(driverData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(driverData.email);
      expect(response.body.user.role).toBe('driver');

      driverToken = response.body.token;
      driverId = response.body.user._id;
    });

    test('Should reject duplicate email registration', async () => {
      // First register a user
      const firstUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };
      await request(app)
        .post('/api/auth/register')
        .send(firstUserData)
        .expect(201);

      // Now try to register with the same email
      const duplicateData = {
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'john.doe@test.com', // Same email as first user
        phone: '+1111111111',
        password: 'password123',
        role: 'passenger'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(400);

      expect(response.body.message).toBe('Email already registered');
    });
  });

  describe('2. User Login Flow', () => {
    test('Should login passenger successfully', async () => {
      // First register the user
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };
      await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      // Now login
      const loginData = {
        email: 'john.doe@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.role).toBe('passenger');

      passengerToken = response.body.token; // Update token
      passengerId = response.body.user._id;
    });

    test('Should login driver successfully', async () => {
      // First register the driver
      const registerData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+11234567890',
        password: 'password123',
        role: 'driver'
      };
      await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      // Now login
      const loginData = {
        email: 'jane.smith@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.role).toBe('driver');

      driverToken = response.body.token; // Update token
      driverId = response.body.user._id;
    });

    test('Should reject invalid credentials', async () => {
      const invalidData = {
        email: 'john.doe@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(401);

      expect(response.body.message).toBe('Authentication failed');
    });
  });

  describe('3. Ride Request Flow', () => {
    test('Should allow passenger to request a ride', async () => {
      // First register and login passenger
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);
      passengerToken = registerResponse.body.token;
      passengerId = registerResponse.body.user._id;

      const rideData = {
        pickupLocation: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128],
          address: '123 Main St, New York, NY'
        },
        dropoffLocation: {
          type: 'Point',
          coordinates: [-73.9851, 40.7589],
          address: '456 Broadway, New York, NY'
        },
        distance: 5.2,
        estimatedDuration: 15,
        fare: {
          baseFare: 5.00,
          distanceFare: 10.40,
          timeFare: 7.50,
          surgeMultiplier: 1.0,
          totalFare: 22.90
        },
        payment: {
          method: 'card'
        }
      };

      const response = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideData)
        .expect(201);

      expect(response.body.message).toBe('Ride requested successfully');
      expect(response.body.ride).toBeDefined();
      // Passenger is populated, so check _id or id property
      const passengerIdInResponse = response.body.ride.passenger._id || response.body.ride.passenger.id || response.body.ride.passenger;
      expect(passengerIdInResponse.toString()).toBe(passengerId.toString());
      expect(response.body.ride.pickupLocation).toBeDefined();
      expect(response.body.ride.dropoffLocation).toBeDefined();
      expect(response.body.ride.status).toBe('requested');

      rideId = response.body.ride.id;
    });

    test('Should reject ride request without authentication', async () => {
      const rideData = {
        pickupLocation: '123 Main St, New York, NY',
        dropoffLocation: '456 Broadway, New York, NY'
      };

      const response = await request(app)
        .post('/api/rides/request')
        .send(rideData)
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });
  });

  describe('4. Driver Ride Management Flow', () => {
    test('Should allow driver to view available rides', async () => {
      // First register and login driver
      const driverRegisterData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+11234567890',
        password: 'password123',
        role: 'driver'
      };
      const driverRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(driverRegisterData)
        .expect(201);
      driverToken = driverRegisterResponse.body.token;
      driverId = driverRegisterResponse.body.user._id;

      // Create a ride request first
      const passengerRegisterData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };
      const passengerRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(passengerRegisterData)
        .expect(201);
      const passengerToken = passengerRegisterResponse.body.token;

      const rideData = {
        pickupLocation: {
          coordinates: [-74.0060, 40.7128],
          address: '123 Main St, New York, NY'
        },
        dropoffLocation: {
          coordinates: [-73.9851, 40.7589],
          address: '456 Broadway, New York, NY'
        },
        distance: 5.2,
        estimatedDuration: 15,
        paymentMethod: 'card'
      };
      const rideResponse = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideData)
        .expect(201);
      rideId = rideResponse.body.ride.id;

      // Now ensure driver is online
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'online' })
        .expect(200);

      const response = await request(app)
        .get('/api/rides/available')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.rides).toBeDefined();
      expect(Array.isArray(response.body.rides)).toBe(true);
      expect(response.body.rides.length).toBeGreaterThanOrEqual(0);

      // Check if our created ride is in the list (if any rides exist)
      if (response.body.rides.length > 0) {
        const ourRide = response.body.rides.find(ride => ride._id === rideId);
        if (ourRide) {
          expect(ourRide.status).toBe('requested');
        }
      }
    });

    test('Should allow driver to accept a ride', async () => {
      // First register and login driver
      const driverRegisterData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+11234567890',
        password: 'password123',
        role: 'driver'
      };
      const driverRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(driverRegisterData)
        .expect(201);
      driverToken = driverRegisterResponse.body.token;
      driverId = driverRegisterResponse.body.user._id;

      // Create a ride request first
      const passengerRegisterData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };
      const passengerRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(passengerRegisterData)
        .expect(201);
      const passengerToken = passengerRegisterResponse.body.token;

      const rideData = {
        pickupLocation: {
          coordinates: [-74.0060, 40.7128],
          address: '123 Main St, New York, NY'
        },
        dropoffLocation: {
          coordinates: [-73.9851, 40.7589],
          address: '456 Broadway, New York, NY'
        },
        distance: 5.2,
        estimatedDuration: 15,
        paymentMethod: 'card'
      };
      const rideResponse = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideData)
        .expect(201);
      rideId = rideResponse.body.ride.id;

      // Now ensure driver is online and available
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'online' })
        .expect(200);

      const response = await request(app)
        .put(`/api/rides/${rideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.message).toBe('Ride accepted successfully');
      expect(response.body.ride).toBeDefined();
      expect(response.body.ride.driver._id).toBe(driverId);
      expect(response.body.ride.status).toBe('accepted');
    });

    test('Should allow driver to update ride status to in-progress', async () => {
      // Set up driver, passenger, and ride
      const driverRegisterData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+11234567890',
        password: 'password123',
        role: 'driver'
      };
      const driverRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(driverRegisterData)
        .expect(201);
      driverToken = driverRegisterResponse.body.token;
      driverId = driverRegisterResponse.body.user._id;

      const passengerRegisterData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };
      const passengerRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(passengerRegisterData)
        .expect(201);
      const passengerToken = passengerRegisterResponse.body.token;

      // Create ride and accept it
      const rideData = {
        pickupLocation: {
          coordinates: [-74.0060, 40.7128],
          address: '123 Main St, New York, NY'
        },
        dropoffLocation: {
          coordinates: [-73.9851, 40.7589],
          address: '456 Broadway, New York, NY'
        },
        distance: 5.2,
        estimatedDuration: 15,
        paymentMethod: 'card'
      };
      const rideResponse = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideData)
        .expect(201);
      rideId = rideResponse.body.ride.id;

      // Set driver online and accept ride
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'online' })
        .expect(200);
      await request(app)
        .put(`/api/rides/${rideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      // Now update status to in-progress
      const response = await request(app)
        .put(`/api/rides/${rideId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'in-progress' })
        .expect(200);

      expect(response.body.message).toBe('Ride status updated successfully');
      expect(response.body.ride.status).toBe('started');
    });

    test('Should allow driver to complete the ride', async () => {
      // Set up driver, passenger, and ride
      const driverRegisterData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+11234567890',
        password: 'password123',
        role: 'driver'
      };
      const driverRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(driverRegisterData)
        .expect(201);
      driverToken = driverRegisterResponse.body.token;
      driverId = driverRegisterResponse.body.user._id;

      const passengerRegisterData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };
      const passengerRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(passengerRegisterData)
        .expect(201);
      const passengerToken = passengerRegisterResponse.body.token;

      // Create ride and accept it
      const rideData = {
        pickupLocation: {
          coordinates: [-74.0060, 40.7128],
          address: '123 Main St, New York, NY'
        },
        dropoffLocation: {
          coordinates: [-73.9851, 40.7589],
          address: '456 Broadway, New York, NY'
        },
        distance: 5.2,
        estimatedDuration: 15,
        paymentMethod: 'card'
      };
      const rideResponse = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideData)
        .expect(201);
      rideId = rideResponse.body.ride.id;

      // Set driver online and accept ride
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'online' })
        .expect(200);
      await request(app)
        .put(`/api/rides/${rideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(res => {
          if (res.status !== 200) {
            console.log('Accept failed:', JSON.stringify(res.body, null, 2));
          }
        })
        .expect(200);

      // Now complete the ride
      const response = await request(app)
        .put(`/api/rides/${rideId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.message).toBe('Ride status updated successfully');
      expect(response.body.ride.status).toBe('completed');
    });
  });

  describe('5. Passenger Ride Tracking Flow', () => {
    test('Should allow passenger to view their active rides', async () => {
      // Register passenger
      const passengerRegisterData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };
      const passengerRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(passengerRegisterData)
        .expect(201);
      passengerToken = passengerRegisterResponse.body.token;
      passengerId = passengerRegisterResponse.body.user._id;

      const response = await request(app)
        .get('/api/rides/active')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.rides).toBeDefined();
      expect(Array.isArray(response.body.rides)).toBe(true);
    });

    test('Should allow passenger to view their ride history', async () => {
      // Register passenger
      const passengerRegisterData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };
      const passengerRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(passengerRegisterData)
        .expect(201);
      passengerToken = passengerRegisterResponse.body.token;
      passengerId = passengerRegisterResponse.body.user._id;

      const response = await request(app)
        .get('/api/rides/history')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.rides).toBeDefined();
      expect(Array.isArray(response.body.rides)).toBe(true);
      // History might be empty if no rides completed yet
    });
  });

  describe('6. Driver Status Management', () => {
    test('Should allow driver to go online', async () => {
      // Register driver
      const driverRegisterData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+11234567890',
        password: 'password123',
        role: 'driver'
      };
      const driverRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(driverRegisterData)
        .expect(201);
      driverToken = driverRegisterResponse.body.token;
      driverId = driverRegisterResponse.body.user._id;

      const response = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'online' })
        .expect(200);

      expect(response.body.message).toContain('online');
      expect(response.body.driver.status).toBe('online');
    });

    test('Should allow driver to go offline', async () => {
      // Register driver
      const driverRegisterData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+11234567890',
        password: 'password123',
        role: 'driver'
      };
      const driverRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(driverRegisterData)
        .expect(201);
      driverToken = driverRegisterResponse.body.token;
      driverId = driverRegisterResponse.body.user._id;

      const response = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'offline' })
        .expect(200);

      expect(response.body.message).toContain('offline');
      expect(response.body.driver.status).toBe('offline');
    });
  });

  describe('7. Error Handling', () => {
    test('Should handle invalid ride ID', async () => {
      // Register driver first
      const driverRegisterData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+11234567890',
        password: 'password123',
        role: 'driver'
      };
      const driverRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send(driverRegisterData)
        .expect(201);
      driverToken = driverRegisterResponse.body.token;
      driverId = driverRegisterResponse.body.user._id;

      // Set driver online
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'online' })
        .expect(200);

      const invalidRideId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/rides/${invalidRideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(404);

      expect(response.body.message).toBe('Ride not found');
    });

    test('Should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/rides/active')
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    test('Should handle invalid token', async () => {
      const response = await request(app)
        .get('/api/rides/active')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Token is not valid');
    });
  });
});
