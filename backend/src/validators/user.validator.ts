/**
 * User Validation Schemas
 *
 * Zod schemas for validating user-related requests.
 */

import { z } from 'zod';

// Supported countries (ISO 3166-1 alpha-2)
const SUPPORTED_COUNTRIES = [
  'US', 'FR', 'DE', 'GB', 'CA', 'AU', 'JP', 'CH',
  'AT', 'BE', 'ES', 'FI', 'IE', 'IT', 'LU', 'NL', 'PT',
] as const;

// Supported currencies (ISO 4217)
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'] as const;

/**
 * PATCH /users/me
 */
export const updateUserSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, 'Please provide your first name')
      .max(100, 'First name is too long')
      .optional(),
    lastName: z
      .string()
      .min(1, 'Please provide your last name')
      .max(100, 'Last name is too long')
      .optional(),
    country: z
      .enum(SUPPORTED_COUNTRIES, {
        errorMap: () => ({ message: 'Please select a supported country' }),
      })
      .optional(),
    currency: z
      .enum(SUPPORTED_CURRENCIES, {
        errorMap: () => ({ message: 'Please select a supported currency' }),
      })
      .optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Please provide at least one field to update' }
  ),
});

// Export types
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
