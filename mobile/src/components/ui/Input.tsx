/**
 * Input Component
 *
 * Text input with label, validation states, and helper text.
 * Supports icons, secure text entry, and various keyboard types.
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';

// =============================================================================
// Types
// =============================================================================

type InputState = 'default' | 'focused' | 'error' | 'success' | 'disabled';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  showClearButton?: boolean;
  onClear?: () => void;
}

// =============================================================================
// Component
// =============================================================================

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      successText,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      showClearButton,
      onClear,
      editable = true,
      value,
      onFocus,
      onBlur,
      ...textInputProps
    },
    ref
  ) => {
    const colors = useColors();
    const [isFocused, setIsFocused] = useState(false);

    // Determine input state
    const getInputState = (): InputState => {
      if (!editable) return 'disabled';
      if (errorText) return 'error';
      if (successText) return 'success';
      if (isFocused) return 'focused';
      return 'default';
    };

    const inputState = getInputState();

    // Get border color based on state
    const getBorderColor = () => {
      switch (inputState) {
        case 'focused':
          return colors.primary;
        case 'error':
          return colors.error;
        case 'success':
          return colors.success;
        case 'disabled':
          return colors.borderLight;
        default:
          return colors.border;
      }
    };

    // Get helper text and color
    const getHelperTextInfo = () => {
      if (errorText) {
        return { text: errorText, color: colors.error };
      }
      if (successText) {
        return { text: successText, color: colors.success };
      }
      if (helperText) {
        return { text: helperText, color: colors.textMuted };
      }
      return null;
    };

    const helperInfo = getHelperTextInfo();

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleClear = () => {
      onClear?.();
    };

    // Show clear button if enabled and has value
    const shouldShowClear = showClearButton && value && value.length > 0;

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        {label && (
          <Text
            style={[
              styles.label,
              { color: colors.textSecondary },
              inputState === 'error' && { color: colors.error },
            ]}
          >
            {label}
          </Text>
        )}

        {/* Input container */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.inputBackground,
              borderColor: getBorderColor(),
            },
            inputState === 'focused' && styles.inputContainerFocused,
            inputState === 'disabled' && styles.inputContainerDisabled,
          ]}
        >
          {/* Left icon */}
          {leftIcon && (
            <View style={styles.leftIcon}>{leftIcon}</View>
          )}

          {/* Text input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: colors.text },
              leftIcon ? styles.inputWithLeftIcon : {},
              (rightIcon || shouldShowClear) ? styles.inputWithRightIcon : {},
              inputStyle || {},
            ]}
            placeholderTextColor={colors.textMuted}
            editable={editable}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...textInputProps}
          />

          {/* Right icon or clear button */}
          {shouldShowClear ? (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.clearText, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          ) : rightIcon ? (
            <View style={styles.rightIcon}>{rightIcon}</View>
          ) : null}
        </View>

        {/* Helper text */}
        {helperInfo && (
          <Text style={[styles.helperText, { color: helperInfo.color }]}>
            {helperInfo.text}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing.lg,
  },
  label: {
    fontSize: tokens.typography.sizes.label.fontSize,
    fontWeight: tokens.typography.weights.medium,
    marginBottom: tokens.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: tokens.components.input.height,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    paddingHorizontal: tokens.components.input.padding.horizontal,
  },
  inputWithLeftIcon: {
    paddingLeft: tokens.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: tokens.spacing.xs,
  },
  leftIcon: {
    paddingLeft: tokens.components.input.padding.horizontal,
  },
  rightIcon: {
    paddingRight: tokens.components.input.padding.horizontal,
  },
  clearButton: {
    paddingHorizontal: tokens.components.input.padding.horizontal,
    height: '100%',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 16,
    fontWeight: tokens.typography.weights.medium,
  },
  helperText: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    marginTop: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.xs,
  },
});

export default Input;
