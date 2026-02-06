/**
 * Milestone Service
 *
 * Tracks user achievements and milestone celebrations.
 * Includes tier definitions for Sovereignty Ladder visualization.
 */

import { api } from './api';

// =============================================================================
// Types
// =============================================================================

export interface Milestone {
  id: string;
  type: string;
  title?: string;
  description?: string;
  achievedAt: string;
  celebratedAt?: string;
  metadata?: Record<string, any>;
}

export interface MilestoneDefinition {
  id: string;
  tier: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  celebration: string;
  icon: string;
  requirement: string;
}

export interface MilestoneWithDefinition extends Milestone {
  definition: MilestoneDefinition;
}

export type MilestoneType =
  | 'CREDIT_CARD_3_MONTHS'
  | 'FIRST_BUDGET'
  | 'FIRST_SINKING_FUND'
  | 'EMERGENCY_FUND_STARTED'
  | 'DEBT_FREE';

// =============================================================================
// Tier Definitions (Mirror backend constants)
// =============================================================================

export const TIER_1_MILESTONES: MilestoneDefinition[] = [
  {
    id: 'first_1000_saved',
    tier: 1,
    name: 'I can breathe',
    description: 'Your first 1,000 saved. You have a cushion now.',
    celebration: "You did it! Your first 1,000 in savings. This changes everything.",
    icon: 'leaf',
    requirement: 'Net worth or savings reaches 1,000',
  },
  {
    id: 'first_money_date',
    tier: 1,
    name: 'First Money Date',
    description: 'You showed up for yourself this week.',
    celebration: "Your first Money Date! This weekly ritual builds wealth.",
    icon: 'calendar',
    requirement: 'Complete first weekly Money Date check-in',
  },
  {
    id: 'autopilot_begins',
    tier: 1,
    name: 'Auto-pilot begins',
    description: 'Your savings happen automatically now.',
    celebration: "Auto-save activated! Your future self thanks you.",
    icon: 'refresh-cw',
    requirement: 'Set up automated savings transfer',
  },
  {
    id: 'debt_free_start',
    tier: 1,
    name: "I'm debt-free",
    description: 'Credit cards paid in full for 2+ months.',
    celebration: "Two months of no credit card interest! You've broken the cycle.",
    icon: 'shield',
    requirement: 'Credit card paid in full for 2 consecutive months',
  },
];

export const TIER_2_MILESTONES: MilestoneDefinition[] = [
  {
    id: 'emergency_fund_3_months',
    tier: 2,
    name: "I'm safe",
    description: '3 months of expenses saved. You have a safety net.',
    celebration: "3 months of runway! Life's surprises can't derail you now.",
    icon: 'shield',
    requirement: 'Emergency fund covers 3 months of expenses',
  },
  {
    id: 'bills_handled',
    tier: 2,
    name: 'Bills handled',
    description: 'All bills on autopay, no late fees.',
    celebration: "Bills on autopilot! No more mental load on due dates.",
    icon: 'check-circle',
    requirement: 'All bills marked as autopay with no late payments',
  },
  {
    id: 'first_sinking_fund_funded',
    tier: 2,
    name: 'I plan ahead',
    description: 'Your first sinking fund is fully funded.',
    celebration: "Goal reached! You planned ahead and made it happen.",
    icon: 'target',
    requirement: 'First sinking fund reaches target amount',
  },
  {
    id: 'pay_yourself_first_30_days',
    tier: 2,
    name: 'Pay yourself first',
    description: 'Saved before spending for 30+ days.',
    celebration: "30 days of paying yourself first! This is how wealth builds.",
    icon: 'trending-up',
    requirement: 'Savings transferred before other spending for 30+ days',
  },
];

export const TIER_3_MILESTONES: MilestoneDefinition[] = [
  {
    id: 'emergency_fund_complete',
    tier: 3,
    name: 'Emergency fund complete',
    description: 'Full 3-6 months of expenses saved.',
    celebration: "Full emergency fund! You're financially resilient.",
    icon: 'shield',
    requirement: 'Emergency fund covers 6 months of expenses',
  },
  {
    id: '10k_club',
    tier: 3,
    name: '10k club',
    description: 'Net worth has reached 10,000.',
    celebration: "Welcome to the 10k club! Your wealth is growing.",
    icon: 'star',
    requirement: 'Net worth reaches 10,000',
  },
  {
    id: 'first_investment',
    tier: 3,
    name: 'My money works',
    description: 'You made your first investment.',
    celebration: "Your money is working for you now! Compounding begins.",
    icon: 'trending-up',
    requirement: 'First investment asset recorded',
  },
  {
    id: 'auto_investor',
    tier: 3,
    name: 'Auto-investor',
    description: 'Recurring investment is active.',
    celebration: "Investing on autopilot! This is how the wealthy do it.",
    icon: 'repeat',
    requirement: 'Recurring investment transfer set up',
  },
];

export const TIER_4_MILESTONES: MilestoneDefinition[] = [
  {
    id: 'zero_touch_month',
    tier: 4,
    name: 'Zero-touch month',
    description: 'Entire month on financial autopilot.',
    celebration: "A whole month with finances on autopilot! True freedom.",
    icon: 'zap',
    requirement: 'All bills and savings automated for full month',
  },
  {
    id: '50k_club',
    tier: 4,
    name: '50k club',
    description: 'Net worth has reached 50,000.',
    celebration: "50k net worth! You're building serious wealth.",
    icon: 'award',
    requirement: 'Net worth reaches 50,000',
  },
  {
    id: 'one_year_salary_saved',
    tier: 4,
    name: '1 year salary saved',
    description: 'Your savings equal one year of income.',
    celebration: "One year of salary saved! Financial freedom is real.",
    icon: 'calendar',
    requirement: 'Total savings equals annual income',
  },
  {
    id: 'sovereign',
    tier: 4,
    name: "I'm sovereign",
    description: '12+ months of runway achieved.',
    celebration: "12 months of runway! You could stop working for a year.",
    icon: 'crown',
    requirement: 'Savings cover 12+ months of expenses',
  },
];

export const TIER_MILESTONES = {
  1: TIER_1_MILESTONES,
  2: TIER_2_MILESTONES,
  3: TIER_3_MILESTONES,
  4: TIER_4_MILESTONES,
};

export const ALL_MILESTONES = [
  ...TIER_1_MILESTONES,
  ...TIER_2_MILESTONES,
  ...TIER_3_MILESTONES,
  ...TIER_4_MILESTONES,
];

export const TIER_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: 'Foundation',
  2: 'Stability',
  3: 'Growth',
  4: 'Sovereignty',
};

// =============================================================================
// API Functions
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
export async function checkMilestones(): Promise<{
  checked: boolean;
  newMilestones: MilestoneWithDefinition[];
  totalNew: number;
}> {
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
 * Get milestone definition by type
 */
export function getMilestoneDefinition(type: string): MilestoneDefinition | undefined {
  return ALL_MILESTONES.find(m => m.id === type);
}

/**
 * Get milestone title and description by type (legacy)
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
      icon: 'award',
    },
    FIRST_BUDGET: {
      title: 'Your first budget!',
      description: "You've taken control of where your money goes. This is the foundation of wealth.",
      icon: 'pie-chart',
    },
    FIRST_SINKING_FUND: {
      title: 'Future you will thank you!',
      description: "You're pre-funding a goal. No more scrambling when it's time to pay.",
      icon: 'target',
    },
    EMERGENCY_FUND_STARTED: {
      title: 'Safety net in progress!',
      description: "You've started building your emergency fund. Peace of mind is priceless.",
      icon: 'shield',
    },
    DEBT_FREE: {
      title: "You're debt free!",
      description: 'No more payments to others. Every dollar you earn is yours to keep or invest.',
      icon: 'check-circle',
    },
  };

  return content[type] || { title: 'Milestone achieved!', description: '', icon: 'star' };
}

/**
 * Calculate tier progress
 */
export function calculateTierProgress(
  tier: 1 | 2 | 3 | 4,
  achievedMilestones: string[]
): { completed: number; total: number; progress: number } {
  const tierMilestones = TIER_MILESTONES[tier];
  const completed = tierMilestones.filter(m => achievedMilestones.includes(m.id)).length;
  const total = tierMilestones.length;
  return {
    completed,
    total,
    progress: total > 0 ? completed / total : 0,
  };
}

/**
 * Determine current tier based on achievements
 */
export function getCurrentTier(achievedMilestones: string[]): number {
  // User is on the first incomplete tier
  for (let tier = 1; tier <= 4; tier++) {
    const { completed, total } = calculateTierProgress(tier as 1 | 2 | 3 | 4, achievedMilestones);
    if (completed < total) {
      return tier;
    }
  }
  return 4; // All tiers complete
}

/**
 * Get visible tiers (current + next only for progressive disclosure)
 */
export function getVisibleTiers(achievedMilestones: string[]): number[] {
  const currentTier = getCurrentTier(achievedMilestones);
  if (currentTier === 4) {
    return [4];
  }
  return [currentTier, currentTier + 1];
}

export default {
  getMilestones,
  getUncelebratedMilestones,
  markCelebrated,
  checkMilestones,
  createMilestone,
  getMilestoneContent,
  getMilestoneDefinition,
  calculateTierProgress,
  getCurrentTier,
  getVisibleTiers,
  TIER_MILESTONES,
  ALL_MILESTONES,
  TIER_NAMES,
};
