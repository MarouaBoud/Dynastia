/**
 * Milestone Constants
 *
 * All 16 milestones across 4 tiers of the Sovereignty Ladder.
 * Each milestone has emotionally safe framing (power phrases, no shame).
 */

export interface MilestoneDefinition {
  id: string;
  tier: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  celebration: string;
  icon: string;
  requirement: string; // Brief description of trigger condition
}

// Tier 1: Foundation (MILE-01 to MILE-04)
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
    icon: 'calendar-check',
    requirement: 'Complete first weekly Money Date check-in',
  },
  {
    id: 'autopilot_begins',
    tier: 1,
    name: 'Auto-pilot begins',
    description: 'Your savings happen automatically now.',
    celebration: "Auto-save activated! Your future self thanks you.",
    icon: 'refresh-auto',
    requirement: 'Set up automated savings transfer',
  },
  {
    id: 'debt_free_start',
    tier: 1,
    name: "I'm debt-free",
    description: 'Credit cards paid in full for 2+ months.',
    celebration: "Two months of no credit card interest! You've broken the cycle.",
    icon: 'shield-check',
    requirement: 'Credit card paid in full for 2 consecutive months',
  },
];

// Tier 2: Stability (MILE-05 to MILE-08)
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

// Tier 3: Growth (MILE-09 to MILE-12)
export const TIER_3_MILESTONES: MilestoneDefinition[] = [
  {
    id: 'emergency_fund_complete',
    tier: 3,
    name: 'Emergency fund complete',
    description: 'Full 3-6 months of expenses saved.',
    celebration: "Full emergency fund! You're financially resilient.",
    icon: 'shield-plus',
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
    icon: 'chart-line',
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

// Tier 4: Sovereignty (MILE-13 to MILE-16)
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

// Combined exports
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

export const MILESTONE_TYPES = Object.fromEntries(
  ALL_MILESTONES.map(m => [m.id, m])
) as Record<string, MilestoneDefinition>;

// Helper to get milestone by id
export function getMilestoneDefinition(id: string): MilestoneDefinition | undefined {
  return MILESTONE_TYPES[id];
}

// Helper to get tier for a milestone
export function getMilestoneTier(id: string): number | undefined {
  return MILESTONE_TYPES[id]?.tier;
}
