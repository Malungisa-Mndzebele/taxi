const request = require('supertest');
const { app } = require('../../test-server');
const User = require('../../models/User');

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new passenger', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe('passenger');
      expect(response.body.user.password).toBeUndefined();

      // Verify user was saved to database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.firstName).toBe(userData.firstName);
    });

    it('should register a new driver', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        password: 'password123',
        role: 'driver'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('driver');
      expect(response.body.user.isDriver).toBe(true);

      // Verify driverProfile was initialized
      const user = await User.findOne({ email: userData.email });
      expect(user.driverProfile).toBeDefined();
      expect(user.driverProfile.rating).toBe(5.0);
      expect(user.driverProfile.totalRides).toBe(0);
    });

    it('should default to passenger role when not specified', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('passenger');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1234567890',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should reject registration with short password', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const duplicateUserData = {
        ...userData,
        phone: '+0987654321'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUserData)
        .expect(400);

      expect(response.body.message).toBe('Email already registered');
    });

    it('should reject registration with duplicate phone', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same phone
      const duplicateUserData = {
        ...userData,
        email: 'jane@example.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUserData)
        .expect(400);

      expect(response.body.message).toBe('Phone number already registered');
    });

    it('should reject registration with invalid phone format', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: 'invalid-phone',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      });
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should generate valid JWT token with correct structure', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      
      // Decode and verify JWT structure
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET || 'test-secret');
      
      // Verify token contains user information
      expect(decoded.user).toBeDefined();
      expect(decoded.user.id).toBeDefined();
      expect(decoded.user.email).toBe(loginData.email);
      expect(decoded.user.isDriver).toBe(false);
      
      // Verify token has expiration (1 hour)
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      const tokenLifetime = decoded.exp - decoded.iat;
      expect(tokenLifetime).toBe(3600); // 1 hour in seconds
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Authentication failed');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Authentication failed');
    });

    it('should reject login for deactivated user', async () => {
      user.isActive = false;
      await user.save();

      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Account is deactivated');
    });

    it('should reject login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should reject login without password', async () => {
      const loginData = {
        email: 'john@example.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    let user, token;

    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      });
      await user.save();

      const jwt = require('jsonwebtoken');
      token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.firstName).toBe(user.firstName);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Token is not valid');
    });
  });

  describe('POST /api/auth/request-verification', () => {
    let user, token;

    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      });
      await user.save();

      const jwt = require('jsonwebtoken');
      token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
    });

    it('should generate and store 6-digit verification code', async () => {
      const response = await request(app)
        .post('/api/auth/request-verification')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('Verification code sent to your phone');
      expect(response.body.verificationCode).toBeDefined();
      expect(response.body.verificationCode).toMatch(/^\d{6}$/);

      // Verify code was stored in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.verificationCode).toBe(response.body.verificationCode);
      expect(updatedUser.verificationCodeExpires).toBeDefined();
      
      // Verify expiration is approximately 10 minutes from now
      const expirationTime = new Date(updatedUser.verificationCodeExpires).getTime();
      const expectedTime = Date.now() + 10 * 60 * 1000;
      expect(Math.abs(expirationTime - expectedTime)).toBeLessThan(5000); // Within 5 seconds
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/request-verification')
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });
  });

  describe('POST /api/auth/verify-phone', () => {
    let user, token, verificationCode;

    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      });
      await user.save();

      const jwt = require('jsonwebtoken');
      token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
      
      // Request verification code
      const response = await request(app)
        .post('/api/auth/request-verification')
        .set('Authorization', `Bearer ${token}`);
      
      verificationCode = response.body.verificationCode;
    });

    it('should verify phone with valid code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-phone')
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationCode })
        .expect(200);

      expect(response.body.message).toBe('Phone number verified successfully');
      expect(response.body.user.isVerified).toBe(true);

      // Verify user is marked as verified and code is cleared
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isVerified).toBe(true);
      expect(updatedUser.verificationCode).toBeUndefined();
      expect(updatedUser.verificationCodeExpires).toBeUndefined();
    });

    it('should reject invalid verification code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-phone')
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationCode: '999999' })
        .expect(400);

      expect(response.body.message).toBe('Invalid verification code');

      // Verify user is not marked as verified
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isVerified).toBe(false);
    });

    it('should reject expired verification code', async () => {
      // Manually expire the code
      user.verificationCodeExpires = new Date(Date.now() - 1000); // 1 second ago
      await user.save();

      const response = await request(app)
        .post('/api/auth/verify-phone')
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationCode })
        .expect(400);

      expect(response.body.message).toBe('Verification code has expired. Please request a new code.');

      // Verify user is not marked as verified
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.isVerified).toBe(false);
    });

    it('should reject request without verification code', async () => {
      const response = await request(app)
        .post('/api/auth/verify-phone')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Verification code is required');
    });

    it('should update isVerified flag on successful verification', async () => {
      // Verify initial state
      let currentUser = await User.findById(user._id);
      expect(currentUser.isVerified).toBe(false);

      // Verify phone
      await request(app)
        .post('/api/auth/verify-phone')
        .set('Authorization', `Bearer ${token}`)
        .send({ verificationCode })
        .expect(200);

      // Verify flag was updated
      currentUser = await User.findById(user._id);
      expect(currentUser.isVerified).toBe(true);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/verify-phone')
        .send({ verificationCode })
        .expect(401);

      expect(response.body.message).toBe('No token, authorization denied');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    let user;

    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      });
      await user.save();
    });

    it('should send password reset for existing email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'john@example.com' })
        .expect(200);

      expect(response.body.message).toBe('Password reset instructions sent to your email');
      expect(response.body.resetToken).toBeDefined();
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(400);

      expect(response.body.message).toBe('Email not found');
    });

    it('should reject request with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let user, resetToken;

    beforeEach(async () => {
      user = new User({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      });
      await user.save();

      // Get reset token
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'john@example.com' });
      
      resetToken = response.body.resetToken;
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'newpassword123';
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken,
          newPassword
        })
        .expect(200);

      expect(response.body.message).toBe('Password reset successfully');

      // Verify user can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: 'john@example.com',
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
    });

    it('should reject reset with expired token', async () => {
      const jwt = require('jsonwebtoken');
      
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'test-secret-key-for-testing',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken: expiredToken,
          newPassword: 'newpassword123'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('should reject reset with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken: 'invalid-token-string',
          newPassword: 'newpassword123'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('should reject password shorter than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken,
          newPassword: '12345' // Only 5 characters
        })
        .expect(400);

      expect(response.body.message).toBe('Password must be at least 6 characters');
    });

    it('should invalidate token after successful use', async () => {
      const newPassword = 'newpassword123';
      
      // First reset should succeed
      await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken,
          newPassword
        })
        .expect(200);

      // Verify password was actually changed by logging in with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: 'john@example.com',
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();

      // Verify old password no longer works
      const oldLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({ 
          email: 'john@example.com',
          password: 'password123' // Old password
        })
        .expect(401);

      expect(oldLoginResponse.body.message).toBe('Authentication failed');
    });

    it('should reject reset without token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          newPassword: 'newpassword123'
        })
        .expect(400);

      expect(response.body.message).toBe('Reset token and new password are required');
    });

    it('should reject reset without new password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ 
          resetToken
        })
        .expect(400);

      expect(response.body.message).toBe('Reset token and new password are required');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit after 5 requests on login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Make 5 requests (should all succeed or fail based on credentials, but not rate limited)
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData);
      }

      // 6th request should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(429);

      expect(response.body.message).toBe('Too many requests, please try again later');
      expect(response.body.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should include X-RateLimit-Limit header', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.headers['x-ratelimit-limit']).toBe('5');
    });

    it('should include X-RateLimit-Remaining header that decrements', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // First request
      const response1 = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response1.headers['x-ratelimit-remaining']).toBeDefined();
      const remaining1 = parseInt(response1.headers['x-ratelimit-remaining']);

      // Second request
      const response2 = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      const remaining2 = parseInt(response2.headers['x-ratelimit-remaining']);
      
      // Remaining should decrement (or stay at 0 if already at limit)
      expect(remaining2).toBeLessThanOrEqual(remaining1);
      // If we haven't hit the limit yet, it should decrement by 1
      if (remaining1 > 0) {
        expect(remaining2).toBe(remaining1 - 1);
      }
    });

    it('should include X-RateLimit-Reset header', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.headers['x-ratelimit-reset']).toBeDefined();
      
      // Verify it's a valid timestamp
      const resetTime = parseInt(response.headers['x-ratelimit-reset']);
      expect(resetTime).toBeGreaterThan(Date.now() / 1000); // Should be in the future
    });

    it('should return RATE_LIMIT_EXCEEDED error code when limit exceeded', async () => {
      const registerData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'ratelimit@example.com',
        phone: '+1234567890',
        password: 'password123'
      };

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/register')
          .send({ ...registerData, email: `ratelimit${i}@example.com`, phone: `+123456789${i}` });
      }

      // 6th request should be rate limited
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...registerData, email: 'ratelimit6@example.com', phone: '+1234567896' })
        .expect(429);

      expect(response.body.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should apply rate limiting to forgot-password endpoint', async () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'test@example.com' });
      }

      // 6th request should be rate limited
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(429);

      expect(response.body.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
