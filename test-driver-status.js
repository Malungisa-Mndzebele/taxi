const axios = require('axios');

async function testDriverStatus() {
  try {
    // Login as driver
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test.driver@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Driver login successful');
    
    // Set driver as online
    const statusResponse = await axios.put('http://localhost:5000/api/drivers/status', 
      { isOnline: true },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    console.log('✅ Driver status set to online:', statusResponse.data);
    
    // Try to get available rides
    const ridesResponse = await axios.get('http://localhost:5000/api/rides/available', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Available rides retrieved:', ridesResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testDriverStatus();
