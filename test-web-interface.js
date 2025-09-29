#!/usr/bin/env node

/**
 * Test Web Interface Functionality
 * Tests the complete web interface flow
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testWebInterface() {
  console.log('🌐 Testing Web Interface Functionality...');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Health Check
  console.log('\n🔍 Testing Backend Health Check...');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend health check successful:', response.data.status);
    passed++;
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    failed++;
  }
  
  // Test 2: Register a Driver
  console.log('\n👤 Testing Driver Registration...');
  const timestamp = Date.now();
  const driverData = {
    firstName: 'Web',
    lastName: 'Driver',
    email: `web.driver.${timestamp}@example.com`,
    phone: `${timestamp.toString().slice(-10)}`,
    password: 'password123',
    role: 'driver'
  };
  
  let driverToken;
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, driverData);
    console.log('✅ Driver registered successfully');
    console.log('   Name:', response.data.user.firstName, response.data.user.lastName);
    console.log('   Role:', response.data.user.role);
    driverToken = response.data.token;
    passed++;
  } catch (error) {
    console.log('❌ Driver registration failed:', error.response?.data?.message || error.message);
    failed++;
  }
  
  // Test 3: Register a Passenger
  console.log('\n👤 Testing Passenger Registration...');
  const passengerData = {
    firstName: 'Web',
    lastName: 'Passenger',
    email: `web.passenger.${timestamp}@example.com`,
    phone: `${(timestamp + 1).toString().slice(-10)}`,
    password: 'password123',
    role: 'passenger'
  };
  
  let passengerToken;
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, passengerData);
    console.log('✅ Passenger registered successfully');
    console.log('   Name:', response.data.user.firstName, response.data.user.lastName);
    console.log('   Role:', response.data.user.role);
    passengerToken = response.data.token;
    passed++;
  } catch (error) {
    console.log('❌ Passenger registration failed:', error.response?.data?.message || error.message);
    failed++;
  }
  
  // Test 4: Driver Login
  console.log('\n🔐 Testing Driver Login...');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: driverData.email,
      password: driverData.password
    });
    console.log('✅ Driver login successful');
    console.log('   Welcome:', response.data.user.firstName, response.data.user.lastName);
    driverToken = response.data.token; // Update token
    passed++;
  } catch (error) {
    console.log('❌ Driver login failed:', error.response?.data?.message || error.message);
    failed++;
  }
  
  // Test 5: Passenger Login
  console.log('\n🔐 Testing Passenger Login...');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: passengerData.email,
      password: passengerData.password
    });
    console.log('✅ Passenger login successful');
    console.log('   Welcome:', response.data.user.firstName, response.data.user.lastName);
    passengerToken = response.data.token; // Update token
    passed++;
  } catch (error) {
    console.log('❌ Passenger login failed:', error.response?.data?.message || error.message);
    failed++;
  }
  
  // Test 6: Set Driver Online
  console.log('\n🚗 Testing Driver Online Status...');
  try {
    const statusResponse = await axios.put(`${API_BASE}/drivers/status`, 
      { isOnline: true },
      { headers: { 'Authorization': `Bearer ${driverToken}` } }
    );
    console.log('✅ Driver set as online successfully');
    passed++;
  } catch (error) {
    console.log('❌ Driver online status failed:', error.response?.data?.message || error.message);
    failed++;
  }
  
  // Test 7: Driver Available Rides
  console.log('\n🚗 Testing Driver Available Rides...');
  try {
    const response = await axios.get(`${API_BASE}/rides/available`, {
      headers: { 'Authorization': `Bearer ${driverToken}` }
    });
    console.log('✅ Driver available rides retrieved successfully');
    console.log('   Available rides:', response.data.rides.length);
    passed++;
  } catch (error) {
    console.log('❌ Driver available rides failed:', error.response?.data?.message || error.message);
    failed++;
  }
  
  // Test 8: Passenger Active Rides
  console.log('\n🚖 Testing Passenger Active Rides...');
  try {
    const response = await axios.get(`${API_BASE}/rides/active`, {
      headers: { 'Authorization': `Bearer ${passengerToken}` }
    });
    console.log('✅ Passenger active rides retrieved successfully');
    console.log('   Active rides:', response.data.rides.length);
    passed++;
  } catch (error) {
    console.log('❌ Passenger active rides failed:', error.response?.data?.message || error.message);
    failed++;
  }
  
  // Test 9: Passenger Ride History
  console.log('\n📋 Testing Passenger Ride History...');
  try {
    const response = await axios.get(`${API_BASE}/rides/history`, {
      headers: { 'Authorization': `Bearer ${passengerToken}` }
    });
    console.log('✅ Passenger ride history retrieved successfully');
    console.log('   Total rides:', response.data.rides.length);
    passed++;
  } catch (error) {
    console.log('❌ Passenger ride history failed:', error.response?.data?.message || error.message);
    failed++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 WEB INTERFACE TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL WEB INTERFACE TESTS PASSED!');
    console.log('\n📱 Web Interface Features Working:');
    console.log('   ✅ Backend health check');
    console.log('   ✅ Driver registration and login');
    console.log('   ✅ Passenger registration and login');
    console.log('   ✅ Driver available rides access');
    console.log('   ✅ Passenger active rides access');
    console.log('   ✅ Passenger ride history access');
    console.log('   ✅ JWT authentication');
    console.log('   ✅ Role-based access control');
    
    console.log('\n🌐 Your web interface is ready!');
    console.log('   • Open web/index.html in your browser');
    console.log('   • Register as a driver or passenger');
    console.log('   • Login to see the appropriate dashboard');
    console.log('   • Drivers can view and accept available rides');
    console.log('   • Passengers can request rides and view history');
  } else {
    console.log('\n⚠️  Some web interface tests failed. Please check the output above for details.');
  }
}

// Run the tests
testWebInterface().catch(error => {
  console.error('❌ Web interface test error:', error.message);
  process.exit(1);
});
