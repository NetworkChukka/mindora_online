const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.error('CRITICAL: MONGODB_URI environment variable is missing on Vercel!');
      throw new Error('MONGODB_URI environment variable is not configured in Vercel settings.');
    }
    if (!cached.conn) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      cached.conn = await mongoose.connect(inMemoryUri);
    }
    return cached.conn;
  }

  // Reuse existing active connection if ready
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10, // Serverless pool size limit to prevent Atlas connection exhaustion
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000, // Quick fail if DB is unreachable
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4 for fast DNS resolution
    };

    console.log('Connecting to cloud MongoDB database with serverless connection pooling...');
    cached.promise = mongoose.connect(mongoUri, opts).then((m) => {
      console.log(`MongoDB Connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB Connection Failure:', e.message);
    throw new Error(`MongoDB Cloud Connection Failed: ${e.message}`);
  }

  return cached.conn;
}

module.exports = connectDB;
