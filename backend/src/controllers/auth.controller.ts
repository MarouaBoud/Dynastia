/**
 * Authentication Controller
 *
 * Handles HTTP requests for authentication operations.
 * Maps HTTP requests to auth service functions.
 *
 * Endpoints:
 * - POST /auth/signup: Create new account
 * - POST /auth/login: Authenticate user
 * - POST /auth/refresh: Get new access token using refresh token
 * - POST /auth/2fa/enable: Enable 2FA (protected)
 * - POST /auth/2fa/verify: Verify 2FA token and complete login
 * - POST /auth/2fa/disable: Disable 2FA (protected)
 */

import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { verifyRefreshToken, generateTokens } from '../services/token.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /auth/signup
 * Create a new user account
 *
 * Body: { email: string, password: string }
 * Returns: { accessToken, refreshToken, user }
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Please provide both email and password'
      });
      return;
    }

    const result = await authService.signup(email, password);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      error: error.message || 'We couldn\'t create your account. Please try again'
    });
  }
}

/**
 * POST /auth/login
 * Authenticate a user
 *
 * Body: { email: string, password: string }
 * Returns: { accessToken, refreshToken, user } or { requires2FA: true, userId }
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Please provide both email and password'
      });
      return;
    }

    const result = await authService.login(email, password);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({
      error: error.message || 'We couldn\'t log you in. Please check your credentials'
    });
  }
}

/**
 * POST /auth/refresh
 * Get a new access token using refresh token
 *
 * Body: { refreshToken: string }
 * Returns: { accessToken }
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Please provide a refresh token'
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({
        error: 'To keep your account secure, please log in again'
      });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens({ id: user.id, email: user.email });

    res.status(200).json({
      accessToken: tokens.accessToken
    });
  } catch (error: any) {
    res.status(401).json({
      error: 'To keep your account secure, please log in again'
    });
  }
}

/**
 * POST /auth/2fa/enable
 * Enable 2FA for authenticated user
 *
 * Headers: Authorization: Bearer <accessToken>
 * Returns: { secret, qrCode }
 */
export async function enable2FA(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'To keep your account secure, please log in again'
      });
      return;
    }

    const result = await authService.enable2FA(req.user.userId, req.user.email);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      error: error.message || 'We couldn\'t enable 2FA. Please try again'
    });
  }
}

/**
 * POST /auth/2fa/verify
 * Verify TOTP token and complete 2FA login
 *
 * Body: { userId: string, token: string }
 * Returns: { accessToken, refreshToken, user }
 */
export async function verify2FA(req: Request, res: Response): Promise<void> {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      res.status(400).json({
        error: 'Please provide both user ID and verification code'
      });
      return;
    }

    const result = await authService.verify2FAToken(userId, token);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({
      error: error.message || 'The verification code is incorrect. Please try again'
    });
  }
}

/**
 * POST /auth/2fa/disable
 * Disable 2FA for authenticated user
 *
 * Headers: Authorization: Bearer <accessToken>
 * Returns: { message: string }
 */
export async function disable2FA(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'To keep your account secure, please log in again'
      });
      return;
    }

    await authService.disable2FA(req.user.userId);

    res.status(200).json({
      message: '2FA has been disabled for your account'
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message || 'We couldn\'t disable 2FA. Please try again'
    });
  }
}
