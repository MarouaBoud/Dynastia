import axios, { AxiosInstance } from 'axios';
import createAuthRefreshInterceptor from 'axios-auth-refresh';
import * as storage from './storage.service';

// Use environment variable for backend URL, fallback to localhost for development
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Main axios instance with auth interceptors
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add access token to Authorization header
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Separate axios instance for refresh endpoint (no interceptors to avoid circular dependency)
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh token logic
const refreshAuthLogic = async (failedRequest: any) => {
  try {
    const refreshToken = await storage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Call refresh endpoint with refresh token
    const response = await refreshApi.post('/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Save new tokens
    await storage.saveTokens(accessToken, newRefreshToken);

    // Update failed request with new token
    failedRequest.response.config.headers['Authorization'] = `Bearer ${accessToken}`;

    return Promise.resolve();
  } catch (error) {
    // Refresh failed - clear tokens and force re-login
    await storage.clearTokens();
    return Promise.reject(error);
  }
};

// Instantiate the refresh interceptor
createAuthRefreshInterceptor(api, refreshAuthLogic, {
  statusCodes: [401], // Refresh on 401 Unauthorized
  pauseInstanceWhileRefreshing: true, // Queue requests while refreshing
});
