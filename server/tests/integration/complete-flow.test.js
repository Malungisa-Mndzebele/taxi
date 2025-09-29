const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');

describe('Complete Taxi App Flow Tests', () => {
  let passengerToken;
  let driverToken;
  let passengerId;
  let driverId;
  let rideId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taxi-app-test');
    }
  });

  afterAll(async () => {
    // Clean up test data
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    await mongoose.disconnect();
  });

  describe('1. User Registration Flow', () => {
    test('Should register a passenger successfully', async () => {
      const passengerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '1234567890',
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
        phone: '0987654321',
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
      const duplicateData = {
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'john.doe@test.com', // Same email as passenger
        phone: '1111111111',
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
    });

    test('Should login driver successfully', async () => {
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

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('3. Ride Request Flow', () => {
    test('Should allow passenger to request a ride', async () => {
      const rideData = {
        pickupLocation: '123 Main St, New York, NY',
        dropoffLocation: '456 Broadway, New York, NY',
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        dropoffLat: 40.7589,
        dropoffLng: -73.9851
      };

      const response = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send(rideData)
        .expect(201);

      expect(response.body.message).toBe('Ride requested successfully');
      expect(response.body.ride).toBeDefined();
      expect(response.body.ride.passenger).toBe(passengerId);
      expect(response.body.ride.pickupLocation).toBe(rideData.pickupLocation);
      expect(response.body.ride.dropoffLocation).toBe(rideData.dropoffLocation);
      expect(response.body.ride.status).toBe('pending');

      rideId = response.body.ride._id;
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

      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('4. Driver Ride Management Flow', () => {
    test('Should allow driver to view available rides', async () => {
      const response = await request(app)
        .get('/api/rides/available')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.rides).toBeDefined();
      expect(Array.isArray(response.body.rides)).toBe(true);
      expect(response.body.rides.length).toBeGreaterThan(0);
      
      // Check if our created ride is in the list
      const ourRide = response.body.rides.find(ride => ride._id === rideId);
      expect(ourRide).toBeDefined();
      expect(ourRide.status).toBe('pending');
    });

    test('Should allow driver to accept a ride', async () => {
      const response = await request(app)
        .put(`/api/rides/${rideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.message).toBe('Ride accepted successfully');
      expect(response.body.ride).toBeDefined();
      expect(response.body.ride.driver).toBe(driverId);
      expect(response.body.ride.status).toBe('accepted');
    });

    test('Should allow driver to update ride status to in-progress', async () => {
      const response = await request(app)
        .put(`/api/rides/${rideId}/status`)
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'in-progress' })
        .expect(200);

      expect(response.body.message).toBe('Ride status updated successfully');
      expect(response.body.ride.status).toBe('in-progress');
    });

    test('Should allow driver to complete the ride', async () => {
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
      const response = await request(app)
        .get('/api/rides/active')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.rides).toBeDefined();
      expect(Array.isArray(response.body.rides)).toBe(true);
    });

    test('Should allow passenger to view their ride history', async () => {
      const response = await request(app)
        .get('/api/rides/history')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(200);

      expect(response.body.rides).toBeDefined();
      expect(Array.isArray(response.body.rides)).toBe(true);
      expect(response.body.rides.length).toBeGreaterThan(0);
      
      // Check if our completed ride is in the history
      const ourRide = response.body.rides.find(ride => ride._id === rideId);
      expect(ourRide).toBeDefined();
      expect(ourRide.status).toBe('completed');
    });
  });

  describe('6. Driver Status Management', () => {
    test('Should allow driver to go online', async () => {
      const response = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'online' })
        .expect(200);

      expect(response.body.message).toBe('Driver status updated successfully');
      expect(response.body.driver.status).toBe('online');
    });

    test('Should allow driver to go offline', async () => {
      const response = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'offline' })
        .expect(200);

      expect(response.body.message).toBe('Driver status updated successfully');
      expect(response.body.driver.status).toBe('offline');
    });
  });

  describe('7. Error Handling', () => {
    test('Should handle invalid ride ID', async () => {
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

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('Should handle invalid token', async () => {
      const response = await request(app)
        .get('/api/rides/active')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Invalid token');
    });
  });
});
