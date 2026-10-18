import mongoose from 'mongoose';

let isConnected = false;
let connPromise = null;

/**
 * Safely masks database credentials from connection URIs to prevent
 * leaking passwords in terminal logs or console outputs.
 */
export const maskMongoURI = (rawUri) => {
  if (!rawUri || typeof rawUri !== 'string') return '';
  return rawUri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@.+)/i, '$1****$2');
};

/**
 * Helper to check live database connectivity state
 */
export const isDBConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

/**
 * Connect to MongoDB Atlas (or local MongoDB).
 * Uses MONGODB_URI from environment variables.
 * Caches active connection promise to prevent duplicate concurrent connections in serverless environments.
 */
export const connectDB = async (customUri = null) => {
  let uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/creditlens';
  const maskedUri = maskMongoURI(uri);

  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connPromise) {
    return connPromise;
  }

  connPromise = (async () => {
    try {
      const conn = await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB_NAME || 'creditlens',
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        autoIndex: process.env.NODE_ENV !== 'production'
      });

      isConnected = true;
      console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);
      console.log(`[Database] Target Cluster URI: ${maskedUri}`);

      return conn;
    } catch (error) {
      isConnected = false;
      connPromise = null;
      console.error(`\n[Database Error] Failed to connect to MongoDB Atlas at ${maskedUri}`);
      console.error(`[Database Diagnostic] ${error.message}`);

      if (error.message.includes('whitelist') || (error.cause && error.cause.message && error.cause.message.includes('alert number 80'))) {
        console.error(`[Atlas Network Access Diagnostic] The connection was rejected during the TLS handshake (SSL alert 80).`);
        console.error(`[Resolution] Your current machine IP address is not whitelisted in MongoDB Atlas.`);
        console.error(`[Action Required] Log into MongoDB Atlas Console (https://cloud.mongodb.com) -> Security -> Network Access -> Add IP Address -> Add Current IP or 0.0.0.0/0.\n`);
      }

      return null;
    }
  })();

  return connPromise;
};

/**
 * Disconnect from MongoDB cleanly
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    connPromise = null;
    console.log('[Database] MongoDB disconnected cleanly.');
  }
};

// Runtime connection lifecycle event listeners
mongoose.connection.on('error', (err) => {
  console.error(`[Database Runtime Error] ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  if (isConnected) {
    isConnected = false;
    connPromise = null;
    console.warn('[Database Warning] MongoDB connection lost. Attempting auto-reconnect...');
  }
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[Database] MongoDB reconnected successfully.');
});
