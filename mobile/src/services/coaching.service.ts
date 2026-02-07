/**
 * Coaching Service
 *
 * API client for coaching endpoints.
 * Coach prompts are contextual - they appear in relevant screens,
 * not in a dedicated chat interface.
 */

import { api } from './api';

// =============================================================================
// Types
// =============================================================================

export interface CoachingMessage {
  hasMessage: boolean;
  message: string | null;
  type: CoachingType | null;
  priority?: number;
  data?: Record<string, any>;
}

export type CoachingType =
  | 'spending_insight'
  | 'milestone_approaching'
  | 'milestone_achieved'
  | 'check_in_reminder'
  | 'streak_celebration'
  | 'streak_at_risk'
  | 'runway_low'
  | 'savings_rate_improvement'
  | 'general_encouragement';

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get contextual coaching prompt.
 * Call this when entering relevant screens (dashboard, post-transaction, Money Date).
 */
export async function getCoachingPrompt(): Promise<CoachingMessage> {
  try {
    const response = await api.post('/coaching/prompt');
    return response.data;
  } catch (error: any) {
    // Handle rate limiting gracefully
    if (error.response?.status === 429) {
      return {
        hasMessage: false,
        message: null,
        type: null
      };
    }
    console.error('Coaching prompt error:', error);
    return {
      hasMessage: false,
      message: null,
      type: null
    };
  }
}

/**
 * Get icon for coaching type.
 */
export function getCoachingIcon(type: CoachingType | null): string {
  const icons: Record<CoachingType, string> = {
    spending_insight: 'trending-up',
    milestone_approaching: 'target',
    milestone_achieved: 'award',
    check_in_reminder: 'calendar',
    streak_celebration: 'zap',
    streak_at_risk: 'alert-circle',
    runway_low: 'shield',
    savings_rate_improvement: 'percent',
    general_encouragement: 'heart'
  };
  return type ? icons[type] : 'message-circle';
}

/**
 * Get color for coaching type (matches theme).
 */
export function getCoachingColor(type: CoachingType | null): string {
  const colors: Record<CoachingType, string> = {
    spending_insight: '#F59E0B',      // Amber - attention
    milestone_approaching: '#10B981', // Green - positive
    milestone_achieved: '#8B5CF6',    // Purple - celebration
    check_in_reminder: '#3B82F6',     // Blue - informational
    streak_celebration: '#10B981',    // Green - positive
    streak_at_risk: '#F59E0B',        // Amber - attention
    runway_low: '#EF4444',            // Red - concern
    savings_rate_improvement: '#3B82F6', // Blue - informational
    general_encouragement: '#10B981'  // Green - positive
  };
  return type ? colors[type] : '#3B82F6';
}

export default {
  getCoachingPrompt,
  getCoachingIcon,
  getCoachingColor
};
