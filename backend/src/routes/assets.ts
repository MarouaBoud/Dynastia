/**
 * Asset Routes
 *
 * All routes require authentication via authMiddleware
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createAsset,
  getAssets,
  updateAsset,
  deleteAsset,
} from '../controllers/assets.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// CRUD endpoints
router.post('/', createAsset);
router.get('/', getAssets);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;
