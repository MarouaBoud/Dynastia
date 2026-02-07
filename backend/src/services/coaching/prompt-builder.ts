/**
 * Prompt Builder
 *
 * Constructs LLM prompts for coaching messages.
 * Enforces emotional safety rules (PSYCH-01 to PSYCH-05, COACH-05).
 */

import { ClaudeClient } from '../llm/claude-client';
import { CoachingDecision, CoachingType } from './rule-engine';

/**
 * System prompt enforcing emotional safety.
 * COACH-05: Uses power phrases, bans shame phrases.
 * COACH-06: Explains "why" behind recommendations.
 */
export const COACHING_SYSTEM_PROMPT = `You are a warm, professional financial coach for Dynastia, an app helping women build financial confidence.

YOUR ROLE:
- Normalize feelings: "This is common", "Many people experience this"
- Reframe perspective: Offer a new lens without judgment
- Explain why: Always explain the reasoning behind advice (builds trust)
- One action: End with ONE clear, specific next action

TONE:
- Professional but empathetic
- Like a supportive financial planner who genuinely cares
- Collaborative ("Let's", "We can") not directive ("You must")

POWER PHRASES (USE THESE):
- "You've got this"
- "This is progress"
- "Your next move"
- "Let's adjust"
- "That's completely normal"
- "You're building something real"

BANNED PHRASES (NEVER USE):
- "You should have"
- "Why didn't you"
- "That was a mistake"
- "You failed"
- "You're behind"
- "It's easy" / "Just" / "Simply"

FORMAT:
- 2-3 sentences maximum
- Warm opening, insight/normalization, then ONE next action
- No bullet points or lists in responses`;

/**
 * Prompt templates for each coaching type.
 * These tell the LLM what information to incorporate.
 */
const PROMPT_TEMPLATES: Record<CoachingType, (data: Record<string, any>) => string> = {
  spending_insight: (data) => {
    if (data.changePercent > 0) {
      return `User's spending increased by ${data.changePercent}% this month (${data.currentAmount} vs ${data.previousAmount} last month)${data.category ? ` in ${data.category}` : ''}.

Craft a 2-3 sentence coaching message that:
1. Normalizes this (spending fluctuates, life happens)
2. Asks a curious question (big purchase? unexpected expense?)
3. Offers one specific action (review transactions, adjust budget)`;
    } else {
      return `User's spending decreased by ${Math.abs(data.changePercent)}% this month (${data.currentAmount} vs ${data.previousAmount} last month).

Craft a 2-3 sentence celebratory message that:
1. Celebrates the positive change
2. Acknowledges the effort
3. Encourages maintaining the momentum`;
    }
  },

  milestone_approaching: (data) => `User is ${data.progress}% toward their next milestone.

Craft a 2-3 sentence encouraging message that:
1. Celebrates how close they are
2. Reframes the remaining gap as achievable
3. Builds excitement about what unlocks when they reach it`,

  milestone_achieved: (data) => `User just achieved a milestone: ${data.milestoneName}.

Craft a 2-3 sentence celebration message that:
1. Celebrates the achievement with genuine enthusiasm
2. Explains WHY this milestone matters for their financial journey
3. Hints at what's next without pressure`,

  check_in_reminder: (data) => `It's been ${data.daysSince} days since user's last Money Date.

Craft a friendly 2-sentence check-in that:
1. Acknowledges they might be busy (no judgment)
2. Gently invites them back with warmth`,

  streak_celebration: (data) => `User has maintained a ${data.weeks}-week Money Date streak!

Craft a 2-3 sentence celebration that:
1. Celebrates the consistency (this is rare!)
2. Explains WHY consistency builds wealth
3. Encourages them to keep going`,

  streak_at_risk: (data) => `User hasn't done a Money Date in ${data.daysSince} days. Their current streak is ${data.currentStreak} weeks.

Craft a 2-sentence gentle nudge that:
1. Acknowledges life gets busy (normalize)
2. Reminds them what's at stake (streak) without pressure`,

  runway_low: (data) => `User's runway is very low: ${data.monthsOfRunway.toFixed(1)} months.

Craft a 2-3 sentence supportive message that:
1. Acknowledges this can feel scary (normalize the feeling)
2. Reframes: knowing this is power
3. Offers ONE immediate action to improve runway`,

  savings_rate_improvement: (data) => `User's savings rate is ${data.currentRate}%.

Craft a 2-3 sentence encouraging message that:
1. Celebrates that they're saving at all
2. Explains WHY increasing savings rate accelerates freedom
3. Suggests ONE small increase (e.g., 1-2%)`,

  general_encouragement: () => `User is checking in but no specific issues detected.

Craft a 2-sentence warm check-in that:
1. Acknowledges their commitment to their financial journey
2. Offers a simple positive affirmation`
};

export class PromptBuilder {
  private claudeClient: ClaudeClient;

  constructor(claudeClient: ClaudeClient) {
    this.claudeClient = claudeClient;
  }

  /**
   * Build user prompt from coaching decision.
   */
  buildPrompt(decision: CoachingDecision): string {
    const templateFn = PROMPT_TEMPLATES[decision.type];
    if (!templateFn) {
      return PROMPT_TEMPLATES.general_encouragement({});
    }
    return templateFn(decision.data);
  }

  /**
   * Generate full coaching message using LLM.
   */
  async generateMessage(decision: CoachingDecision): Promise<string> {
    const userPrompt = this.buildPrompt(decision);
    return this.claudeClient.generateCoachingMessage(
      COACHING_SYSTEM_PROMPT,
      userPrompt
    );
  }
}

export const createPromptBuilder = (claudeClient: ClaudeClient) =>
  new PromptBuilder(claudeClient);
