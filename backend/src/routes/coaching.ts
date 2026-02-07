/**
 * Coaching Routes
 *
 * /api/coaching/*
 * Rate-limited to protect LLM API costs.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { llmRateLimit } from '../middleware/llm-rate-limit';
import { coachingController } from '../controllers/coaching.controller';

const router = Router();

// POST /api/coaching/prompt - Get contextual coaching message
// Rate limited: 20 requests per hour per user
router.post(
  '/prompt',
  authMiddleware,
  llmRateLimit,
  coachingController.getCoachingPrompt
);

export default router;
