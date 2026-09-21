import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lost2found';
    
    // Use Memory Server if in development and local URI is specified (no local mongo required)
    if (process.env.NODE_ENV !== 'production' && mongoUri.includes('localhost')) {
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('Using mongodb-memory-server for local development');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

