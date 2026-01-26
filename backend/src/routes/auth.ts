/**
 * Authentication Routes
 *
 * Defines HTTP routes for authentication operations.
 * Mounts controllers and applies middleware where needed.
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

const router = Router();

// Public routes (no authentication required)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/2fa/verify', authController.verify2FA);

// Protected routes (require authentication)
router.post('/2fa/enable', authMiddleware, authController.enable2FA);
router.post('/2fa/disable', authMiddleware, authController.disable2FA);

export default router;
