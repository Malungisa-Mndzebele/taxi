import axios from 'axios';
import { API_BASE_URL } from '../config';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear stored token and redirect to login
      // This will be handled by the AuthContext
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  verifyPhone: () => api.post('/auth/verify-phone'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateLocation: (coordinates, address) => api.put('/users/location', { coordinates, address }),
  getNearbyDrivers: (latitude, longitude, radius) => 
    api.get(`/users/nearby-drivers?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),
  submitRating: (rideId, rating, review) => 
    api.post('/users/rating', { rideId, rating, review }),
  changePassword: (currentPassword, newPassword) => 
    api.put('/users/password', { currentPassword, newPassword }),
  deactivateAccount: () => api.delete('/users/account'),
};

export const rideAPI = {
  requestRide: (rideData) => api.post('/rides/request', rideData),
  acceptRide: (rideId) => api.post(`/rides/${rideId}/accept`),
  arrive: (rideId) => api.post(`/rides/${rideId}/arrive`),
  startRide: (rideId) => api.post(`/rides/${rideId}/start`),
  completeRide: (rideId) => api.post(`/rides/${rideId}/complete`),
  cancelRide: (rideId, reason) => api.post(`/rides/${rideId}/cancel`, { reason }),
  getActiveRides: () => api.get('/rides/active'),
  getRideHistory: (page = 1, limit = 10) => 
    api.get(`/rides/history?page=${page}&limit=${limit}`),
  getRideDetails: (rideId) => api.get(`/rides/${rideId}`),
};

export const driverAPI = {
  updateProfile: (data) => api.put('/drivers/profile', data),
  updateStatus: (isOnline, isAvailable) => 
    api.put('/drivers/status', { isOnline, isAvailable }),
  getStats: () => api.get('/drivers/stats'),
  getEarnings: (page = 1, limit = 20) => 
    api.get(`/drivers/earnings?page=${page}&limit=${limit}`),
  getRideRequests: (latitude, longitude, radius = 10) => 
    api.get(`/drivers/requests?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),
};
