/**
 * Transaction Validation Schemas
 *
 * Zod schemas for validating transaction-related requests.
 */

import { z } from 'zod';

// Valid transaction categories
const TRANSACTION_CATEGORIES = [
  'housing',
  'food',
  'transport',
  'shopping',
  'health',
  'entertainment',
  'other',
] as const;

// Amount validation (positive, reasonable max)
const amountSchema = z
  .number({ required_error: 'Please provide an amount' })
  .positive('Amount must be positive')
  .max(999999999.9999, 'Amount is too large');

// Date validation
const dateSchema = z
  .string({ required_error: 'Please provide a date' })
  .datetime({ message: 'That date format looks off' })
  .or(z.date());

// UUID for params
const uuidParamSchema = z.object({
  id: z.string().uuid('That ID format looks off'),
});

/**
 * POST /transactions
 */
export const createTransactionSchema = z.object({
  body: z.object({
    amount: amountSchema,
    merchant: z
      .string({ required_error: 'Please provide a merchant name' })
      .min(1, 'Please provide a merchant name')
      .max(255, 'Merchant name is too long'),
    description: z
      .string()
      .max(1000, 'Description is too long')
      .optional()
      .nullable(),
    date: dateSchema,
    category: z.enum(TRANSACTION_CATEGORIES, {
      errorMap: () => ({ message: 'Please select a valid category' }),
    }),
    notes: z
      .string()
      .max(1000, 'Notes are too long')
      .optional()
      .nullable(),
    receiptUrl: z
      .string()
      .url('That URL format looks off')
      .max(500, 'URL is too long')
      .optional()
      .nullable(),
  }),
});

/**
 * PUT /transactions/:id
 */
export const updateTransactionSchema = z.object({
  params: uuidParamSchema,
  body: z.object({
    amount: amountSchema.optional(),
    merchant: z
      .string()
      .min(1, 'Please provide a merchant name')
      .max(255, 'Merchant name is too long')
      .optional(),
    description: z
      .string()
      .max(1000, 'Description is too long')
      .optional()
      .nullable(),
    date: dateSchema.optional(),
    category: z
      .enum(TRANSACTION_CATEGORIES, {
        errorMap: () => ({ message: 'Please select a valid category' }),
      })
      .optional(),
    notes: z
      .string()
      .max(1000, 'Notes are too long')
      .optional()
      .nullable(),
    receiptUrl: z
      .string()
      .url('That URL format looks off')
      .max(500, 'URL is too long')
      .optional()
      .nullable(),
  }),
});

/**
 * GET /transactions/:id and DELETE /transactions/:id
 */
export const transactionIdSchema = z.object({
  params: uuidParamSchema,
});

/**
 * GET /transactions (query params)
 */
export const listTransactionsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().min(1).max(100).default(50).optional(),
    offset: z.coerce.number().min(0).default(0).optional(),
    category: z.enum(TRANSACTION_CATEGORIES).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Export types
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>['body'];
