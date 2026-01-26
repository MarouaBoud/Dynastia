/**
 * Authentication Middleware
 *
 * Protects routes by verifying JWT access tokens.
 * Attaches decoded user info to req.user for downstream handlers.
 *
 * Security principles:
 * - Return 401 (not 403) for auth failures to trigger token refresh flow
 * - Use emotionally safe error messages
 * - Extract token from Authorization: Bearer <token> header
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../services/token.service';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to verify JWT access token and attach user to request
 *
 * Usage: Apply to protected routes
 * Example: router.get('/protected', authMiddleware, handler)
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'To keep your account secure, please log in again'
      });
      return;
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        error: 'To keep your account secure, please log in again'
      });
      return;
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.user = decoded;

    // Continue to next handler
    next();
  } catch (error: any) {
    // Token verification failed (expired, invalid, etc.)
    res.status(401).json({
      error: 'To keep your account secure, please log in again'
    });
  }
}
