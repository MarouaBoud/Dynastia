/**
 * Habit Context
 *
 * Manages habit state including check-ins, streaks, and milestones.
 * Provides data to all habit-related screens.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import * as habitService from '../services/habit.service';
import * as notificationService from '../services/notification.service';
import { useAuth } from './AuthContext';

// =============================================================================
// Types
// =============================================================================

interface HabitState {
  // Streak data
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: Date | null;
  streakActive: boolean;
  streakMessage: string;

  // Check-in data
  checkIns: habitService.HabitCheckIn[];
  gridData: habitService.GridDataPoint[];
  totalCheckIns: number;
  completedThisWeek: boolean;

  // Loading states
  isLoading: boolean;
  isCheckingIn: boolean;

  // New milestones to celebrate
  pendingMilestones: habitService.MilestoneNotification[];
}

interface HabitContextType extends HabitState {
  // Actions
  checkIn: (notes?: string, metadata?: Record<string, unknown>) => Promise<void>;
  refreshStreak: () => Promise<void>;
  refreshCheckIns: (days?: number) => Promise<void>;
  dismissMilestone: (type: string) => void;
  clearPendingMilestones: () => void;
}

const initialState: HabitState = {
  currentStreak: 0,
  longestStreak: 0,
  lastCheckIn: null,
  streakActive: false,
  streakMessage: '',
  checkIns: [],
  gridData: [],
  totalCheckIns: 0,
  completedThisWeek: false,
  isLoading: true,
  isCheckingIn: false,
  pendingMilestones: [],
};

// =============================================================================
// Context
// =============================================================================

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
  const { state: authState } = useAuth();
  const [state, setState] = useState<HabitState>(initialState);

  // Load streak data
  const refreshStreak = useCallback(async () => {
    if (!authState.userToken) return;

    try {
      const streakData = await habitService.getStreak();
      setState(prev => ({
        ...prev,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        lastCheckIn: streakData.lastCheckIn ? new Date(streakData.lastCheckIn) : null,
        streakActive: streakData.streakActive,
        streakMessage: streakData.message,
      }));
    } catch (error) {
      console.error('Failed to load streak:', error);
    }
  }, [authState.userToken]);

  // Load check-in history
  const refreshCheckIns = useCallback(async (days: number = 90) => {
    if (!authState.userToken) return;

    try {
      const data = await habitService.getCheckIns('money_date', days);
      const completedThisWeek = await habitService.hasCompletedThisWeek();

      setState(prev => ({
        ...prev,
        checkIns: data.checkIns,
        gridData: data.gridData,
        totalCheckIns: data.totalCheckIns,
        completedThisWeek,
      }));
    } catch (error) {
      console.error('Failed to load check-ins:', error);
    }
  }, [authState.userToken]);

  // Initial load
  useEffect(() => {
    if (authState.userToken) {
      setState(prev => ({ ...prev, isLoading: true }));
      Promise.all([refreshStreak(), refreshCheckIns()])
        .finally(() => {
          setState(prev => ({ ...prev, isLoading: false }));
        });
    }
  }, [authState.userToken, refreshStreak, refreshCheckIns]);

  // Configure notifications on mount
  useEffect(() => {
    notificationService.configureNotifications();
  }, []);

  // Check-in action
  const checkIn = useCallback(async (notes?: string, metadata?: Record<string, unknown>) => {
    if (!authState.userToken) return;

    setState(prev => ({ ...prev, isCheckingIn: true }));

    try {
      const response = await habitService.createCheckIn('money_date', notes, metadata);

      // Add any new milestones to pending list
      if (response.newMilestones && response.newMilestones.length > 0) {
        setState(prev => ({
          ...prev,
          pendingMilestones: [...prev.pendingMilestones, ...response.newMilestones],
        }));

        // Show notification for tier unlocks
        for (const milestone of response.newMilestones) {
          await notificationService.showMilestoneCelebration(
            milestone.name,
            milestone.celebration
          );
        }
      }

      // Refresh data
      await Promise.all([refreshStreak(), refreshCheckIns()]);

      // Schedule streak protection notification
      if (response.checkIn.date) {
        await notificationService.scheduleStreakProtectionAlert(
          new Date(response.checkIn.date)
        );
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isCheckingIn: false }));
    }
  }, [authState.userToken, refreshStreak, refreshCheckIns]);

  // Dismiss a pending milestone (after showing celebration modal)
  const dismissMilestone = useCallback((type: string) => {
    setState(prev => ({
      ...prev,
      pendingMilestones: prev.pendingMilestones.filter(m => m.type !== type),
    }));
  }, []);

  // Clear all pending milestones
  const clearPendingMilestones = useCallback(() => {
    setState(prev => ({ ...prev, pendingMilestones: [] }));
  }, []);

  const value: HabitContextType = {
    ...state,
    checkIn,
    refreshStreak,
    refreshCheckIns,
    dismissMilestone,
    clearPendingMilestones,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits(): HabitContextType {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}

export default { HabitProvider, useHabits };
