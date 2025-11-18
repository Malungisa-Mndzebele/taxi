const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../test-server');
const User = require('../../models/User');
const Ride = require('../../models/Ride');

describe('Authentication End-to-End Integration Tests', () => {
  let passengerToken;
  let driverToken;
  let passengerId;
  let driverId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Ride.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Complete Authentication Flow', () => {
    it('should register, login, and access protected routes as passenger', async () => {
      // Step 1: Register as passenger
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'passenger@test.com',
          phone: '+1234567890',
          password: 'password123',
          role: 'passenger'
        });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.token).toBeDefined();
      expect(registerRes.body.user.role).toBe('passenger');
      
      passengerToken = registerRes.body.token;
      passengerId = registerRes.body.user.id;

      // Step 2: Access /api/auth/me with token
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe('passenger@test.com');
      expect(meRes.body.user.role).toBe('passenger');

      // Step 3: Update profile via /api/users/profile
      const updateRes = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          firstName: 'Jane',
          profilePicture: 'https://example.com/pic.jpg'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.user.firstName).toBe('Jane');

      // Step 4: Request a ride via /api/rides/request
      const rideRes = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          pickupLocation: {
            coordinates: [-73.935242, 40.730610],
            address: '123 Main St'
          },
          dropoffLocation: {
            coordinates: [-73.985428, 40.748817],
            address: '456 Park Ave'
          },
          distance: 5.2,
          estimatedDuration: 15
        });

      expect(rideRes.status).toBe(201);
      expect(rideRes.body.ride.passenger).toBeDefined();
      expect(rideRes.body.ride.status).toBe('requested');
    });

    it('should register, login, and access protected routes as driver', async () => {
      // Step 1: Register as driver
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Bob',
          lastName: 'Driver',
          email: 'driver@test.com',
          phone: '+1234567891',
          password: 'password123',
          role: 'driver'
        });

      expect(registerRes.status).toBe(201);
      expect(registerRes.body.token).toBeDefined();
      expect(registerRes.body.user.role).toBe('driver');
      expect(registerRes.body.user.isDriver).toBe(true);
      
      driverToken = registerRes.body.token;
      driverId = registerRes.body.user.id;

      // Step 2: Access /api/auth/me with token
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe('driver@test.com');
      expect(meRes.body.user.role).toBe('driver');

      // Step 3: Update driver status via /api/drivers/status
      const statusRes = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          isOnline: true,
          isAvailable: true
        });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.status.isOnline).toBe(true);

      // Step 4: Get available rides via /api/rides/available
      const ridesRes = await request(app)
        .get('/api/rides/available')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(ridesRes.status).toBe(200);
      expect(ridesRes.body.rides).toBeDefined();
    });

    it('should enforce role-based access control', async () => {
      // Register passenger
      const passengerRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Passenger',
          email: 'passenger2@test.com',
          phone: '+1234567892',
          password: 'password123',
          role: 'passenger'
        });

      passengerToken = passengerRes.body.token;

      // Try to access driver-only endpoint
      const driverStatusRes = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          isOnline: true
        });

      expect(driverStatusRes.status).toBe(403);
      expect(driverStatusRes.body.message).toContain('Insufficient permissions');

      // Try to access driver-only rides endpoint
      const availableRidesRes = await request(app)
        .get('/api/rides/available')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(availableRidesRes.status).toBe(403);
    });

    it('should reject requests without authentication token', async () => {
      // Try to access /api/auth/me without token
      const meRes = await request(app)
        .get('/api/auth/me');

      expect(meRes.status).toBe(401);
      expect(meRes.body.message).toContain('No token');

      // Try to update profile without token
      const profileRes = await request(app)
        .put('/api/users/profile')
        .send({ firstName: 'Test' });

      expect(profileRes.status).toBe(401);

      // Try to request ride without token
      const rideRes = await request(app)
        .post('/api/rides/request')
        .send({
          pickupLocation: {
            coordinates: [-73.935242, 40.730610],
            address: '123 Main St'
          },
          dropoffLocation: {
            coordinates: [-73.985428, 40.748817],
            address: '456 Park Ave'
          },
          distance: 5.2,
          estimatedDuration: 15
        });

      expect(rideRes.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      // Try to access /api/auth/me with invalid token
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(meRes.status).toBe(401);
      expect(meRes.body.message).toContain('Token is not valid');

      // Try to update profile with invalid token
      const profileRes = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ firstName: 'Test' });

      expect(profileRes.status).toBe(401);
    });

    it('should handle complete ride flow with authentication', async () => {
      // Register passenger
      const passengerRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Alice',
          lastName: 'Passenger',
          email: 'alice@test.com',
          phone: '+1234567893',
          password: 'password123',
          role: 'passenger'
        });

      passengerToken = passengerRes.body.token;

      // Register driver
      const driverRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Charlie',
          lastName: 'Driver',
          email: 'charlie@test.com',
          phone: '+1234567894',
          password: 'password123',
          role: 'driver'
        });

      driverToken = driverRes.body.token;

      // Set driver online
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          isOnline: true,
          isAvailable: true
        });

      // Passenger requests ride
      const rideRes = await request(app)
        .post('/api/rides/request')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          pickupLocation: {
            coordinates: [-73.935242, 40.730610],
            address: '123 Main St'
          },
          dropoffLocation: {
            coordinates: [-73.985428, 40.748817],
            address: '456 Park Ave'
          },
          distance: 5.2,
          estimatedDuration: 15
        });

      expect(rideRes.status).toBe(201);
      const rideId = rideRes.body.ride.id;

      // Driver accepts ride
      const acceptRes = await request(app)
        .post(`/api/rides/${rideId}/accept`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.ride.status).toBe('accepted');

      // Passenger views ride details
      const rideDetailsRes = await request(app)
        .get(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(rideDetailsRes.status).toBe(200);
      expect(rideDetailsRes.body.ride.status).toBe('accepted');

      // Driver views active rides
      const activeRidesRes = await request(app)
        .get('/api/rides/active')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(activeRidesRes.status).toBe(200);
      expect(activeRidesRes.body.rides.length).toBeGreaterThan(0);
    });

    it('should maintain JWT token consistency across all endpoints', async () => {
      // Register user
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          phone: '+1234567895',
          password: 'password123',
          role: 'passenger'
        });

      const token = registerRes.body.token;

      // Verify token works on auth endpoints
      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(meRes.status).toBe(200);

      // Verify token works on user endpoints
      const profileRes = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Updated' });
      expect(profileRes.status).toBe(200);

      // Verify token works on ride endpoints
      const activeRidesRes = await request(app)
        .get('/api/rides/active')
        .set('Authorization', `Bearer ${token}`);
      expect(activeRidesRes.status).toBe(200);

      // Login and verify new token also works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      const newToken = loginRes.body.token;

      // Verify new token works across all endpoints
      const meRes2 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${newToken}`);
      expect(meRes2.status).toBe(200);

      const profileRes2 = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${newToken}`)
        .send({ firstName: 'Updated Again' });
      expect(profileRes2.status).toBe(200);
    });
  });
});
