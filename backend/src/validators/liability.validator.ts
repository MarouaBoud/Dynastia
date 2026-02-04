/**
 * Liability Validation Schemas
 *
 * Zod schemas for validating liability-related requests.
 */

import { z } from 'zod';

// Valid liability types
const LIABILITY_TYPES = [
  'credit_card',
  'student_loan',
  'mortgage',
  'auto_loan',
  'personal_loan',
  'medical_debt',
  'other',
] as const;

// Balance validation
const balanceSchema = z
  .number({ required_error: 'Please provide a balance' })
  .nonnegative('Balance cannot be negative')
  .max(999999999.9999, 'Balance is too large');

// UUID for params
const uuidParamSchema = z.object({
  id: z.string().uuid('That ID format looks off'),
});

/**
 * POST /liabilities
 */
export const createLiabilitySchema = z.object({
  body: z.object({
    type: z.enum(LIABILITY_TYPES, {
      errorMap: () => ({ message: 'Please select a valid liability type' }),
    }),
    name: z
      .string({ required_error: 'Please provide a name' })
      .min(1, 'Please provide a name')
      .max(255, 'Name is too long'),
    balance: balanceSchema,
  }),
});

/**
 * PUT /liabilities/:id
 */
export const updateLiabilitySchema = z.object({
  params: uuidParamSchema,
  body: z.object({
    type: z
      .enum(LIABILITY_TYPES, {
        errorMap: () => ({ message: 'Please select a valid liability type' }),
      })
      .optional(),
    name: z
      .string()
      .min(1, 'Please provide a name')
      .max(255, 'Name is too long')
      .optional(),
    balance: balanceSchema.optional(),
  }),
});

/**
 * GET /liabilities/:id and DELETE /liabilities/:id
 */
export const liabilityIdSchema = z.object({
  params: uuidParamSchema,
});

// Export types
export type CreateLiabilityInput = z.infer<typeof createLiabilitySchema>['body'];
export type UpdateLiabilityInput = z.infer<typeof updateLiabilitySchema>['body'];
