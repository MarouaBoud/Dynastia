/**
 * Emotional Safety Language System
 *
 * Dynastia targets women with financial anxiety. Shame-based language increases
 * anxiety and causes app abandonment. Power phrases build confidence and trust.
 *
 * This module defines:
 * - BANNED_PHRASES: Words/phrases that imply failure or judgment
 * - POWER_PHRASES: Approved collaborative, action-oriented replacements
 * - SAFE_LANGUAGE_RULES: Guidelines for tone, focus, and emotion normalization
 */

/**
 * BANNED_PHRASES
 *
 * Never use these phrases in user-facing text. They create shame, imply failure,
 * or blame the user. Each phrase has been validated against psychological research
 * on financial anxiety and shame responses.
 *
 * Rationale:
 * - "invalid", "error", "failed": Technical language that feels judgmental
 * - "wrong", "incorrect": Implies user made a mistake
 * - "you're behind", "you should have": Creates comparison anxiety
 * - "it's easy", "just": Dismisses user's struggle, increases shame
 * - "try again" (alone): Feels dismissive; use "let's try again" instead
 */
export const BANNED_PHRASES: string[] = [
  // Technical judgment words
  'invalid',
  'error',
  'failed',
  'failure',
  'wrong',
  'incorrect',
  'bad',

  // Comparison and judgment
  "you're behind",
  "you're late",
  "you should have",
  "you must",
  "you need to",
  "why didn't you",

  // Minimizing phrases
  "it's easy",
  "it's simple",
  "just",
  "simply",
  "obviously",
  "clearly",

  // Solo "try again" without collaboration
  "try again",

  // Blame language
  "you failed",
  "you forgot",
  "you missed",
  "your fault",
];

/**
 * POWER_PHRASES
 *
 * Approved phrases that are collaborative, action-oriented, and emotionally safe.
 * These phrases:
 * - Use "we" and "let's" to create partnership
 * - Focus on next action, not past mistakes
 * - Normalize struggle and celebrate small wins
 * - Build confidence without creating pressure
 */
export const POWER_PHRASES: string[] = [
  // Collaborative action
  "your next move",
  "let's try again",
  "let's adjust",
  "ready to continue?",

  // Data-focused (not blame)
  "the data shows",
  "we couldn't find",
  "we're having trouble",
  "that didn't work",

  // Confidence building
  "you've got this",
  "you're making progress",
  "let's make this stronger",

  // Normalization
  "this is common",
  "many people start here",
  "this takes time",

  // Celebration
  "well done",
  "you did it",
  "that's progress",
];

/**
 * SAFE_LANGUAGE_RULES
 *
 * Guidelines for writing emotionally safe copy across the product.
 * These rules enforce the emotional safety principles embedded in Dynastia's design.
 */
export const SAFE_LANGUAGE_RULES = {
  /**
   * Error message guidelines
   */
  errors: {
    // Use "Let's" not "You must"
    tone: 'collaborative' as const,

    // Focus on what to do next, not what went wrong
    focus: 'next_action' as const,

    // Never blame the user
    blame: 'none' as const,

    examples: {
      bad: 'Invalid credentials. Try again.',
      good: "We couldn't find that email and password combination. Let's try again.",
    },
  },

  /**
   * Progress display guidelines
   */
  progress: {
    // Frame progress as stress reduction and safety increase, not just money
    framing: ['stress_reduction', 'safety_increase'] as const,

    // Never compare user to others ("You're ahead of 80% of users")
    comparison: 'self_only' as const,

    examples: {
      bad: 'You saved €500. You\'re behind schedule.',
      good: 'Your financial stress decreased by 15%. Your safety score: 78%.',
    },
  },

  /**
   * Emotion normalization guidelines
   */
  emotions: {
    // These emotions are normal and expected - never make user feel bad for experiencing them
    normalize: ['fear', 'shame', 'overwhelm', 'confusion', 'anxiety'] as const,

    // Celebrate these behaviors, even if small
    celebrate: ['small_wins', 'consistency', 'trying', 'showing_up'] as const,

    examples: {
      bad: "Don't worry, it's easy!",
      good: 'This feeling is normal. Your next move: review your expenses.',
    },
  },

  /**
   * Unavailable feature guidelines
   */
  unavailable: {
    // When a feature isn't available, reassure user their core needs are still met
    approach: 'reassure_core_security' as const,

    examples: {
      bad: 'Biometric authentication is not available on this device.',
      good: "Biometric authentication isn't available on this device, but your account is still secure with your password.",
    },
  },
} as const;

/**
 * Type definitions for type safety
 */
export type ErrorTone = typeof SAFE_LANGUAGE_RULES.errors.tone;
export type ErrorFocus = typeof SAFE_LANGUAGE_RULES.errors.focus;
export type ProgressFraming = typeof SAFE_LANGUAGE_RULES.progress.framing[number];
export type NormalizedEmotion = typeof SAFE_LANGUAGE_RULES.emotions.normalize[number];
export type CelebratedBehavior = typeof SAFE_LANGUAGE_RULES.emotions.celebrate[number];
