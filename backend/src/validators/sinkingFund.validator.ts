/**
 * Sinking Fund Validation Schemas
 *
 * Zod schemas for validating sinking fund-related requests.
 */

import { z } from 'zod';

// Amount validation
const amountSchema = z
  .number({ required_error: 'Please provide an amount' })
  .positive('Amount must be positive')
  .max(999999999.9999, 'Amount is too large');

// Non-negative amount for current amount
const currentAmountSchema = z
  .number()
  .nonnegative('Amount cannot be negative')
  .max(999999999.9999, 'Amount is too large');

// UUID for params
const uuidParamSchema = z.object({
  id: z.string().uuid('That ID format looks off'),
});

/**
 * POST /sinking-funds
 */
export const createSinkingFundSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Please provide a name for your savings goal' })
      .min(1, 'Please provide a name for your savings goal')
      .max(255, 'Name is too long'),
    targetAmount: amountSchema,
    currentAmount: currentAmountSchema.default(0),
    deadline: z
      .string({ required_error: 'Please provide a target date' })
      .datetime('That date format looks off'),
    budgetId: z.string().uuid('That budget ID format looks off').optional().nullable(),
  }),
});

/**
 * PATCH /sinking-funds/:id
 */
export const updateSinkingFundSchema = z.object({
  params: uuidParamSchema,
  body: z.object({
    name: z
      .string()
      .min(1, 'Please provide a name for your savings goal')
      .max(255, 'Name is too long')
      .optional(),
    targetAmount: amountSchema.optional(),
    currentAmount: currentAmountSchema.optional(),
    deadline: z.string().datetime('That date format looks off').optional(),
    isCompleted: z.boolean().optional(),
    budgetId: z.string().uuid('That budget ID format looks off').optional().nullable(),
  }),
});

/**
 * GET /sinking-funds/:id and DELETE /sinking-funds/:id
 */
export const sinkingFundIdSchema = z.object({
  params: uuidParamSchema,
});

/**
 * POST /sinking-funds/:id/contribute
 */
export const contributeSinkingFundSchema = z.object({
  params: uuidParamSchema,
  body: z.object({
    amount: z
      .number({ required_error: 'Please provide a contribution amount' })
      .positive('Contribution must be positive')
      .max(999999999.9999, 'Amount is too large'),
  }),
});

// Export types
export type CreateSinkingFundInput = z.infer<typeof createSinkingFundSchema>['body'];
export type UpdateSinkingFundInput = z.infer<typeof updateSinkingFundSchema>['body'];
export type ContributeSinkingFundInput = z.infer<typeof contributeSinkingFundSchema>['body'];
