/**
 * Skeleton Component
 *
 * Animated placeholder for loading states.
 * Shows a pulsing shimmer effect while content loads.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';

// =============================================================================
// Types
// =============================================================================

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
  loading?: boolean;
}

interface SkeletonGroupProps {
  children: React.ReactNode;
  loading?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function Skeleton({
  variant = 'text',
  width = '100%',
  height,
  style,
  children,
  loading = true,
}: SkeletonProps) {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Start pulse animation
  useEffect(() => {
    if (loading) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [loading, pulseAnim]);

  // If not loading, show children
  if (!loading) {
    return <>{children}</>;
  }

  // Get default height based on variant
  const getDefaultHeight = (): number => {
    switch (variant) {
      case 'text':
        return tokens.typography.sizes.bodyMd.lineHeight;
      case 'circular':
        return typeof width === 'number' ? width : 40;
      case 'rectangular':
        return 100;
      case 'rounded':
        return 48;
      default:
        return 20;
    }
  };

  // Get border radius based on variant
  const getBorderRadius = (): number => {
    switch (variant) {
      case 'text':
        return tokens.radius.xs;
      case 'circular':
        return tokens.radius.full;
      case 'rectangular':
        return 0;
      case 'rounded':
        return tokens.radius.md;
      default:
        return tokens.radius.xs;
    }
  };

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonStyles: ViewStyle[] = [
    styles.skeleton,
    {
      width: width as any,
      height: height || getDefaultHeight(),
      borderRadius: getBorderRadius(),
      backgroundColor: colors.border,
    },
    style || {},
  ];

  return (
    <Animated.View style={[skeletonStyles, { opacity }]} />
  );
}

// =============================================================================
// Preset Skeletons
// =============================================================================

export function SkeletonText({
  lines = 1,
  lastLineWidth = '60%',
  spacing = tokens.spacing.sm,
}: {
  lines?: number;
  lastLineWidth?: number | string;
  spacing?: number;
}) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({
  height = 120,
  style,
}: {
  height?: number;
  style?: ViewStyle;
}) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.skeletonCard,
        { backgroundColor: colors.card, height },
        style,
      ]}
    >
      <View style={styles.skeletonCardHeader}>
        <Skeleton variant="circular" width={40} height={40} />
        <View style={styles.skeletonCardHeaderText}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </View>
      </View>
      <View style={styles.skeletonCardBody}>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="50%" />
      </View>
    </View>
  );
}

export function SkeletonListItem({ style }: { style?: ViewStyle }) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.skeletonListItem,
        { backgroundColor: colors.card },
        style,
      ]}
    >
      <Skeleton variant="circular" width={48} height={48} />
      <View style={styles.skeletonListItemContent}>
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
      </View>
      <Skeleton variant="text" width={60} />
    </View>
  );
}

export function SkeletonBudgetCard({ style }: { style?: ViewStyle }) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.skeletonBudgetCard,
        { backgroundColor: colors.card },
        style,
      ]}
    >
      <View style={styles.skeletonBudgetHeader}>
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width={80} height={24} />
      </View>
      <Skeleton variant="rounded" width="100%" height={10} />
      <View style={styles.skeletonBudgetFooter}>
        <Skeleton variant="text" width="30%" height={14} />
        <Skeleton variant="text" width="25%" height={14} />
      </View>
    </View>
  );
}

// =============================================================================
// Skeleton Group (wraps children in loading state)
// =============================================================================

export function SkeletonGroup({ children, loading = true }: SkeletonGroupProps) {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <View style={styles.skeletonGroup}>
      {children}
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  skeletonGroup: {
    opacity: 1,
  },
  skeletonCard: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.md,
    ...tokens.shadows.sm,
  },
  skeletonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  skeletonCardHeaderText: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  skeletonCardBody: {
    gap: tokens.spacing.sm,
  },
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.md,
    gap: tokens.spacing.md,
  },
  skeletonListItemContent: {
    flex: 1,
    gap: tokens.spacing.xs,
  },
  skeletonBudgetCard: {
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    gap: tokens.spacing.md,
    ...tokens.shadows.sm,
  },
  skeletonBudgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonBudgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default Skeleton;
