/**
 * Category to Budget Bucket Mapping
 *
 * Maps the 7 transaction categories to 3 budget buckets.
 * Used for calculating spending progress per bucket.
 */

// Map existing transaction categories to budget buckets
export const CATEGORY_TO_BUCKET = {
  Housing: 'bills',
  Food: 'lifestyle',
  Transport: 'lifestyle',
  Shopping: 'lifestyle',
  Health: 'bills',
  Entertainment: 'lifestyle',
  Other: 'lifestyle',
} as const;

export type TransactionCategory = keyof typeof CATEGORY_TO_BUCKET;
export type BudgetBucket = 'savings' | 'bills' | 'lifestyle';

/**
 * Get the budget bucket for a transaction category
 * @param category - Transaction category
 * @returns Budget bucket (savings, bills, or lifestyle)
 */
export function getCategoryBucket(category: string): BudgetBucket {
  const bucket = CATEGORY_TO_BUCKET[category as TransactionCategory];
  return bucket || 'lifestyle'; // Default to lifestyle for unknown categories
}

/**
 * Get all categories that map to a specific bucket
 * @param bucket - Budget bucket
 * @returns Array of category names
 */
export function getCategoriesForBucket(bucket: BudgetBucket): string[] {
  return Object.entries(CATEGORY_TO_BUCKET)
    .filter(([_, b]) => b === bucket)
    .map(([category]) => category);
}

/**
 * Budget bucket display information
 */
export const BUCKET_INFO = {
  savings: {
    name: 'Savings',
    displayName: 'Pay Yourself First',
    description: 'Emergency fund, investments, and savings goals',
    color: '#10B981', // Green
    order: 1,
  },
  bills: {
    name: 'Bills',
    displayName: 'Fixed Expenses',
    description: 'Housing, utilities, subscriptions, and health',
    color: '#3B82F6', // Blue
    order: 2,
  },
  lifestyle: {
    name: 'Lifestyle',
    displayName: 'Enjoy Life',
    description: 'Food, shopping, entertainment, and personal',
    color: '#8B5CF6', // Purple
    order: 3,
  },
} as const;
