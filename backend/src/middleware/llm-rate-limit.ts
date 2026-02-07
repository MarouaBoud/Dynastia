/**
 * LLM Rate Limiting Middleware
 *
 * Protects against LLM API cost overruns by limiting requests per user.
 * Uses per-user tracking (not just IP) for accurate accounting.
 */

import rateLimit from 'express-rate-limit';

/**
 * LLM-specific rate limiter
 * 20 requests per hour per user (prevents cost overrun)
 *
 * Cost protection strategy:
 * - Uses userId from JWT auth for accurate per-user tracking
 * - Falls back to IP if userId not available
 * - Emotionally safe error message (collaborative, not blaming)
 * - Returns retry-after header for client handling
 */
export const llmRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // 20 requests per hour per user
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  keyGenerator: (req) => {
    // Use user ID from JWT auth (req.user set by authMiddleware)
    // Falls back to IP for unauthenticated requests
    return (req as any).user?.userId || req.ip || 'anonymous';
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many coaching requests',
      message: "Let's take a short break. You can request more guidance in an hour.",
      retryAfter: res.getHeader('Retry-After')
    });
  }
});
