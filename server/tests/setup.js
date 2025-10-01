const mongoose = require('mongoose');
const { setupTestEnvironment, teardownTestEnvironment } = require('./test-helper');
const { Server } = require('socket.io');

// Clear database before each test
beforeEach(async () => {
  // Drop all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    try {
      await collection.deleteMany({});
    } catch (err) {
      console.warn(`Error clearing collection ${key}:`, err.message);
    }
  }
});

// Set up test environment before all tests
beforeAll(async () => {
  await setupTestEnvironment();
});

// Clean up test environment after all tests
afterAll(async () => {
  await teardownTestEnvironment();
});

test('Test environment is set up correctly', () => {
  expect(process.env.NODE_ENV).toBe('test');
  expect(process.env.JWT_SECRET).toBeDefined();
});
