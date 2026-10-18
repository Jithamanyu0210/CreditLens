import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import simulatorRoutes from './routes/simulatorRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import bankRateRoutes from './routes/bankRateRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Build normalized list of allowed CORS origins
const getAllowedOrigins = () => {
  const origins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  if (process.env.CLIENT_ORIGIN) {
    const configured = process.env.CLIENT_ORIGIN
      .split(',')
      .map((item) => item.trim().replace(/\/+$/, ''))
      .filter(Boolean);
    origins.push(...configured);
  }
  return origins;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/+$/, '');
      const allowed = getAllowedOrigins();
      if (allowed.includes(normalizedOrigin) || allowed.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.options('*', cors());

app.use(express.json());

// Ensure MongoDB connection in serverless runtime environments (e.g. Vercel)
app.use(async (req, res, next) => {
  if (process.env.VERCEL && process.env.MONGODB_URI && mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch {
      // ConnectDB internally logs masked connection diagnostic details
    }
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/simulators', simulatorRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bank-rates', bankRateRoutes);

// Health check endpoint (supports both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'CreditLens REST API Gateway',
    timestamp: new Date().toISOString()
  });
});

// Root disclaimer / frontend entrypoint
app.get('/', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('text/html') && !req.xhr) {
    const indexPath = path.resolve(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  res.json({
    name: 'CreditLens FinTech API Gateway',
    version: '1.0.0',
    description: 'Loan Affordability & Repayment Planner REST API',
    disclaimer: 'Educational planning tool only. Not credit approval or official lending advice.'
  });
});

// Serve frontend assets if production bundle exists
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// Central Error & 404 Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
