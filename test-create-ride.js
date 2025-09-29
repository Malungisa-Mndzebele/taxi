const axios = require('axios');

async function testCreateRide() {
  try {
    // Register a passenger first
    const timestamp = Date.now();
    const passengerData = {
      firstName: 'Test',
      lastName: 'Passenger',
      email: `test.passenger.${timestamp}@example.com`,
      phone: `${timestamp.toString().slice(-10)}`,
      password: 'password123',
      role: 'passenger'
    };
    
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', passengerData);
    console.log('✅ Passenger registered:', registerResponse.data.user.email);
    
    // Login as passenger
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: passengerData.email,
      password: passengerData.password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Create a ride request
    const rideData = {
      pickupLocation: {
        coordinates: [-74.0060, 40.7128],
        address: '123 Main St, New York, NY'
      },
      dropoffLocation: {
        coordinates: [-73.9851, 40.7589],
        address: '456 Broadway, New York, NY'
      },
      distance: 5.2,
      estimatedDuration: 15
    };
    
    const rideResponse = await axios.post('http://localhost:5000/api/rides/request', 
      rideData,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    console.log('✅ Ride created:', rideResponse.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testCreateRide();
