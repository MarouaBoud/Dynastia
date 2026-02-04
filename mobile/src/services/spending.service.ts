/**
 * Spending Service
 *
 * Aggregates transaction data for chart visualizations.
 * Provides spending breakdowns by category, bucket, and time.
 */

import { getTransactions, Transaction } from './transactions.service';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

// =============================================================================
// Types
// =============================================================================

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  transactionCount: number;
}

export interface BucketSpending {
  bucket: 'savings' | 'bills' | 'lifestyle';
  amount: number;
  percentage: number;
  color: string;
}

export interface SpendingTrend {
  month: string;
  label: string;
  total: number;
  savings: number;
  bills: number;
  lifestyle: number;
}

export interface SpendingComparison {
  category: string;
  currentMonth: number;
  previousMonth: number;
  change: number;
  changePercent: number;
}

export interface MonthlySpendingSummary {
  total: number;
  byCategory: CategorySpending[];
  byBucket: BucketSpending[];
  transactionCount: number;
}

// =============================================================================
// Constants
// =============================================================================

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#4A90D9',
  Food: '#F5A623',
  Transport: '#7B68EE',
  Shopping: '#50C878',
  Health: '#FF6B6B',
  Entertainment: '#FFD700',
  Other: '#95A5A6',
};

export const BUCKET_COLORS = {
  savings: '#4A9D7C',
  bills: '#3B82F6',
  lifestyle: '#8B5CF6',
};

// Category to bucket mapping
const CATEGORY_TO_BUCKET: Record<string, 'savings' | 'bills' | 'lifestyle'> = {
  Housing: 'bills',
  Health: 'bills',
  Food: 'lifestyle',
  Transport: 'lifestyle',
  Shopping: 'lifestyle',
  Entertainment: 'lifestyle',
  Other: 'lifestyle',
};

// =============================================================================
// Service Functions
// =============================================================================

/**
 * Get spending aggregated by category for a specific month
 */
export async function getSpendingByCategory(
  month: number,
  year: number
): Promise<CategorySpending[]> {
  const startDate = startOfMonth(new Date(year, month));
  const endDate = endOfMonth(new Date(year, month));

  const transactions = await getTransactions({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  // Aggregate by category
  const categoryTotals: Record<string, { amount: number; count: number }> = {};
  let totalSpent = 0;

  transactions.forEach((tx) => {
    if (!categoryTotals[tx.category]) {
      categoryTotals[tx.category] = { amount: 0, count: 0 };
    }
    categoryTotals[tx.category].amount += tx.amount;
    categoryTotals[tx.category].count += 1;
    totalSpent += tx.amount;
  });

  // Convert to CategorySpending array
  const result: CategorySpending[] = Object.entries(categoryTotals)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  return result;
}

/**
 * Get spending aggregated by budget bucket
 */
export async function getSpendingByBucket(
  month: number,
  year: number
): Promise<BucketSpending[]> {
  const categorySpending = await getSpendingByCategory(month, year);

  // Map categories to buckets
  const bucketTotals: Record<string, number> = {
    savings: 0,
    bills: 0,
    lifestyle: 0,
  };

  categorySpending.forEach((cat) => {
    const bucket = CATEGORY_TO_BUCKET[cat.category] || 'lifestyle';
    bucketTotals[bucket] += cat.amount;
  });

  const total = Object.values(bucketTotals).reduce((sum, amt) => sum + amt, 0);

  return [
    {
      bucket: 'savings',
      amount: bucketTotals.savings,
      percentage: total > 0 ? (bucketTotals.savings / total) * 100 : 0,
      color: BUCKET_COLORS.savings,
    },
    {
      bucket: 'bills',
      amount: bucketTotals.bills,
      percentage: total > 0 ? (bucketTotals.bills / total) * 100 : 0,
      color: BUCKET_COLORS.bills,
    },
    {
      bucket: 'lifestyle',
      amount: bucketTotals.lifestyle,
      percentage: total > 0 ? (bucketTotals.lifestyle / total) * 100 : 0,
      color: BUCKET_COLORS.lifestyle,
    },
  ];
}

/**
 * Get spending trends over multiple months
 */
export async function getSpendingTrend(months: number = 6): Promise<SpendingTrend[]> {
  const trends: SpendingTrend[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i);
    const month = date.getMonth();
    const year = date.getFullYear();

    const bucketSpending = await getSpendingByBucket(month, year);

    const savingsData = bucketSpending.find((b) => b.bucket === 'savings');
    const billsData = bucketSpending.find((b) => b.bucket === 'bills');
    const lifestyleData = bucketSpending.find((b) => b.bucket === 'lifestyle');

    trends.push({
      month: format(date, 'yyyy-MM'),
      label: format(date, 'MMM'),
      total:
        (savingsData?.amount || 0) +
        (billsData?.amount || 0) +
        (lifestyleData?.amount || 0),
      savings: savingsData?.amount || 0,
      bills: billsData?.amount || 0,
      lifestyle: lifestyleData?.amount || 0,
    });
  }

  return trends;
}

/**
 * Compare spending to previous month by category
 */
export async function getCategoryComparison(
  month: number,
  year: number
): Promise<SpendingComparison[]> {
  const currentSpending = await getSpendingByCategory(month, year);

  // Get previous month
  const prevDate = subMonths(new Date(year, month), 1);
  const prevMonth = prevDate.getMonth();
  const prevYear = prevDate.getFullYear();
  const prevSpending = await getSpendingByCategory(prevMonth, prevYear);

  // Create comparison map
  const prevMap = new Map(prevSpending.map((s) => [s.category, s.amount]));

  return currentSpending.map((current) => {
    const previousAmount = prevMap.get(current.category) || 0;
    const change = current.amount - previousAmount;
    const changePercent =
      previousAmount > 0 ? ((change / previousAmount) * 100) : current.amount > 0 ? 100 : 0;

    return {
      category: current.category,
      currentMonth: current.amount,
      previousMonth: previousAmount,
      change,
      changePercent,
    };
  });
}

/**
 * Get complete monthly spending summary
 */
export async function getMonthlySpendingSummary(
  month: number,
  year: number
): Promise<MonthlySpendingSummary> {
  const [byCategory, byBucket] = await Promise.all([
    getSpendingByCategory(month, year),
    getSpendingByBucket(month, year),
  ]);

  const total = byCategory.reduce((sum, cat) => sum + cat.amount, 0);
  const transactionCount = byCategory.reduce((sum, cat) => sum + cat.transactionCount, 0);

  return {
    total,
    byCategory,
    byBucket,
    transactionCount,
  };
}

export default {
  getSpendingByCategory,
  getSpendingByBucket,
  getSpendingTrend,
  getCategoryComparison,
  getMonthlySpendingSummary,
  CATEGORY_COLORS,
  BUCKET_COLORS,
};
