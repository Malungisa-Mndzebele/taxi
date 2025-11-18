/**
 * Test Data Factories
 * Provides factory functions for creating test data
 */

const User = require('../../models/User');
const Ride = require('../../models/Ride');

class UserFactory {
  /**
   * Create a passenger user for testing
   * @param {Object} overrides - Override default values
   * @returns {Object} User data object
   */
  static createPassenger(overrides = {}) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    
    return {
      firstName: 'John',
      lastName: 'Doe',
      email: `passenger.${timestamp}.${random}@test.com`,
      phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'passenger',
      isActive: true,
      ...overrides
    };
  }

  /**
   * Create a driver user for testing
   * @param {Object} overrides - Override default values
   * @returns {Object} User data object
   */
  static createDriver(overrides = {}) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    
    return {
      firstName: 'Jane',
      lastName: 'Smith',
      email: `driver.${timestamp}.${random}@test.com`,
      phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      password: 'password123',
      role: 'driver',
      isActive: true,
      driverProfile: {
        licenseNumber: `DL${Math.floor(10000000 + Math.random() * 90000000)}`,
        isOnline: true,
        isAvailable: true,
        vehicleInfo: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          color: 'White',
          plateNumber: `ABC${Math.floor(1000 + Math.random() * 9000)}`
        },
        rating: 4.8,
        totalRides: 0
      },
      currentLocation: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749], // San Francisco
        address: 'San Francisco, CA',
        lastUpdated: new Date()
      },
      ...overrides
    };
  }

  /**
   * Create and save a passenger user
   * @param {Object} overrides - Override default values
   * @returns {Promise<User>} Saved user instance
   */
  static async createAndSavePassenger(overrides = {}) {
    const userData = this.createPassenger(overrides);
    const user = new User(userData);
    return await user.save();
  }

  /**
   * Create and save a driver user
   * @param {Object} overrides - Override default values
   * @returns {Promise<User>} Saved user instance
   */
  static async createAndSaveDriver(overrides = {}) {
    const userData = this.createDriver(overrides);
    const user = new User(userData);
    return await user.save();
  }
}

class RideFactory {
  /**
   * Create a ride request for testing
   * @param {Object} overrides - Override default values
   * @returns {Object} Ride request data
   */
  static createRideRequest(overrides = {}) {
    return {
      pickupLocation: {
        coordinates: [-122.4194, 37.7749], // San Francisco
        address: '123 Main St, San Francisco, CA 94102'
      },
      dropoffLocation: {
        coordinates: [-122.3965, 37.7937], // Oakland
        address: '456 Oak Ave, Oakland, CA 94601'
      },
      distance: 15.5, // kilometers
      estimatedDuration: 20, // minutes
      paymentMethod: 'card',
      ...overrides
    };
  }

  /**
   * Create a ride with passenger and driver
   * @param {Object} passenger - Passenger user instance
   * @param {Object} driver - Driver user instance (optional)
   * @param {Object} overrides - Override default values
   * @returns {Object} Ride data
   */
  static createRide(passenger, driver = null, overrides = {}) {
    const rideData = {
      passenger: passenger._id,
      driver: driver ? driver._id : null,
      status: driver ? 'accepted' : 'requested',
      pickupLocation: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: '123 Main St, San Francisco, CA 94102'
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [-122.3965, 37.7937],
        address: '456 Oak Ave, Oakland, CA 94601'
      },
      distance: 15.5,
      estimatedDuration: 20,
      fare: {
        baseFare: 2.0,
        distanceFare: 15.5,
        timeFare: 6.0,
        surgeMultiplier: 1.0,
        totalFare: 25.50
      },
      payment: {
        method: 'card',
        status: 'pending'
      },
      timeline: {
        requestedAt: new Date()
      },
      ...overrides
    };

    if (driver) {
      rideData.timeline.acceptedAt = new Date();
    }

    return rideData;
  }

  /**
   * Create and save a ride
   * @param {Object} passenger - Passenger user instance
   * @param {Object} driver - Driver user instance (optional)
   * @param {Object} overrides - Override default values
   * @returns {Promise<Ride>} Saved ride instance
   */
  static async createAndSaveRide(passenger, driver = null, overrides = {}) {
    const rideData = this.createRide(passenger, driver, overrides);
    const ride = new Ride(rideData);
    return await ride.save();
  }
}

class LocationFactory {
  /**
   * Create a location for testing
   * @param {Object} overrides - Override default values
   * @returns {Object} Location data
   */
  static createLocation(overrides = {}) {
    return {
      type: 'Point',
      coordinates: [-122.4194, 37.7749], // [longitude, latitude]
      address: 'San Francisco, CA',
      lastUpdated: new Date(),
      ...overrides
    };
  }

  /**
   * Create a location near a given point
   * @param {Array<Number>} center - Center coordinates [lng, lat]
   * @param {Number} radiusKm - Radius in kilometers
   * @returns {Object} Location data
   */
  static createLocationNear(center, radiusKm = 1) {
    // Simple approximation: 1 degree latitude ≈ 111 km
    const latOffset = (Math.random() * radiusKm * 2 - radiusKm) / 111;
    const lngOffset = (Math.random() * radiusKm * 2 - radiusKm) / (111 * Math.cos(center[1] * Math.PI / 180));
    
    return {
      type: 'Point',
      coordinates: [center[0] + lngOffset, center[1] + latOffset],
      address: 'Test Location',
      lastUpdated: new Date()
    };
  }
}

module.exports = {
  UserFactory,
  RideFactory,
  LocationFactory
};

