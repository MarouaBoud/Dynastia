/**
 * Financial Independence Calculator
 *
 * Uses industry-standard formulas:
 * - FI Number: annual expenses / 0.04 (4% safe withdrawal rate)
 * - Runway: savings / monthly expenses
 * - Months to FI: iterative compound interest calculation
 */

export interface FinancialProfile {
  monthlyExpenses: number;      // Average monthly expenses
  currentSavings: number;       // Liquid savings
  currentInvestments: number;   // Investment portfolio value
  monthlySavingsRate: number;   // How much saved per month
}

export interface FIResult {
  fiNumber: number;             // Total needed for FI
  currentNetWorth: number;      // Savings + investments
  progressPercent: number;      // Progress toward FI (0-100)
  monthsToFI: number;           // Countdown (Infinity if not achievable)
  monthlyRunway: number;        // Months could survive without income
  yearsToFI: number;            // Months / 12 for display
}

export class FICalculator {
  private readonly SAFE_WITHDRAWAL_RATE = 0.04; // 4% rule
  private readonly ANNUAL_RETURN_RATE = 0.07;   // 7% conservative estimate
  private readonly MAX_PROJECTION_MONTHS = 600; // 50 years cap

  calculate(profile: FinancialProfile): FIResult {
    // FI Number: Annual expenses / 4% (or * 25)
    const annualExpenses = profile.monthlyExpenses * 12;
    const fiNumber = annualExpenses / this.SAFE_WITHDRAWAL_RATE;

    // Current net worth
    const currentNetWorth = profile.currentSavings + profile.currentInvestments;

    // Progress toward FI
    const progressPercent = fiNumber > 0
      ? Math.min((currentNetWorth / fiNumber) * 100, 100)
      : 0;

    // Monthly runway (how long money would last if stopped working)
    const monthlyRunway = profile.monthlyExpenses > 0
      ? currentNetWorth / profile.monthlyExpenses
      : Infinity;

    // Months to FI with compound interest
    const monthsToFI = this.calculateMonthsToFI(
      currentNetWorth,
      fiNumber,
      profile.monthlySavingsRate
    );

    return {
      fiNumber: Math.round(fiNumber),
      currentNetWorth: Math.round(currentNetWorth),
      progressPercent: Math.round(progressPercent * 10) / 10,
      monthsToFI,
      monthlyRunway: Math.round(monthlyRunway * 10) / 10,
      yearsToFI: monthsToFI < Infinity ? Math.round(monthsToFI / 12 * 10) / 10 : Infinity
    };
  }

  private calculateMonthsToFI(
    current: number,
    target: number,
    monthlyContribution: number
  ): number {
    if (current >= target) return 0;
    if (monthlyContribution <= 0) return Infinity;

    const monthlyRate = Math.pow(1 + this.ANNUAL_RETURN_RATE, 1/12) - 1;

    let months = 0;
    let balance = current;

    while (balance < target && months < this.MAX_PROJECTION_MONTHS) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      months++;
    }

    return months < this.MAX_PROJECTION_MONTHS ? months : Infinity;
  }
}

export const fiCalculator = new FICalculator();
