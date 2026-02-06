/**
 * Habit Service
 *
 * API client for habit check-ins, streaks, and notification preferences.
 */

import { api } from './api';

// =============================================================================
// Types
// =============================================================================

export interface HabitCheckIn {
  id: string;
  userId: string;
  date: string;
  type: string;
  completed: boolean;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  streakActive: boolean;
  daysSinceLastCheckIn: number;
  message: string;
}

export interface CheckInResponse {
  checkIn: HabitCheckIn;
  message: string;
  newMilestones: MilestoneNotification[];
}

export interface MilestoneNotification {
  type: string;
  name: string;
  description: string;
  celebration: string;
  tier: number;
  icon: string;
}

export interface GridDataPoint {
  date: string; // YYYY-MM-DD
  count: number; // 0 or 1
}

export interface CheckInsResponse {
  checkIns: HabitCheckIn[];
  gridData: GridDataPoint[];
  totalCheckIns: number;
}

export interface NotificationPreferences {
  moneyDateReminder: boolean;
  streakProtection: boolean;
  billReminders: boolean;
  milestoneAlerts: boolean;
  reminderDay: number;
  reminderHour: number;
  marketingUpdates: boolean;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Create a habit check-in (Money Date)
 */
export async function createCheckIn(
  type: string = 'money_date',
  notes?: string,
  metadata?: Record<string, unknown>
): Promise<CheckInResponse> {
  const response = await api.post('/habits/check-in', { type, notes, metadata });
  return response.data;
}

/**
 * Get check-in history for contribution grid
 */
export async function getCheckIns(
  type: string = 'money_date',
  days: number = 90
): Promise<CheckInsResponse> {
  const response = await api.get('/habits/check-ins', { params: { type, days } });
  return response.data;
}

/**
 * Get current streak data
 */
export async function getStreak(type: string = 'money_date'): Promise<StreakData> {
  const response = await api.get('/habits/streak', { params: { type } });
  return response.data;
}

/**
 * Get notification preferences from server
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const response = await api.get('/habits/notifications');
  return response.data;
}

/**
 * Update notification preferences on server
 */
export async function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>
): Promise<{ preferences: NotificationPreferences; message: string }> {
  const response = await api.put('/habits/notifications', prefs);
  return response.data;
}

/**
 * Check if user has completed Money Date this week
 */
export async function hasCompletedThisWeek(): Promise<boolean> {
  try {
    const { checkIns } = await getCheckIns('money_date', 7);
    return checkIns.some(c => c.completed);
  } catch (error) {
    console.error('Failed to check weekly completion:', error);
    return false;
  }
}

export default {
  createCheckIn,
  getCheckIns,
  getStreak,
  getNotificationPreferences,
  updateNotificationPreferences,
  hasCompletedThisWeek,
};
