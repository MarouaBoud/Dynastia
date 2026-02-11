/**
 * Opik Tracing for Dynastia Coaching
 *
 * Wraps coaching interactions with full observability:
 * - Request context (user tier, milestone, country)
 * - LLM call details (prompt, response, latency, tokens)
 * - Evaluation scores (emotional safety, action clarity, etc.)
 *
 * This creates a complete picture of every AI coaching interaction
 * for hackathon judges to see.
 */

import { getOpikClient, UserContext } from './opik-client';
import { runAllEvaluations, EvaluationResult } from './evaluators';
import { LLMResponse } from '../llm/groq-client';

/**
 * Coaching trace result with all observability data
 */
export interface TracedCoachingResult {
  message: string;
  traceId: string | null;
  evaluations: EvaluationResult;
  metadata: {
    tokensUsed: number;
    latencyMs: number;
    model: string;
  };
}

/**
 * Trace a complete coaching interaction
 *
 * This is the main entry point for traced coaching.
 * It creates a trace, logs the LLM call, runs evaluations,
 * and records everything to Opik.
 */
export async function traceCoachingInteraction(
  userContext: UserContext,
  decisionType: string,
  systemPrompt: string,
  userPrompt: string,
  llmResponse: LLMResponse
): Promise<TracedCoachingResult> {
  const opik = getOpikClient();

  // Run evaluations on the response
  const evaluations = runAllEvaluations(llmResponse.content, {
    tier: userContext.tier
  });

  // If Opik is not configured, still return result without tracing
  if (!opik) {
    console.log('[Opik] Not configured - skipping trace');
    return {
      message: llmResponse.content,
      traceId: null,
      evaluations,
      metadata: {
        tokensUsed: llmResponse.tokensUsed,
        latencyMs: llmResponse.latencyMs,
        model: llmResponse.model
      }
    };
  }

  try {
    // Create trace with full context
    const trace = opik.trace({
      name: `coaching_${decisionType}`,
      input: {
        systemPrompt,
        userPrompt
      },
      output: {
        message: llmResponse.content
      },
      metadata: {
        userId: userContext.userId,
        tier: userContext.tier,
        currentMilestone: userContext.currentMilestone,
        nextMilestone: userContext.nextMilestone,
        country: userContext.country,
        conversationType: userContext.conversationType,
        decisionType,
        model: llmResponse.model,
        tokensUsed: llmResponse.tokensUsed,
        latencyMs: llmResponse.latencyMs
      }
    });

    const traceId = trace.data.id;

    // Log evaluation scores using trace.score() method
    trace.score({
      name: 'emotional_safety',
      value: evaluations.emotional_safety,
      categoryName: 'coaching_quality'
    });
    trace.score({
      name: 'one_action_clarity',
      value: evaluations.one_action_clarity,
      categoryName: 'coaching_quality'
    });
    trace.score({
      name: 'tier_alignment',
      value: evaluations.tier_alignment,
      categoryName: 'coaching_quality'
    });
    trace.score({
      name: 'identity_building',
      value: evaluations.identity_building,
      categoryName: 'coaching_quality'
    });
    trace.score({
      name: 'overwhelm_prevention',
      value: evaluations.overwhelm_prevention,
      categoryName: 'coaching_quality'
    });
    trace.score({
      name: 'composite_score',
      value: evaluations.composite_score,
      categoryName: 'coaching_quality'
    });

    // End the trace
    trace.end();

    console.log(`[Opik] Traced coaching interaction: ${traceId}`);
    console.log(`[Opik] Scores - Emotional Safety: ${evaluations.emotional_safety}, One-Action: ${evaluations.one_action_clarity}, Composite: ${evaluations.composite_score}`);

    return {
      message: llmResponse.content,
      traceId,
      evaluations,
      metadata: {
        tokensUsed: llmResponse.tokensUsed,
        latencyMs: llmResponse.latencyMs,
        model: llmResponse.model
      }
    };
  } catch (error) {
    console.error('[Opik] Tracing error:', error);
    // Don't fail the request if tracing fails
    return {
      message: llmResponse.content,
      traceId: null,
      evaluations,
      metadata: {
        tokensUsed: llmResponse.tokensUsed,
        latencyMs: llmResponse.latencyMs,
        model: llmResponse.model
      }
    };
  }
}

/**
 * Get user context for tracing from database/session
 * This should be called at the start of a coaching request
 */
export function buildUserContext(
  userId: string,
  tier: 'foundation' | 'stability' | 'growth' | 'sovereignty',
  currentMilestone: string,
  nextMilestone: string,
  country: string,
  conversationType: 'money_date' | 'coaching_chat' | 'milestone_guidance'
): UserContext {
  return {
    userId,
    tier,
    currentMilestone,
    nextMilestone,
    country,
    conversationType
  };
}

/**
 * Determine user's sovereignty tier based on milestone progress
 */
export function determineTier(
  completedMilestones: string[]
): 'foundation' | 'stability' | 'growth' | 'sovereignty' {
  const TIER_MILESTONES = {
    foundation: ['first_1000_saved', 'first_money_date', 'autopilot_begins', 'debt_free_start'],
    stability: ['emergency_3mo', 'bills_automated', 'sinking_funds', 'savings_rate_20'],
    growth: ['first_investment', 'net_worth_10k', 'multiple_income', 'investment_habit'],
    sovereignty: ['net_worth_50k', 'year_runway', 'wealth_team', 'passive_income']
  };

  const foundationComplete = TIER_MILESTONES.foundation.every(m => completedMilestones.includes(m));
  const stabilityComplete = TIER_MILESTONES.stability.every(m => completedMilestones.includes(m));
  const growthComplete = TIER_MILESTONES.growth.every(m => completedMilestones.includes(m));

  if (growthComplete) return 'sovereignty';
  if (stabilityComplete) return 'growth';
  if (foundationComplete) return 'stability';
  return 'foundation';
}

/**
 * Get the current and next milestone for a user
 */
export function getMilestoneContext(
  completedMilestones: string[]
): { current: string; next: string } {
  const ALL_MILESTONES = [
    'first_1000_saved', 'first_money_date', 'autopilot_begins', 'debt_free_start',
    'emergency_3mo', 'bills_automated', 'sinking_funds', 'savings_rate_20',
    'first_investment', 'net_worth_10k', 'multiple_income', 'investment_habit',
    'net_worth_50k', 'year_runway', 'wealth_team', 'passive_income'
  ];

  const lastCompleted = ALL_MILESTONES.filter(m => completedMilestones.includes(m)).pop() || 'none';
  const nextMilestone = ALL_MILESTONES.find(m => !completedMilestones.includes(m)) || 'all_complete';

  return {
    current: lastCompleted,
    next: nextMilestone
  };
}
