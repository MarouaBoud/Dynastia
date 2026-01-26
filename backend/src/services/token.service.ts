/**
 * Token Service
 *
 * Handles JWT token generation and verification for authentication.
 * Uses industry-standard jsonwebtoken library (never hand-roll crypto).
 *
 * Security principles:
 * - Access tokens: Short-lived (15 min) to limit exposure if leaked
 * - Refresh tokens: Longer-lived (7 days) for better UX
 * - Separate secrets: Prevents refresh token misuse as access token
 * - Clear errors: Helps debugging without exposing internals
 */

import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
}

if (ACCESS_TOKEN_SECRET === REFRESH_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different');
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generates a pair of access and refresh tokens for a user
 *
 * @param user - User information to embed in tokens
 * @returns TokenPair containing both access and refresh tokens
 */
export function generateTokens(user: { id: string; email: string }): TokenPair {
  // Access token: Contains user ID and email, expires in 15 minutes
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    ACCESS_TOKEN_SECRET!,
    { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
  );

  // Refresh token: Contains only user ID (minimal info), expires in 7 days
  const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_TOKEN_SECRET!,
    { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

/**
 * Verifies and decodes an access token
 *
 * @param token - JWT access token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid, expired, or malformed
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET!) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw new Error('Failed to verify access token');
  }
}

/**
 * Verifies and decodes a refresh token
 *
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid, expired, or malformed
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET!) as RefreshTokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw new Error('Failed to verify refresh token');
  }
}

/**
 * Decodes a token without verifying (useful for debugging, not for auth)
 *
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): any {
  return jwt.decode(token);
}
