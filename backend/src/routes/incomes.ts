/**
 * Income Routes
 *
 * All routes require authentication via authMiddleware
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createIncome,
  getIncomes,
  getIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/income.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD endpoints
router.post('/', createIncome);
router.get('/', getIncomes);
router.get('/:id', getIncome);
router.patch('/:id', updateIncome);
router.delete('/:id', deleteIncome);

export default router;
