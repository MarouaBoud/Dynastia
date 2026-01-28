/**
 * Users Service
 *
 * Handles user profile API calls.
 * Provides methods to get and update user profile data.
 */

import { api } from './api';

// User interface matching backend response
export interface User {
  id: string;
  email: string;
  country: string | null;
  currency: string | null;
  createdAt: string;
  updatedAt: string;
}

// Update profile request payload
export interface UpdateProfileRequest {
  country?: string;
  currency?: string;
}

/**
 * Get current user profile
 *
 * @returns User profile data
 * @throws Error if request fails
 */
export async function getProfile(): Promise<User> {
  try {
    const response = await api.get<User>('/users/me');
    return response.data;
  } catch (error: any) {
    console.error('Get profile error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
}

/**
 * Update user profile (country, currency)
 *
 * @param data - Profile fields to update
 * @returns Updated user profile
 * @throws Error if request fails
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  try {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  } catch (error: any) {
    console.error('Update profile error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
}
