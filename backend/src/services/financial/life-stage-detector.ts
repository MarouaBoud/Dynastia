/**
 * Life Stage Detector
 *
 * Segments users by financial behavior patterns for personalized coaching.
 * IMPORTANT: Always allow user override - detection is a suggestion.
 */

export type LifeStage =
  | 'student'
  | 'early_career'
  | 'mid_career'
  | 'entrepreneur'
  | 'established';

export interface UserFinancialBehavior {
  age?: number;
  monthlyIncome: number;
  incomeStability: 'stable' | 'variable' | 'irregular';
  hasDebt: boolean;
  debtAmount?: number;
  savingsRate: number;           // Percentage (0-100)
  hasInvestments: boolean;
}

export interface LifeStageResult {
  stage: LifeStage;
  confidence: number;            // 0-100
  indicators: string[];          // Why we classified this way
  recommendedActions: string[];  // Stage-specific next steps
}

export class LifeStageDetector {
  detect(behavior: UserFinancialBehavior): LifeStageResult {
    const indicators: string[] = [];
    let stage: LifeStage;
    let confidence = 100;

    // Student indicators
    if (
      behavior.age && behavior.age < 25 &&
      behavior.monthlyIncome < 2000 &&
      behavior.hasDebt
    ) {
      indicators.push('Age under 25', 'Income below 2,000/month', 'Has debt');
      stage = 'student';
    }
    // Early career indicators
    else if (
      (!behavior.age || (behavior.age >= 22 && behavior.age < 32)) &&
      behavior.monthlyIncome >= 2000 && behavior.monthlyIncome < 5000 &&
      behavior.incomeStability === 'stable'
    ) {
      indicators.push('Income 2,000-5,000/month', 'Stable income');
      if (behavior.age) indicators.push(`Age ${behavior.age}`);
      stage = 'early_career';
    }
    // Entrepreneur indicators (high variability, irregular income)
    else if (
      behavior.incomeStability === 'irregular' ||
      behavior.incomeStability === 'variable'
    ) {
      indicators.push('Variable/irregular income');
      stage = 'entrepreneur';
      confidence = 75; // Lower confidence, harder to distinguish from freelancer
    }
    // Mid-career indicators
    else if (
      (!behavior.age || (behavior.age >= 32 && behavior.age < 50)) &&
      behavior.monthlyIncome >= 5000 &&
      behavior.savingsRate >= 10
    ) {
      indicators.push('Income 5,000+/month', 'Savings rate 10%+');
      if (behavior.age) indicators.push(`Age ${behavior.age}`);
      stage = 'mid_career';
    }
    // Established/peak earning
    else if (
      (behavior.age && behavior.age >= 50) ||
      behavior.monthlyIncome >= 8000 ||
      behavior.hasInvestments
    ) {
      indicators.push('High income or established investments');
      if (behavior.age && behavior.age >= 50) indicators.push('Age 50+');
      stage = 'established';
    }
    // Default to early_career if ambiguous
    else {
      indicators.push('Profile does not match specific pattern');
      stage = 'early_career';
      confidence = 50;
    }

    return {
      stage,
      confidence,
      indicators,
      recommendedActions: this.getRecommendedActions(stage)
    };
  }

  private getRecommendedActions(stage: LifeStage): string[] {
    const actions: Record<LifeStage, string[]> = {
      student: [
        'Build 1,000 emergency cushion',
        'Track spending for 30 days',
        'Apply for income-based debt repayment'
      ],
      early_career: [
        'Automate 10% savings from each paycheck',
        'Build 3-month emergency fund',
        'Start retirement contributions (even small amounts)'
      ],
      mid_career: [
        'Increase savings rate to 20%',
        'Review investment allocation annually',
        'Plan for major life expenses'
      ],
      entrepreneur: [
        'Separate business and personal finances',
        'Build 6-month emergency fund (income irregular)',
        'Set up automated tax savings (30% rule)'
      ],
      established: [
        'Maximize tax-advantaged accounts',
        'Review estate planning',
        'Consider FI timeline and withdrawal strategy'
      ]
    };

    return actions[stage];
  }
}

export const lifeStageDetector = new LifeStageDetector();
