/**
 * Income Validation Schemas
 *
 * Zod schemas for validating income-related requests.
 */

import { z } from 'zod';

// Valid income frequencies
const INCOME_FREQUENCIES = ['monthly', 'bi-weekly', 'weekly', 'one-time'] as const;

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
 * POST /incomes
 */
export const createIncomeSchema = z.object({
  body: z.object({
    source: z
      .string({ required_error: 'Please provide an income source' })
      .min(1, 'Please provide an income source')
      .max(255, 'Source name is too long'),
    amount: amountSchema,
    frequency: z
      .enum(INCOME_FREQUENCIES, {
        errorMap: () => ({ message: 'Please select a valid frequency' }),
      })
      .default('monthly'),
    budgetId: z.string().uuid('That budget ID format looks off').optional().nullable(),
  }),
});

/**
 * PATCH /incomes/:id
 */
export const updateIncomeSchema = z.object({
  params: uuidParamSchema,
  body: z.object({
    source: z
      .string()
      .min(1, 'Please provide an income source')
      .max(255, 'Source name is too long')
      .optional(),
    amount: amountSchema.optional(),
    frequency: z
      .enum(INCOME_FREQUENCIES, {
        errorMap: () => ({ message: 'Please select a valid frequency' }),
      })
      .optional(),
    budgetId: z.string().uuid('That budget ID format looks off').optional().nullable(),
  }),
});

/**
 * GET /incomes/:id and DELETE /incomes/:id
 */
export const incomeIdSchema = z.object({
  params: uuidParamSchema,
});

// Export types
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>['body'];
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>['body'];
