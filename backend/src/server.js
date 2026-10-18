import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from backend directory with fallback to process.cwd()
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Connect to MongoDB Atlas when server starts
await connectDB();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CreditLens Backend] Secure server running on http://localhost:${PORT} (0.0.0.0:${PORT})`);
  console.log(`[CreditLens Backend] API Health Check: http://localhost:${PORT}/api/health`);
});

// Handle server startup errors (e.g. port conflict / EADDRINUSE)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[CreditLens Backend Startup Error] Port ${PORT} is already in use by another running process.`);
    console.error(`[CreditLens Diagnostic] A backend instance is already running on port ${PORT}.`);
    console.error(`[Resolution] Terminate the process currently listening on port ${PORT} or configure a different PORT in backend/.env.\n`);
    process.exit(1);
  } else {
    console.error(`[CreditLens Backend Server Error] Failed to bind to port ${PORT}:`, err.message);
    process.exit(1);
  }
});

// Graceful shutdown handling
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[CreditLens Backend] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

export default server;
