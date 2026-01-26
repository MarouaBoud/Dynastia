/**
 * Unit tests for copy validation utility
 *
 * Tests verify that validation catches common shame language mistakes
 * and provides helpful suggestions for developers.
 */

import {
  containsBannedPhrase,
  suggestReplacement,
  validateCopy,
  isSafeLanguage,
  validateCopyObject,
} from '../validateCopy';

describe('containsBannedPhrase', () => {
  it('should detect banned phrases (case-insensitive)', () => {
    const result = containsBannedPhrase('Invalid credentials');
    expect(result.hasBanned).toBe(true);
    expect(result.found).toContain('invalid');
  });

  it('should detect multiple banned phrases', () => {
    const result = containsBannedPhrase('Invalid error failed');
    expect(result.hasBanned).toBe(true);
    expect(result.found).toHaveLength(3);
    expect(result.found).toContain('invalid');
    expect(result.found).toContain('error');
    expect(result.found).toContain('failed');
  });

  it('should return no banned phrases for safe text', () => {
    const result = containsBannedPhrase("We couldn't find that email");
    expect(result.hasBanned).toBe(false);
    expect(result.found).toHaveLength(0);
  });

  it('should handle empty strings', () => {
    const result = containsBannedPhrase('');
    expect(result.hasBanned).toBe(false);
    expect(result.found).toHaveLength(0);
  });
});

describe('suggestReplacement', () => {
  it('should suggest replacement for "invalid"', () => {
    const suggestion = suggestReplacement('Invalid credentials');
    expect(suggestion).toContain("We couldn't find that");
  });

  it('should suggest replacement for "error"', () => {
    const suggestion = suggestReplacement('Error occurred');
    expect(suggestion).toContain("Let's try again");
  });

  it('should suggest replacement for "failed"', () => {
    const suggestion = suggestReplacement('You failed to log in');
    expect(suggestion).toContain("That didn't work");
  });

  it('should suggest replacement for "you should"', () => {
    const suggestion = suggestReplacement('You should enter your password');
    expect(suggestion).toContain('Your next move');
  });

  it('should suggest replacement for "you\'re behind"', () => {
    const suggestion = suggestReplacement("You're behind schedule");
    expect(suggestion).toContain('Your next step');
  });

  it('should provide general suggestion for unmapped phrases', () => {
    const suggestion = suggestReplacement('Some random text');
    expect(suggestion).toContain('collaborative');
  });
});

describe('validateCopy', () => {
  it('should fail validation for banned phrases', () => {
    const result = validateCopy('Invalid credentials. Try again.', 'login_error');
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('should pass validation for safe language', () => {
    const result = validateCopy("We couldn't find that email. Let's try again.", 'login_error');
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should detect blame language', () => {
    const result = validateCopy('You must enter a password', 'form_validation');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.includes('blame'))).toBe(true);
  });

  it('should detect comparison language', () => {
    const result = validateCopy("You're behind on your savings goal", 'progress_message');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.includes('Comparison'))).toBe(true);
  });

  it('should detect dismissive language', () => {
    const result = validateCopy("It's easy, just enter your email", 'instruction');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.includes('Dismissive'))).toBe(true);
  });

  it('should suggest next action for error messages', () => {
    const result = validateCopy('Something went wrong', 'error_message');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.includes('next action'))).toBe(true);
  });

  it('should suggest reassurance for unavailable features', () => {
    const result = validateCopy('This feature is not available', 'unavailable_feature');
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.includes('reassurance'))).toBe(true);
  });
});

describe('isSafeLanguage', () => {
  it('should return true for safe language', () => {
    expect(isSafeLanguage("Let's try again")).toBe(true);
    expect(isSafeLanguage("We couldn't find that email")).toBe(true);
    expect(isSafeLanguage('Your next move is to review your expenses')).toBe(true);
  });

  it('should return false for banned phrases', () => {
    expect(isSafeLanguage('Invalid credentials')).toBe(false);
    expect(isSafeLanguage('You failed')).toBe(false);
    expect(isSafeLanguage('Error occurred')).toBe(false);
  });

  it('should return false for blame language', () => {
    expect(isSafeLanguage('You must enter a password')).toBe(false);
    expect(isSafeLanguage('You should have saved more')).toBe(false);
    expect(isSafeLanguage("You're behind schedule")).toBe(false);
  });

  it('should return false for dismissive language', () => {
    expect(isSafeLanguage("It's easy")).toBe(false);
    expect(isSafeLanguage('Just enter your email')).toBe(false);
    expect(isSafeLanguage('Simply click here')).toBe(false);
  });
});

describe('validateCopyObject', () => {
  it('should validate all strings in nested object', () => {
    const copyObject = {
      login: {
        title: 'Welcome back',
        error: 'Invalid credentials', // Bad
      },
      signup: {
        title: 'Create account',
        error: "We couldn't find that", // Good
      },
    };

    const errors = validateCopyObject(copyObject);
    expect(errors.length).toBe(1);
    expect(errors[0].path).toBe('login.error');
    expect(errors[0].issues.length).toBeGreaterThan(0);
  });

  it('should return empty array for all safe copy', () => {
    const copyObject = {
      login: {
        title: 'Welcome back',
        error: "We couldn't find that email. Let's try again.",
      },
      signup: {
        title: 'Create your account',
        success: 'Account created. Welcome!',
      },
    };

    const errors = validateCopyObject(copyObject);
    expect(errors).toHaveLength(0);
  });

  it('should handle deeply nested objects', () => {
    const copyObject = {
      auth: {
        login: {
          errors: {
            notFound: 'Invalid email', // Bad
            network: "We're having trouble connecting", // Good
          },
        },
      },
    };

    const errors = validateCopyObject(copyObject);
    expect(errors.length).toBe(1);
    expect(errors[0].path).toBe('auth.login.errors.notFound');
  });
});
