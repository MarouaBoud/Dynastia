/**
 * CoachingContext
 *
 * App-wide coaching state management.
 * Provides coaching messages across screens with caching and dismissal.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode
} from 'react';
import { getCoachingPrompt, CoachingMessage } from '../services/coaching.service';
import { useAuth } from './AuthContext';

// =============================================================================
// Types
// =============================================================================

interface CoachingContextValue {
  coaching: CoachingMessage | null;
  loading: boolean;
  error: string | null;
  refreshCoaching: (force?: boolean) => Promise<void>;
  dismissCoaching: () => void;
  lastFetchedAt: Date | null;
}

// =============================================================================
// Context
// =============================================================================

const CoachingContext = createContext<CoachingContextValue | undefined>(undefined);

// =============================================================================
// Provider
// =============================================================================

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function CoachingProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const isAuthenticated = state.userToken !== null;

  const [coaching, setCoaching] = useState<CoachingMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  /**
   * Refresh coaching prompt from API.
   * @param force - Skip cache and force refresh
   */
  const refreshCoaching = useCallback(async (force = false) => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      return;
    }

    // Skip if recently fetched and not forced
    const now = new Date();
    if (!force && lastFetchedAt) {
      const timeSinceLastFetch = now.getTime() - lastFetchedAt.getTime();
      if (timeSinceLastFetch < CACHE_DURATION_MS) {
        return; // Use cached data
      }
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getCoachingPrompt();
      setCoaching(result);
      setLastFetchedAt(now);
      setIsDismissed(false); // Reset dismiss state on refresh
    } catch (err: any) {
      console.error('Failed to refresh coaching:', err);
      setError(err.message || 'Failed to load coaching');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, lastFetchedAt]);

  /**
   * Dismiss current coaching message.
   * Prevents it from showing until next refresh.
   */
  const dismissCoaching = useCallback(() => {
    setIsDismissed(true);
  }, []);

  /**
   * Fetch coaching on mount and when authentication changes.
   */
  useEffect(() => {
    if (isAuthenticated) {
      refreshCoaching();
    }
  }, [isAuthenticated]); // Don't include refreshCoaching to avoid infinite loop

  // Hide coaching if dismissed
  const visibleCoaching = isDismissed ? null : coaching;

  return (
    <CoachingContext.Provider
      value={{
        coaching: visibleCoaching,
        loading,
        error,
        refreshCoaching,
        dismissCoaching,
        lastFetchedAt
      }}
    >
      {children}
    </CoachingContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useCoaching(): CoachingContextValue {
  const context = useContext(CoachingContext);
  if (context === undefined) {
    throw new Error('useCoaching must be used within a CoachingProvider');
  }
  return context;
}
