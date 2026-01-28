/**
 * Net Worth Routes
 *
 * All routes require authentication via authMiddleware
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getNetWorth } from '../controllers/networth.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get net worth endpoint
router.get('/', getNetWorth);

export default router;
