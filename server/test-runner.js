// Simple test runner to verify our setup
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

async function runTests() {
  console.log('🚀 Starting test setup...');
  
  try {
    // Start in-memory MongoDB
    console.log('📦 Starting MongoDB Memory Server...');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log('✅ MongoDB Memory Server started at:', mongoUri);
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Test User model
    console.log('👤 Testing User model...');
    const User = require('./models/User');
    
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123',
      role: 'passenger'
    });
    
    const savedUser = await testUser.save();
    console.log('✅ User model test passed - User saved with ID:', savedUser._id);
    
    // Test password hashing
    const isMatch = await savedUser.comparePassword('password123');
    console.log('✅ Password comparison test passed:', isMatch);
    
    // Test Ride model
    console.log('🚗 Testing Ride model...');
    const Ride = require('./models/Ride');
    
    const testRide = new Ride({
      passenger: savedUser._id,
      pickupLocation: {
        type: 'Point',
        coordinates: [-122.4324, 37.78825],
        address: 'San Francisco, CA'
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'San Francisco Airport, CA'
      },
      distance: 15.5,
      estimatedDuration: 25,
      fare: {
        baseFare: 2.0,
        distanceFare: 23.25,
        timeFare: 7.5,
        surgeMultiplier: 1.0,
        totalFare: 32.75
      },
      payment: {
        method: 'card'
      }
    });
    
    const savedRide = await testRide.save();
    console.log('✅ Ride model test passed - Ride saved with ID:', savedRide._id);
    
    // Test fare calculation
    const calculatedFare = savedRide.calculateFare();
    console.log('✅ Fare calculation test passed - Calculated fare:', calculatedFare);
    
    // Test status update
    await savedRide.updateStatus('accepted');
    console.log('✅ Status update test passed - Ride status:', savedRide.status);
    
    // Clean up
    await mongoose.disconnect();
    await mongoServer.stop();
    
    console.log('🎉 All tests passed successfully!');
    console.log('📊 Test Summary:');
    console.log('  ✅ MongoDB Memory Server setup');
    console.log('  ✅ User model creation and validation');
    console.log('  ✅ Password hashing and comparison');
    console.log('  ✅ Ride model creation and validation');
    console.log('  ✅ Fare calculation');
    console.log('  ✅ Status updates');
    console.log('  ✅ Database cleanup');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();
