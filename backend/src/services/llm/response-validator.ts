/**
 * LLM Response Validator
 *
 * Zod schemas for validating LLM outputs before use.
 * Ensures coaching responses are safe, well-formed, and within length limits.
 */

import { z } from 'zod';

/**
 * Coaching response schema
 *
 * Validates that LLM responses:
 * - Have non-empty message text
 * - Stay within 500 character limit (keeps coaching concise)
 * - Optionally include tone metadata for UI personalization
 */
export const CoachingResponseSchema = z.object({
  message: z.string().min(1).max(500),
  tone: z.enum(['encouraging', 'curious', 'celebratory', 'supportive']).optional()
});

/**
 * TypeScript type inferred from schema
 */
export type CoachingResponse = z.infer<typeof CoachingResponseSchema>;

/**
 * Validate raw LLM response
 *
 * @param rawResponse - Raw string response from LLM
 * @returns Validation result with parsed data or error
 *
 * Usage:
 * ```typescript
 * const result = validateCoachingResponse(llmOutput);
 * if (result.success) {
 *   // Use result.data.message, result.data.tone
 * } else {
 *   // Handle validation error: result.error
 * }
 * ```
 */
export function validateCoachingResponse(rawResponse: string):
  | { success: true; data: CoachingResponse }
  | { success: false; error: z.ZodError }
{
  try {
    // Attempt to parse as JSON first (for structured responses)
    const parsed = JSON.parse(rawResponse);
    const result = CoachingResponseSchema.safeParse(parsed);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  } catch (jsonError) {
    // If not JSON, treat as plain text message
    const plainTextResponse = { message: rawResponse };
    const result = CoachingResponseSchema.safeParse(plainTextResponse);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  }
}
