/**
 * Haptics Utility
 *
 * Provides haptic feedback for user interactions.
 * Creates tactile responses that enhance the "Sanctuary Finance" experience.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// =============================================================================
// Types
// =============================================================================

type HapticFeedbackType =
  | 'light'      // Subtle feedback - selections, toggles
  | 'medium'     // Standard feedback - button presses
  | 'heavy'      // Strong feedback - confirmations, success
  | 'success'    // Positive outcome - transaction complete
  | 'warning'    // Caution - approaching limit
  | 'error';     // Negative outcome - validation error

// =============================================================================
// Haptic Functions
// =============================================================================

/**
 * Trigger haptic feedback based on interaction type
 */
export async function haptic(type: HapticFeedbackType = 'medium'): Promise<void> {
  // Skip haptics on web
  if (Platform.OS === 'web') {
    return;
  }

  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;

      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;

      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;

      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;

      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;

      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;

      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch (error) {
    // Silently fail - haptics are enhancement, not critical
    console.debug('Haptic feedback unavailable:', error);
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Light tap - for selections, toggles, navigation
 */
export const hapticLight = () => haptic('light');

/**
 * Medium tap - for button presses, interactions
 */
export const hapticMedium = () => haptic('medium');

/**
 * Heavy tap - for confirmations, drag completion
 */
export const hapticHeavy = () => haptic('heavy');

/**
 * Success notification - for completed actions
 */
export const hapticSuccess = () => haptic('success');

/**
 * Warning notification - for approaching limits, caution states
 */
export const hapticWarning = () => haptic('warning');

/**
 * Error notification - for validation errors, failed actions
 */
export const hapticError = () => haptic('error');

// =============================================================================
// Selection Feedback (for pickers, switches)
// =============================================================================

/**
 * Selection changed - subtle feedback for picker/switch changes
 */
export async function hapticSelection(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.debug('Selection haptic unavailable:', error);
  }
}

// =============================================================================
// Default Export
// =============================================================================

export default {
  haptic,
  light: hapticLight,
  medium: hapticMedium,
  heavy: hapticHeavy,
  success: hapticSuccess,
  warning: hapticWarning,
  error: hapticError,
  selection: hapticSelection,
};
