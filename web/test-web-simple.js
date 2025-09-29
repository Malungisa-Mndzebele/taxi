#!/usr/bin/env node

/**
 * Simple Web Interface Test
 * Tests the web app functionality without complex DOM manipulation
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Mock localStorage for testing
const mockLocalStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  },
  clear: function() {
    this.data = {};
  }
};

// Mock fetch for testing
const mockFetch = async (url, options = {}) => {
  try {
    const response = await axios({
      method: options.method || 'GET',
      url: url,
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: options.headers || {}
    });
    
    return {
      ok: true,
      status: response.status,
      json: async () => response.data
    };
  } catch (error) {
    return {
      ok: false,
      status: error.response?.status || 500,
      json: async () => ({ message: error.response?.data?.message || error.message })
    };
  }
};

// Test functions
async function testWebAppFunctionality() {
  console.log('🌐 Testing Web App Functionality...');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Backend Health Check (simulating web app health check)
  console.log('\n🔍 Testing Backend Health Check (Web App)...');
  try {
    const response = await mockFetch('http://localhost:5000/api/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend health check successful:', data.status);
      passed++;
    } else {
      console.log('❌ Backend health check failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Backend health check error:', error.message);
    failed++;
  }
  
  // Test 2: User Registration (simulating web app registration)
  console.log('\n👤 Testing User Registration (Web App)...');
  try {
    const timestamp = Date.now();
    const userData = {
      firstName: 'Web',
      lastName: 'Tester',
      email: `web.tester.${timestamp}@example.com`,
      phone: `${timestamp.toString().slice(-10)}`,
      password: 'password123',
      role: 'passenger'
    };
    
    const response = await mockFetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ User registration successful');
      console.log('   Name:', data.user.firstName, data.user.lastName);
      console.log('   Email:', data.user.email);
      console.log('   Role:', data.user.role);
      
      // Store token for next tests
      mockLocalStorage.setItem('authToken', data.token);
      mockLocalStorage.setItem('currentUser', JSON.stringify(data.user));
      passed++;
      
      // Test 3: User Login (simulating web app login)
      console.log('\n🔐 Testing User Login (Web App)...');
      const loginData = {
        email: userData.email,
        password: userData.password
      };
      
      const loginResponse = await mockFetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ User login successful');
        console.log('   Welcome:', loginResult.user.firstName, loginResult.user.lastName);
        
        // Update stored token
        mockLocalStorage.setItem('authToken', loginResult.token);
        passed++;
        
        // Test 4: Ride History (simulating web app ride history)
        console.log('\n📋 Testing Ride History (Web App)...');
        const token = mockLocalStorage.getItem('authToken');
        const historyResponse = await mockFetch('http://localhost:5000/api/rides/history', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          console.log('✅ Ride history retrieved successfully');
          console.log('   Total rides:', historyData.rides.length);
          passed++;
        } else {
          console.log('❌ Ride history failed');
          failed++;
        }
        
        // Test 5: Active Rides (simulating web app active rides)
        console.log('\n🚖 Testing Active Rides (Web App)...');
        const activeResponse = await mockFetch('http://localhost:5000/api/rides/active', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (activeResponse.ok) {
          const activeData = await activeResponse.json();
          console.log('✅ Active rides retrieved successfully');
          console.log('   Active rides:', activeData.rides.length);
          passed++;
        } else {
          console.log('❌ Active rides failed');
          failed++;
        }
        
      } else {
        console.log('❌ User login failed');
        failed++;
      }
      
    } else {
      console.log('❌ User registration failed');
      failed++;
    }
  } catch (error) {
    console.log('❌ Registration/Login test error:', error.message);
    failed++;
  }
  
  // Test 6: Authentication Status Check (simulating web app auth check)
  console.log('\n🔒 Testing Authentication Status (Web App)...');
  try {
    const token = mockLocalStorage.getItem('authToken');
    if (token) {
      const authResponse = await mockFetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        console.log('✅ Authentication status check successful');
        console.log('   User:', authData.user.firstName, authData.user.lastName);
        passed++;
      } else {
        console.log('❌ Authentication status check failed');
        failed++;
      }
    } else {
      console.log('❌ No authentication token found');
      failed++;
    }
  } catch (error) {
    console.log('❌ Authentication status check error:', error.message);
    failed++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 WEB APP TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL WEB APP TESTS PASSED! Your web interface is working perfectly!');
    console.log('\n📱 Tested Web Features:');
    console.log('   ✅ Backend health check');
    console.log('   ✅ User registration');
    console.log('   ✅ User login');
    console.log('   ✅ Ride history access');
    console.log('   ✅ Active rides access');
    console.log('   ✅ Authentication status check');
  } else {
    console.log('\n⚠️  Some web app tests failed. Please check the output above for details.');
  }
  
  return { passed, failed };
}

// Run the tests
testWebAppFunctionality().catch(error => {
  console.error('❌ Web app test runner error:', error.message);
  process.exit(1);
});
