// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000'  // Development
  : 'https://your-production-api.com';  // Production

// Google Maps Configuration
export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// App Configuration
export const APP_CONFIG = {
  DEFAULT_RADIUS: 5, // km
  MAX_RADIUS: 20, // km
  MIN_RADIUS: 1, // km
  DEFAULT_ZOOM: 15,
  PICKUP_ZOOM: 18,
  ANIMATION_DURATION: 300,
  LOCATION_UPDATE_INTERVAL: 5000, // 5 seconds
  DRIVER_LOCATION_UPDATE_INTERVAL: 3000, // 3 seconds
};

// Fare Configuration
export const FARE_CONFIG = {
  BASE_FARE: 2.0,
  PER_KM_RATE: 1.5,
  PER_MINUTE_RATE: 0.3,
  MIN_FARE: 5.0,
  MAX_SURGE_MULTIPLIER: 3.0,
};

// Ride Status
export const RIDE_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  ARRIVED: 'arrived',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// User Roles
export const USER_ROLES = {
  PASSENGER: 'passenger',
  DRIVER: 'driver',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  CASH: 'cash',
  WALLET: 'wallet',
};

// Colors
export const COLORS = {
  PRIMARY: '#000000',
  SECONDARY: '#FFD700',
  SUCCESS: '#4CAF50',
  ERROR: '#F44336',
  WARNING: '#FF9800',
  INFO: '#2196F3',
  LIGHT_GRAY: '#F5F5F5',
  GRAY: '#9E9E9E',
  DARK_GRAY: '#424242',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
};

// Map Styles
export const MAP_STYLE = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];
