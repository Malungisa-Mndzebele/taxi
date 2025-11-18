const jwt = require('jsonwebtoken');
const { auth, requireRole } = require('../../middleware/auth');
const User = require('../../models/User');

// Mock request, response, and next
const mockRequest = (headers = {}) => ({
  header: jest.fn((key) => headers[key]),
  user: null
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};


describe('Auth Middleware', () => {
  let user;
  let mockNext;

  beforeEach(async () => {
    mockNext = jest.fn();
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

  describe('auth middleware', () => {
    it('should authenticate user with valid token', async () => {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
      const req = mockRequest({ Authorization: `Bearer ${token}` });
      const res = mockResponse();

      await auth(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.user._id.toString()).toBe(user._id.toString());
    });

    it('should reject request without token', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await auth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      const req = mockRequest({ Authorization: 'Bearer invalid-token' });
      const res = mockResponse();

      await auth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Token is not valid',
        code: 'AUTH_INVALID',
        error: expect.any(String)
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );
      const req = mockRequest({ Authorization: `Bearer ${expiredToken}` });
      const res = mockResponse();

      await auth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Token is not valid',
        code: 'AUTH_EXPIRED',
        error: expect.any(String)
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request for non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const token = jwt.sign({ userId: fakeUserId }, process.env.JWT_SECRET || 'test-secret');
      const req = mockRequest({ Authorization: `Bearer ${token}` });
      const res = mockResponse();

      await auth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found or token is invalid' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request for deactivated user', async () => {
      user.isActive = false;
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
      const req = mockRequest({ Authorization: `Bearer ${token}` });
      const res = mockResponse();

      await auth(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Account is deactivated' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireRole middleware', () => {
    it('should allow access for authorized role', async () => {
      const req = { user: { role: 'passenger' } };
      const res = mockResponse();

      await requireRole(['passenger'])(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for multiple authorized roles', async () => {
      const req = { user: { role: 'driver' } };
      const res = mockResponse();

      await requireRole(['passenger', 'driver'])(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', async () => {
      const req = { user: { role: 'passenger' } };
      const res = mockResponse();

      await requireRole(['driver'])(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when no user is authenticated', async () => {
      const req = {};
      const res = mockResponse();

      await requireRole(['passenger'])(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
