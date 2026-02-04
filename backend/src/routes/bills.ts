/**
 * Bill Routes
 *
 * All routes require authentication via authMiddleware
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createBill,
  getBills,
  getBill,
  updateBill,
  deleteBill,
  markBillPaid,
} from '../controllers/bill.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD endpoints
router.post('/', createBill);
router.get('/', getBills);
router.get('/:id', getBill);
router.patch('/:id', updateBill);
router.delete('/:id', deleteBill);

// Special actions
router.post('/:id/mark-paid', markBillPaid);

export default router;
