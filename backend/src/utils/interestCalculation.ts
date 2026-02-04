/**
 * Interest Calculation Utilities
 *
 * Helpers for credit card interest calculations and APR defaults.
 */

// Default APR by country (based on 2026 averages)
export const DEFAULT_APR = {
  US: 22, // United States average
  GB: 23, // United Kingdom average
  // European countries with lower regulated rates
  FR: 18, // France
  DE: 18, // Germany
  ES: 18, // Spain
  IT: 18, // Italy
  NL: 18, // Netherlands
  BE: 18, // Belgium
  AT: 18, // Austria
  PT: 18, // Portugal
  IE: 18, // Ireland
  FI: 18, // Finland
  // Other countries
  CA: 20, // Canada
  AU: 20, // Australia
  JP: 15, // Japan
  CH: 12, // Switzerland
} as const;

/**
 * Get default APR for a country
 * @param country - ISO 3166-1 alpha-2 country code
 * @returns Default APR percentage
 */
export function getDefaultApr(country: string): number {
  const apr = DEFAULT_APR[country as keyof typeof DEFAULT_APR];
  if (apr) return apr;

  // Default to EU rate for unknown European countries
  if (['LU', 'GR', 'MT', 'CY', 'SI', 'SK', 'EE', 'LV', 'LT'].includes(country)) {
    return 18;
  }

  // Default to US rate for unknown countries
  return 22;
}

/**
 * Calculate monthly interest cost
 * @param balance - Current balance
 * @param apr - Annual Percentage Rate
 * @returns Monthly interest cost
 */
export function calculateMonthlyInterest(balance: number, apr: number): number {
  if (balance <= 0 || apr <= 0) return 0;
  return Math.round((balance * (apr / 100) / 12) * 100) / 100;
}

/**
 * Calculate yearly interest cost
 * @param balance - Current balance
 * @param apr - Annual Percentage Rate
 * @returns Yearly interest cost
 */
export function calculateYearlyInterest(balance: number, apr: number): number {
  if (balance <= 0 || apr <= 0) return 0;
  return Math.round((balance * (apr / 100)) * 100) / 100;
}

/**
 * Calculate time to pay off balance
 * @param balance - Current balance
 * @param monthlyPayment - Fixed monthly payment
 * @param apr - Annual Percentage Rate
 * @returns Object with months to payoff and total interest paid
 */
export function calculatePayoffTime(
  balance: number,
  monthlyPayment: number,
  apr: number
): { months: number; totalInterest: number } {
  if (balance <= 0) return { months: 0, totalInterest: 0 };
  if (monthlyPayment <= 0) return { months: Infinity, totalInterest: Infinity };

  const monthlyRate = apr / 100 / 12;
  let remaining = balance;
  let months = 0;
  let totalInterest = 0;

  // Safety limit to prevent infinite loops
  const maxMonths = 360; // 30 years

  while (remaining > 0 && months < maxMonths) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining = remaining + interest - monthlyPayment;
    months++;

    // If payment doesn't cover interest, it will never be paid off
    if (interest >= monthlyPayment) {
      return { months: Infinity, totalInterest: Infinity };
    }
  }

  return {
    months,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}

/**
 * Generate educational message about interest cost
 * @param balance - Current balance
 * @param apr - Annual Percentage Rate
 * @param currency - Currency symbol
 * @returns Educational message string
 */
export function getInterestEducationMessage(
  balance: number,
  apr: number,
  currency: string = '€'
): string {
  if (balance <= 0) {
    return 'Your balance is clear. Great job!';
  }

  const monthlyInterest = calculateMonthlyInterest(balance, apr);
  const yearlyInterest = calculateYearlyInterest(balance, apr);

  return `Carrying ${currency}${balance.toLocaleString()} at ${apr}% APR costs ~${currency}${monthlyInterest.toLocaleString()}/month in interest (${currency}${yearlyInterest.toLocaleString()}/year)`;
}
