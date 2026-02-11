/**
 * Opik Evaluators for Dynastia AI Coaching
 *
 * These evaluators score AI coaching responses against Dynastia's core principles:
 * - Emotional safety (no shame, power phrases)
 * - One-action clarity (exactly one clear next step)
 * - Tier alignment (advice matches user's sovereignty stage)
 * - Identity building (wealth mindset language)
 * - Country compliance (region-appropriate guidance)
 * - Overwhelm prevention (concise, focused responses)
 */

import { getGroqClient } from '../llm/groq-client';

/**
 * Banned phrases that score automatic 0 for emotional safety
 */
const BANNED_PHRASES = [
  'you failed',
  'you should have',
  "you're behind",
  'you are behind',
  "it's easy",
  'its easy',
  'just do',
  'simply do',
  'simply click',
  'you must',
  'you need to',
  'you have to',
  'why haven\'t you',
  'why didn\'t you',
  'you\'re not',
  'you are not',
  'wrong',
  'mistake',
  'bad decision'
];

/**
 * Power phrases that boost emotional safety score
 */
const POWER_PHRASES = [
  'your next move',
  "you've got this",
  'you have got this',
  "let's adjust",
  'lets adjust',
  'the data shows',
  "you're becoming",
  'you are becoming',
  "you're on track",
  'you are on track',
  'here\'s what\'s working',
  'small steps',
  'progress',
  'you can'
];

/**
 * Tier-specific topics for alignment checking
 */
const TIER_TOPICS: Record<string, string[]> = {
  foundation: [
    'tracking', 'track spending', 'save €1000', 'save $1000', 'first 1000',
    'money date', 'check-in', 'debt', 'credit card', 'emergency start'
  ],
  stability: [
    'emergency fund', '3 months', 'three months', 'autopay', 'automatic',
    'sinking fund', 'bills', 'pay yourself first', 'savings rate'
  ],
  growth: [
    'invest', 'etf', 'index fund', '€10k', '$10k', '10,000', 'ten thousand',
    'auto-invest', 'brokerage', 'roth ira', '401k', 'pea', 'portfolio'
  ],
  sovereignty: [
    '€50k', '$50k', '50,000', 'fifty thousand', 'runway', 'financial independence',
    'fi', 'could quit', 'walk away', 'sovereign', 'year of expenses'
  ]
};

/**
 * Country-specific terms
 */
const COUNTRY_TERMS: Record<string, string[]> = {
  US: ['401k', '401(k)', 'roth ira', 'hsa', 'hysa', 'fidelity', 'vanguard', 'schwab'],
  EU: ['livret a', 'pea', 'ucits', 'etf', 'degiro', 'trade republic'],
  FR: ['livret a', 'pea', 'assurance vie', 'per'],
  DE: ['depot', 'etf', 'trade republic', 'scalable'],
  UK: ['isa', 'sipp', 'vanguard uk', 'hargreaves']
};

export interface EvaluationResult {
  emotional_safety: number;
  one_action_clarity: number;
  tier_alignment: number;
  identity_building: number;
  overwhelm_prevention: number;
  composite_score: number;
  details: {
    bannedPhrasesFound: string[];
    powerPhrasesFound: string[];
    actionCount: number;
    wordCount: number;
  };
}

/**
 * Evaluate emotional safety of a response
 *
 * @param response - The AI response to evaluate
 * @returns Score from 0.0 to 1.0
 */
export function evaluateEmotionalSafety(response: string): {
  score: number;
  bannedFound: string[];
  powerFound: string[];
} {
  const lowerResponse = response.toLowerCase();

  // Check for banned phrases (automatic 0)
  const bannedFound: string[] = [];
  for (const phrase of BANNED_PHRASES) {
    if (lowerResponse.includes(phrase.toLowerCase())) {
      bannedFound.push(phrase);
    }
  }

  if (bannedFound.length > 0) {
    return { score: 0.0, bannedFound, powerFound: [] };
  }

  // Count power phrases
  const powerFound: string[] = [];
  for (const phrase of POWER_PHRASES) {
    if (lowerResponse.includes(phrase.toLowerCase())) {
      powerFound.push(phrase);
    }
  }

  // Base score 0.7, +0.1 for each power phrase (max 1.0)
  const score = Math.min(1.0, 0.7 + (powerFound.length * 0.1));

  return { score, bannedFound, powerFound };
}

/**
 * Evaluate if response has exactly one clear action
 *
 * @param response - The AI response to evaluate
 * @returns Score from 0.0 to 1.0
 */
export function evaluateOneActionClarity(response: string): {
  score: number;
  actionCount: number;
} {
  // Action indicators
  const actionPhrases = [
    'your next move',
    'next step',
    'action:',
    'to do:',
    'try this:',
    'here\'s what to do',
    'do this:',
    'start by',
    'begin with',
    'first,',
    'open a',
    'set up',
    'create a',
    'schedule',
    'transfer',
    'automate'
  ];

  // Multiple action indicators (red flags)
  const multipleActionPhrases = [
    'and then',
    'after that',
    'also,',
    'additionally',
    'second,',
    'third,',
    'finally,',
    'or you could',
    'another option'
  ];

  const lowerResponse = response.toLowerCase();

  // Count action phrases
  let actionCount = 0;
  for (const phrase of actionPhrases) {
    if (lowerResponse.includes(phrase)) {
      actionCount++;
    }
  }

  // Check for multiple actions
  let multipleActionCount = 0;
  for (const phrase of multipleActionPhrases) {
    if (lowerResponse.includes(phrase)) {
      multipleActionCount++;
    }
  }

  // Scoring logic
  if (multipleActionCount >= 2) {
    return { score: 0.3, actionCount: multipleActionCount + 1 }; // Multiple actions = bad
  }

  if (actionCount === 0) {
    return { score: 0.4, actionCount: 0 }; // No clear action
  }

  if (actionCount === 1 && multipleActionCount === 0) {
    return { score: 1.0, actionCount: 1 }; // Perfect: exactly one action
  }

  // Some action but could be clearer
  return { score: 0.7, actionCount };
}

/**
 * Evaluate if advice matches user's sovereignty tier
 *
 * @param response - The AI response to evaluate
 * @param tier - User's current tier
 * @returns Score from 0.0 to 1.0
 */
export function evaluateTierAlignment(
  response: string,
  tier: string
): number {
  const lowerResponse = response.toLowerCase();
  const normalizedTier = tier.toLowerCase();

  // Get topics for user's tier
  const relevantTopics = TIER_TOPICS[normalizedTier] || [];

  // Get topics for OTHER tiers (wrong advice)
  const wrongTopics: string[] = [];
  for (const [t, topics] of Object.entries(TIER_TOPICS)) {
    if (t !== normalizedTier) {
      // Only add if it's a MORE advanced tier
      const tierOrder = ['foundation', 'stability', 'growth', 'sovereignty'];
      if (tierOrder.indexOf(t) > tierOrder.indexOf(normalizedTier)) {
        wrongTopics.push(...topics);
      }
    }
  }

  // Check for wrong-tier topics (giving advanced advice to beginners)
  let wrongTopicCount = 0;
  for (const topic of wrongTopics) {
    if (lowerResponse.includes(topic)) {
      wrongTopicCount++;
    }
  }

  if (wrongTopicCount >= 2) {
    return 0.3; // Significant mismatch
  }

  // Check for relevant topics
  let relevantCount = 0;
  for (const topic of relevantTopics) {
    if (lowerResponse.includes(topic)) {
      relevantCount++;
    }
  }

  if (relevantCount >= 2) {
    return 1.0; // Great alignment
  }

  if (relevantCount === 1) {
    return 0.8; // Good alignment
  }

  // No specific tier topics, but no wrong ones either = neutral
  return 0.6;
}

/**
 * Evaluate if response builds wealth identity
 *
 * @param response - The AI response to evaluate
 * @returns Score from 0.0 to 1.0
 */
export function evaluateIdentityBuilding(response: string): number {
  const identityPhrases = [
    "you're becoming",
    'you are becoming',
    'this is what investors do',
    'this is what savers do',
    "you're someone who",
    'you are someone who',
    "you're building",
    'you are building',
    'this is who you are',
    'wealthy people',
    'financially free people'
  ];

  const antiIdentityPhrases = [
    "you didn't",
    "you haven't",
    "you're not",
    'you are not',
    'you lack',
    'you need to be',
    'you should be'
  ];

  const lowerResponse = response.toLowerCase();

  // Check for anti-identity phrases
  for (const phrase of antiIdentityPhrases) {
    if (lowerResponse.includes(phrase)) {
      return 0.3;
    }
  }

  // Count identity-building phrases
  let identityCount = 0;
  for (const phrase of identityPhrases) {
    if (lowerResponse.includes(phrase)) {
      identityCount++;
    }
  }

  if (identityCount >= 2) {
    return 1.0;
  }

  if (identityCount === 1) {
    return 0.8;
  }

  // Neutral
  return 0.6;
}

/**
 * Evaluate if response avoids overwhelming the user
 *
 * @param response - The AI response to evaluate
 * @returns Score from 0.0 to 1.0
 */
export function evaluateOverwhelmPrevention(response: string): {
  score: number;
  wordCount: number;
} {
  const wordCount = response.split(/\s+/).length;
  const paragraphCount = response.split(/\n\n+/).length;

  // Check for info-dump indicators
  const infoDumpPhrases = [
    'there are several',
    'many options',
    'you could also',
    'alternatively',
    'on the other hand',
    'however,',
    'but also',
    'keep in mind that'
  ];

  const lowerResponse = response.toLowerCase();
  let infoDumpCount = 0;
  for (const phrase of infoDumpPhrases) {
    if (lowerResponse.includes(phrase)) {
      infoDumpCount++;
    }
  }

  // Scoring based on length and complexity
  if (wordCount > 200 || paragraphCount > 3 || infoDumpCount >= 2) {
    return { score: 0.4, wordCount }; // Too long/complex
  }

  if (wordCount > 150 || paragraphCount > 2 || infoDumpCount >= 1) {
    return { score: 0.6, wordCount }; // Could be more concise
  }

  if (wordCount <= 100 && paragraphCount <= 2 && infoDumpCount === 0) {
    return { score: 1.0, wordCount }; // Perfect: concise and focused
  }

  return { score: 0.8, wordCount }; // Good
}

/**
 * Run all evaluations on a response
 *
 * @param response - The AI response to evaluate
 * @param context - User context for tier alignment
 * @returns Complete evaluation result
 */
export function runAllEvaluations(
  response: string,
  context: { tier: string }
): EvaluationResult {
  const emotionalSafety = evaluateEmotionalSafety(response);
  const oneActionClarity = evaluateOneActionClarity(response);
  const tierAlignment = evaluateTierAlignment(response, context.tier);
  const identityBuilding = evaluateIdentityBuilding(response);
  const overwhelmPrevention = evaluateOverwhelmPrevention(response);

  const scores = {
    emotional_safety: emotionalSafety.score,
    one_action_clarity: oneActionClarity.score,
    tier_alignment: tierAlignment,
    identity_building: identityBuilding,
    overwhelm_prevention: overwhelmPrevention.score
  };

  // Composite score (weighted average)
  const weights = {
    emotional_safety: 0.3,      // Most important
    one_action_clarity: 0.25,   // Very important
    tier_alignment: 0.2,        // Important
    identity_building: 0.15,    // Nice to have
    overwhelm_prevention: 0.1   // Secondary
  };

  const compositeScore =
    scores.emotional_safety * weights.emotional_safety +
    scores.one_action_clarity * weights.one_action_clarity +
    scores.tier_alignment * weights.tier_alignment +
    scores.identity_building * weights.identity_building +
    scores.overwhelm_prevention * weights.overwhelm_prevention;

  return {
    ...scores,
    composite_score: Math.round(compositeScore * 100) / 100,
    details: {
      bannedPhrasesFound: emotionalSafety.bannedFound,
      powerPhrasesFound: emotionalSafety.powerFound,
      actionCount: oneActionClarity.actionCount,
      wordCount: overwhelmPrevention.wordCount
    }
  };
}

/**
 * LLM-as-Judge evaluation for more nuanced scoring
 * Uses Groq with fast model for cost-effective judging
 */
export async function llmJudgeOneActionClarity(response: string): Promise<number> {
  const groqClient = getGroqClient();
  if (!groqClient) {
    // Fallback to heuristic if no LLM available
    return evaluateOneActionClarity(response).score;
  }

  const judgePrompt = `You are evaluating a financial coaching response for action clarity.

SCORING CRITERIA:
- 1.0: Exactly ONE specific, doable-today action with clear instructions
- 0.7: One action but could be more specific or actionable
- 0.4: Multiple actions that might overwhelm the user
- 0.2: Vague advice with no clear action
- 0.0: No action at all, just information

RESPONSE TO EVALUATE:
"${response}"

Return ONLY a single number between 0.0 and 1.0 (nothing else):`;

  try {
    const result = await groqClient.generateEvaluation(judgePrompt);
    const score = parseFloat(result.trim());
    return isNaN(score) ? 0.5 : Math.min(1.0, Math.max(0.0, score));
  } catch (error) {
    console.error('LLM judge error:', error);
    return evaluateOneActionClarity(response).score;
  }
}
