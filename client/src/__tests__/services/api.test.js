import axios from 'axios';
import { api, authAPI, userAPI, rideAPI, driverAPI } from '../../services/api';

// Mock axios
jest.mock('axios');

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('api instance', () => {
    it('should create axios instance with correct configuration', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:5000/api',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('authAPI', () => {
    const mockApi = {
      get: jest.fn(),
      post: jest.fn(),
    };

    beforeEach(() => {
      api.get = mockApi.get;
      api.post = mockApi.post;
    });

    it('should call login endpoint', async () => {
      const mockResponse = { data: { token: 'test-token', user: {} } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authAPI.login('test@example.com', 'password123');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call register endpoint', async () => {
      const mockResponse = { data: { token: 'test-token', user: {} } };
      mockApi.post.mockResolvedValue(mockResponse);

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };

      const result = await authAPI.register(userData);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should call getMe endpoint', async () => {
      const mockResponse = { data: { user: {} } };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await authAPI.getMe();

      expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse);
    });

    it('should call verifyPhone endpoint', async () => {
      const mockResponse = { data: { message: 'Phone verified' } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authAPI.verifyPhone();

      expect(mockApi.post).toHaveBeenCalledWith('/auth/verify-phone');
      expect(result).toEqual(mockResponse);
    });

    it('should call forgotPassword endpoint', async () => {
      const mockResponse = { data: { message: 'Reset email sent' } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authAPI.forgotPassword('test@example.com');

      expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com'
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('userAPI', () => {
    const mockApi = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    beforeEach(() => {
      api.get = mockApi.get;
      api.post = mockApi.post;
      api.put = mockApi.put;
      api.delete = mockApi.delete;
    });

    it('should call updateProfile endpoint', async () => {
      const mockResponse = { data: { user: {} } };
      mockApi.put.mockResolvedValue(mockResponse);

      const profileData = {
        firstName: 'Jane',
        lastName: 'Doe'
      };

      const result = await userAPI.updateProfile(profileData);

      expect(mockApi.put).toHaveBeenCalledWith('/users/profile', profileData);
      expect(result).toEqual(mockResponse);
    });

    it('should call updateLocation endpoint', async () => {
      const mockResponse = { data: { location: {} } };
      mockApi.put.mockResolvedValue(mockResponse);

      const coordinates = [-122.4324, 37.78825];
      const address = 'San Francisco, CA';

      const result = await userAPI.updateLocation(coordinates, address);

      expect(mockApi.put).toHaveBeenCalledWith('/users/location', {
        coordinates,
        address
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call getNearbyDrivers endpoint', async () => {
      const mockResponse = { data: { drivers: [] } };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userAPI.getNearbyDrivers(37.78825, -122.4324, 5);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/users/nearby-drivers?latitude=37.78825&longitude=-122.4324&radius=5'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call submitRating endpoint', async () => {
      const mockResponse = { data: { message: 'Rating submitted' } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await userAPI.submitRating('ride-id', 5, 'Great ride!');

      expect(mockApi.post).toHaveBeenCalledWith('/users/rating', {
        rideId: 'ride-id',
        rating: 5,
        review: 'Great ride!'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call changePassword endpoint', async () => {
      const mockResponse = { data: { message: 'Password changed' } };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await userAPI.changePassword('oldpass', 'newpass');

      expect(mockApi.put).toHaveBeenCalledWith('/users/password', {
        currentPassword: 'oldpass',
        newPassword: 'newpass'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call deactivateAccount endpoint', async () => {
      const mockResponse = { data: { message: 'Account deactivated' } };
      mockApi.delete.mockResolvedValue(mockResponse);

      const result = await userAPI.deactivateAccount();

      expect(mockApi.delete).toHaveBeenCalledWith('/users/account');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('rideAPI', () => {
    const mockApi = {
      get: jest.fn(),
      post: jest.fn(),
    };

    beforeEach(() => {
      api.get = mockApi.get;
      api.post = mockApi.post;
    });

    it('should call requestRide endpoint', async () => {
      const mockResponse = { data: { ride: {} } };
      mockApi.post.mockResolvedValue(mockResponse);

      const rideData = {
        pickupLocation: { coordinates: [-122.4324, 37.78825], address: 'SF' },
        dropoffLocation: { coordinates: [-122.4194, 37.7749], address: 'SFO' },
        distance: 15.5,
        estimatedDuration: 25,
        paymentMethod: 'card'
      };

      const result = await rideAPI.requestRide(rideData);

      expect(mockApi.post).toHaveBeenCalledWith('/rides/request', rideData);
      expect(result).toEqual(mockResponse);
    });

    it('should call acceptRide endpoint', async () => {
      const mockResponse = { data: { ride: {} } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await rideAPI.acceptRide('ride-id');

      expect(mockApi.post).toHaveBeenCalledWith('/rides/ride-id/accept');
      expect(result).toEqual(mockResponse);
    });

    it('should call arrive endpoint', async () => {
      const mockResponse = { data: { ride: {} } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await rideAPI.arrive('ride-id');

      expect(mockApi.post).toHaveBeenCalledWith('/rides/ride-id/arrive');
      expect(result).toEqual(mockResponse);
    });

    it('should call startRide endpoint', async () => {
      const mockResponse = { data: { ride: {} } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await rideAPI.startRide('ride-id');

      expect(mockApi.post).toHaveBeenCalledWith('/rides/ride-id/start');
      expect(result).toEqual(mockResponse);
    });

    it('should call completeRide endpoint', async () => {
      const mockResponse = { data: { ride: {} } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await rideAPI.completeRide('ride-id');

      expect(mockApi.post).toHaveBeenCalledWith('/rides/ride-id/complete');
      expect(result).toEqual(mockResponse);
    });

    it('should call cancelRide endpoint', async () => {
      const mockResponse = { data: { ride: {} } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await rideAPI.cancelRide('ride-id', 'Cancelled by user');

      expect(mockApi.post).toHaveBeenCalledWith('/rides/ride-id/cancel', {
        reason: 'Cancelled by user'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call getActiveRides endpoint', async () => {
      const mockResponse = { data: { rides: [] } };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await rideAPI.getActiveRides();

      expect(mockApi.get).toHaveBeenCalledWith('/rides/active');
      expect(result).toEqual(mockResponse);
    });

    it('should call getRideHistory endpoint', async () => {
      const mockResponse = { data: { rides: [] } };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await rideAPI.getRideHistory(1, 10);

      expect(mockApi.get).toHaveBeenCalledWith('/rides/history?page=1&limit=10');
      expect(result).toEqual(mockResponse);
    });

    it('should call getRideDetails endpoint', async () => {
      const mockResponse = { data: { ride: {} } };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await rideAPI.getRideDetails('ride-id');

      expect(mockApi.get).toHaveBeenCalledWith('/rides/ride-id');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('driverAPI', () => {
    const mockApi = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    };

    beforeEach(() => {
      api.get = mockApi.get;
      api.post = mockApi.post;
      api.put = mockApi.put;
    });

    it('should call updateProfile endpoint', async () => {
      const mockResponse = { data: { driverProfile: {} } };
      mockApi.put.mockResolvedValue(mockResponse);

      const profileData = {
        licenseNumber: 'DL123456',
        vehicleInfo: {
          make: 'Toyota',
          model: 'Camry'
        }
      };

      const result = await driverAPI.updateProfile(profileData);

      expect(mockApi.put).toHaveBeenCalledWith('/drivers/profile', profileData);
      expect(result).toEqual(mockResponse);
    });

    it('should call updateStatus endpoint', async () => {
      const mockResponse = { data: { status: {} } };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await driverAPI.updateStatus(true, true);

      expect(mockApi.put).toHaveBeenCalledWith('/drivers/status', {
        isOnline: true,
        isAvailable: true
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call getStats endpoint', async () => {
      const mockResponse = { data: { stats: {} } };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await driverAPI.getStats();

      expect(mockApi.get).toHaveBeenCalledWith('/drivers/stats');
      expect(result).toEqual(mockResponse);
    });

    it('should call getEarnings endpoint', async () => {
      const mockResponse = { data: { rides: [], totalEarnings: 0 } };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await driverAPI.getEarnings(1, 20);

      expect(mockApi.get).toHaveBeenCalledWith('/drivers/earnings?page=1&limit=20');
      expect(result).toEqual(mockResponse);
    });

    it('should call getRideRequests endpoint', async () => {
      const mockResponse = { data: { rideRequests: [] } };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await driverAPI.getRideRequests(37.78825, -122.4324, 10);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/drivers/requests?latitude=37.78825&longitude=-122.4324&radius=10'
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
