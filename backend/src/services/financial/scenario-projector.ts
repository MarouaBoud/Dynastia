/**
 * Scenario Projector
 *
 * "What if?" simulations with single-variable changes.
 * Per CONTEXT.md: One variable at a time (savings rate OR income OR expenses).
 */

import { FICalculator, FinancialProfile, FIResult } from './fi-calculator';

export type ScenarioVariable = 'savings_rate' | 'income' | 'expenses';

export interface ScenarioInput {
  baseProfile: FinancialProfile;
  variable: ScenarioVariable;
  newValue: number;             // New value for the variable
  projectionYears: number;      // How far to project (default 10)
}

export interface ScenarioResult {
  variable: ScenarioVariable;
  originalValue: number;
  newValue: number;
  changePercent: number;
  yearByYearBalances: number[];  // [year0, year1, ..., yearN]
  finalBalance: number;
  originalFIResult: FIResult;
  newFIResult: FIResult;
  monthsSaved: number;           // How many months faster to FI
}

export class ScenarioProjector {
  private readonly ANNUAL_RETURN_RATE = 0.07;
  private readonly fiCalculator = new FICalculator();

  project(input: ScenarioInput): ScenarioResult {
    const { baseProfile, variable, newValue, projectionYears = 10 } = input;

    // Calculate original FI result
    const originalFIResult = this.fiCalculator.calculate(baseProfile);

    // Create modified profile
    const modifiedProfile = this.applyVariableChange(baseProfile, variable, newValue);
    const newFIResult = this.fiCalculator.calculate(modifiedProfile);

    // Get original value for comparison
    const originalValue = this.getOriginalValue(baseProfile, variable);

    // Calculate year-by-year projections
    const yearByYearBalances = this.projectYearByYear(
      modifiedProfile,
      projectionYears
    );

    // Calculate months saved
    const monthsSaved = originalFIResult.monthsToFI === Infinity || newFIResult.monthsToFI === Infinity
      ? 0
      : originalFIResult.monthsToFI - newFIResult.monthsToFI;

    return {
      variable,
      originalValue,
      newValue,
      changePercent: originalValue > 0
        ? Math.round(((newValue - originalValue) / originalValue) * 100)
        : 0,
      yearByYearBalances,
      finalBalance: yearByYearBalances[yearByYearBalances.length - 1],
      originalFIResult,
      newFIResult,
      monthsSaved: Math.max(0, monthsSaved)
    };
  }

  private applyVariableChange(
    profile: FinancialProfile,
    variable: ScenarioVariable,
    newValue: number
  ): FinancialProfile {
    const modified = { ...profile };

    switch (variable) {
      case 'savings_rate':
        // newValue is percentage (e.g., 20 for 20%)
        // Calculate new monthly savings based on implied income
        const impliedIncome = profile.monthlyExpenses + profile.monthlySavingsRate;
        modified.monthlySavingsRate = impliedIncome * (newValue / 100);
        modified.monthlyExpenses = impliedIncome - modified.monthlySavingsRate;
        break;

      case 'income':
        // newValue is new monthly income
        // Keep same expenses, increase savings
        const currentIncome = profile.monthlyExpenses + profile.monthlySavingsRate;
        const incomeDiff = newValue - currentIncome;
        modified.monthlySavingsRate = profile.monthlySavingsRate + incomeDiff;
        break;

      case 'expenses':
        // newValue is new monthly expenses
        // Keep income same, adjust savings
        const currentIncomeForExpenses = profile.monthlyExpenses + profile.monthlySavingsRate;
        modified.monthlyExpenses = newValue;
        modified.monthlySavingsRate = currentIncomeForExpenses - newValue;
        break;
    }

    return modified;
  }

  private getOriginalValue(profile: FinancialProfile, variable: ScenarioVariable): number {
    switch (variable) {
      case 'savings_rate':
        const income = profile.monthlyExpenses + profile.monthlySavingsRate;
        return income > 0 ? Math.round((profile.monthlySavingsRate / income) * 100) : 0;
      case 'income':
        return profile.monthlyExpenses + profile.monthlySavingsRate;
      case 'expenses':
        return profile.monthlyExpenses;
    }
  }

  private projectYearByYear(profile: FinancialProfile, years: number): number[] {
    const monthlyRate = Math.pow(1 + this.ANNUAL_RETURN_RATE, 1/12) - 1;
    const projections: number[] = [profile.currentSavings + profile.currentInvestments];

    let balance = projections[0];

    for (let year = 1; year <= years; year++) {
      for (let month = 0; month < 12; month++) {
        balance = balance * (1 + monthlyRate) + profile.monthlySavingsRate;
      }
      projections.push(Math.round(balance));
    }

    return projections;
  }
}

export const scenarioProjector = new ScenarioProjector();
