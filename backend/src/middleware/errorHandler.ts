/**
 * Global Error Handler Middleware
 *
 * Catches all unhandled errors and returns safe, user-friendly responses.
 * Logs errors for debugging while hiding internal details from users.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common API errors with safe messages
export const Errors = {
  badRequest: (message = "Let's double-check that information and try again.") =>
    new ApiError(400, message),
  unauthorized: (message = 'To keep your account secure, please log in again.') =>
    new ApiError(401, message),
  forbidden: (message = "You don't have access to that resource.") =>
    new ApiError(403, message),
  notFound: (message = "We couldn't find what you're looking for.") =>
    new ApiError(404, message),
  conflict: (message = 'That resource already exists.') =>
    new ApiError(409, message),
  tooManyRequests: (message = "Let's take a short break and try again in a few minutes.") =>
    new ApiError(429, message),
  internal: (message = "Something unexpected happened. Let's try that again.") =>
    new ApiError(500, message, false),
};

/**
 * Global error handler middleware
 * Must be registered after all routes
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    req: {
      method: req.method,
      url: req.url,
      body: req.body,
    },
  });

  // Handle known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        error: 'That information is already in use. Try something different.',
      });
      return;
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      res.status(404).json({
        error: "We couldn't find what you're looking for.",
      });
      return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'To keep your account secure, please log in again.',
    });
    return;
  }

  // Handle all other errors (don't expose internal details)
  res.status(500).json({
    error: "Something unexpected happened. Let's try that again.",
  });
};

/**
 * Not found handler for unknown routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: "We couldn't find what you're looking for.",
  });
};
