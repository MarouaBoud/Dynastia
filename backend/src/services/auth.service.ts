/**
 * Authentication Service
 *
 * Handles user signup, login, and 2FA operations.
 * Uses industry-standard libraries: bcrypt for password hashing, otplib for TOTP 2FA.
 *
 * Security principles:
 * - Never store plain-text passwords (use bcrypt with 10 rounds)
 * - 2FA is optional but recommended for security
 * - Return minimal user info to clients (no password hash, sensitive data)
 * - Use emotionally safe error messages (no shame language)
 */

import * as bcrypt from 'bcrypt';
import { TOTP, generateSecret } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { generateTokens, TokenPair } from './token.service';
import { toPublicUser, UserPublic } from '../models/user.model';

const prisma = new PrismaClient();

// bcrypt salt rounds - 10 is recommended balance between security and performance
const SALT_ROUNDS = 10;

export interface SignupResult {
  accessToken: string;
  refreshToken: string;
  user: UserPublic;
}

export interface LoginResult {
  accessToken?: string;
  refreshToken?: string;
  user?: UserPublic;
  requires2FA?: boolean;
  userId?: string;
}

export interface Enable2FAResult {
  secret: string;
  qrCode: string;
}

/**
 * Creates a new user account with email and password
 *
 * @param email - User's email address (must be unique)
 * @param password - Plain-text password (will be hashed)
 * @returns Tokens and public user info
 * @throws Error if email already exists or validation fails
 */
export async function signup(email: string, password: string): Promise<SignupResult> {
  // Validate input
  if (!email || !email.includes('@')) {
    throw new Error('Please provide a valid email address');
  }

  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  // Hash password with bcrypt
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user in database
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      totpSecret: null
    }
  });

  // Generate tokens
  const tokens = generateTokens({ id: user.id, email: user.email });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: toPublicUser(user)
  };
}

/**
 * Authenticates a user with email and password
 *
 * @param email - User's email address
 * @param password - Plain-text password
 * @returns Tokens if successful, or requires2FA flag if 2FA enabled
 * @throws Error if credentials are invalid
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    throw new Error('We couldn\'t find an account with that email');
  }

  // Compare password with hash
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('The password you entered doesn\'t match our records');
  }

  // Check if 2FA is enabled
  if (user.totpSecret) {
    return {
      requires2FA: true,
      userId: user.id
    };
  }

  // Generate tokens
  const tokens = generateTokens({ id: user.id, email: user.email });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: toPublicUser(user)
  };
}

/**
 * Enables TOTP 2FA for a user
 *
 * @param userId - User's ID
 * @param email - User's email (for QR code label)
 * @returns TOTP secret and QR code data URL
 * @throws Error if user not found
 */
export async function enable2FA(userId: string, email: string): Promise<Enable2FAResult> {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Generate TOTP secret
  const secret = generateSecret();

  // Save secret to database
  await prisma.user.update({
    where: { id: userId },
    data: { totpSecret: secret }
  });

  // Generate QR code for authenticator apps (Google Authenticator, Authy, etc.)
  const appName = 'Dynastia';
  const otpauthUrl = `otpauth://totp/${appName}:${email}?secret=${secret}&issuer=${appName}`;
  const qrCode = await QRCode.toDataURL(otpauthUrl);

  return {
    secret,
    qrCode
  };
}

/**
 * Verifies a TOTP token and completes 2FA login
 *
 * @param userId - User's ID
 * @param token - 6-digit TOTP token from authenticator app
 * @returns Tokens if verification successful
 * @throws Error if token is invalid or user not found
 */
export async function verify2FAToken(userId: string, token: string): Promise<SignupResult> {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.totpSecret) {
    throw new Error('2FA is not enabled for this account');
  }

  // Verify TOTP token
  const totp = new TOTP({ secret: user.totpSecret });
  const isValid = totp.verify(token.replace(/\s/g, '')); // Remove spaces

  if (!isValid) {
    throw new Error('The verification code you entered is incorrect. Please try again');
  }

  // Generate tokens
  const tokens = generateTokens({ id: user.id, email: user.email });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: toPublicUser(user)
  };
}

/**
 * Disables 2FA for a user
 *
 * @param userId - User's ID
 * @throws Error if user not found
 */
export async function disable2FA(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { totpSecret: null }
  });
}
