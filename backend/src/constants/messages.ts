/**
 * Backend Error Messages
 *
 * Emotionally safe error messages for API responses.
 * These messages are returned to the frontend and shown to users.
 *
 * Principles:
 * - Use collaborative language ("we", "let's")
 * - Focus on next action, not blame
 * - Provide specific guidance when possible
 * - Never expose technical details to users
 */

/**
 * AUTH_MESSAGES
 *
 * Authentication and authorization error messages
 */
export const AUTH_MESSAGES = {
  // Login errors
  invalidCredentials:
    "We couldn't find that email and password combination. Let's try again.",
  accountLocked:
    'Your account is temporarily locked for security. Ready to reset your password?',
  accountDisabled:
    'This account has been disabled. Contact support if you need help.',
  tooManyAttempts:
    "Let's take a short break. You can try again in {minutes} minutes.",

  // Token errors
  tokenExpired: 'Your session expired. Ready to log in again?',
  tokenInvalid: "We couldn't verify your session. Let's log in again.",
  tokenMissing: 'Authentication required. Ready to log in?',

  // Registration errors
  emailExists: 'That email is already registered. Ready to log in instead?',
  emailInvalid: 'That email format looks off. Double-check and try again.',
  passwordWeak:
    "Let's make your password stronger. Add a mix of letters, numbers, and symbols.",

  // Two-factor authentication
  twoFactorRequired: 'Enter your two-factor code to continue',
  twoFactorInvalid: "That code didn't match. Let's try again.",
  twoFactorExpired: 'That code expired. Ready for a new one?',

  // Password reset
  resetTokenExpired: 'That reset link expired. Ready to request a new one?',
  resetTokenInvalid: "We couldn't verify that reset link. Let's request a new one.",
  passwordSameAsCurrent: "That's your current password. Let's choose a new one.",
} as const;

/**
 * VALIDATION_MESSAGES
 *
 * Input validation error messages
 */
export const VALIDATION_MESSAGES = {
  // Required fields
  fieldRequired: 'This field is needed to continue',
  emailRequired: 'Add your email to continue',
  passwordRequired: 'Add your password to continue',

  // Format validation
  emailFormat: 'That email format looks off. Double-check and try again.',
  dateFormat: "That date format looks off. Let's try again.",
  numberFormat: 'This needs to be a number',
  positiveNumber: 'This needs to be a positive number',
  integerRequired: 'This needs to be a whole number',

  // Length validation
  tooShort: 'Add at least {min} characters',
  tooLong: 'This needs to be under {max} characters',
  exactLength: 'This needs to be exactly {length} characters',

  // Range validation
  tooSmall: 'This needs to be at least {min}',
  tooLarge: 'This needs to be under {max}',
  outOfRange: 'This needs to be between {min} and {max}',

  // Special validation
  invalidChoice: 'That option is not available. Choose from the list provided.',
  invalidDate: 'That date is not valid. Choose a valid date.',
  dateFuture: 'That date is in the future. Choose a past or current date.',
  datePast: 'That date is in the past. Choose a current or future date.',
} as const;

/**
 * SERVER_MESSAGES
 *
 * Server and system error messages
 */
export const SERVER_MESSAGES = {
  // Generic errors
  internalError:
    "We're having technical difficulties. Our team is working on it. Let's try again in a few minutes.",
  unknown: "Something unexpected happened. Let's try that again.",
  notFound: "We couldn't find that. Let's go back and try again.",

  // Network and timeout
  timeout: "That's taking longer than expected. Let's try again.",
  networkError: "We're having trouble connecting. Check your internet and let's try again.",

  // Rate limiting
  rateLimitExceeded:
    "You're making requests too quickly. Let's take a short break and try again in {seconds} seconds.",
  tooManyRequests:
    "Let's slow down a bit. You can continue in {seconds} seconds.",

  // Maintenance
  maintenance:
    "We're performing maintenance right now. We'll be back in about {minutes} minutes.",
  unavailable:
    "This feature is temporarily unavailable. We're working to restore it.",

  // Resource limits
  quotaExceeded:
    "You've reached your {resource} limit for this month. Ready to upgrade your plan?",
  storageLimit:
    "You've reached your storage limit. Let's remove some old data or upgrade your plan.",
} as const;

/**
 * PERMISSION_MESSAGES
 *
 * Authorization and permission error messages
 */
export const PERMISSION_MESSAGES = {
  unauthorized: 'You need to log in to access this.',
  forbidden: "You don't have access to that yet. Check back after completing your profile.",
  insufficientPermissions:
    "You don't have permission to do that. Contact support if you need help.",
  featureNotAvailable:
    'This feature is not available on your current plan. Ready to upgrade?',
  accountIncomplete:
    'Complete your profile to access this feature. Your next move: add your financial details.',
} as const;

/**
 * DATA_MESSAGES
 *
 * Data operation error messages
 */
export const DATA_MESSAGES = {
  // Create errors
  createFailed: "We couldn't save that. Let's try again.",
  duplicateEntry: 'That entry already exists. Ready to update it instead?',

  // Read errors
  notFound: "We couldn't find that. It may have been deleted.",
  noData: 'No data available yet. Your next move: add your first entry.',

  // Update errors
  updateFailed: "We couldn't save your changes. Let's try again.",
  versionConflict:
    'Someone else updated this while you were editing. Let's refresh and try again.',
  optimisticLockFailed:
    'This was updated elsewhere. Let's refresh and see the latest version.',

  // Delete errors
  deleteFailed: "We couldn't delete that. Let's try again.",
  hasRelatedData:
    "This can't be deleted because it's connected to other data. Remove those connections first.",

  // Import/Export errors
  importFailed: "We couldn't import that file. Let's check the format and try again.",
  exportFailed: "We couldn't export your data. Let's try again.",
  invalidFileFormat:
    'That file format is not supported. Try uploading a CSV or JSON file.',
  fileTooLarge:
    'That file is too large. Try a file under {maxSize}MB.',
} as const;

/**
 * Helper function to replace placeholders in messages
 *
 * @example
 * formatMessage(AUTH_MESSAGES.tooManyAttempts, { minutes: 15 })
 * // Returns: "Let's take a short break. You can try again in 15 minutes."
 */
export function formatMessage(
  message: string,
  params: Record<string, string | number>
): string {
  let formatted = message;
  for (const [key, value] of Object.entries(params)) {
    formatted = formatted.replace(`{${key}}`, String(value));
  }
  return formatted;
}

/**
 * Type definitions
 */
export type AuthMessages = typeof AUTH_MESSAGES;
export type ValidationMessages = typeof VALIDATION_MESSAGES;
export type ServerMessages = typeof SERVER_MESSAGES;
export type PermissionMessages = typeof PERMISSION_MESSAGES;
export type DataMessages = typeof DATA_MESSAGES;
