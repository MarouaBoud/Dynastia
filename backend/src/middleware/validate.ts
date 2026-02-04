/**
 * Validation Middleware
 *
 * Uses Zod schemas to validate incoming requests.
 * Returns emotionally safe error messages.
 */

import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Creates a validation middleware for the given Zod schema.
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * router.post('/signup', validate(signupSchema), signup);
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into user-friendly messages
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        // Get the first error message for a simple response
        const firstError = errors[0]?.message || "Let's double-check that information";

        res.status(400).json({
          error: firstError,
          details: errors,
        });
        return;
      }

      // Unexpected error
      res.status(500).json({
        error: "Something unexpected happened. Let's try that again.",
      });
    }
  };
};

/**
 * Validate only the request body (simpler usage)
 */
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0]?.message || "Let's double-check that information";
        res.status(400).json({
          error: firstError,
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }

      res.status(500).json({
        error: "Something unexpected happened. Let's try that again.",
      });
    }
  };
};
