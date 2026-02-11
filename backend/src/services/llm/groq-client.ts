/**
 * Groq Client Wrapper
 *
 * Backend proxy for Groq API calls using Llama 3.1.
 * Free tier: 14,400 requests/day with fast inference.
 *
 * Replaces Claude for cost-effective coaching.
 */

import Groq from 'groq-sdk';

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  latencyMs: number;
  model: string;
}

/**
 * Groq API client wrapper for coaching message generation
 */
export class GroqClient {
  private client: Groq;
  private readonly FALLBACK_MESSAGE = "Let's check in on your progress. How are things going?";
  private readonly MODEL = 'llama-3.1-70b-versatile';

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  /**
   * Generate coaching message using Groq API
   *
   * @param systemPrompt - System-level instructions defining coach persona
   * @param userPrompt - User-specific context and coaching need
   * @returns Coaching message with metadata
   */
  async generateCoachingMessage(
    systemPrompt: string,
    userPrompt: string
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const latencyMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        content: content || this.FALLBACK_MESSAGE,
        tokensUsed,
        latencyMs,
        model: this.MODEL
      };

    } catch (error: any) {
      console.error('Groq API error:', error.message || error);

      return {
        content: this.FALLBACK_MESSAGE,
        tokensUsed: 0,
        latencyMs: Date.now() - startTime,
        model: this.MODEL
      };
    }
  }

  /**
   * Generate evaluation using fast model (for LLM-as-judge)
   */
  async generateEvaluation(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant', // Fast, cheap model for judging
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Groq evaluation error:', error.message || error);
      return '';
    }
  }
}

// Singleton instance
let groqClientInstance: GroqClient | null = null;

export function getGroqClient(): GroqClient | null {
  if (!groqClientInstance && process.env.GROQ_API_KEY) {
    groqClientInstance = new GroqClient(process.env.GROQ_API_KEY);
  }
  return groqClientInstance;
}
