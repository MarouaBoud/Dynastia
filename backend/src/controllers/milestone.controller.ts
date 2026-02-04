/**
 * Milestone Controller
 *
 * Tracks and retrieves user achievement milestones.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Milestone type definitions for Phase 3
const MILESTONE_TYPES = {
  credit_card_3_months_no_interest: {
    name: "You've broken the interest cycle!",
    description: '3 months of paying your credit card in full. Your money is working for you now.',
    celebration: true,
  },
};

/**
 * Get all milestones for current user
 * GET /api/milestones
 */
export async function getMilestones(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const milestones = await prisma.milestone.findMany({
      where: { userId },
      orderBy: { achievedAt: 'desc' },
    });

    // Enrich with milestone details
    const enrichedMilestones = milestones.map((milestone) => {
      const typeInfo = MILESTONE_TYPES[milestone.type as keyof typeof MILESTONE_TYPES];
      return {
        ...milestone,
        name: typeInfo?.name || milestone.type,
        description: typeInfo?.description || '',
        celebration: typeInfo?.celebration || false,
      };
    });

    res.status(200).json(enrichedMilestones);
  } catch (error: any) {
    console.error('Get milestones error:', error);
    res.status(500).json({
      error: "We couldn't load your milestones. Let's try again.",
    });
  }
}

/**
 * Check for new milestone achievements
 * POST /api/milestones/check
 *
 * This endpoint checks various conditions and awards milestones
 */
export async function checkMilestones(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'To keep your account secure, please log in again' });
      return;
    }

    const newMilestones: any[] = [];

    // Check for credit card 3-month milestone
    const creditCards = await prisma.bill.findMany({
      where: {
        userId,
        isCreditCard: true,
        consecutivePaidInFull: { gte: 3 },
      },
    });

    for (const card of creditCards) {
      // Check if milestone already exists for this card
      const existing = await prisma.milestone.findFirst({
        where: {
          userId,
          type: 'credit_card_3_months_no_interest',
          relatedId: card.id,
        },
      });

      if (!existing) {
        const milestone = await prisma.milestone.create({
          data: {
            userId,
            type: 'credit_card_3_months_no_interest',
            relatedId: card.id,
            metadata: { billName: card.name },
          },
        });

        const typeInfo = MILESTONE_TYPES.credit_card_3_months_no_interest;
        newMilestones.push({
          ...milestone,
          name: typeInfo.name,
          description: typeInfo.description,
          celebration: typeInfo.celebration,
        });
      }
    }

    // Additional milestone checks can be added here for Phase 4+

    res.status(200).json({
      checked: true,
      newMilestones,
      totalNew: newMilestones.length,
    });
  } catch (error: any) {
    console.error('Check milestones error:', error);
    res.status(500).json({
      error: "We couldn't check for new milestones. Let's try again.",
    });
  }
}

/**
 * Get milestone types and their descriptions
 * GET /api/milestones/types
 */
export async function getMilestoneTypes(req: Request, res: Response): Promise<void> {
  const types = Object.entries(MILESTONE_TYPES).map(([id, info]) => ({
    id,
    ...info,
  }));

  res.status(200).json(types);
}
