/**
 * Habits API Routes
 *
 * Endpoints for Money Date check-ins, streak tracking, and notification preferences.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createCheckIn,
  getCheckIns,
  getStreak,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../controllers/habit.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Check-in endpoints
router.post('/check-in', createCheckIn);
router.get('/check-ins', getCheckIns);
router.get('/streak', getStreak);

// Notification preferences
router.get('/notifications', getNotificationPreferences);
router.put('/notifications', updateNotificationPreferences);

export default router;
