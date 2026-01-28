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
import usersRoutes from './routes/users';
import transactionsRoutes from './routes/transactions';
import assetsRoutes from './routes/assets';
import liabilitiesRoutes from './routes/liabilities';
import networthRoutes from './routes/networth';

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
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/liabilities', liabilitiesRoutes);
app.use('/api/networth', networthRoutes);

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
  console.log('');
  console.log('Available endpoints:');
  console.log('   Auth:');
  console.log('     POST /api/auth/signup');
  console.log('     POST /api/auth/login');
  console.log('     POST /api/auth/refresh');
  console.log('     POST /api/auth/2fa/enable (protected)');
  console.log('     POST /api/auth/2fa/verify');
  console.log('     POST /api/auth/2fa/disable (protected)');
  console.log('   Users:');
  console.log('     GET  /api/users/me (protected)');
  console.log('     PATCH /api/users/me (protected)');
  console.log('   Transactions:');
  console.log('     POST /api/transactions (protected)');
  console.log('     GET  /api/transactions (protected)');
  console.log('     GET  /api/transactions/:id (protected)');
  console.log('     PUT  /api/transactions/:id (protected)');
  console.log('     DELETE /api/transactions/:id (protected)');
  console.log('   Assets:');
  console.log('     POST /api/assets (protected)');
  console.log('     GET  /api/assets (protected)');
  console.log('     PUT  /api/assets/:id (protected)');
  console.log('     DELETE /api/assets/:id (protected)');
  console.log('   Liabilities:');
  console.log('     POST /api/liabilities (protected)');
  console.log('     GET  /api/liabilities (protected)');
  console.log('     PUT  /api/liabilities/:id (protected)');
  console.log('     DELETE /api/liabilities/:id (protected)');
  console.log('   Net Worth:');
  console.log('     GET  /api/networth (protected)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

export default app;
