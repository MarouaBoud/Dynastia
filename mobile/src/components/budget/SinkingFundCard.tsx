/**
 * SinkingFundCard Component
 *
 * Displays a savings goal with progress circle,
 * current/target amounts, and monthly contribution needed.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { MoneyText } from '../ui/MoneyText';
import {
  SinkingFund,
  formatMonthsRemaining,
} from '../../services/sinkingFund.service';

// =============================================================================
// Types
// =============================================================================

interface SinkingFundCardProps {
  fund: SinkingFund;
  onPress: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function SinkingFundCard({ fund, onPress }: SinkingFundCardProps) {
  const colors = useColors();
  const progress = fund.progress || 0;
  const isCompleted = fund.isCompleted;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Progress Circle */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressCircle, { borderColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: isCompleted ? colors.success : colors.primary,
                height: `${Math.min(100, progress)}%`,
              },
            ]}
          />
          <View style={styles.progressTextContainer}>
            <Text style={[styles.progressPercent, { color: colors.text }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        </View>
        {isCompleted && (
          <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>

      {/* Fund Info */}
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {fund.name}
        </Text>

        <View style={styles.amountRow}>
          <MoneyText value={fund.currentAmount} size="sm" />
          <Text style={[styles.ofText, { color: colors.textMuted }]}> of </Text>
          <MoneyText value={fund.targetAmount} size="sm" variant="muted" />
        </View>

        {!isCompleted && fund.monthlyContribution && fund.monthlyContribution > 0 && (
          <Text style={[styles.contribution, { color: colors.primary }]}>
            Save{' '}
            <Text style={styles.contributionAmount}>
              ${(fund.monthlyContribution / 100).toFixed(0)}
            </Text>
            /month to reach goal
          </Text>
        )}

        {!isCompleted && fund.monthsRemaining !== undefined && (
          <Text style={[styles.deadline, { color: colors.textMuted }]}>
            {formatMonthsRemaining(fund.monthsRemaining)}
          </Text>
        )}

        {isCompleted && (
          <View style={[styles.completedLabel, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.completedLabelText, { color: colors.success }]}>
              🎉 Goal Reached!
            </Text>
          </View>
        )}
      </View>

      {/* Arrow */}
      <Text style={[styles.arrow, { color: colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.lg,
    marginHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    ...tokens.shadows.sm,
  },
  progressContainer: {
    position: 'relative',
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 32,
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.bold,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: tokens.typography.weights.bold,
  },
  content: {
    flex: 1,
    marginLeft: tokens.spacing.md,
  },
  name: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    marginBottom: tokens.spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: tokens.spacing.xs,
  },
  ofText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  contribution: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.xxs,
  },
  contributionAmount: {
    fontWeight: tokens.typography.weights.semibold,
  },
  deadline: {
    fontSize: tokens.typography.sizes.caption.fontSize,
  },
  completedLabel: {
    marginTop: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs,
    borderRadius: tokens.radius.full,
    alignSelf: 'flex-start',
  },
  completedLabelText: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  arrow: {
    fontSize: 24,
    marginLeft: tokens.spacing.sm,
  },
});

export default SinkingFundCard;
