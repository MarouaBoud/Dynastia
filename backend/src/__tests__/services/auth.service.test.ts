/**
 * Auth Service Unit Tests
 *
 * Tests for user signup, login, and 2FA operations
 */

import { prismaMock } from '../mocks/prisma';
import { createMockUser, generateTestToken } from '../utils/testHelpers';
import * as bcrypt from 'bcrypt';

// Import the functions to test (after prisma mock is set up)
import { signup, login } from '../../services/auth.service';

describe('Auth Service', () => {
  describe('signup', () => {
    it('should create a new user with valid email and password', async () => {
      const mockUser = createMockUser({
        id: 'new-user-id',
        email: 'newuser@example.com',
      });

      // Mock: no existing user found
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Mock: user creation
      prismaMock.user.create.mockResolvedValue({
        ...mockUser,
        passwordHash: 'hashed-password',
        totpSecret: null,
        totpEnabled: false,
        biometricEnabled: false,
        onboardingComplete: false,
        primaryCountry: null,
        secondaryCountry: null,
        incomeType: null,
        lifeStage: null,
      } as any);

      const result = await signup('newuser@example.com', 'SecurePass123!');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('newuser@example.com');
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error for invalid email', async () => {
      await expect(signup('invalid-email', 'password123')).rejects.toThrow(
        'Please provide a valid email address'
      );
    });

    it('should throw error for short password', async () => {
      await expect(signup('test@example.com', 'short')).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('should throw error for existing email', async () => {
      const existingUser = createMockUser({ email: 'existing@example.com' });

      prismaMock.user.findUnique.mockResolvedValue({
        ...existingUser,
        passwordHash: 'hashed',
        totpSecret: null,
        totpEnabled: false,
        biometricEnabled: false,
        onboardingComplete: false,
        primaryCountry: null,
        secondaryCountry: null,
        incomeType: null,
        lifeStage: null,
      } as any);

      await expect(signup('existing@example.com', 'password123')).rejects.toThrow(
        'An account with this email already exists'
      );
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('ValidPassword123!', 10);
      const mockUser = createMockUser({
        id: 'user-123',
        email: 'user@example.com',
      });

      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
        totpSecret: null,
        totpEnabled: false,
        biometricEnabled: false,
        onboardingComplete: true,
        primaryCountry: 'US',
        secondaryCountry: null,
        incomeType: 'salary',
        lifeStage: 'early_career',
      } as any);

      const result = await login('user@example.com', 'ValidPassword123!');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.requires2FA).toBeFalsy();
    });

    it('should throw error for non-existent user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(login('nonexistent@example.com', 'password123')).rejects.toThrow();
    });

    it('should throw error for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
      const mockUser = createMockUser();

      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
        totpSecret: null,
        totpEnabled: false,
        biometricEnabled: false,
        onboardingComplete: false,
        primaryCountry: null,
        secondaryCountry: null,
        incomeType: null,
        lifeStage: null,
      } as any);

      await expect(login('test@example.com', 'WrongPassword123!')).rejects.toThrow();
    });

    it('should return requires2FA when 2FA is enabled', async () => {
      const hashedPassword = await bcrypt.hash('ValidPassword123!', 10);
      const mockUser = createMockUser({
        twoFactorEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      });

      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
        totpSecret: 'JBSWY3DPEHPK3PXP',
        totpEnabled: true,
        biometricEnabled: false,
        onboardingComplete: false,
        primaryCountry: null,
        secondaryCountry: null,
        incomeType: null,
        lifeStage: null,
      } as any);

      const result = await login('test@example.com', 'ValidPassword123!');

      expect(result.requires2FA).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.accessToken).toBeUndefined();
    });
  });
});
