const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Automatically reset cache on disconnection or TLS socket errors to prevent stale socket reuse
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Clearing cached serverless connection.');
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  cached.conn = null;
  cached.promise = null;
});

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.error('CRITICAL: MONGODB_URI environment variable is missing on Vercel!');
      throw new Error('MONGODB_URI environment variable is not configured in Vercel settings.');
    }
    if (!cached.conn || mongoose.connection.readyState !== 1) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      cached.conn = await mongoose.connect(inMemoryUri);
    }
    return cached.conn;
  }

  // Reuse existing active connection ONLY if readyState is fully connected (1)
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is stale or broken, clear promises to force fresh SSL handshake
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      minPoolSize: 0, // Essential for Vercel serverless: allow pool to shrink to 0 when idle
      maxIdleTimeMS: 10000, // Close idle connections after 10s before Atlas drops TLS sockets
      serverSelectionTimeoutMS: 5000, // Fast failure timeout if Atlas is unreachable
      socketTimeoutMS: 45000,
      family: 4, // IPv4 for fast DNS resolution
      retryWrites: true,
      retryReads: true
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
    cached.conn = null;
    cached.promise = null;
    console.error('MongoDB Connection Failure:', e.message);
    throw new Error(`MongoDB Cloud Connection Failed: ${e.message}`);
  }

  return cached.conn;
}

module.exports = connectDB;
