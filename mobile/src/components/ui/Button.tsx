/**
 * Button Component
 *
 * Primary interactive component with multiple variants and sizes.
 * Supports loading state, icons, and haptic feedback.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';

// =============================================================================
// Types
// =============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// =============================================================================
// Component
// =============================================================================

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ButtonProps) {
  const colors = useColors();

  const isDisabled = disabled || loading;

  // Get variant colors
  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    if (isDisabled) {
      return {
        bg: colors.buttonDisabled,
        text: colors.textMuted,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          bg: colors.primary,
          text: colors.textInverse,
        };
      case 'secondary':
        return {
          bg: 'transparent',
          text: colors.primary,
          border: colors.primary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: colors.primary,
        };
      case 'danger':
        return {
          bg: colors.error,
          text: colors.textInverse,
        };
      case 'success':
        return {
          bg: colors.success,
          text: colors.textInverse,
        };
      default:
        return {
          bg: colors.primary,
          text: colors.textInverse,
        };
    }
  };

  // Get size dimensions
  const getSizeStyles = () => {
    const config = tokens.components.button;
    switch (size) {
      case 'sm':
        return {
          height: config.height.sm,
          paddingHorizontal: config.padding.sm.horizontal,
          fontSize: tokens.typography.sizes.bodySm.fontSize,
        };
      case 'lg':
        return {
          height: config.height.lg,
          paddingHorizontal: config.padding.lg.horizontal,
          fontSize: tokens.typography.sizes.bodyLg.fontSize,
        };
      default:
        return {
          height: config.height.md,
          paddingHorizontal: config.padding.md.horizontal,
          fontSize: tokens.typography.sizes.bodyMd.fontSize,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyles: ViewStyle[] = [
    styles.base,
    {
      backgroundColor: variantStyles.bg,
      height: sizeStyles.height,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      borderColor: variantStyles.border || 'transparent',
      borderWidth: variantStyles.border ? 2 : 0,
    },
    fullWidth ? styles.fullWidth : {},
    variant === 'primary' && !isDisabled ? styles.primaryShadow : {},
    style || {},
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    {
      color: variantStyles.text,
      fontSize: sizeStyles.fontSize,
    },
    textStyle || {},
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variantStyles.text}
        />
      );
    }

    const textContent = (
      <Text style={textStyles}>
        {children}
      </Text>
    );

    if (icon) {
      return (
        <View style={styles.contentRow}>
          {iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          {textContent}
          {iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      );
    }

    return textContent;
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  primaryShadow: {
    ...tokens.shadows.md,
  },
  text: {
    fontWeight: tokens.typography.weights.semibold,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: tokens.spacing.sm,
  },
  iconRight: {
    marginLeft: tokens.spacing.sm,
  },
});

export default Button;
