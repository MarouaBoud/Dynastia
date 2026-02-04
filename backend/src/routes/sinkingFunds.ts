/**
 * Sinking Fund Routes
 *
 * All routes require authentication via authMiddleware
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createSinkingFund,
  getSinkingFunds,
  getSinkingFund,
  updateSinkingFund,
  contributeTo,
  deleteSinkingFund,
} from '../controllers/sinkingFund.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD endpoints
router.post('/', createSinkingFund);
router.get('/', getSinkingFunds);
router.get('/:id', getSinkingFund);
router.patch('/:id', updateSinkingFund);
router.delete('/:id', deleteSinkingFund);

// Special actions
router.post('/:id/contribute', contributeTo);

export default router;
