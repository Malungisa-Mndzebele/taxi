const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../test-server');
const User = require('../../models/User');
const Ride = require('../../models/Ride');

describe('Driver Routes', () => {
  let driverToken;
  let driverId;
  let passengerToken;

  beforeEach(async () => {
    // Create and login a driver
    const driverData = {
      firstName: 'John',
      lastName: 'Driver',
      email: 'driver@test.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'driver'
    };

    const driverRes = await request(app)
      .post('/api/auth/register')
      .send(driverData);

    driverToken = driverRes.body.token;
    driverId = driverRes.body.user._id;

    // Create a passenger for testing
    const passengerData = {
      firstName: 'Jane',
      lastName: 'Passenger',
      email: 'passenger@test.com',
      phone: '+0987654321',
      password: 'password123',
      role: 'passenger'
    };

    const passengerRes = await request(app)
      .post('/api/auth/register')
      .send(passengerData);

    passengerToken = passengerRes.body.token;
  });

  describe('GET /api/drivers/status', () => {
    it('should get driver status', async () => {
      const response = await request(app)
        .get('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.status).toBeDefined();
      expect(response.body.isOnline).toBeDefined();
      expect(response.body.isAvailable).toBeDefined();
    });

    it('should reject request without auth token', async () => {
      await request(app)
        .get('/api/drivers/status')
        .expect(401);
    });

    it('should reject request from non-driver', async () => {
      await request(app)
        .get('/api/drivers/status')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/drivers/status', () => {
    it('should update driver status to online', async () => {
      const response = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'online' })
        .expect(200);

      expect(response.body.status).toBe('online');
      expect(response.body.message).toContain('online');
    });

    it('should update driver status to offline', async () => {
      const response = await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'offline' })
        .expect(200);

      expect(response.body.status).toBe('offline');
    });

    it('should reject invalid status', async () => {
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'invalid' })
        .expect(400);
    });

    it('should reject request without status', async () => {
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('PUT /api/drivers/location', () => {
    it('should update driver location', async () => {
      const response = await request(app)
        .put('/api/drivers/location')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco, CA'
        })
        .expect(200);

      expect(response.body.message).toContain('Location updated successfully');
      expect(response.body.location).toBeDefined();
      expect(response.body.location.coordinates).toEqual([-122.4194, 37.7749]);
    });

    it('should reject invalid coordinates', async () => {
      await request(app)
        .put('/api/drivers/location')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          coordinates: [-200, 100] // Invalid: out of range
        })
        .expect(400);
    });

    it('should reject missing coordinates', async () => {
      await request(app)
        .put('/api/drivers/location')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({})
        .expect(400);
    });

    it('should reject coordinates with wrong array length', async () => {
      await request(app)
        .put('/api/drivers/location')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          coordinates: [-122.4194] // Only one coordinate
        })
        .expect(400);
    });
  });

  describe('GET /api/drivers/available', () => {
    beforeEach(async () => {
      // Set driver online and update location
      await request(app)
        .put('/api/drivers/status')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({ status: 'online' });

      await request(app)
        .put('/api/drivers/location')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          coordinates: [-122.4194, 37.7749]
        });
    });

    it('should get available drivers near a location', async () => {
      const response = await request(app)
        .get('/api/drivers/available')
        .set('Authorization', `Bearer ${passengerToken}`)
        .query({
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 10000
        })
        .expect(200);

      expect(response.body.message).toBeDefined();
      expect(response.body.drivers).toBeDefined();
      expect(Array.isArray(response.body.drivers)).toBe(true);
    });

    it('should reject request without coordinates', async () => {
      await request(app)
        .get('/api/drivers/available')
        .set('Authorization', `Bearer ${passengerToken}`)
        .expect(400);
    });

    it('should reject request with invalid coordinates', async () => {
      const response = await request(app)
        .get('/api/drivers/available')
        .set('Authorization', `Bearer ${passengerToken}`)
        .query({
          latitude: 'invalid',
          longitude: -122.4194
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid');
    });
  });

  describe('GET /api/drivers/rides', () => {
    it('should get driver ride history', async () => {
      const response = await request(app)
        .get('/api/drivers/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.message).toBeDefined();
      expect(response.body.rides).toBeDefined();
      expect(Array.isArray(response.body.rides)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter rides by status', async () => {
      const response = await request(app)
        .get('/api/drivers/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .query({ status: 'completed' })
        .expect(200);

      expect(response.body.rides).toBeDefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/drivers/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/drivers/earnings', () => {
    it('should get driver earnings summary', async () => {
      const response = await request(app)
        .get('/api/drivers/earnings')
        .set('Authorization', `Bearer ${driverToken}`)
        .expect(200);

      expect(response.body.message).toBeDefined();
      expect(response.body.earnings).toBeDefined();
      expect(response.body.earnings.total).toBeDefined();
      expect(response.body.earnings.totalRides).toBeDefined();
      expect(response.body.earnings.averagePerRide).toBeDefined();
    });

    it('should filter earnings by date range', async () => {
      const response = await request(app)
        .get('/api/drivers/earnings')
        .set('Authorization', `Bearer ${driverToken}`)
        .query({
          startDate: '2025-01-01',
          endDate: '2025-12-31'
        })
        .expect(200);

      expect(response.body.earnings).toBeDefined();
    });
  });

  describe('PUT /api/drivers/profile', () => {
    it('should update driver profile', async () => {
      const response = await request(app)
        .put('/api/drivers/profile')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          licenseNumber: 'DL123456',
          vehicleInfo: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'White',
            plateNumber: 'ABC-123'
          }
        })
        .expect(200);

      expect(response.body.message).toContain('updated successfully');
      expect(response.body.driver).toBeDefined();
      expect(response.body.driver.driverProfile).toBeDefined();
    });

    it('should update only license number', async () => {
      const response = await request(app)
        .put('/api/drivers/profile')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          licenseNumber: 'DL789012'
        })
        .expect(200);

      expect(response.body.driver.driverProfile).toBeDefined();
    });

    it('should update only vehicle info', async () => {
      const response = await request(app)
        .put('/api/drivers/profile')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          vehicleInfo: {
            make: 'Honda',
            model: 'Accord'
          }
        })
        .expect(200);

      expect(response.body.driver.driverProfile).toBeDefined();
    });

    it('should reject invalid year', async () => {
      await request(app)
        .put('/api/drivers/profile')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          vehicleInfo: {
            year: 1800 // Invalid year
          }
        })
        .expect(400);
    });
  });
});
