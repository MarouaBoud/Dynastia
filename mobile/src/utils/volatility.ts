/**
 * Volatility Cone Calculations
 *
 * Shows expected range of investment outcomes over time.
 * Uses lognormal distribution to model return variability.
 *
 * WEALTH-05: Explain volatility with probability bands, not scary charts.
 */

export interface ConeDataPoint {
  year: number;
  median: number;      // Expected value (50th percentile)
  upper80: number;     // 90th percentile (top of 80% confidence)
  lower80: number;     // 10th percentile (bottom of 80% confidence)
}

/**
 * Calculate volatility cone showing range of outcomes
 *
 * @param initialAmount Starting investment amount
 * @param monthlyContribution Monthly addition to investment
 * @param expectedReturn Annual expected return (default 7%)
 * @param volatility Annual standard deviation (default 15%)
 * @param years Number of years to project
 * @returns Array of data points for cone visualization
 */
export function calculateVolatilityCone(
  initialAmount: number,
  monthlyContribution: number,
  expectedReturn: number = 0.07,
  volatility: number = 0.15,
  years: number = 30
): ConeDataPoint[] {
  const data: ConeDataPoint[] = [];

  for (let year = 0; year <= years; year++) {
    // Total contributions by this year
    const totalContributions = initialAmount + (monthlyContribution * 12 * year);

    // Expected growth factor using compound interest
    const growthFactor = Math.pow(1 + expectedReturn, year);

    // Median projection (expected value)
    const median = totalContributions * growthFactor;

    // Standard deviation increases with square root of time
    // This is based on the lognormal distribution of returns
    const stdDev = volatility * Math.sqrt(year);

    // 80% confidence interval = +/- 1.28 standard deviations
    // Upper: 90th percentile, Lower: 10th percentile
    const z = 1.28;
    const upper80 = year === 0 ? median : median * Math.exp(z * stdDev);
    const lower80 = year === 0 ? median : median * Math.exp(-z * stdDev);

    data.push({
      year,
      median: Math.round(median),
      upper80: Math.round(upper80),
      lower80: Math.round(lower80)
    });
  }

  return data;
}

/**
 * Format cone data for display labels (every 5 years)
 */
export function getConeLabels(coneData: ConeDataPoint[]): string[] {
  return coneData
    .filter((_, i) => i % 5 === 0)
    .map(d => `${d.year}y`);
}

/**
 * Get normalized description of volatility
 * Frames market drops as normal, not scary events.
 */
export function getVolatilityDescription(currentDropPercent: number): string {
  if (currentDropPercent <= 10) {
    return 'Normal fluctuation. The market dips 10% about once per year.';
  }
  if (currentDropPercent <= 20) {
    return 'Correction territory. This happens every 3-4 years historically.';
  }
  if (currentDropPercent <= 30) {
    return 'Significant downturn. Uncomfortable, but the market has always recovered.';
  }
  return 'Major bear market. Rare, but historically followed by strong recoveries.';
}

/**
 * Historical context for normalizing volatility
 * Key facts that help users stay calm during market drops.
 */
export const VOLATILITY_CONTEXT = {
  annualDropFrequency: 'Markets drop 10%+ about once per year',
  correctionFrequency: 'Markets drop 20%+ every 3-4 years',
  bearMarketFrequency: 'Markets drop 30%+ about every 10 years',
  averageReturn: '10% average annual return over 100+ years',
  recoveryNote: 'Every major drop in history has been followed by new highs'
};

/**
 * Format large numbers for display
 */
export function formatConeAmount(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value}`;
}
