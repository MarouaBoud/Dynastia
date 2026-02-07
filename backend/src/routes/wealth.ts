/**
 * Wealth Routes
 *
 * API routes for country-specific wealth guidance and currency conversion.
 *
 * Routes:
 * - GET /api/wealth/guidance - Get country-specific wealth account recommendations
 * - GET /api/wealth/exchange-rate - Get exchange rate between currencies
 * - POST /api/wealth/convert - Convert amount between currencies
 *
 * All routes require authentication.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getWealthGuidance,
  getExchangeRates,
  convertAmount,
} from '../controllers/wealth.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/wealth/guidance
 * Get country-specific wealth account recommendations based on user's country settings
 */
router.get('/guidance', getWealthGuidance);

/**
 * GET /api/wealth/exchange-rate?from=USD&to=EUR
 * Get exchange rate between two currencies
 */
router.get('/exchange-rate', getExchangeRates);

/**
 * POST /api/wealth/convert
 * Convert an amount from one currency to another
 * Body: { amount: number, from: string, to: string }
 */
router.post('/convert', convertAmount);

export default router;
