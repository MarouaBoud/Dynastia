/**
 * Authentication Validation Schemas
 *
 * Zod schemas for validating auth-related requests.
 * All error messages use emotionally safe language.
 */

import { z } from 'zod';

// Email validation with custom message
const emailSchema = z
  .string({ required_error: 'Please provide your email' })
  .email('That email format looks off. Double-check and try again.')
  .max(255, 'Email is too long')
  .transform((email) => email.toLowerCase().trim());

// Password validation
const passwordSchema = z
  .string({ required_error: 'Please provide your password' })
  .min(8, 'Add at least 8 characters to your password')
  .max(128, 'Password is too long')
  .regex(
    /^(?=.*[a-zA-Z])(?=.*[0-9])/,
    "Let's make your password stronger with a mix of letters and numbers"
  );

// UUID validation
const uuidSchema = z
  .string({ required_error: 'This field is required' })
  .uuid('That ID format looks off');

// TOTP token validation (6 digits)
const totpTokenSchema = z
  .string({ required_error: 'Please provide the verification code' })
  .length(6, 'The verification code should be 6 digits')
  .regex(/^\d{6}$/, 'The verification code should only contain numbers');

// JWT token validation
const jwtTokenSchema = z
  .string({ required_error: 'Please provide the token' })
  .min(10, 'That token looks incomplete');

/**
 * POST /auth/signup
 */
export const signupSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

/**
 * POST /auth/login
 */
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string({ required_error: 'Please provide your password' }).min(1),
  }),
});

/**
 * POST /auth/refresh
 */
export const refreshSchema = z.object({
  body: z.object({
    refreshToken: jwtTokenSchema,
  }),
});

/**
 * POST /auth/2fa/verify
 */
export const verify2FASchema = z.object({
  body: z.object({
    userId: uuidSchema,
    token: totpTokenSchema,
  }),
});

// Export types
export type SignupInput = z.infer<typeof signupSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshInput = z.infer<typeof refreshSchema>['body'];
export type Verify2FAInput = z.infer<typeof verify2FASchema>['body'];
