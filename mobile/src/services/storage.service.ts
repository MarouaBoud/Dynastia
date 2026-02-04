import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Storage service wrapping expo-secure-store for encrypted token storage.
 * Uses native Keychain (iOS) and Keystore (Android) - NOT AsyncStorage.
 * Fallback to localStorage for Web.
 */

const isWeb = Platform.OS === 'web';

export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const saveUser = async (user: object): Promise<void> => {
  try {
    if (isWeb) {
       localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
       await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getUser = async (): Promise<object | null> => {
  try {
    let userStr;
    if (isWeb) {
      userStr = localStorage.getItem(USER_KEY);
    } else {
      userStr = await SecureStore.getItemAsync(USER_KEY);
    }
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    if (isWeb) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
  } catch (error) {
    console.error('Error clearing tokens:', error);
    throw error;
  }
};
