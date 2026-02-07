/**
 * Projections Service
 *
 * API client for FI calculations and scenario simulations.
 */

import { api } from './api';

// =============================================================================
// Types
// =============================================================================

export interface FIProjection {
  fiNumber: number;           // Total needed for FI
  currentNetWorth: number;
  progressPercent: number;    // 0-100
  monthsToFI: number;
  yearsToFI: number;
  monthlyRunway: number;
}

export interface ScenarioResult {
  variable: 'savings_rate' | 'income' | 'expenses';
  originalValue: number;
  newValue: number;
  changePercent: number;
  yearByYearBalances: number[];
  finalBalance: number;
  originalFI: {
    monthsToFI: number;
    yearsToFI: number;
  };
  newFI: {
    monthsToFI: number;
    yearsToFI: number;
  };
  monthsSaved: number;
}

export interface FinancialInputs {
  monthlyExpenses: number;
  currentSavings: number;
  currentInvestments: number;
  monthlySavingsRate: number;
}

export interface CompoundingProjection {
  year: number;
  balance: number;
  contributions: number;
  growth: number;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get FI projection based on current financial state.
 */
export async function getFIProjection(inputs: FinancialInputs): Promise<FIProjection> {
  const response = await api.get('/projections/fi', { params: inputs });
  return response.data;
}

/**
 * Run scenario simulation with single variable change.
 */
export async function runScenario(
  inputs: FinancialInputs,
  variable: 'savings_rate' | 'income' | 'expenses',
  newValue: number,
  projectionYears: number = 10
): Promise<ScenarioResult> {
  const response = await api.post('/projections/scenario', {
    ...inputs,
    variable,
    newValue,
    projectionYears
  });
  return response.data;
}

/**
 * Calculate compound growth projections (client-side for COACH-04).
 * Shows year-by-year growth with compound interest visualization.
 */
export function calculateCompoundingProjection(
  currentBalance: number,
  monthlyContribution: number,
  annualReturnRate: number = 0.07,
  years: number = 30
): CompoundingProjection[] {
  const projections: CompoundingProjection[] = [];
  let balance = currentBalance;
  let totalContributions = currentBalance;

  for (let year = 1; year <= years; year++) {
    const yearlyContribution = monthlyContribution * 12;
    totalContributions += yearlyContribution;

    // Compound monthly (more accurate)
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + annualReturnRate / 12) + monthlyContribution;
    }

    const growth = balance - totalContributions;

    projections.push({
      year,
      balance: Math.round(balance),
      contributions: Math.round(totalContributions),
      growth: Math.round(growth)
    });
  }

  return projections;
}

/**
 * Format months to human-readable string.
 */
export function formatMonthsToFI(months: number): string {
  if (!isFinite(months)) return 'Calculate your path';
  if (months <= 0) return 'You made it!';

  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);

  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years}y ${remainingMonths}m`;
}

export default {
  getFIProjection,
  runScenario,
  calculateCompoundingProjection,
  formatMonthsToFI
};
