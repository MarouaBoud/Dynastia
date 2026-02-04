/**
 * Budget Validation Schemas
 *
 * Zod schemas for validating budget-related requests.
 */

import { z } from 'zod';

// Percentage validation (0-100, 2 decimal places)
const percentSchema = z
  .number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100');

// Amount validation
const amountSchema = z
  .number({ required_error: 'Please provide an amount' })
  .positive('Amount must be positive')
  .max(999999999.9999, 'Amount is too large');

// UUID for params
const uuidParamSchema = z.object({
  id: z.string().uuid('That ID format looks off'),
});

/**
 * POST /budgets
 */
export const createBudgetSchema = z.object({
  body: z
    .object({
      month: z
        .number({ required_error: 'Please provide a month' })
        .int('Month must be a whole number')
        .min(1, 'Month must be between 1 and 12')
        .max(12, 'Month must be between 1 and 12'),
      year: z
        .number({ required_error: 'Please provide a year' })
        .int('Year must be a whole number')
        .min(2020, 'Year must be 2020 or later')
        .max(2100, 'Year must be before 2100'),
      totalIncome: amountSchema,
      savingsPercent: percentSchema.default(20),
      billsPercent: percentSchema.default(50),
      lifestylePercent: percentSchema.default(30),
    })
    .refine(
      (data) =>
        Math.abs(data.savingsPercent + data.billsPercent + data.lifestylePercent - 100) < 0.01,
      {
        message: 'Savings, bills, and lifestyle percentages must add up to 100%',
        path: ['savingsPercent'],
      }
    ),
});

/**
 * PATCH /budgets/:id
 */
export const updateBudgetSchema = z.object({
  params: uuidParamSchema,
  body: z
    .object({
      totalIncome: amountSchema.optional(),
      savingsPercent: percentSchema.optional(),
      billsPercent: percentSchema.optional(),
      lifestylePercent: percentSchema.optional(),
    })
    .refine(
      (data) => {
        // If any percentage is provided, all must be provided and sum to 100
        const hasAnyPercent =
          data.savingsPercent !== undefined ||
          data.billsPercent !== undefined ||
          data.lifestylePercent !== undefined;

        if (!hasAnyPercent) return true;

        const allPresent =
          data.savingsPercent !== undefined &&
          data.billsPercent !== undefined &&
          data.lifestylePercent !== undefined;

        if (!allPresent) return false;

        return (
          Math.abs(data.savingsPercent! + data.billsPercent! + data.lifestylePercent! - 100) < 0.01
        );
      },
      {
        message:
          "When updating allocations, please provide all three (savings, bills, lifestyle) and ensure they add up to 100%",
      }
    ),
});

/**
 * GET /budgets/:id and GET /budgets/:id/progress
 */
export const budgetIdSchema = z.object({
  params: uuidParamSchema,
});

// Export types
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>['body'];
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>['body'];
