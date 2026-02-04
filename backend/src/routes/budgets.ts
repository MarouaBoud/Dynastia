/**
 * Budget Routes
 *
 * All routes require authentication via authMiddleware
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createBudget,
  getCurrentBudget,
  getBudget,
  updateBudget,
  getBudgetProgress,
  getPresets,
  checkRebalance,
} from '../controllers/budget.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Static routes first
router.get('/presets', getPresets);
router.get('/current', getCurrentBudget);
router.get('/check-rebalance', checkRebalance);

// CRUD endpoints
router.post('/', createBudget);
router.get('/:id', getBudget);
router.patch('/:id', updateBudget);
router.get('/:id/progress', getBudgetProgress);

export default router;
