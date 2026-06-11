const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Start in-memory MongoDB server and connect Mongoose
beforeAll(async () => {
  // Set JWT secrets for testing environment
  process.env.JWT_SECRET = 'testsecret12345';
  process.env.JWT_REFRESH_SECRET = 'testrefreshsecret12345';
  process.env.NODE_ENV = 'test';

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

// Close database connection and stop memory database
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear collections before running each test case
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
