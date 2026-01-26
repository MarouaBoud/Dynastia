import { api } from './api';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Unauthenticated axios instance for login/signup endpoints
const unauthenticatedApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    has2FAEnabled?: boolean;
  };
  requires2FA?: boolean;
  tempUserId?: string;
}

interface Enable2FAResponse {
  secret: string;
  otpauthUrl: string;
}

interface Verify2FAResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    has2FAEnabled?: boolean;
  };
}

/**
 * Sign up a new user
 */
export const signup = async (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string
): Promise<SignupResponse> => {
  const response = await unauthenticatedApi.post('/auth/signup', {
    email,
    password,
    firstName,
    lastName,
  });
  return response.data;
};

/**
 * Log in existing user
 * Returns tokens + user if no 2FA, or requires2FA flag if 2FA is enabled
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await unauthenticatedApi.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Enable 2FA for authenticated user
 * Returns secret and otpauthUrl for QR code generation
 */
export const enable2FA = async (): Promise<Enable2FAResponse> => {
  const response = await api.post('/auth/2fa/enable');
  return response.data;
};

/**
 * Verify 2FA setup with TOTP token
 * Called during 2FA setup flow to confirm user has scanned QR code
 */
export const verify2FASetup = async (token: string): Promise<{ success: boolean }> => {
  const response = await api.post('/auth/2fa/verify-setup', {
    token,
  });
  return response.data;
};

/**
 * Verify 2FA during login
 * Called when user with 2FA enabled tries to log in
 */
export const verify2FA = async (userId: string, token: string): Promise<Verify2FAResponse> => {
  const response = await unauthenticatedApi.post('/auth/2fa/verify', {
    userId,
    token,
  });
  return response.data;
};

/**
 * Disable 2FA for authenticated user
 */
export const disable2FA = async (): Promise<{ success: boolean }> => {
  const response = await api.post('/auth/2fa/disable');
  return response.data;
};
