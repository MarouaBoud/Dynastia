/**
 * Opik Client Configuration
 *
 * Initializes Opik SDK for tracing and evaluation of AI coaching.
 * Provides observability into LLM calls, response quality, and user outcomes.
 */

import { Opik } from 'opik';

// Singleton instance
let opikClient: Opik | null = null;

/**
 * Get or create Opik client instance
 */
export function getOpikClient(): Opik | null {
  if (!opikClient && process.env.OPIK_API_KEY) {
    opikClient = new Opik({
      apiKey: process.env.OPIK_API_KEY,
      projectName: process.env.OPIK_PROJECT || 'dynastia-coaching',
    });
    console.log('Opik client initialized for project:', process.env.OPIK_PROJECT || 'dynastia-coaching');
  }
  return opikClient;
}

/**
 * Flush pending traces (call before process exit or after batch operations)
 */
export async function flushOpik(): Promise<void> {
  if (opikClient) {
    await opikClient.flush();
  }
}

/**
 * User context for tracing
 */
export interface UserContext {
  userId: string;
  tier: 'foundation' | 'stability' | 'growth' | 'sovereignty';
  currentMilestone: string;
  nextMilestone: string;
  country: string;
  conversationType: 'money_date' | 'coaching_chat' | 'milestone_guidance';
}

/**
 * Coaching trace metadata
 */
export interface CoachingTraceMetadata {
  userContext: UserContext;
  decisionType: string;
  prompt: {
    system: string;
    user: string;
  };
  response: {
    content: string;
    tokensUsed: number;
    latencyMs: number;
    model: string;
  };
  evaluations: {
    emotional_safety: number;
    one_action_clarity: number;
    tier_alignment: number;
    composite_score: number;
  };
}

export { Opik };
