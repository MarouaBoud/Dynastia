/**
 * Liability Routes
 *
 * All routes require authentication via authMiddleware
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createLiability,
  getLiabilities,
  updateLiability,
  deleteLiability,
} from '../controllers/liabilities.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD endpoints
router.post('/', createLiability);
router.get('/', getLiabilities);
router.put('/:id', updateLiability);
router.delete('/:id', deleteLiability);

export default router;
