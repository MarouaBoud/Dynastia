/**
 * Transaction Routes
 *
 * All routes require authentication via authMiddleware
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactions.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD endpoints
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
