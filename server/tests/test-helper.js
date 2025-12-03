const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Set up test environment with in-memory MongoDB or service container
 */
async function setupTestEnvironment() {
  // Set environment to test
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Test database already connected');
      return;
    }
    
    // Use Docker MongoDB (localhost:27017) for all tests
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taxi-app-test';
    console.log('🔧 Using Docker MongoDB');
    
    // Connect to database with retry logic
    if (mongoose.connection.readyState === 0) {
      let retries = 5;
      let connected = false;
      
      while (retries > 0 && !connected) {
        try {
          await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
          });
          connected = true;
          console.log('✅ Test database connected');
        } catch (connectError) {
          retries--;
          if (retries === 0) throw connectError;
          console.log(`⏳ Waiting for MongoDB... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Create indexes after connection
      try {
        const User = require('../models/User');
        await User.collection.createIndex({ 'currentLocation.coordinates': '2dsphere' });
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ phone: 1 }, { unique: true });
        
        const Ride = require('../models/Ride');
        await Ride.collection.createIndex({ 'pickupLocation': '2dsphere' });
        await Ride.collection.createIndex({ 'dropoffLocation': '2dsphere' });
      } catch (indexError) {
        // Indexes might already exist, that's okay
        if (!indexError.message.includes('already exists')) {
          console.warn('Index creation warning:', indexError.message);
        }
      }
    }
  } catch (error) {
    // If connection already exists, that's okay
    if (error.message.includes('Can\'t call `openUri()` on an active connection')) {
      console.log('✅ Test database already connected (reusing existing connection)');
      return;
    }
    console.error('❌ Error setting up test environment:', error);
    throw error;
  }
}

/**
 * Tear down test environment
 */
async function teardownTestEnvironment() {
  try {
    // Close mongoose connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    console.log('✅ Test database disconnected');
  } catch (error) {
    // Log warning but don't throw - cleanup errors shouldn't fail tests
    console.warn('⚠️  Warning during test environment cleanup:', error.message);
  }
}

/**
 * Clear all collections in the database
 */
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

/**
 * Generate a test JWT token
 */
function generateTestToken(userId) {
  const jwt = require('jsonwebtoken');
  // Support both token formats for compatibility
  return jwt.sign(
    { userId: userId },
    process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing',
    { expiresIn: '1h' }
  );
}

module.exports = {
  setupTestEnvironment,
  teardownTestEnvironment,
  clearDatabase,
  generateTestToken,
};
