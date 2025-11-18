const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../test-server');
const User = require('../../models/User');

describe('User Routes', () => {
  let userToken;
  let userId;
  let user;

  beforeEach(async () => {
    // Create and login a user
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'passenger'
    };

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(userData);

    userToken = registerRes.body.token;
    userId = registerRes.body.user._id;
    user = await User.findById(userId);
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Jane',
          lastName: 'Smith'
        })
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.firstName).toBe('Jane');
      expect(response.body.user.lastName).toBe('Smith');
    });

    it('should update only first name', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'UpdatedName'
        })
        .expect(200);

      expect(response.body.user.firstName).toBe('UpdatedName');
      expect(response.body.user.lastName).toBe('Doe'); // Original value
    });

    it('should update phone number', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phone: '+9876543210'
        })
        .expect(200);

      expect(response.body.user.phone).toBe('+9876543210');
    });

    it('should reject duplicate phone number', async () => {
      // Create another user
      const anotherUser = {
        firstName: 'Another',
        lastName: 'User',
        email: 'another@test.com',
        phone: '+1111111111',
        password: 'password123',
        role: 'passenger'
      };

      await request(app)
        .post('/api/auth/register')
        .send(anotherUser);

      // Try to update to existing phone
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phone: '+1111111111'
        })
        .expect(400);

      expect(response.body.message).toBe('Phone number already in use');
    });

    it('should reject invalid first name', async () => {
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'J' // Too short
        })
        .expect(400);
    });

    it('should reject invalid phone format', async () => {
      await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phone: 'invalid-phone'
        })
        .expect(400);
    });

    it('should reject request without auth token', async () => {
      await request(app)
        .put('/api/users/profile')
        .send({
          firstName: 'Test'
        })
        .expect(401);
    });

    it('should not return password in response', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Test'
        })
        .expect(200);

      expect(response.body.user.password).toBeUndefined();
    });

    it('should update email successfully', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'newemail@test.com'
        })
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.email).toBe('newemail@test.com');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should reject duplicate email', async () => {
      // Create another user
      const anotherUser = {
        firstName: 'Another',
        lastName: 'User',
        email: 'another@test.com',
        phone: '+1111111111',
        password: 'password123',
        role: 'passenger'
      };

      await request(app)
        .post('/api/auth/register')
        .send(anotherUser);

      // Try to update to existing email
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'another@test.com'
        })
        .expect(400);

      expect(response.body.message).toBe('Email already in use');
    });

    it('should update multiple fields at once', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
          phone: '+9999999999'
        })
        .expect(200);

      expect(response.body.user.firstName).toBe('UpdatedFirst');
      expect(response.body.user.lastName).toBe('UpdatedLast');
      expect(response.body.user.phone).toBe('+9999999999');
    });
  });

  describe('PUT /api/users/location', () => {
    it('should update user location successfully', async () => {
      const response = await request(app)
        .put('/api/users/location')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          latitude: 37.7749,
          longitude: -122.4194
        })
        .expect(200);

      expect(response.body.message).toBe('Location updated successfully');
      expect(response.body.location.coordinates).toEqual([-122.4194, 37.7749]);
      expect(response.body.location.type).toBe('Point');
    });

    it('should reject invalid latitude', async () => {
      const response = await request(app)
        .put('/api/users/location')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          latitude: 100, // Out of range
          longitude: -122.4194
        })
        .expect(400);

      expect(response.body.message).toContain('latitude');
    });

    it('should reject invalid longitude', async () => {
      const response = await request(app)
        .put('/api/users/location')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          latitude: 37.7749,
          longitude: 200 // Out of range
        })
        .expect(400);

      expect(response.body.message).toContain('longitude');
    });

    it('should reject non-number latitude', async () => {
      const response = await request(app)
        .put('/api/users/location')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          latitude: 'invalid',
          longitude: -122.4194
        })
        .expect(400);

      expect(response.body.message).toContain('number');
    });

    it('should reject missing coordinates', async () => {
      await request(app)
        .put('/api/users/location')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);
    });

    it('should reject request without auth token', async () => {
      await request(app)
        .put('/api/users/location')
        .send({
          latitude: 37.7749,
          longitude: -122.4194
        })
        .expect(401);
    });
  });

  describe('PUT /api/users/preferences', () => {
    it('should update user preferences successfully', async () => {
      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          preferences: {
            language: 'en',
            notifications: 'enabled',
            theme: 'dark'
          }
        })
        .expect(200);

      expect(response.body.message).toBe('Preferences updated successfully');
      expect(response.body.preferences.language).toBe('en');
      expect(response.body.preferences.notifications).toBe('enabled');
      expect(response.body.preferences.theme).toBe('dark');
    });

    it('should update only specified preferences', async () => {
      // First set
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          preferences: {
            language: 'en',
            theme: 'dark'
          }
        });

      // Update only language
      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          preferences: {
            language: 'es'
          }
        })
        .expect(200);

      expect(response.body.preferences.language).toBe('es');
      expect(response.body.preferences.theme).toBe('dark'); // Should still be set
    });

    it('should reject invalid preferences format', async () => {
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          preferences: 'invalid'
        })
        .expect(400);
    });

    it('should reject missing preferences', async () => {
      await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);
    });

    it('should reject request without auth token', async () => {
      await request(app)
        .put('/api/users/preferences')
        .send({
          preferences: { language: 'en' }
        })
        .expect(401);
    });
  });

  describe('PUT /api/users/device-token', () => {
    it('should add device token successfully', async () => {
      const response = await request(app)
        .put('/api/users/device-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          token: 'device-token-123'
        })
        .expect(200);

      expect(response.body.message).toBe('Device token updated successfully');
      expect(response.body.deviceTokens).toContain('device-token-123');
    });

    it('should not add duplicate token', async () => {
      // Add token first time
      await request(app)
        .put('/api/users/device-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          token: 'device-token-123'
        });

      // Try to add same token again
      const response = await request(app)
        .put('/api/users/device-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          token: 'device-token-123'
        })
        .expect(200);

      // Should only have one instance
      const user = await User.findById(userId);
      const tokenCount = user.deviceTokens.filter(t => t === 'device-token-123').length;
      expect(tokenCount).toBe(1);
    });

    it('should reject missing token', async () => {
      await request(app)
        .put('/api/users/device-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);
    });

    it('should reject request without auth token', async () => {
      await request(app)
        .put('/api/users/device-token')
        .send({
          token: 'device-token-123'
        })
        .expect(401);
    });
  });

  describe('DELETE /api/users/device-token', () => {
    beforeEach(async () => {
      // Add a token first
      await request(app)
        .put('/api/users/device-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          token: 'device-token-123'
        });
    });

    it('should remove device token successfully', async () => {
      const response = await request(app)
        .delete('/api/users/device-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          token: 'device-token-123'
        })
        .expect(200);

      expect(response.body.message).toBe('Device token removed successfully');
      expect(response.body.deviceTokens).not.toContain('device-token-123');
    });

    it('should handle removing non-existent token gracefully', async () => {
      const response = await request(app)
        .delete('/api/users/device-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          token: 'non-existent-token'
        })
        .expect(200);

      expect(response.body.message).toBe('Device token removed successfully');
    });

    it('should reject missing token', async () => {
      await request(app)
        .delete('/api/users/device-token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);
    });

    it('should reject request without auth token', async () => {
      await request(app)
        .delete('/api/users/device-token')
        .send({
          token: 'device-token-123'
        })
        .expect(401);
    });
  });
});
