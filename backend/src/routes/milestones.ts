/**
 * Milestone Routes
 *
 * All routes require authentication via authMiddleware
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getMilestones,
  checkMilestones,
  getMilestoneTypes,
} from '../controllers/milestone.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/', getMilestones);
router.get('/types', getMilestoneTypes);
router.post('/check', checkMilestones);

export default router;
