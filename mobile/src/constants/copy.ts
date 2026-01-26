/**
 * Centralized Copy Constants
 *
 * Single source of truth for all user-facing text in the mobile app.
 * All copy is validated for emotional safety on import.
 *
 * Usage:
 * - Import specific copy objects: import { AUTH_COPY } from '@/constants/copy'
 * - Use in components: <Text>{AUTH_COPY.login.title}</Text>
 * - Never hardcode user-facing strings in components
 *
 * All copy follows emotional safety principles:
 * - Collaborative tone ("Let's", "We")
 * - Focus on next action, not past mistakes
 * - No shame phrases ("invalid", "failed", "error")
 * - Normalize struggle and celebrate small wins
 */

import { validateCopyObject } from '../utils/validateCopy';

/**
 * AUTH_COPY
 *
 * All authentication-related copy including login, signup, 2FA, biometric, and session.
 */
export const AUTH_COPY = {
  login: {
    title: 'Welcome back',
    subtitle: 'Continue your financial journey',
    emailPlaceholder: 'Your email',
    passwordPlaceholder: 'Password',
    submitButton: 'Continue',
    forgotPassword: 'Forgot your password?',
    signupPrompt: 'New to Dynastia? Create your account',

    // Error messages - collaborative, next-action focused
    errorNotFound:
      "We couldn't find that email and password combination. Let's try again.",
    errorNetwork:
      "We're having trouble connecting. Check your internet and let's try again.",
    errorTooManyAttempts:
      "Let's take a short break. You can try again in 15 minutes, or reset your password now.",
    errorLocked:
      'Your account is temporarily locked for security. Ready to reset your password?',
  },

  signup: {
    title: 'Create your financial sanctuary',
    subtitle: 'Build wealth without overwhelm',
    emailPlaceholder: 'Your email',
    passwordPlaceholder: 'Choose a strong password',
    passwordHint: 'At least 8 characters, with letters and numbers',
    submitButton: 'Create account',
    loginPrompt: 'Already have an account? Log in',
    termsText: 'By creating an account, you agree to our Terms and Privacy Policy',

    // Error messages
    errorEmailExists:
      'That email is already registered. Ready to log in instead?',
    errorWeakPassword:
      "Let's make your password stronger. Add a mix of letters, numbers, and symbols.",
    errorNetwork:
      "We're having trouble connecting. Check your internet and let's try again.",

    // Success message
    successMessage: 'Account created. Welcome to your financial journey.',
  },

  twoFactor: {
    title: 'Two-factor verification',
    subtitle: 'Enter the 6-digit code from your authenticator app',
    codePlaceholder: '000000',
    submitButton: 'Verify',
    resendButton: 'Send new code',
    backButton: 'Use different method',

    // Setup flow
    setupTitle: 'Add extra security',
    setupMessage: 'Add an extra layer of security to protect your financial data',
    setupInstructions: 'Scan this QR code with your authenticator app',
    setupSuccess: 'Two-factor authentication enabled. Your account is now even more secure.',

    // Error messages
    errorInvalidCode:
      "That code didn't match. Let's try again.",
    errorExpiredCode:
      'That code expired. Ready for a new one?',
    errorTooManyAttempts:
      "Let's take a short break. You can try again in 5 minutes.",
  },

  biometric: {
    promptMessage: 'Unlock your financial sanctuary',
    setupTitle: 'Enable biometric unlock',
    setupMessageFaceID: 'Enable Face ID for faster, secure access',
    setupMessageTouchID: 'Enable Touch ID for faster, secure access',
    setupMessageFingerprint: 'Enable fingerprint for faster, secure access',
    enableButton: 'Enable',
    skipButton: 'Maybe later',

    // Success and status messages
    enableSuccess:
      'Biometric unlock enabled. Next time, you can access your financial sanctuary with just a tap.',
    disableMessage:
      "Biometric unlock disabled. You'll use your password to log in.",

    // Error messages
    errorUnavailable:
      "Biometric authentication isn't available on this device, but your account is still secure with your password.",
    errorNotEnrolled:
      "No biometrics enrolled on this device. You can add them in your device settings, or continue using your password.",
    errorFallback:
      "We couldn't verify your biometrics. Let's use your password instead.",
    errorLockout:
      'Too many attempts. Ready to use your password instead?',
  },

  session: {
    expired:
      'To keep your account secure, we logged you out. Ready to continue?',
    expiringSoon:
      'Your session expires in 5 minutes. Stay logged in?',
    refreshing:
      "We're securely verifying your session. This takes about 10 seconds.",
    refreshSuccess: 'Session refreshed. You can continue.',
    refreshFailed:
      "We couldn't refresh your session. Let's log in again to keep your data secure.",
  },

  passwordReset: {
    title: 'Reset your password',
    subtitle: 'Enter your email to receive reset instructions',
    emailPlaceholder: 'Your email',
    submitButton: 'Send reset link',
    backButton: 'Back to login',

    // Success and instructions
    successMessage:
      'Check your email for reset instructions. The link is valid for 1 hour.',
    newPasswordTitle: 'Choose new password',
    newPasswordPlaceholder: 'New password',
    confirmPasswordPlaceholder: 'Confirm new password',
    submitNewPassword: 'Reset password',
    resetSuccess: 'Password reset complete. Ready to log in?',

    // Error messages
    errorNotFound:
      "We couldn't find that email. Ready to create an account instead?",
    errorExpiredLink:
      'That reset link expired. Ready to request a new one?',
    errorMismatch:
      "Those passwords don't match. Let's try again.",
    errorSamePassword:
      'That\'s your current password. Let\'s choose a new one.',
  },
} as const;

/**
 * ERROR_COPY
 *
 * Generic error messages used across the app.
 * All errors are collaborative and suggest next action.
 */
export const ERROR_COPY = {
  network:
    "We're having trouble connecting. Check your internet and let's try again.",
  timeout:
    "That's taking longer than expected. Let's try again.",
  unknown:
    "Something unexpected happened. Let's try that again.",
  maintenance:
    "We're performing maintenance right now. We'll be back in about 30 minutes.",
  notFound:
    "We couldn't find that. Let's go back and try again.",
  unauthorized:
    'Your session expired. Ready to log in again?',
  forbidden:
    "You don't have access to that yet. Check back after completing your profile.",
  serverError:
    "We're having technical difficulties. Our team is working on it. Let's try again in a few minutes.",
  validation:
    "Let's double-check that information and try again.",
} as const;

/**
 * SUCCESS_COPY
 *
 * Success messages for completed actions.
 * Celebrate wins without creating pressure.
 */
export const SUCCESS_COPY = {
  login: 'Welcome back',
  signup: 'Account created. Welcome to your financial journey.',
  logout: 'Logged out securely. See you soon.',
  biometricEnabled:
    'Biometric unlock enabled. Next time, you can access your financial sanctuary with just a tap.',
  twoFactorEnabled:
    'Two-factor authentication enabled. Your account is now even more secure.',
  profileUpdated: 'Profile updated.',
  settingsSaved: 'Settings saved.',
  dataExported: 'Your data is ready to download.',
  accountDeleted:
    'Account deleted. Your data has been securely removed.',
} as const;

/**
 * PROGRESS_COPY
 *
 * Progress indicators that frame success as stress reduction and safety increase.
 * Never compare user to others.
 */
export const PROGRESS_COPY = {
  // Stress reduction framing
  stressReduction: 'Your financial stress decreased by {percent}%',
  stressReductionWithContext:
    'Your financial stress decreased by {percent}% since {timeframe}',

  // Safety increase framing
  safetyIncrease: 'Your safety score: {score}%',
  safetyIncreaseWithContext:
    'Your safety score increased to {score}% (up {change}% this month)',

  // Milestone celebrations
  milestoneReached: "You've reached: {milestone}",
  milestoneProgress: "You're {percent}% of the way to: {milestone}",

  // Consistency celebrations (showing up matters)
  streakMessage: "{count} days in a row. That's progress.",
  consistencyMessage: 'You checked in {count} times this month. Well done.',

  // Small wins
  firstTransaction: 'First transaction logged. Well done.',
  firstSavings: 'First savings contribution. That\'s progress.',
  budgetCreated: 'Budget created. Your next move: track your first expense.',
} as const;

/**
 * LOADING_COPY
 *
 * Loading messages that set expectations and reduce anxiety.
 */
export const LOADING_COPY = {
  default: 'Loading...',
  authenticating: 'Verifying your credentials...',
  syncing: 'Syncing your data...',
  calculating: 'Calculating your numbers...',
  savingChanges: 'Saving your changes...',
  processingPayment: 'Processing securely...',

  // With time estimates (reduces anxiety)
  syncingWithTime: 'Syncing your data. This takes about {seconds} seconds.',
  calculatingWithTime:
    'Calculating your numbers. This takes about {seconds} seconds.',
} as const;

/**
 * VALIDATION_COPY
 *
 * Form validation messages.
 * Focus on what to do, not what's wrong.
 */
export const VALIDATION_COPY = {
  emailRequired: 'Add your email to continue',
  emailFormat: 'That email format looks off. Double-check and try again.',
  passwordRequired: 'Add your password to continue',
  passwordTooShort: 'Add at least {min} characters to your password',
  passwordTooWeak:
    "Let's make your password stronger with a mix of letters, numbers, and symbols",
  fieldRequired: 'This field is needed to continue',
  numberRequired: 'Add a number here',
  positiveNumber: 'This needs to be a positive number',
  dateRequired: 'Add a date to continue',
  dateInvalid: "That date format looks off. Let's try again.",
  dateFuture: 'That date is in the future. Choose a past or current date.',
} as const;

// Validate all copy on import (development only)
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  const allCopy = {
    AUTH_COPY,
    ERROR_COPY,
    SUCCESS_COPY,
    PROGRESS_COPY,
    LOADING_COPY,
    VALIDATION_COPY,
  };

  const errors = validateCopyObject(allCopy);

  if (errors.length > 0) {
    console.error('❌ COPY VALIDATION FAILED:');
    errors.forEach((error) => {
      console.error(`\n📍 ${error.path}`);
      console.error('  Issues:', error.issues);
      console.error('  Suggestions:', error.suggestions);
    });
    throw new Error(
      `Copy validation failed with ${errors.length} issue(s). See console for details.`
    );
  } else {
    console.log('✅ All copy validated for emotional safety');
  }
}

// Export types for TypeScript
export type AuthCopy = typeof AUTH_COPY;
export type ErrorCopy = typeof ERROR_COPY;
export type SuccessCopy = typeof SUCCESS_COPY;
export type ProgressCopy = typeof PROGRESS_COPY;
export type LoadingCopy = typeof LOADING_COPY;
export type ValidationCopy = typeof VALIDATION_COPY;
