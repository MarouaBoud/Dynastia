/**
 * Test Helper Utilities
 *
 * Common utilities for creating test data and mocking
 */

import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Generate a test JWT token
 */
export function generateTestToken(userId: string, expiresIn: string = '15m'): string {
  const options: SignOptions = { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] };
  return jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET || 'test-secret',
    options
  );
}

/**
 * Generate a test refresh token
 */
export function generateTestRefreshToken(userId: string, expiresIn: string = '7d'): string {
  const options: SignOptions = { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] };
  return jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret',
    options
  );
}

/**
 * Create a mock user object
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    password: '$2b$10$hashedpasswordhere',
    name: 'Test User',
    twoFactorEnabled: false,
    twoFactorSecret: null,
    biometricEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock transaction object
 */
export function createMockTransaction(overrides: Partial<MockTransaction> = {}): MockTransaction {
  return {
    id: 'test-transaction-id',
    userId: 'test-user-id',
    amount: 5000, // cents
    currency: 'USD',
    type: 'expense',
    category: 'food',
    merchant: 'Test Merchant',
    description: 'Test transaction',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock asset object
 */
export function createMockAsset(overrides: Partial<MockAsset> = {}): MockAsset {
  return {
    id: 'test-asset-id',
    userId: 'test-user-id',
    name: 'Savings Account',
    type: 'savings',
    value: 1000000, // cents
    currency: 'USD',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock liability object
 */
export function createMockLiability(overrides: Partial<MockLiability> = {}): MockLiability {
  return {
    id: 'test-liability-id',
    userId: 'test-user-id',
    name: 'Credit Card',
    type: 'credit_card',
    balance: 50000, // cents
    currency: 'USD',
    interestRate: 18.99,
    minimumPayment: 2500,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock milestone object
 */
export function createMockMilestone(overrides: Partial<MockMilestone> = {}): MockMilestone {
  return {
    id: 'test-milestone-id',
    userId: 'test-user-id',
    milestoneId: 'MILE-01',
    name: 'I can breathe',
    tier: 1,
    completed: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Type definitions for mock objects
export interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string | null;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  biometricEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: string;
  category: string;
  merchant: string | null;
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockAsset {
  id: string;
  userId: string;
  name: string;
  type: string;
  value: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockLiability {
  id: string;
  userId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  interestRate: number | null;
  minimumPayment: number | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockMilestone {
  id: string;
  userId: string;
  milestoneId: string;
  name: string;
  tier: number;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
