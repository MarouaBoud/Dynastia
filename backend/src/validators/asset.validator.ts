/**
 * Asset Validation Schemas
 *
 * Zod schemas for validating asset-related requests.
 */

import { z } from 'zod';

// Valid asset types
const ASSET_TYPES = [
  'cash',
  'savings',
  'checking',
  'investment',
  'retirement',
  'property',
  'vehicle',
  'other',
] as const;

// Amount validation
const valueSchema = z
  .number({ required_error: 'Please provide a value' })
  .nonnegative('Value cannot be negative')
  .max(999999999.9999, 'Value is too large');

// UUID for params
const uuidParamSchema = z.object({
  id: z.string().uuid('That ID format looks off'),
});

/**
 * POST /assets
 */
export const createAssetSchema = z.object({
  body: z.object({
    type: z.enum(ASSET_TYPES, {
      errorMap: () => ({ message: 'Please select a valid asset type' }),
    }),
    name: z
      .string({ required_error: 'Please provide a name' })
      .min(1, 'Please provide a name')
      .max(255, 'Name is too long'),
    value: valueSchema,
  }),
});

/**
 * PUT /assets/:id
 */
export const updateAssetSchema = z.object({
  params: uuidParamSchema,
  body: z.object({
    type: z
      .enum(ASSET_TYPES, {
        errorMap: () => ({ message: 'Please select a valid asset type' }),
      })
      .optional(),
    name: z
      .string()
      .min(1, 'Please provide a name')
      .max(255, 'Name is too long')
      .optional(),
    value: valueSchema.optional(),
  }),
});

/**
 * GET /assets/:id and DELETE /assets/:id
 */
export const assetIdSchema = z.object({
  params: uuidParamSchema,
});

// Export types
export type CreateAssetInput = z.infer<typeof createAssetSchema>['body'];
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>['body'];
