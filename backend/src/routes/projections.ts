/**
 * Projections Routes
 *
 * /api/projections/*
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { projectionsController } from '../controllers/projections.controller';

const router = Router();

// GET /api/projections/fi - Calculate FI metrics
router.get('/fi', authMiddleware, projectionsController.getFIProjection);

// POST /api/projections/scenario - Run what-if scenario
router.post('/scenario', authMiddleware, projectionsController.runScenario);

// POST /api/projections/plan - Generate 90-day plan
router.post('/plan', authMiddleware, projectionsController.generatePlan);

export default router;
