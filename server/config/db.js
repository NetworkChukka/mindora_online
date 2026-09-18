const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  try {
    if (mongoUri && mongoUri.trim() !== '') {
      console.log('Connecting to cloud/provided MongoDB database...');
      await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } else {
      console.log('No MONGODB_URI set. Starting MongoMemoryServer for instant local execution...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`MongoDB Memory Server Connected: ${inMemoryUri}`);
    }
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Do not crash immediately in production, allow express health check to report database: disconnected
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Reconnection attempts in progress...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully.');
  });
}

module.exports = connectDB;
