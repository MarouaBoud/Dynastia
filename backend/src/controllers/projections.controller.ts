/**
 * Projections Controller
 *
 * Handles FI calculations, scenario simulations, and plan generation.
 */

import { Request, Response } from 'express';
import { fiCalculator, FinancialProfile } from '../services/financial/fi-calculator';
import { scenarioProjector, ScenarioVariable } from '../services/financial/scenario-projector';
import { planGenerator, UserOnboardingData } from '../services/planning/plan-generator';

/**
 * GET /api/projections/fi
 * Calculate FI metrics from user's current financial state.
 */
export async function getFIProjection(req: Request, res: Response) {
  try {
    const { monthlyExpenses, currentSavings, currentInvestments, monthlySavingsRate } = req.query;

    const profile: FinancialProfile = {
      monthlyExpenses: parseFloat(monthlyExpenses as string) || 0,
      currentSavings: parseFloat(currentSavings as string) || 0,
      currentInvestments: parseFloat(currentInvestments as string) || 0,
      monthlySavingsRate: parseFloat(monthlySavingsRate as string) || 0
    };

    const result = fiCalculator.calculate(profile);

    res.json({
      fiNumber: result.fiNumber,
      currentNetWorth: result.currentNetWorth,
      progressPercent: result.progressPercent,
      monthsToFI: result.monthsToFI,
      yearsToFI: result.yearsToFI,
      monthlyRunway: result.monthlyRunway
    });
  } catch (error) {
    console.error('FI projection error:', error);
    res.status(500).json({
      error: "We couldn't calculate your projection. Let's try again."
    });
  }
}

/**
 * POST /api/projections/scenario
 * Run what-if scenario simulation.
 */
export async function runScenario(req: Request, res: Response) {
  try {
    const {
      monthlyExpenses,
      currentSavings,
      currentInvestments,
      monthlySavingsRate,
      variable,
      newValue,
      projectionYears = 10
    } = req.body;

    const baseProfile: FinancialProfile = {
      monthlyExpenses: parseFloat(monthlyExpenses) || 0,
      currentSavings: parseFloat(currentSavings) || 0,
      currentInvestments: parseFloat(currentInvestments) || 0,
      monthlySavingsRate: parseFloat(monthlySavingsRate) || 0
    };

    const result = scenarioProjector.project({
      baseProfile,
      variable: variable as ScenarioVariable,
      newValue: parseFloat(newValue),
      projectionYears: parseInt(projectionYears)
    });

    res.json({
      variable: result.variable,
      originalValue: result.originalValue,
      newValue: result.newValue,
      changePercent: result.changePercent,
      yearByYearBalances: result.yearByYearBalances,
      finalBalance: result.finalBalance,
      originalFI: {
        monthsToFI: result.originalFIResult.monthsToFI,
        yearsToFI: result.originalFIResult.yearsToFI
      },
      newFI: {
        monthsToFI: result.newFIResult.monthsToFI,
        yearsToFI: result.newFIResult.yearsToFI
      },
      monthsSaved: result.monthsSaved
    });
  } catch (error) {
    console.error('Scenario projection error:', error);
    res.status(500).json({
      error: "We couldn't run that scenario. Let's try again."
    });
  }
}

/**
 * POST /api/projections/plan
 * Generate personalized 90-day plan.
 */
export async function generatePlan(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const onboarding: UserOnboardingData = req.body;

    const plan = planGenerator.generate(userId, onboarding);

    res.json({
      generatedAt: plan.generatedAt,
      lifeStage: plan.lifeStage,
      lifeStageConfidence: plan.lifeStageConfidence,
      fiResult: {
        fiNumber: plan.fiResult.fiNumber,
        monthsToFI: plan.fiResult.monthsToFI,
        yearsToFI: plan.fiResult.yearsToFI,
        progressPercent: plan.fiResult.progressPercent
      },
      items: plan.items,
      totalItems: plan.totalItems,
      completedItems: plan.completedItems,
      progressPercent: plan.progressPercent
    });
  } catch (error) {
    console.error('Plan generation error:', error);
    res.status(500).json({
      error: "We couldn't generate your plan. Let's try again."
    });
  }
}

export const projectionsController = {
  getFIProjection,
  runScenario,
  generatePlan
};
