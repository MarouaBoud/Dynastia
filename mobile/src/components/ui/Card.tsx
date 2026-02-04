/**
 * Card Component
 *
 * Container component with elevation and accent border options.
 * Foundation for dashboard cards, list items, and content sections.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';

// =============================================================================
// Types
// =============================================================================

type CardVariant = 'elevated' | 'flat' | 'outlined';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  accentColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

// =============================================================================
// Component
// =============================================================================

export function Card({
  children,
  variant = 'elevated',
  size = 'md',
  accentColor,
  onPress,
  style,
}: CardProps) {
  const colors = useColors();

  // Get padding based on size
  const getPadding = () => {
    switch (size) {
      case 'sm':
        return tokens.components.card.padding.sm;
      case 'lg':
        return tokens.components.card.padding.lg;
      default:
        return tokens.components.card.padding.md;
    }
  };

  // Build card styles
  const cardStyles: ViewStyle[] = [
    styles.base,
    {
      padding: getPadding(),
      backgroundColor: colors.card,
    },
  ];

  // Apply variant styles
  switch (variant) {
    case 'elevated':
      cardStyles.push(styles.elevated);
      break;
    case 'outlined':
      cardStyles.push({
        borderWidth: 1,
        borderColor: colors.border,
      });
      break;
    case 'flat':
      // No additional styles
      break;
  }

  // Apply accent border if provided
  if (accentColor) {
    cardStyles.push({
      borderLeftWidth: 4,
      borderLeftColor: accentColor,
    });
  }

  // Add custom style
  if (style) {
    cardStyles.push(style);
  }

  // Render as touchable if onPress is provided
  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

// =============================================================================
// Specialized Card Variants
// =============================================================================

interface MetricCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  accentColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor,
  onPress,
  style,
}: MetricCardProps) {
  const colors = useColors();

  return (
    <Card
      variant="elevated"
      accentColor={accentColor}
      onPress={onPress}
      style={style}
    >
      <View style={styles.metricHeader}>
        <View style={styles.metricTitleRow}>
          {icon && <View style={styles.metricIcon}>{icon}</View>}
          <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
            {title}
          </Text>
        </View>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trend.positive
                  ? colors.success + '20'
                  : colors.error + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.trendText,
                {
                  color: trend.positive ? colors.success : colors.error,
                },
              ]}
            >
              {trend.value}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.metricValue}>{value}</View>
      {subtitle && (
        <Text style={[styles.metricSubtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
  },
  elevated: {
    ...tokens.shadows.md,
  },
  // Metric card styles
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: tokens.spacing.sm,
  },
  metricTitle: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  } as TextStyle,
  metricValue: {
    marginBottom: tokens.spacing.xs,
  },
  metricSubtitle: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  } as TextStyle,
  trendBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs,
    borderRadius: tokens.radius.full,
  },
  trendText: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  } as TextStyle,
});

export default Card;
