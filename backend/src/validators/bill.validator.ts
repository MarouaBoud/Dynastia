/**
 * Bill Validation Schemas
 *
 * Zod schemas for validating bill-related requests.
 */

import { z } from 'zod';

// Valid bill frequencies
const BILL_FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'annually'] as const;

// Valid bill categories
const BILL_CATEGORIES = [
  'housing',
  'utilities',
  'subscription',
  'insurance',
  'loan',
  'other',
] as const;

// Amount validation
const amountSchema = z
  .number({ required_error: 'Please provide an amount' })
  .positive('Amount must be positive')
  .max(999999999.9999, 'Amount is too large');

// APR validation (0-100%)
const aprSchema = z
  .number()
  .min(0, 'APR cannot be negative')
  .max(100, 'APR cannot exceed 100%')
  .optional()
  .nullable();

// UUID for params
const uuidParamSchema = z.object({
  id: z.string().uuid('That ID format looks off'),
});

/**
 * POST /bills
 */
export const createBillSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Please provide a bill name' })
        .min(1, 'Please provide a bill name')
        .max(255, 'Bill name is too long'),
      amount: amountSchema,
      frequency: z
        .enum(BILL_FREQUENCIES, {
          errorMap: () => ({ message: 'Please select a valid frequency' }),
        })
        .default('monthly'),
      dueDay: z
        .number({ required_error: 'Please provide a due day' })
        .int('Due day must be a whole number')
        .min(1, 'Due day must be at least 1')
        .max(31, 'Due day cannot exceed 31'),
      nextDueDate: z
        .string({ required_error: 'Please provide the next due date' })
        .datetime('That date format looks off'),
      category: z.enum(BILL_CATEGORIES, {
        errorMap: () => ({ message: 'Please select a valid category' }),
      }),
      isCreditCard: z.boolean().default(false),
      creditCardApr: aprSchema,
    })
    .refine(
      (data) => {
        // If it's a credit card, APR should be provided
        if (data.isCreditCard && data.creditCardApr === null) {
          return true; // Allow null APR for credit cards (optional)
        }
        return true;
      },
      { message: 'Credit cards should have an APR specified' }
    ),
});

/**
 * PATCH /bills/:id
 */
export const updateBillSchema = z.object({
  params: uuidParamSchema,
  body: z.object({
    name: z
      .string()
      .min(1, 'Please provide a bill name')
      .max(255, 'Bill name is too long')
      .optional(),
    amount: amountSchema.optional(),
    frequency: z
      .enum(BILL_FREQUENCIES, {
        errorMap: () => ({ message: 'Please select a valid frequency' }),
      })
      .optional(),
    dueDay: z
      .number()
      .int('Due day must be a whole number')
      .min(1, 'Due day must be at least 1')
      .max(31, 'Due day cannot exceed 31')
      .optional(),
    nextDueDate: z.string().datetime('That date format looks off').optional(),
    category: z
      .enum(BILL_CATEGORIES, {
        errorMap: () => ({ message: 'Please select a valid category' }),
      })
      .optional(),
    isCreditCard: z.boolean().optional(),
    creditCardApr: aprSchema,
    isPaid: z.boolean().optional(),
  }),
});

/**
 * GET /bills/:id and DELETE /bills/:id
 */
export const billIdSchema = z.object({
  params: uuidParamSchema,
});

/**
 * POST /bills/:id/mark-paid
 */
export const markBillPaidSchema = z.object({
  params: uuidParamSchema,
  body: z.object({
    paidInFull: z.boolean().default(true),
  }),
});

// Export types
export type CreateBillInput = z.infer<typeof createBillSchema>['body'];
export type UpdateBillInput = z.infer<typeof updateBillSchema>['body'];
