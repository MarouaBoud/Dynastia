/**
 * Rule Engine
 *
 * Determines WHAT to coach about using deterministic rules.
 * LLM only determines HOW to say it (tone, phrasing).
 *
 * This provides:
 * - Transparency: Rules are auditable
 * - Cost control: LLM only called when needed
 * - Consistency: Same situation = same coaching topic
 */

import { insightDetector, SpendingInsight } from './insight-detector';

export interface CoachingContext {
  userId: string;
  // Spending data
  spendingThisMonth: number;
  spendingLastMonth: number;
  spendingByCategory: Record<string, number>;
  lastMonthByCategory: Record<string, number>;
  // Milestone progress
  milestoneProgress: number;         // 0-100 for current tier
  nextMilestoneId?: string;
  // Habits
  lastMoneyDateDaysAgo: number;
  currentStreak: number;
  // Financial state
  monthsOfRunway: number;
  savingsRate: number;               // Percentage
}

export type CoachingType =
  | 'spending_insight'
  | 'milestone_approaching'
  | 'milestone_achieved'
  | 'check_in_reminder'
  | 'streak_celebration'
  | 'streak_at_risk'
  | 'runway_low'
  | 'savings_rate_improvement'
  | 'general_encouragement';

export interface CoachingDecision {
  type: CoachingType;
  priority: number;                  // Higher = more important
  data: Record<string, any>;
  insight?: SpendingInsight;
}

export class RuleEngine {
  /**
   * Analyze context and return prioritized coaching decisions.
   * Returns array sorted by priority (highest first).
   */
  determineCoachingNeeds(context: CoachingContext): CoachingDecision[] {
    const decisions: CoachingDecision[] = [];

    // Rule 1: Spending insights (COACH-03)
    const spendingInsights = insightDetector.detectSpendingInsights({
      currentMonth: context.spendingThisMonth,
      previousMonth: context.spendingLastMonth,
      currentByCategory: context.spendingByCategory,
      previousByCategory: context.lastMonthByCategory
    });

    for (const insight of spendingInsights) {
      if (insight.shouldCoach) {
        decisions.push({
          type: 'spending_insight',
          priority: insight.severity === 'concern' ? 9 : 7,
          data: insight.data,
          insight
        });
      }
    }

    // Rule 2: Milestone approaching (85%+ progress)
    if (context.milestoneProgress >= 85 && context.milestoneProgress < 100) {
      decisions.push({
        type: 'milestone_approaching',
        priority: 8,
        data: {
          progress: context.milestoneProgress,
          nextMilestoneId: context.nextMilestoneId
        }
      });
    }

    // Rule 3: Check-in reminder (3+ days since Money Date)
    if (context.lastMoneyDateDaysAgo >= 3 && context.lastMoneyDateDaysAgo <= 10) {
      decisions.push({
        type: 'check_in_reminder',
        priority: 6,
        data: { daysSince: context.lastMoneyDateDaysAgo }
      });
    }

    // Rule 4: Streak celebration (weekly milestones)
    if (context.currentStreak > 0 && context.currentStreak % 4 === 0) {
      decisions.push({
        type: 'streak_celebration',
        priority: 7,
        data: { streak: context.currentStreak, weeks: context.currentStreak }
      });
    }

    // Rule 5: Streak at risk (7+ days since last Money Date)
    if (context.lastMoneyDateDaysAgo >= 7) {
      decisions.push({
        type: 'streak_at_risk',
        priority: 8,
        data: {
          daysSince: context.lastMoneyDateDaysAgo,
          currentStreak: context.currentStreak
        }
      });
    }

    // Rule 6: Low runway warning (< 1 month)
    if (context.monthsOfRunway < 1 && context.monthsOfRunway > 0) {
      decisions.push({
        type: 'runway_low',
        priority: 10,  // Highest priority
        data: { monthsOfRunway: context.monthsOfRunway }
      });
    }

    // Rule 7: Savings rate improvement opportunity
    if (context.savingsRate < 10) {
      decisions.push({
        type: 'savings_rate_improvement',
        priority: 5,
        data: { currentRate: context.savingsRate }
      });
    }

    // If no specific coaching needs, add general encouragement (low priority)
    if (decisions.length === 0) {
      decisions.push({
        type: 'general_encouragement',
        priority: 3,
        data: {}
      });
    }

    // Sort by priority (highest first)
    return decisions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get the top coaching decision (most important topic to address).
   */
  getTopDecision(context: CoachingContext): CoachingDecision | null {
    const decisions = this.determineCoachingNeeds(context);
    return decisions.length > 0 ? decisions[0] : null;
  }
}

export const ruleEngine = new RuleEngine();
