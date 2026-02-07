/**
 * Plan Generator
 *
 * Generates personalized 90-day financial plans.
 * PLAN-01: Based on onboarding data
 * PLAN-03: Adapts when circumstances change
 * PLAN-04: Uses life stage detection
 */

import { lifeStageDetector, LifeStage, UserFinancialBehavior } from '../financial/life-stage-detector';
import { fiCalculator, FinancialProfile, FIResult } from '../financial/fi-calculator';
import { getTemplatesForStage, PlanItemTemplate } from './plan-item-templates';

export interface UserOnboardingData {
  // PLAN-05: Onboarding captures these
  country: string;
  age?: number;
  incomeType: 'salary' | 'freelance' | 'business' | 'mixed';
  monthlyIncome: number;
  monthlyExpenses: number;
  hasDebt: boolean;
  debtAmount?: number;
  currentSavings: number;
  currentInvestments: number;
  goals: string[];                // e.g., ['emergency_fund', 'debt_free', 'invest']
  emotionalReadiness: 'overwhelmed' | 'curious' | 'motivated' | 'confident';
}

export interface PlanItem {
  id: string;
  title: string;
  description: string;
  why: string;
  actionSteps: string[];
  completionCriteria: string;
  priority: number;
  durationDays: number;
  startDay: number;              // Day in the 90-day plan to start
  endDay: number;                // Target completion day
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
}

export interface PersonalizedPlan {
  userId: string;
  generatedAt: Date;
  lifeStage: LifeStage;
  lifeStageConfidence: number;
  fiResult: FIResult;
  items: PlanItem[];
  totalItems: number;
  completedItems: number;
  progressPercent: number;
}

export class PlanGenerator {
  /**
   * Generate personalized 90-day plan from onboarding data.
   */
  generate(userId: string, onboarding: UserOnboardingData): PersonalizedPlan {
    // Detect life stage (PLAN-04)
    const lifeStageResult = lifeStageDetector.detect(this.toFinancialBehavior(onboarding));

    // Calculate FI metrics
    const fiResult = fiCalculator.calculate(this.toFinancialProfile(onboarding));

    // Get applicable templates
    const templates = getTemplatesForStage(lifeStageResult.stage);

    // Filter based on current situation
    const relevantTemplates = this.filterByCurrentSituation(templates, onboarding, fiResult);

    // Convert to plan items with scheduling
    const items = this.schedulePlanItems(relevantTemplates);

    return {
      userId,
      generatedAt: new Date(),
      lifeStage: lifeStageResult.stage,
      lifeStageConfidence: lifeStageResult.confidence,
      fiResult,
      items,
      totalItems: items.length,
      completedItems: 0,
      progressPercent: 0
    };
  }

  /**
   * Regenerate plan when circumstances change (PLAN-03).
   */
  regenerate(
    userId: string,
    currentPlan: PersonalizedPlan,
    newOnboarding: UserOnboardingData
  ): PersonalizedPlan {
    const newPlan = this.generate(userId, newOnboarding);

    // Preserve completion status for items that still exist
    for (const newItem of newPlan.items) {
      const existingItem = currentPlan.items.find(i => i.id === newItem.id);
      if (existingItem && existingItem.status === 'completed') {
        newItem.status = 'completed';
        newItem.completedAt = existingItem.completedAt;
      }
    }

    // Recalculate progress
    const completedItems = newPlan.items.filter(i => i.status === 'completed').length;
    newPlan.completedItems = completedItems;
    newPlan.progressPercent = newPlan.totalItems > 0
      ? Math.round((completedItems / newPlan.totalItems) * 100)
      : 0;

    return newPlan;
  }

  private toFinancialBehavior(onboarding: UserOnboardingData): UserFinancialBehavior {
    const incomeStability =
      onboarding.incomeType === 'salary' ? 'stable' :
      onboarding.incomeType === 'freelance' || onboarding.incomeType === 'mixed' ? 'variable' :
      'irregular';

    const savingsRate = onboarding.monthlyIncome > 0
      ? ((onboarding.monthlyIncome - onboarding.monthlyExpenses) / onboarding.monthlyIncome) * 100
      : 0;

    return {
      age: onboarding.age,
      monthlyIncome: onboarding.monthlyIncome,
      incomeStability,
      hasDebt: onboarding.hasDebt,
      debtAmount: onboarding.debtAmount,
      savingsRate: Math.max(0, savingsRate),
      hasInvestments: onboarding.currentInvestments > 0
    };
  }

  private toFinancialProfile(onboarding: UserOnboardingData): FinancialProfile {
    return {
      monthlyExpenses: onboarding.monthlyExpenses,
      currentSavings: onboarding.currentSavings,
      currentInvestments: onboarding.currentInvestments,
      monthlySavingsRate: Math.max(0, onboarding.monthlyIncome - onboarding.monthlyExpenses)
    };
  }

  private filterByCurrentSituation(
    templates: PlanItemTemplate[],
    onboarding: UserOnboardingData,
    fiResult: FIResult
  ): PlanItemTemplate[] {
    return templates.filter(template => {
      // Skip emergency cushion if already have 1k+
      if (template.id === 'emergency_cushion_1k' && onboarding.currentSavings >= 1000) {
        return false;
      }

      // Skip 3-month emergency fund if already have it
      if (template.id === 'emergency_fund_3_months' && fiResult.monthlyRunway >= 3) {
        return false;
      }

      // Skip credit card payoff if no debt
      if (template.id === 'credit_card_payoff_plan' && !onboarding.hasDebt) {
        return false;
      }

      // Skip investment account if already investing
      if (template.id === 'open_investment_account' && onboarding.currentInvestments > 0) {
        return false;
      }

      // Check prerequisites are met (or will be in plan)
      // Note: Prerequisites are handled by scheduling, not filtering

      return true;
    });
  }

  private schedulePlanItems(templates: PlanItemTemplate[]): PlanItem[] {
    const items: PlanItem[] = [];
    let currentDay = 1;

    // Process in priority order (already sorted)
    for (const template of templates) {
      // Check if prerequisites are in our list
      const prereqsMet = !template.prerequisiteIds || template.prerequisiteIds.every(
        prereqId => templates.some(t => t.id === prereqId)
      );

      if (!prereqsMet) continue;

      // Calculate start day based on prerequisites
      let startDay = currentDay;
      if (template.prerequisiteIds) {
        for (const prereqId of template.prerequisiteIds) {
          const prereqItem = items.find(i => i.id === prereqId);
          if (prereqItem) {
            startDay = Math.max(startDay, prereqItem.endDay + 1);
          }
        }
      }

      const endDay = Math.min(startDay + template.durationDays - 1, 90);

      items.push({
        id: template.id,
        title: template.title,
        description: template.description,
        why: template.why,
        actionSteps: template.actionSteps,
        completionCriteria: template.completionCriteria,
        priority: template.priority,
        durationDays: template.durationDays,
        startDay,
        endDay,
        status: 'pending'
      });

      // Some items can run in parallel, only advance for sequential items
      if (template.durationDays <= 7) {
        // Short items don't advance the timeline
      } else {
        currentDay = Math.max(currentDay, endDay + 1);
      }
    }

    // Limit to what fits in 90 days, max ~8 items to prevent overwhelm
    return items
      .filter(item => item.startDay <= 90)
      .slice(0, 8);
  }
}

export const planGenerator = new PlanGenerator();
