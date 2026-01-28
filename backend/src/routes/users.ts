import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get current user profile
router.get('/me', getProfile);

// Update user profile (country, currency)
router.patch('/me', updateProfile);

export default router;
