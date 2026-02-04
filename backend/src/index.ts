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
 * - Request validation with Zod
 * - Rate limiting for abuse prevention
 * - Structured logging with Pino
 * - Security headers with Helmet
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import transactionsRoutes from './routes/transactions';
import assetsRoutes from './routes/assets';
import liabilitiesRoutes from './routes/liabilities';
import networthRoutes from './routes/networth';
import budgetsRoutes from './routes/budgets';
import incomesRoutes from './routes/incomes';
import billsRoutes from './routes/bills';
import sinkingFundsRoutes from './routes/sinkingFunds';
import milestonesRoutes from './routes/milestones';

// Middleware
import { httpLogger, logger } from './middleware/logger';
import { generalLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// Security Middleware
// =============================================================================

// Helmet - Security headers
app.use(helmet());

// CORS - Configured for mobile app
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:8081', // Expo dev server
  'http://localhost:19006', // Expo web
  'exp://localhost:8081', // Expo Go
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn({ origin }, 'CORS blocked request from origin');
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// =============================================================================
// Request Processing Middleware
// =============================================================================

// Request logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(httpLogger);
}

// Parse JSON request bodies (with size limit)
app.use(express.json({ limit: '10kb' }));

// General rate limiting
app.use(generalLimiter);

// =============================================================================
// Routes
// =============================================================================

// Health check endpoint (no rate limit, no logging)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Dynastia Backend API',
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/liabilities', liabilitiesRoutes);
app.use('/api/networth', networthRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/incomes', incomesRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/sinking-funds', sinkingFundsRoutes);
app.use('/api/milestones', milestonesRoutes);

// =============================================================================
// Error Handling
// =============================================================================

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// =============================================================================
// Server Startup
// =============================================================================

app.listen(PORT, () => {
  logger.info({ port: PORT }, '🚀 Dynastia Backend API started');
  logger.info({ url: `http://localhost:${PORT}/health` }, 'Health check available');

  if (process.env.NODE_ENV === 'development') {
    console.log(`
🚀 Dynastia Backend API is running on port ${PORT}
   Health check: http://localhost:${PORT}/health

Security features enabled:
   ✓ Helmet security headers
   ✓ CORS with origin whitelist
   ✓ Rate limiting (100 req/15min general, stricter for auth)
   ✓ Request validation with Zod
   ✓ Structured logging with Pino
   ✓ Global error handling

Available endpoints:
   Auth:      POST /api/auth/signup, login, refresh, 2fa/*
   Users:     GET/PATCH /api/users/me
   Transactions: CRUD /api/transactions
   Assets:    CRUD /api/assets
   Liabilities: CRUD /api/liabilities
   Net Worth: GET /api/networth
   Budgets:   CRUD /api/budgets
   Incomes:   CRUD /api/incomes
   Bills:     CRUD /api/bills
   Sinking Funds: CRUD /api/sinking-funds
   Milestones: GET /api/milestones
`);
  }
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info({ signal }, 'Shutdown signal received');
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
