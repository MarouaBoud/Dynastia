/**
 * Dynastia Backend Server
 *
 * Main entry point for the Express server.
 * Handles authentication, user management, and financial data.
 *
 * Features:
 * - JWT-based authentication with access + refresh tokens
 * - TOTP 2FA support
 * - Emotionally safe error messages
 * - CORS enabled for mobile app
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for mobile app
app.use(express.json()); // Parse JSON request bodies

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Dynastia Backend API'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'We couldn\'t find what you\'re looking for'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dynastia Backend API is running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log('');
  console.log('Available endpoints:');
  console.log('   POST /api/auth/signup');
  console.log('   POST /api/auth/login');
  console.log('   POST /api/auth/refresh');
  console.log('   POST /api/auth/2fa/enable (protected)');
  console.log('   POST /api/auth/2fa/verify');
  console.log('   POST /api/auth/2fa/disable (protected)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

export default app;
