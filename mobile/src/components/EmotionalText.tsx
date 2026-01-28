/**
 * EmotionalText Component
 *
 * A React Native Text component with built-in emotional safety validation.
 * Prevents shame language from being displayed to users.
 *
 * Features:
 * - Automatic validation in development mode
 * - Type-based styling (error, success, info, progress)
 * - Logs warnings for unsafe language
 * - Throws errors in test mode for strict enforcement
 *
 * Usage:
 * ```tsx
 * import { EmotionalText } from '@/components/EmotionalText';
 * import { AUTH_COPY } from '@/constants/copy';
 *
 * <EmotionalText
 *   text={AUTH_COPY.login.errorNotFound}
 *   type="error"
 * />
 * ```
 */

import React from 'react';
import { Text, TextStyle, StyleSheet, StyleProp } from 'react-native';
import { isSafeLanguage, validateCopy } from '../utils/validateCopy';

/**
 * Props interface
 */
export interface EmotionalTextProps {
  /**
   * Text to display (required)
   * Should come from copy constants, never hardcoded
   */
  text: string;

  /**
   * Message type for styling
   * - error: Red text for error messages
   * - success: Green text for success messages
   * - info: Default black text for informational messages
   * - progress: Blue text for progress indicators
   *
   * @default "info"
   */
  type?: 'error' | 'success' | 'info' | 'progress';

  /**
   * Custom style override
   * Applied after type-based styling
   */
  style?: StyleProp<TextStyle>;

  /**
   * Enable validation
   * - true: Validate text for emotional safety
   * - false: Skip validation (use for non-user-facing text)
   *
   * @default true in dev/test, false in production
   */
  validate?: boolean;

  /**
   * Additional Text component props
   */
  [key: string]: any;
}

/**
 * EmotionalText Component
 */
export const EmotionalText: React.FC<EmotionalTextProps> = ({
  text,
  type = 'info',
  style,
  validate = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test',
  ...restProps
}) => {
  // Validate text in development/test mode
  React.useEffect(() => {
    if (validate && text) {
      const isValid = isSafeLanguage(text);

      if (!isValid) {
        const validation = validateCopy(text, type);
        const errorMessage = `
🚨 EMOTIONAL SAFETY VIOLATION 🚨

Text: "${text}"
Type: ${type}

Issues:
${validation.issues.map((issue) => `  - ${issue}`).join('\n')}

Suggestions:
${validation.suggestions.map((suggestion) => `  - ${suggestion}`).join('\n')}

This text contains shame language and should not be shown to users.
Use copy constants from @/constants/copy instead of hardcoded strings.
        `.trim();

        // In test mode: Throw error to fail tests
        if (process.env.NODE_ENV === 'test') {
          throw new Error(errorMessage);
        }

        // In development mode: Log warning (doesn't break app)
        console.warn(errorMessage);
      }
    }
  }, [text, type, validate]);

  // Get style based on type
  const typeStyle = getTypeStyle(type);

  return (
    <Text
      style={[styles.base, typeStyle, style]}
      accessibilityRole="text"
      {...restProps}
    >
      {text}
    </Text>
  );
};

/**
 * Get style based on message type
 */
function getTypeStyle(type: EmotionalTextProps['type']): TextStyle {
  switch (type) {
    case 'error':
      return styles.error;
    case 'success':
      return styles.success;
    case 'progress':
      return styles.progress;
    case 'info':
    default:
      return styles.info;
  }
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'System', // Replace with your design system font
  },
  error: {
    color: '#DC2626', // Red-600
  },
  success: {
    color: '#16A34A', // Green-600
  },
  info: {
    color: '#1F2937', // Gray-800
  },
  progress: {
    color: '#2563EB', // Blue-600
  },
});

// EmotionalTextProps already exported above
