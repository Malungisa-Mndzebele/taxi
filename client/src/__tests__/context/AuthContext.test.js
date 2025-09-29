import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../services/api';

// Mock the API service
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

// Test component to access context
const TestComponent = () => {
  const auth = useAuth();
  return null;
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
  });

  describe('AuthProvider', () => {
    it('should provide initial state', () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Context should be available
      expect(() => useAuth()).not.toThrow();
    });

    it('should load stored auth token on mount', async () => {
      const mockToken = 'test-token';
      const mockUser = {
        id: 'user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'passenger'
      };

      AsyncStorage.getItem.mockResolvedValue(mockToken);
      api.get.mockResolvedValue({ data: { user: mockUser } });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalledWith('authToken');
        expect(api.get).toHaveBeenCalledWith('/auth/me');
      });
    });

    it('should handle invalid stored token', async () => {
      const mockToken = 'invalid-token';
      
      AsyncStorage.getItem.mockResolvedValue(mockToken);
      api.get.mockRejectedValue(new Error('Invalid token'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      });
    });
  });

  describe('login function', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            id: 'user-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'passenger'
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      let authContext;
      const TestComponent = () => {
        authContext = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        const result = await authContext.login('john@example.com', 'password123');
        expect(result.success).toBe(true);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
      expect(api.defaults.headers.common['Authorization']).toBe('Bearer test-token');
    });

    it('should handle login failure', async () => {
      api.post.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      });

      let authContext;
      const TestComponent = () => {
        authContext = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        const result = await authContext.login('john@example.com', 'wrongpassword');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid credentials');
      });
    });
  });

  describe('register function', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            id: 'user-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'passenger'
          }
        }
      };

      api.post.mockResolvedValue(mockResponse);

      let authContext;
      const TestComponent = () => {
        authContext = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };

      await act(async () => {
        const result = await authContext.register(userData);
        expect(result.success).toBe(true);
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token');
    });

    it('should handle registration failure', async () => {
      api.post.mockRejectedValue({
        response: {
          data: {
            message: 'Email already exists'
          }
        }
      });

      let authContext;
      const TestComponent = () => {
        authContext = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'password123',
        role: 'passenger'
      };

      await act(async () => {
        const result = await authContext.register(userData);
        expect(result.success).toBe(false);
        expect(result.message).toBe('Email already exists');
      });
    });
  });

  describe('logout function', () => {
    it('should logout successfully', async () => {
      let authContext;
      const TestComponent = () => {
        authContext = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await authContext.logout();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(api.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('updateUser function', () => {
    it('should update user data', async () => {
      let authContext;
      const TestComponent = () => {
        authContext = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const updatedUser = {
        id: 'user-id',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        role: 'passenger'
      };

      await act(async () => {
        authContext.updateUser(updatedUser);
      });

      expect(authContext.user).toEqual(updatedUser);
    });
  });

  describe('updateLocation function', () => {
    it('should update user location', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 'user-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'passenger',
            currentLocation: {
              type: 'Point',
              coordinates: [-122.4324, 37.78825],
              address: 'San Francisco, CA',
              lastUpdated: '2023-01-01T00:00:00.000Z'
            }
          }
        }
      };

      api.put.mockResolvedValue(mockResponse);

      let authContext;
      const TestComponent = () => {
        authContext = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const coordinates = [-122.4324, 37.78825];
      const address = 'San Francisco, CA';

      await act(async () => {
        await authContext.updateLocation(coordinates, address);
      });

      expect(api.put).toHaveBeenCalledWith('/users/location', {
        coordinates,
        address
      });
    });

    it('should handle location update error', async () => {
      api.put.mockRejectedValue(new Error('Network error'));

      let authContext;
      const TestComponent = () => {
        authContext = useAuth();
        return null;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const coordinates = [-122.4324, 37.78825];
      const address = 'San Francisco, CA';

      await act(async () => {
        await authContext.updateLocation(coordinates, address);
      });

      // Should not throw error, just log it
      expect(api.put).toHaveBeenCalledWith('/users/location', {
        coordinates,
        address
      });
    });
  });
});
