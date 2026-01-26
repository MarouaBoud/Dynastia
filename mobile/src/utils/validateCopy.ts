/**
 * Copy Validation Utility
 *
 * Prevents shame language from entering the product by validating all user-facing
 * text against BANNED_PHRASES and safe language rules.
 *
 * Usage:
 * - Development: Automatically validate all copy imports
 * - CI/CD: Run validation tests before deployment
 * - Code reviews: Check new copy additions
 */

import { BANNED_PHRASES, POWER_PHRASES, SAFE_LANGUAGE_RULES } from '../constants/emotionalSafety';

/**
 * ValidationResult interface
 */
export interface ValidationResult {
  valid: boolean;
  issues: string[];
  suggestions: string[];
}

/**
 * BannedPhraseResult interface
 */
export interface BannedPhraseResult {
  hasBanned: boolean;
  found: string[];
}

/**
 * containsBannedPhrase
 *
 * Checks if text contains any banned phrases (case-insensitive).
 *
 * @param text - Text to check
 * @returns Object with hasBanned flag and array of found phrases
 *
 * @example
 * containsBannedPhrase("Invalid credentials")
 * // Returns: { hasBanned: true, found: ["invalid"] }
 */
export function containsBannedPhrase(text: string): BannedPhraseResult {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const phrase of BANNED_PHRASES) {
    if (lowerText.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }

  return {
    hasBanned: found.length > 0,
    found,
  };
}

/**
 * suggestReplacement
 *
 * Provides specific replacement suggestions for common banned phrases.
 *
 * @param text - Text containing banned phrase
 * @returns Suggested replacement text
 *
 * @example
 * suggestReplacement("Invalid credentials")
 * // Returns: "We couldn't find that email and password combination"
 */
export function suggestReplacement(text: string): string {
  const lowerText = text.toLowerCase();

  // Map of banned phrases to safe replacements
  const replacementMap: Record<string, string> = {
    invalid: "We couldn't find that",
    error: "Let's try again",
    failed: "That didn't work",
    failure: "That didn't work",
    wrong: "That didn't match",
    incorrect: "That didn't match",
    'you should': 'Your next move',
    "you're behind": 'Your next step',
    "you're late": 'Ready to continue?',
    'you must': "Let's",
    'you need to': "Your next move is to",
    "it's easy": 'You can do this',
    "it's simple": 'Here\'s how',
    just: "Here's how to",
    simply: "Here's how to",
    'try again': "Let's try again",
    'you failed': "That didn't work",
    'you forgot': "Let's add",
    'you missed': "Let's complete",
  };

  // Find first matching banned phrase and suggest replacement
  for (const [banned, replacement] of Object.entries(replacementMap)) {
    if (lowerText.includes(banned)) {
      return `Try: "${replacement}" instead of "${banned}"`;
    }
  }

  return 'Use collaborative language: "Let\'s" or "We" instead of "You"';
}

/**
 * detectBlameLanguage
 *
 * Detects blame-oriented language patterns beyond banned phrases.
 *
 * @param text - Text to check
 * @returns Array of detected blame patterns
 */
function detectBlameLanguage(text: string): string[] {
  const lowerText = text.toLowerCase();
  const blamePatterns: string[] = [];

  // Check for direct blame
  if (lowerText.match(/you (failed|forgot|missed|didn't|should have|must|need to)/)) {
    blamePatterns.push('Direct blame detected (you + negative action)');
  }

  // Check for comparison language
  if (lowerText.match(/(behind|ahead|late|early|better than|worse than)/)) {
    blamePatterns.push('Comparison language detected (may create anxiety)');
  }

  // Check for dismissive language
  if (lowerText.match(/(just|simply|easy|obvious|clear)/)) {
    blamePatterns.push('Dismissive language detected (minimizes user struggle)');
  }

  return blamePatterns;
}

/**
 * validateCopy
 *
 * Comprehensive validation of text for emotional safety.
 * Returns detailed validation result with issues and suggestions.
 *
 * @param text - Text to validate
 * @param context - Context for the text (e.g., "login_error", "success_message")
 * @returns ValidationResult with valid flag, issues, and suggestions
 *
 * @example
 * validateCopy("Invalid credentials. Try again.", "login_error")
 * // Returns: {
 * //   valid: false,
 * //   issues: ["Contains banned phrase: invalid", "Contains banned phrase: try again"],
 * //   suggestions: ["Try: \"We couldn't find that\" instead of \"invalid\""]
 * // }
 */
export function validateCopy(text: string, context: string = 'unknown'): ValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check for banned phrases
  const bannedResult = containsBannedPhrase(text);
  if (bannedResult.hasBanned) {
    bannedResult.found.forEach((phrase) => {
      issues.push(`Contains banned phrase: "${phrase}"`);
    });
    suggestions.push(suggestReplacement(text));
  }

  // Check for blame language
  const blamePatterns = detectBlameLanguage(text);
  if (blamePatterns.length > 0) {
    issues.push(...blamePatterns);
    suggestions.push('Use "we" or "let\'s" to create collaboration');
  }

  // Check for missing next action (for error messages)
  if (context.includes('error') && !text.toLowerCase().includes('try')) {
    issues.push('Error message missing next action guidance');
    suggestions.push('Add what user should do next (e.g., "Let\'s try again")');
  }

  // Check for reassurance (for unavailable features)
  if (context.includes('unavailable') && !text.toLowerCase().match(/(still|secure|safe|protected)/)) {
    issues.push('Unavailable feature message missing reassurance');
    suggestions.push('Reassure user their core needs are still met');
  }

  return {
    valid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * isSafeLanguage
 *
 * Quick boolean check for emotional safety.
 * Useful for assertions and conditional logic.
 *
 * @param text - Text to check
 * @returns true if text is emotionally safe, false otherwise
 *
 * @example
 * isSafeLanguage("Let's try again")  // Returns: true
 * isSafeLanguage("You failed")       // Returns: false
 */
export function isSafeLanguage(text: string): boolean {
  const bannedResult = containsBannedPhrase(text);
  if (bannedResult.hasBanned) {
    return false;
  }

  const blamePatterns = detectBlameLanguage(text);
  if (blamePatterns.length > 0) {
    return false;
  }

  return true;
}

/**
 * validateCopyObject
 *
 * Validates all strings in a nested object (useful for copy constants).
 *
 * @param obj - Object containing copy text
 * @param prefix - Prefix for nested keys (used recursively)
 * @returns Array of validation errors with paths
 */
export function validateCopyObject(
  obj: any,
  prefix: string = ''
): Array<{ path: string; issues: string[]; suggestions: string[] }> {
  const errors: Array<{ path: string; issues: string[]; suggestions: string[] }> = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      const result = validateCopy(value, key);
      if (!result.valid) {
        errors.push({
          path,
          issues: result.issues,
          suggestions: result.suggestions,
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      errors.push(...validateCopyObject(value, path));
    }
  }

  return errors;
}
