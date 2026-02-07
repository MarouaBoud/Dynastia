/**
 * Claude Client Wrapper
 *
 * Backend proxy for Anthropic Claude API calls.
 * Handles LLM requests with error handling and fallback messages.
 *
 * Security principles:
 * - API key stored in backend only (ANTHROPIC_API_KEY env var)
 * - Never expose API key to mobile app
 * - Return fallback message if LLM fails
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Claude API client wrapper for coaching message generation
 *
 * Usage:
 * - Instantiate once per request or as singleton
 * - Call generateCoachingMessage with system and user prompts
 * - Handles errors gracefully with fallback message
 */
export class ClaudeClient {
  private client: Anthropic;
  private readonly FALLBACK_MESSAGE = "Let's check in on your progress. How are things going?";

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Generate coaching message using Claude API
   *
   * @param systemPrompt - System-level instructions defining coach persona
   * @param userPrompt - User-specific context and coaching need
   * @returns Coaching message text, or fallback if error
   */
  async generateCoachingMessage(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929', // Cost-effective for coaching
        max_tokens: 200, // Keep responses concise
        temperature: 0.7, // Some creativity, not too wild
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      // Extract text from response
      const text = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      // Return text or fallback if empty
      return text || this.FALLBACK_MESSAGE;

    } catch (error: any) {
      console.error('Claude API error:', error.message || error);

      // Return fallback message on any error
      return this.FALLBACK_MESSAGE;
    }
  }
}
