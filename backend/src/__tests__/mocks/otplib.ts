/**
 * Mock for otplib to avoid ESM issues in Jest
 */

export const TOTP = {
  generate: jest.fn().mockReturnValue('123456'),
  verify: jest.fn().mockImplementation(({ token }) => token === '123456'),
  options: {},
};

export const generateSecret = jest.fn().mockReturnValue('TESTSECRET123456');
