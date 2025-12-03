import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },
};

export const rides = {
  request: (rideData) => api.post('/rides/request', rideData),
  getAvailable: () => api.get('/rides/available'),
  getActive: () => api.get('/rides/active'),
  accept: (rideId) => api.post(`/rides/${rideId}/accept`),
};

export const drivers = {
  setStatus: (isOnline) => api.put('/drivers/status', { 
    isOnline, 
    isAvailable: isOnline // When going online, also become available
  }),
};

export const health = {
  check: () => api.get('/health'),
};

export default api;
