const { MongoMemoryServer } = require('mongodb-memory-server');

async function run() {
  console.log('Starting MongoDB Memory Server on port 27017...');
  
  // Configure MongoMemoryServer to run on port 27017 with database 'vibeRoommate'
  const mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '5.0.26'
    },
    instance: {
      port: 27017,
      dbName: 'vibeRoommate',
      ip: '127.0.0.1',
      storageEngine: 'ephemeralForTest'
    }
  });

  const uri = mongoServer.getUri();
  console.log(`\n======================================================`);
  console.log(`🚀 MongoDB Memory Server is running on port 27017!`);
  console.log(`🔗 URI: ${uri}`);
  console.log(`======================================================\n`);
  console.log(`Keep this process open while developing or testing.`);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nStopping MongoDB Memory Server...');
    await mongoServer.stop();
    process.exit(0);
  });
}

run().catch(err => {
  console.error('❌ Failed to start MongoDB Memory Server:', err);
  process.exit(1);
});
