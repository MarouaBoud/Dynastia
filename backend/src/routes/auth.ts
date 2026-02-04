/**
 * Authentication Routes
 *
 * Defines HTTP routes for authentication operations.
 * Includes validation, rate limiting, and auth middleware.
 *
 * Routes:
 * - POST /auth/signup: Public - Create account
 * - POST /auth/login: Public - Authenticate
 * - POST /auth/refresh: Public - Refresh access token
 * - POST /auth/2fa/enable: Protected - Enable 2FA
 * - POST /auth/2fa/verify: Public - Verify 2FA token
 * - POST /auth/2fa/disable: Protected - Disable 2FA
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { authLimiter, twoFactorLimiter } from '../middleware/rateLimit';
import {
  signupSchema,
  loginSchema,
  refreshSchema,
  verify2FASchema,
} from '../validators/auth.validator';

const router = Router();

// =============================================================================
// Public routes (no authentication required)
// =============================================================================

// Signup - stricter rate limit to prevent abuse
router.post(
  '/signup',
  authLimiter,
  validate(signupSchema),
  authController.signup
);

// Login - stricter rate limit to prevent brute force
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

// Refresh token
router.post(
  '/refresh',
  validate(refreshSchema),
  authController.refresh
);

// 2FA verification - strict limit to prevent code guessing
router.post(
  '/2fa/verify',
  twoFactorLimiter,
  validate(verify2FASchema),
  authController.verify2FA
);

// =============================================================================
// Protected routes (require authentication)
// =============================================================================

// Enable 2FA
router.post(
  '/2fa/enable',
  authMiddleware,
  authController.enable2FA
);

// Disable 2FA
router.post(
  '/2fa/disable',
  authMiddleware,
  authController.disable2FA
);

export default router;
