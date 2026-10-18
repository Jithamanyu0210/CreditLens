import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Pre-warm MongoDB Atlas connection during lambda container initialization
if (process.env.MONGODB_URI) {
  connectDB().catch((err) => {
    console.error('[CreditLens Vercel Serverless] MongoDB Atlas initial connection notice:', err.message);
  });
}

export default async function handler(req, res) {
  if (process.env.MONGODB_URI && mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('[CreditLens Vercel Serverless] MongoDB Atlas connection error:', err.message);
    }
  }
  return app(req, res);
}
