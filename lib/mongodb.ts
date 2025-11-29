import mongoose from 'mongoose';

// Extend the global type to include our MongoDB cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Get MongoDB URI from environment variables
const envUri = process.env.MONGODB_URI;

if (!envUri) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

// After validation, assign to a typed constant
const MONGODB_URI: string = envUri;

/**
 * Global cache to prevent multiple connections during development.
 * In development, Next.js hot reloading can cause multiple connections
 * if we don't cache the connection promise.
 */
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Caches the connection to reuse across hot reloads in development.
 * 
 * @returns {Promise<mongoose.Connection>} The MongoDB connection instance
 */
async function connectDB(): Promise<mongoose.Connection> {
  // Return cached connection if it exists
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if it doesn't exist
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable buffering to fail fast if not connected
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  try {
    // Await the connection promise and cache the result
    cached.conn = await cached.promise;
  } catch (e) {
    // Reset promise on error so next call attempts to reconnect
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
