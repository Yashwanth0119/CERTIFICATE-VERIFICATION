import mongoose from 'mongoose';

/**
 * MongoDB Mongoose Connection Configuration
 * Connects to MongoDB when MONGO_URI is available,
 * or gracefully notes when using the embedded database.
 */
export async function connectMongoDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/certverify';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000 // Fast failover if local mongod is not started
    });
    console.log(`[Mongoose/MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.log(`[Mongoose/MongoDB] Local mongod not running on 27017 (${err.message}). Using persistent JSON database storage.`);
    return false;
  }
}
