/**
 * Plan Item Templates
 *
 * Prioritized action items for 90-day financial plans.
 * Order matters: Emergency fund before investments, debt before growth.
 *
 * Priority scale (1-10):
 * 10: Critical safety (runway < 1 month)
 * 9: High-impact foundation (emergency fund, employer match)
 * 8: Debt elimination
 * 7: Financial habits
 * 6: Growth setup
 * 5: Optimization
 */

import { LifeStage } from '../financial/life-stage-detector';

export interface PlanItemTemplate {
  id: string;
  title: string;
  description: string;
  why: string;                    // COACH-06: Explain the reasoning
  actionSteps: string[];          // Specific steps to complete
  completionCriteria: string;     // How to know it's done
  priority: number;               // 1-10 (higher = more urgent)
  durationDays: number;           // Expected time to complete
  applicableStages: LifeStage[];  // Which life stages this applies to
  prerequisiteIds?: string[];     // Items that must be done first
}

/**
 * Priority order (based on financial impact):
 * 1. Emergency cushion (1k) - immediate safety
 * 2. Employer 401k match - free money
 * 3. High-interest debt - stop bleeding
 * 4. 3-month emergency fund - stability
 * 5. Automate savings - build habits
 * 6. Track spending - awareness
 * 7. Review subscriptions - quick wins
 * 8. Increase savings rate - compound effect
 * 9. Start investing - growth
 * 10. Tax optimization - efficiency
 */
export const PLAN_ITEM_TEMPLATES: PlanItemTemplate[] = [
  // TIER 1: CRITICAL SAFETY (Priority 10)
  {
    id: 'emergency_cushion_1k',
    title: 'Build 1,000 emergency cushion',
    description: 'Your first financial safety net. This covers small emergencies without going into debt.',
    why: 'Without this cushion, any unexpected expense goes on a credit card. This breaks the cycle.',
    actionSteps: [
      'Open a separate savings account (or use existing)',
      'Set up automatic transfer of 50-100 per week',
      'Resist the urge to touch it for non-emergencies'
    ],
    completionCriteria: 'Savings account balance reaches 1,000',
    priority: 10,
    durationDays: 30,
    applicableStages: ['student', 'early_career', 'entrepreneur']
  },

  // TIER 2: HIGH-IMPACT FOUNDATION (Priority 9)
  {
    id: 'employer_match',
    title: 'Capture employer 401k match',
    description: 'If your employer matches retirement contributions, this is free money.',
    why: 'A 50% match means instant 50% return on your contribution. No investment beats this.',
    actionSteps: [
      'Check if employer offers 401k matching',
      'Find out the match percentage and limit',
      'Contribute at least enough to get full match'
    ],
    completionCriteria: 'Contributing enough to get 100% of employer match',
    priority: 9,
    durationDays: 14,
    applicableStages: ['early_career', 'mid_career', 'established']
  },

  // TIER 3: DEBT ELIMINATION (Priority 8)
  {
    id: 'credit_card_payoff_plan',
    title: 'Create credit card payoff plan',
    description: 'High-interest debt (usually 20%+) destroys wealth. Eliminate it systematically.',
    why: 'Paying off 22% APR debt is like earning 22% guaranteed return. No investment does that.',
    actionSteps: [
      'List all credit cards with balances and APRs',
      'Choose strategy: highest APR first (avalanche) or smallest balance first (snowball)',
      'Set up autopay for minimum + extra payment'
    ],
    completionCriteria: 'All credit card balances at zero',
    priority: 8,
    durationDays: 90,
    applicableStages: ['student', 'early_career', 'mid_career', 'entrepreneur', 'established'],
    prerequisiteIds: ['emergency_cushion_1k']
  },

  // TIER 4: STABILITY (Priority 7)
  {
    id: 'emergency_fund_3_months',
    title: 'Build 3-month emergency fund',
    description: 'Expand your safety net to cover 3 months of expenses.',
    why: 'Job loss, medical issues, or car repairs can take weeks to resolve. 3 months buys you time.',
    actionSteps: [
      'Calculate your monthly essential expenses',
      'Multiply by 3 for target amount',
      'Continue automatic savings until you reach it'
    ],
    completionCriteria: 'Emergency fund covers 3 months of expenses',
    priority: 7,
    durationDays: 90,
    applicableStages: ['early_career', 'mid_career', 'entrepreneur', 'established'],
    prerequisiteIds: ['emergency_cushion_1k']
  },

  // TIER 5: HABITS (Priority 6-7)
  {
    id: 'automate_savings',
    title: 'Automate savings transfer',
    description: 'Set up automatic transfer on payday. Pay yourself first.',
    why: 'What you do not see, you do not spend. Automation removes willpower from the equation.',
    actionSteps: [
      'Choose savings amount (start with 10% of income)',
      'Set up recurring transfer for payday',
      'Treat it like a bill that must be paid'
    ],
    completionCriteria: 'Automatic transfer running for 1+ month',
    priority: 7,
    durationDays: 7,
    applicableStages: ['student', 'early_career', 'mid_career', 'entrepreneur', 'established']
  },
  {
    id: 'track_spending_30_days',
    title: 'Track spending for 30 days',
    description: 'Log every expense for one month. Awareness is the first step to change.',
    why: 'Most people underestimate spending by 30-40%. Data reveals reality.',
    actionSteps: [
      'Use Dynastia to log every transaction',
      'Categorize each expense',
      'Review weekly during Money Date'
    ],
    completionCriteria: '30 days of complete transaction logging',
    priority: 6,
    durationDays: 30,
    applicableStages: ['student', 'early_career', 'mid_career', 'entrepreneur', 'established']
  },

  // TIER 6: QUICK WINS (Priority 5)
  {
    id: 'subscription_audit',
    title: 'Audit subscriptions',
    description: 'Review recurring charges. Cancel what you do not use.',
    why: 'The average person wastes 200+/month on forgotten subscriptions. Easy savings.',
    actionSteps: [
      'List all recurring charges from bank/card statements',
      'For each: "Did I use this in the last month?"',
      'Cancel anything not providing value'
    ],
    completionCriteria: 'All subscriptions reviewed, unused ones cancelled',
    priority: 5,
    durationDays: 7,
    applicableStages: ['student', 'early_career', 'mid_career', 'entrepreneur', 'established']
  },

  // TIER 7: GROWTH (Priority 4-5)
  {
    id: 'increase_savings_rate',
    title: 'Increase savings rate by 2%',
    description: 'Small increases compound dramatically over time.',
    why: 'Going from 10% to 12% savings rate can shave years off your FI timeline.',
    actionSteps: [
      'Calculate current savings rate',
      'Identify 2% of income worth of cuts or extra income',
      'Update automatic transfer to new amount'
    ],
    completionCriteria: 'Savings rate increased by at least 2%',
    priority: 5,
    durationDays: 30,
    applicableStages: ['early_career', 'mid_career', 'established'],
    prerequisiteIds: ['automate_savings', 'track_spending_30_days']
  },
  {
    id: 'open_investment_account',
    title: 'Open investment account',
    description: 'Start investing for long-term wealth building.',
    why: 'Money in savings loses to inflation. Investments grow with the economy (avg 7%/year).',
    actionSteps: [
      'Choose platform (Vanguard, Fidelity, or robo-advisor)',
      'Open account (takes 10-15 minutes)',
      'Start with low-cost index fund (e.g., total market ETF)'
    ],
    completionCriteria: 'Investment account open with first deposit made',
    priority: 4,
    durationDays: 14,
    applicableStages: ['early_career', 'mid_career', 'entrepreneur', 'established'],
    prerequisiteIds: ['emergency_fund_3_months']
  },

  // ENTREPRENEUR-SPECIFIC
  {
    id: 'separate_business_personal',
    title: 'Separate business and personal finances',
    description: 'Open a dedicated business account. Never mix personal and business.',
    why: 'Mixing finances makes taxes a nightmare and hides true business profitability.',
    actionSteps: [
      'Open business checking account',
      'Open business savings for taxes (set aside 30%)',
      'Route all business income through business account'
    ],
    completionCriteria: 'Business account open, all revenue flowing through it',
    priority: 8,
    durationDays: 14,
    applicableStages: ['entrepreneur']
  },
  {
    id: 'tax_savings_30_percent',
    title: 'Set up 30% tax savings',
    description: 'Automatically save 30% of revenue for quarterly taxes.',
    why: 'Nothing derails entrepreneurs like surprise tax bills. Save before you spend.',
    actionSteps: [
      'Calculate 30% of average monthly revenue',
      'Set up automatic transfer to tax savings account',
      'Never touch this money except for taxes'
    ],
    completionCriteria: 'Automatic tax savings running for 1+ month',
    priority: 9,
    durationDays: 7,
    applicableStages: ['entrepreneur']
  }
];

/**
 * Get templates applicable to a life stage, sorted by priority.
 */
export function getTemplatesForStage(stage: LifeStage): PlanItemTemplate[] {
  return PLAN_ITEM_TEMPLATES
    .filter(t => t.applicableStages.includes(stage))
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Get template by ID.
 */
export function getTemplateById(id: string): PlanItemTemplate | undefined {
  return PLAN_ITEM_TEMPLATES.find(t => t.id === id);
}
