#!/usr/bin/env node

/**
 * Manual Test Script for Taxi App
 * Tests the complete user flow step by step
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testData = {
  passenger: {
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie.brown.manual@test.com',
    phone: '5555555555',
    password: 'password123',
    role: 'passenger'
  },
  driver: {
    firstName: 'Diana',
    lastName: 'Prince',
    email: 'diana.prince.manual@test.com',
    phone: '6666666666',
    password: 'password123',
    role: 'driver'
  }
};

let passengerToken, driverToken, passengerId, driverId, rideId;

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Backend Health Check...');
  const result = await apiCall('GET', '/health');
  
  if (result.success) {
    console.log('✅ Backend is healthy:', result.data.status);
    return true;
  } else {
    console.log('❌ Backend health check failed:', result.error);
    return false;
  }
}

async function testPassengerRegistration() {
  console.log('\n👤 Testing Passenger Registration...');
  const result = await apiCall('POST', '/auth/register', testData.passenger);
  
  if (result.success) {
    console.log('✅ Passenger registered successfully');
    console.log('   Name:', result.data.user.firstName, result.data.user.lastName);
    console.log('   Email:', result.data.user.email);
    console.log('   Role:', result.data.user.role);
    passengerToken = result.data.token;
    passengerId = result.data.user._id;
    return true;
  } else {
    console.log('❌ Passenger registration failed:', result.error);
    return false;
  }
}

async function testDriverRegistration() {
  console.log('\n🚗 Testing Driver Registration...');
  const result = await apiCall('POST', '/auth/register', testData.driver);
  
  if (result.success) {
    console.log('✅ Driver registered successfully');
    console.log('   Name:', result.data.user.firstName, result.data.user.lastName);
    console.log('   Email:', result.data.user.email);
    console.log('   Role:', result.data.user.role);
    driverToken = result.data.token;
    driverId = result.data.user._id;
    return true;
  } else {
    console.log('❌ Driver registration failed:', result.error);
    return false;
  }
}

async function testPassengerLogin() {
  console.log('\n🔐 Testing Passenger Login...');
  const loginData = {
    email: testData.passenger.email,
    password: testData.passenger.password
  };
  
  const result = await apiCall('POST', '/auth/login', loginData);
  
  if (result.success) {
    console.log('✅ Passenger login successful');
    console.log('   Welcome:', result.data.user.firstName, result.data.user.lastName);
    passengerToken = result.data.token; // Update token
    return true;
  } else {
    console.log('❌ Passenger login failed:', result.error);
    return false;
  }
}

async function testDriverLogin() {
  console.log('\n🔐 Testing Driver Login...');
  const loginData = {
    email: testData.driver.email,
    password: testData.driver.password
  };
  
  const result = await apiCall('POST', '/auth/login', loginData);
  
  if (result.success) {
    console.log('✅ Driver login successful');
    console.log('   Welcome:', result.data.user.firstName, result.data.user.lastName);
    driverToken = result.data.token; // Update token
    return true;
  } else {
    console.log('❌ Driver login failed:', result.error);
    return false;
  }
}

async function testRideRequest() {
  console.log('\n🚖 Testing Ride Request...');
  const rideData = {
    pickupLocation: {
      coordinates: [-74.0060, 40.7128],
      address: '123 Main St, New York, NY'
    },
    dropoffLocation: {
      coordinates: [-73.9851, 40.7589],
      address: '456 Broadway, New York, NY'
    },
    distance: 5.2, // km
    estimatedDuration: 15 // minutes
  };
  
  const result = await apiCall('POST', '/rides/request', rideData, passengerToken);
  
  if (result.success) {
    console.log('✅ Ride requested successfully');
    console.log('   Pickup:', result.data.ride.pickupLocation.address);
    console.log('   Dropoff:', result.data.ride.dropoffLocation.address);
    console.log('   Status:', result.data.ride.status);
    rideId = result.data.ride._id;
    return true;
  } else {
    console.log('❌ Ride request failed:', result.error);
    return false;
  }
}

async function testDriverAcceptRide() {
  console.log('\n✅ Testing Driver Ride Acceptance...');
  const result = await apiCall('POST', `/rides/${rideId}/accept`, {}, driverToken);
  
  if (result.success) {
    console.log('✅ Ride accepted successfully');
    console.log('   Driver:', result.data.ride.driver);
    console.log('   Status:', result.data.ride.status);
    return true;
  } else {
    console.log('❌ Ride acceptance failed:', result.error);
    return false;
  }
}

async function testRideStatusUpdate() {
  console.log('\n🔄 Testing Ride Status Update...');
  
  // Driver arrives
  let result = await apiCall('POST', `/rides/${rideId}/arrive`, {}, driverToken);
  if (result.success) {
    console.log('✅ Driver arrived at pickup location');
  } else {
    console.log('❌ Failed to update ride status to arrived:', result.error);
    return false;
  }
  
  // Start ride
  result = await apiCall('POST', `/rides/${rideId}/start`, {}, driverToken);
  if (result.success) {
    console.log('✅ Ride started');
  } else {
    console.log('❌ Failed to start ride:', result.error);
    return false;
  }
  
  // Complete ride
  result = await apiCall('POST', `/rides/${rideId}/complete`, {}, driverToken);
  if (result.success) {
    console.log('✅ Ride completed successfully');
    return true;
  } else {
    console.log('❌ Failed to complete ride:', result.error);
    return false;
  }
}

async function testRideHistory() {
  console.log('\n📋 Testing Ride History...');
  const result = await apiCall('GET', '/rides/history', null, passengerToken);
  
  if (result.success) {
    console.log('✅ Ride history retrieved successfully');
    console.log('   Total rides:', result.data.rides.length);
    if (result.data.rides.length > 0) {
      const lastRide = result.data.rides[0];
      console.log('   Last ride status:', lastRide.status);
      console.log('   Last ride pickup:', lastRide.pickupLocation);
    }
    return true;
  } else {
    console.log('❌ Failed to retrieve ride history:', result.error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚗 Starting Manual Taxi App Tests...');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Passenger Registration', fn: testPassengerRegistration },
    { name: 'Driver Registration', fn: testDriverRegistration },
    { name: 'Passenger Login', fn: testPassengerLogin },
    { name: 'Driver Login', fn: testDriverLogin },
    { name: 'Ride Request', fn: testRideRequest },
    { name: 'Driver Accept Ride', fn: testDriverAcceptRide },
    { name: 'Ride Status Update', fn: testRideStatusUpdate },
    { name: 'Ride History', fn: testRideHistory }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your taxi app is working perfectly!');
    console.log('\n📱 Tested Features:');
    console.log('   ✅ Driver registration and login');
    console.log('   ✅ Passenger registration and login');
    console.log('   ✅ Ride request functionality');
    console.log('   ✅ Driver ride acceptance');
    console.log('   ✅ Ride status management');
    console.log('   ✅ Ride history tracking');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above for details.');
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test runner error:', error.message);
  process.exit(1);
});
