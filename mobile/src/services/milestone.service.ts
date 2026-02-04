/**
 * Milestone Service
 *
 * Tracks user achievements and milestone celebrations.
 */

import { api } from './api';

// =============================================================================
// Types
// =============================================================================

export interface Milestone {
  id: string;
  type: string;
  title: string;
  description: string;
  achievedAt: string;
  celebratedAt?: string;
  metadata?: Record<string, any>;
}

export type MilestoneType =
  | 'CREDIT_CARD_3_MONTHS'
  | 'FIRST_BUDGET'
  | 'FIRST_SINKING_FUND'
  | 'EMERGENCY_FUND_STARTED'
  | 'DEBT_FREE';

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Get all milestones for the user
 */
export async function getMilestones(): Promise<Milestone[]> {
  const response = await api.get('/milestones');
  return response.data;
}

/**
 * Get uncelebrated milestones
 */
export async function getUncelebratedMilestones(): Promise<Milestone[]> {
  const response = await api.get('/milestones/uncelebrated');
  return response.data;
}

/**
 * Mark a milestone as celebrated
 */
export async function markCelebrated(id: string): Promise<Milestone> {
  const response = await api.patch(`/milestones/${id}/celebrate`);
  return response.data;
}

/**
 * Check for new milestone achievements
 * Called after relevant actions (e.g., marking bill as paid)
 */
export async function checkMilestones(): Promise<Milestone[]> {
  const response = await api.post('/milestones/check');
  return response.data;
}

/**
 * Create a milestone (internal use)
 */
export async function createMilestone(
  type: MilestoneType,
  metadata?: Record<string, any>
): Promise<Milestone> {
  const response = await api.post('/milestones', { type, metadata });
  return response.data;
}

/**
 * Get milestone title and description by type
 */
export function getMilestoneContent(type: MilestoneType): {
  title: string;
  description: string;
  icon: string;
} {
  const content: Record<MilestoneType, { title: string; description: string; icon: string }> = {
    CREDIT_CARD_3_MONTHS: {
      title: "You've broken the interest cycle!",
      description: '3 months of paying your credit card in full. Your money is working for you now.',
      icon: '🎉',
    },
    FIRST_BUDGET: {
      title: 'Your first budget!',
      description: "You've taken control of where your money goes. This is the foundation of wealth.",
      icon: '💰',
    },
    FIRST_SINKING_FUND: {
      title: 'Future you will thank you!',
      description: "You're pre-funding a goal. No more scrambling when it's time to pay.",
      icon: '🎯',
    },
    EMERGENCY_FUND_STARTED: {
      title: 'Safety net in progress!',
      description: "You've started building your emergency fund. Peace of mind is priceless.",
      icon: '🛡️',
    },
    DEBT_FREE: {
      title: "You're debt free!",
      description: 'No more payments to others. Every dollar you earn is yours to keep or invest.',
      icon: '🆓',
    },
  };

  return content[type] || { title: 'Milestone achieved!', description: '', icon: '✨' };
}

export default {
  getMilestones,
  getUncelebratedMilestones,
  markCelebrated,
  checkMilestones,
  createMilestone,
  getMilestoneContent,
};
