/**
 * Web App Integration Tests
 * Tests the complete user flow through the web interface
 */

// Mock fetch for testing
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock DOM environment
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Load the HTML file
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const dom = new JSDOM(html, { 
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Load the JavaScript code
const script = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const scriptMatch = script.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  eval(scriptMatch[1]);
}

describe('Taxi App Web Interface Tests', () => {
  beforeEach(() => {
    // Reset mocks
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Reset DOM
    document.getElementById('auth-status').innerHTML = '';
    document.getElementById('ride-status').innerHTML = '';
    document.getElementById('api-status').innerHTML = '';
    document.getElementById('active-rides').innerHTML = '';
    
    // Clear form fields
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('password').value = '';
    document.getElementById('role').value = 'passenger';
    document.getElementById('pickupLocation').value = '';
    document.getElementById('dropoffLocation').value = '';
  });

  describe('1. Backend Health Check', () => {
    test('Should check backend health successfully', async () => {
      // Mock successful health check response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'OK', timestamp: '2024-01-01T00:00:00.000Z' })
      });

      await checkHealth();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/health');
      expect(document.getElementById('api-status').innerHTML).toContain('✅ Backend is healthy!');
    });

    test('Should handle backend health check failure', async () => {
      // Mock failed health check response
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await checkHealth();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/health');
      expect(document.getElementById('api-status').innerHTML).toContain('❌ Backend connection failed');
    });
  });

  describe('2. User Registration Flow', () => {
    test('Should register a passenger successfully', async () => {
      // Fill form data
      document.getElementById('firstName').value = 'John';
      document.getElementById('lastName').value = 'Doe';
      document.getElementById('email').value = 'john.doe@test.com';
      document.getElementById('phone').value = '1234567890';
      document.getElementById('password').value = 'password123';
      document.getElementById('role').value = 'passenger';

      // Mock successful registration response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'User registered successfully',
          token: 'mock-jwt-token',
          user: {
            _id: 'mock-user-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@test.com',
            role: 'passenger'
          }
        })
      });

      await register();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@test.com',
          phone: '1234567890',
          password: 'password123',
          role: 'passenger'
        })
      });

      expect(document.getElementById('auth-status').innerHTML).toContain('✅ Registration successful!');
      expect(document.getElementById('auth-status').innerHTML).toContain('Welcome John!');
    });

    test('Should register a driver successfully', async () => {
      // Fill form data
      document.getElementById('firstName').value = 'Jane';
      document.getElementById('lastName').value = 'Smith';
      document.getElementById('email').value = 'jane.smith@test.com';
      document.getElementById('phone').value = '0987654321';
      document.getElementById('password').value = 'password123';
      document.getElementById('role').value = 'driver';

      // Mock successful registration response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'User registered successfully',
          token: 'mock-driver-jwt-token',
          user: {
            _id: 'mock-driver-id',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@test.com',
            role: 'driver'
          }
        })
      });

      await register();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@test.com',
          phone: '0987654321',
          password: 'password123',
          role: 'driver'
        })
      });

      expect(document.getElementById('auth-status').innerHTML).toContain('✅ Registration successful!');
      expect(document.getElementById('auth-status').innerHTML).toContain('Welcome Jane!');
    });

    test('Should handle registration failure', async () => {
      // Fill form data
      document.getElementById('firstName').value = 'Test';
      document.getElementById('lastName').value = 'User';
      document.getElementById('email').value = 'test@test.com';
      document.getElementById('phone').value = '1111111111';
      document.getElementById('password').value = 'password123';
      document.getElementById('role').value = 'passenger';

      // Mock failed registration response
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Email already registered' })
      });

      await register();

      expect(document.getElementById('auth-status').innerHTML).toContain('❌ Registration failed');
      expect(document.getElementById('auth-status').innerHTML).toContain('Email already registered');
    });
  });

  describe('3. User Login Flow', () => {
    test('Should login passenger successfully', async () => {
      // Fill login data
      document.getElementById('email').value = 'john.doe@test.com';
      document.getElementById('password').value = 'password123';

      // Mock successful login response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Login successful',
          token: 'mock-jwt-token',
          user: {
            _id: 'mock-user-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@test.com',
            role: 'passenger'
          }
        })
      });

      await login();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'john.doe@test.com',
          password: 'password123'
        })
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-jwt-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('currentUser', expect.any(String));
      expect(document.getElementById('auth-status').innerHTML).toContain('✅ Login successful!');
      expect(document.getElementById('auth-status').innerHTML).toContain('Welcome John!');
    });

    test('Should login driver successfully', async () => {
      // Fill login data
      document.getElementById('email').value = 'jane.smith@test.com';
      document.getElementById('password').value = 'password123';

      // Mock successful login response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Login successful',
          token: 'mock-driver-jwt-token',
          user: {
            _id: 'mock-driver-id',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@test.com',
            role: 'driver'
          }
        })
      });

      await login();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'jane.smith@test.com',
          password: 'password123'
        })
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-driver-jwt-token');
      expect(document.getElementById('auth-status').innerHTML).toContain('✅ Login successful!');
      expect(document.getElementById('auth-status').innerHTML).toContain('Welcome Jane!');
    });

    test('Should handle login failure', async () => {
      // Fill login data
      document.getElementById('email').value = 'john.doe@test.com';
      document.getElementById('password').value = 'wrongpassword';

      // Mock failed login response
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' })
      });

      await login();

      expect(document.getElementById('auth-status').innerHTML).toContain('❌ Login failed');
      expect(document.getElementById('auth-status').innerHTML).toContain('Invalid credentials');
    });
  });

  describe('4. Ride Request Flow', () => {
    beforeEach(() => {
      // Set up authenticated user
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      authToken = 'mock-jwt-token';
    });

    test('Should request a ride successfully', async () => {
      // Fill ride data
      document.getElementById('pickupLocation').value = '123 Main St, New York, NY';
      document.getElementById('dropoffLocation').value = '456 Broadway, New York, NY';

      // Mock successful ride request response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Ride requested successfully',
          ride: {
            _id: 'mock-ride-id',
            pickupLocation: '123 Main St, New York, NY',
            dropoffLocation: '456 Broadway, New York, NY',
            status: 'pending',
            passenger: 'mock-user-id'
          }
        })
      });

      await requestRide();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/rides/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token'
        },
        body: JSON.stringify({
          pickupLocation: '123 Main St, New York, NY',
          dropoffLocation: '456 Broadway, New York, NY',
          pickupLat: 40.7128,
          pickupLng: -74.0060,
          dropoffLat: 40.7589,
          dropoffLng: -73.9851
        })
      });

      expect(document.getElementById('ride-status').innerHTML).toContain('✅ Ride requested successfully!');
      expect(document.getElementById('ride-status').innerHTML).toContain('Ride ID: mock-ride-id');
    });

    test('Should reject ride request without authentication', async () => {
      // Clear authentication
      authToken = null;
      localStorageMock.getItem.mockReturnValue(null);

      // Fill ride data
      document.getElementById('pickupLocation').value = '123 Main St, New York, NY';
      document.getElementById('dropoffLocation').value = '456 Broadway, New York, NY';

      await requestRide();

      expect(document.getElementById('ride-status').innerHTML).toContain('❌ Please login first to request a ride');
    });

    test('Should handle ride request failure', async () => {
      // Fill ride data
      document.getElementById('pickupLocation').value = '123 Main St, New York, NY';
      document.getElementById('dropoffLocation').value = '456 Broadway, New York, NY';

      // Mock failed ride request response
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'No available drivers' })
      });

      await requestRide();

      expect(document.getElementById('ride-status').innerHTML).toContain('❌ Ride request failed');
      expect(document.getElementById('ride-status').innerHTML).toContain('No available drivers');
    });
  });

  describe('5. Active Rides Management', () => {
    beforeEach(() => {
      // Set up authenticated user
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      authToken = 'mock-jwt-token';
    });

    test('Should fetch active rides successfully', async () => {
      // Mock successful active rides response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          rides: [
            {
              _id: 'mock-ride-1',
              status: 'accepted',
              pickupLocation: '123 Main St, New York, NY',
              dropoffLocation: '456 Broadway, New York, NY',
              fare: 15.50,
              driver: {
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '0987654321'
              }
            }
          ]
        })
      });

      await getActiveRides();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/rides/active', {
        headers: { 'Authorization': 'Bearer mock-jwt-token' }
      });

      expect(document.getElementById('active-rides').innerHTML).toContain('Ride #mock-ride-1');
      expect(document.getElementById('active-rides').innerHTML).toContain('accepted');
      expect(document.getElementById('active-rides').innerHTML).toContain('Jane Smith');
    });

    test('Should handle no active rides', async () => {
      // Mock empty active rides response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ rides: [] })
      });

      await getActiveRides();

      expect(document.getElementById('active-rides').innerHTML).toContain('No active rides found');
    });

    test('Should reject active rides request without authentication', async () => {
      // Clear authentication
      authToken = null;
      localStorageMock.getItem.mockReturnValue(null);

      await getActiveRides();

      expect(document.getElementById('active-rides').innerHTML).toContain('❌ Please login first to view rides');
    });
  });

  describe('6. Authentication Status Management', () => {
    test('Should check authentication status with valid token', async () => {
      // Set up valid token
      localStorageMock.getItem.mockReturnValue('mock-jwt-token');
      authToken = 'mock-jwt-token';

      // Mock successful auth status response
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            _id: 'mock-user-id',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@test.com',
            role: 'passenger'
          }
        })
      });

      await checkAuthStatus();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': 'Bearer mock-jwt-token' }
      });

      expect(currentUser).toBeDefined();
      expect(currentUser.firstName).toBe('John');
    });

    test('Should logout on invalid token', async () => {
      // Set up invalid token
      localStorageMock.getItem.mockReturnValue('invalid-token');
      authToken = 'invalid-token';

      // Mock failed auth status response
      fetch.mockResolvedValueOnce({
        ok: false
      });

      // Mock location.reload
      global.location = { reload: jest.fn() };

      await checkAuthStatus();

      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
      expect(global.location.reload).toHaveBeenCalled();
    });
  });

  describe('7. Form Validation and UI Updates', () => {
    test('Should clear auth form after successful registration', async () => {
      // Fill form data
      document.getElementById('firstName').value = 'Test';
      document.getElementById('lastName').value = 'User';
      document.getElementById('email').value = 'test@test.com';
      document.getElementById('phone').value = '1111111111';
      document.getElementById('password').value = 'password123';

      // Mock successful registration
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'User registered successfully',
          token: 'mock-token',
          user: { firstName: 'Test', lastName: 'User', email: 'test@test.com', role: 'passenger' }
        })
      });

      await register();

      // Check that form was cleared
      expect(document.getElementById('firstName').value).toBe('');
      expect(document.getElementById('lastName').value).toBe('');
      expect(document.getElementById('email').value).toBe('');
      expect(document.getElementById('phone').value).toBe('');
      expect(document.getElementById('password').value).toBe('');
    });

    test('Should clear ride form after successful ride request', async () => {
      // Set up authentication
      authToken = 'mock-jwt-token';

      // Fill ride data
      document.getElementById('pickupLocation').value = '123 Main St';
      document.getElementById('dropoffLocation').value = '456 Broadway';

      // Mock successful ride request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Ride requested successfully',
          ride: { _id: 'mock-ride-id' }
        })
      });

      await requestRide();

      // Check that form was cleared
      expect(document.getElementById('pickupLocation').value).toBe('');
      expect(document.getElementById('dropoffLocation').value).toBe('');
    });
  });
});
