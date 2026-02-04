/**
 * MoneyText Component
 *
 * Specialized text component for displaying currency values.
 * Features:
 * - Automatic currency formatting
 * - Color coding for positive/negative values
 * - Animated counting effect
 * - Support for various display sizes
 */

import React, { useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextStyle,
  Animated,
} from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { useAuth } from '../../contexts/AuthContext';

// =============================================================================
// Types
// =============================================================================

type MoneySize = 'sm' | 'md' | 'lg' | 'xl' | 'hero';
type MoneyVariant = 'default' | 'positive' | 'negative' | 'muted';

interface MoneyTextProps {
  value: number;
  currency?: string;
  size?: MoneySize;
  variant?: MoneyVariant;
  showSign?: boolean;
  animated?: boolean;
  style?: TextStyle;
  colorByValue?: boolean; // Auto-color based on positive/negative
}

// =============================================================================
// Utilities
// =============================================================================

const formatCurrency = (
  value: number,
  currency: string = 'USD',
  showSign: boolean = false
): string => {
  const absValue = Math.abs(value);

  // Get currency symbol
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    JPY: '¥',
    CHF: 'CHF ',
  };

  const symbol = symbols[currency] || currency + ' ';

  // Format the number
  const formatted = absValue.toLocaleString('en-US', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  // Add sign if needed
  let prefix = '';
  if (showSign && value > 0) prefix = '+';
  if (value < 0) prefix = '-';

  return `${prefix}${symbol}${formatted}`;
};

// =============================================================================
// Component
// =============================================================================

export function MoneyText({
  value,
  currency,
  size = 'md',
  variant = 'default',
  showSign = false,
  animated = false,
  style,
  colorByValue = false,
}: MoneyTextProps) {
  const colors = useColors();
  const { user } = useAuth();
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Use user's currency if not specified
  const displayCurrency = currency || user?.currency || 'USD';

  // Animate on value change
  useEffect(() => {
    if (animated) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [value, animated]);

  // Determine variant based on value if colorByValue is true
  const effectiveVariant = colorByValue
    ? value > 0
      ? 'positive'
      : value < 0
      ? 'negative'
      : 'default'
    : variant;

  // Get color based on variant
  const getColor = (): string => {
    switch (effectiveVariant) {
      case 'positive':
        return colors.success;
      case 'negative':
        return colors.error;
      case 'muted':
        return colors.textMuted;
      default:
        return colors.text;
    }
  };

  // Get text style based on size
  const getTextStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return {
          fontSize: tokens.typography.sizes.bodySm.fontSize,
          lineHeight: tokens.typography.sizes.bodySm.lineHeight,
          fontWeight: tokens.typography.weights.medium,
        };
      case 'md':
        return {
          fontSize: tokens.typography.sizes.bodyLg.fontSize,
          lineHeight: tokens.typography.sizes.bodyLg.lineHeight,
          fontWeight: tokens.typography.weights.semibold,
        };
      case 'lg':
        return {
          fontSize: tokens.typography.sizes.headingLg.fontSize,
          lineHeight: tokens.typography.sizes.headingLg.lineHeight,
          fontWeight: tokens.typography.weights.bold,
        };
      case 'xl':
        return {
          fontSize: tokens.typography.sizes.displayMd.fontSize,
          lineHeight: tokens.typography.sizes.displayMd.lineHeight,
          fontWeight: tokens.typography.weights.bold,
        };
      case 'hero':
        return {
          fontSize: tokens.typography.sizes.displayLg.fontSize,
          lineHeight: tokens.typography.sizes.displayLg.lineHeight,
          fontWeight: tokens.typography.weights.bold,
        };
      default:
        return {
          fontSize: tokens.typography.sizes.bodyLg.fontSize,
          lineHeight: tokens.typography.sizes.bodyLg.lineHeight,
          fontWeight: tokens.typography.weights.semibold,
        };
    }
  };

  const formattedValue = formatCurrency(value, displayCurrency, showSign);
  const textStyle = getTextStyle();

  const textStyles: TextStyle[] = [
    styles.base,
    textStyle,
    { color: getColor() },
    style || {},
  ];

  if (animated) {
    const scale = animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.95, 1.02, 1],
    });

    const opacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    return (
      <Animated.Text
        style={[
          textStyles,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        {formattedValue}
      </Animated.Text>
    );
  }

  return <Text style={textStyles}>{formattedValue}</Text>;
}

// =============================================================================
// Compound Components
// =============================================================================

interface MoneyWithLabelProps extends MoneyTextProps {
  label: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export function MoneyWithLabel({
  label,
  labelPosition = 'top',
  ...moneyProps
}: MoneyWithLabelProps) {
  const colors = useColors();

  const isHorizontal = labelPosition === 'left' || labelPosition === 'right';

  return (
    <View
      style={[
        styles.labelContainer,
        isHorizontal && styles.labelContainerHorizontal,
        labelPosition === 'bottom' && styles.labelContainerReverse,
        labelPosition === 'right' && styles.labelContainerRightReverse,
      ]}
    >
      {(labelPosition === 'top' || labelPosition === 'left') && (
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      )}
      <MoneyText {...moneyProps} />
      {(labelPosition === 'bottom' || labelPosition === 'right') && (
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      )}
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  base: {
    fontVariant: ['tabular-nums'], // Ensures numbers align properly
  },
  labelContainer: {
    gap: tokens.spacing.xxs,
  },
  labelContainerHorizontal: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: tokens.spacing.sm,
  },
  labelContainerReverse: {
    flexDirection: 'column-reverse',
  },
  labelContainerRightReverse: {
    flexDirection: 'row-reverse',
  },
  label: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
});

export default MoneyText;
