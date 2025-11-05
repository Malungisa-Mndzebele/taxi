const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Set up test environment with in-memory MongoDB
 */
async function setupTestEnvironment() {
  // Set environment to test
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  
  try {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Test database connected');
  } catch (error) {
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
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    
    // Stop in-memory MongoDB server
    if (mongoServer) {
      await mongoServer.stop({ doCleanup: true, force: false });
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
  return jwt.sign(
    { user: { id: userId } },
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
