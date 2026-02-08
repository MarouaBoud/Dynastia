/**
 * Prisma Client Mock
 *
 * This module provides a mock implementation of the Prisma client
 * for unit testing without hitting the actual database.
 *
 * Usage in tests:
 * ```
 * import { prismaMock } from '../mocks/prisma';
 *
 * beforeEach(() => {
 *   prismaMock.user.findUnique.mockResolvedValue(mockUser);
 * });
 * ```
 */

import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// Install jest-mock-extended: npm install --save-dev jest-mock-extended

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const prismaMock = mockDeep<PrismaClient>();

// Reset all mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

// Mock the @prisma/client module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  Prisma: {
    Decimal: jest.fn((value: string | number) => ({
      toNumber: () => Number(value),
      toString: () => String(value),
    })),
  },
}));

export default prismaMock;
