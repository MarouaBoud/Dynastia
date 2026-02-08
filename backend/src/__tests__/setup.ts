/**
 * Jest test setup file
 *
 * This file runs before each test file and sets up:
 * - Environment variables for testing
 * - Global mocks
 * - Test utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-access-token-secret-minimum-64-characters-for-testing-purposes-only';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-minimum-64-characters-for-testing-purposes-only';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.REFRESH_TOKEN_EXPIRY = '7d';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Global beforeAll/afterAll hooks can be added here
beforeAll(() => {
  // Setup before all tests
});

afterAll(() => {
  // Cleanup after all tests
});
