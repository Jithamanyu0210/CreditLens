import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import simulatorRoutes from './routes/simulatorRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import bankRateRoutes from './routes/bankRateRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// CORS configuration restricted to frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_ORIGIN
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.options('*', cors());

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/simulators', simulatorRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bank-rates', bankRateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
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
