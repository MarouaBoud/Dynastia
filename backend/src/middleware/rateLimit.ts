/**
 * Rate Limiting Middleware
 *
 * Protects API from abuse with configurable rate limits.
 * Uses emotionally safe messages when limits are exceeded.
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    error: "You're making requests faster than we can handle. Let's take a short break and try again in a few minutes.",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

/**
 * Strict rate limiter for authentication endpoints
 * 10 requests per 15 minutes per IP (prevents brute force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    error: "Let's take a short break. You can try again in 15 minutes, or reset your password now.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});

/**
 * Very strict limiter for password reset
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per window
  message: {
    error: "We've sent too many reset emails recently. Please check your inbox or try again in an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Moderate limiter for 2FA verification
 * 5 attempts per 5 minutes (prevents code guessing)
 */
export const twoFactorLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: {
    error: "Let's take a short break. You can try again in 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Write operations limiter
 * 30 requests per minute per IP
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 writes per minute
  message: {
    error: "You're saving changes faster than we can process. Let's slow down a bit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
