/**
 * CreditCardItem
 *
 * Displays a credit card with balance, APR, interest cost,
 * and paid-in-full streak tracking.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Bill } from '../../services/bill.service';
import { MoneyText } from '../ui/MoneyText';
import { formatCurrency } from '../../utils/currency';
import { hapticLight } from '../../utils/haptics';

interface CreditCardItemProps {
  bill: Bill;
  onPress: () => void;
  onMarkPaid: (paidInFull: boolean) => void;
}

export function CreditCardItem({ bill, onPress, onMarkPaid }: CreditCardItemProps) {
  const colors = useColors();

  // Calculate monthly interest cost
  const monthlyInterestCost = bill.creditCardApr
    ? Math.round((bill.amount * (bill.creditCardApr / 100)) / 12)
    : 0;

  // Progress toward 3-month milestone (dots)
  const streakCount = bill.consecutivePaidInFull || 0;
  const maxStreak = 3;

  const handleMarkPaidInFull = () => {
    hapticLight();
    onMarkPaid(true);
  };

  const handleMarkPaidPartial = () => {
    hapticLight();
    onMarkPaid(false);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>💳</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.cardName, { color: colors.text }]}>{bill.name}</Text>
          {bill.creditCardApr && (
            <View style={[styles.aprBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.aprText, { color: colors.warning }]}>
                {bill.creditCardApr}% APR
              </Text>
            </View>
          )}
        </View>
        <MoneyText value={bill.amount} size="md" />
      </View>

      {/* Interest Cost */}
      {monthlyInterestCost > 0 && (
        <View style={[styles.interestRow, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.interestLabel, { color: colors.textMuted }]}>
            Monthly interest cost
          </Text>
          <Text style={[styles.interestValue, { color: colors.error }]}>
            ~{formatCurrency(monthlyInterestCost)}
          </Text>
        </View>
      )}

      {/* Streak Progress */}
      <View style={styles.streakSection}>
        <View style={styles.streakInfo}>
          {streakCount > 0 ? (
            <Text style={[styles.streakText, { color: colors.success }]}>
              🔥 {streakCount} month{streakCount !== 1 ? 's' : ''} paid in full
            </Text>
          ) : (
            <Text style={[styles.streakText, { color: colors.textMuted }]}>
              Start your streak!
            </Text>
          )}
        </View>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {Array.from({ length: maxStreak }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i < streakCount ? colors.success : colors.border,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      {bill.status !== 'paid' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={handleMarkPaidInFull}
          >
            <Text style={styles.actionButtonText}>Paid in Full</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryAction,
              { borderColor: colors.border },
            ]}
            onPress={handleMarkPaidPartial}
          >
            <Text style={[styles.actionButtonTextSecondary, { color: colors.textSecondary }]}>
              Partial Payment
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {bill.status === 'paid' && (
        <View style={[styles.paidBadge, { backgroundColor: colors.success + '15' }]}>
          <Text style={[styles.paidText, { color: colors.success }]}>
            ✓ Paid this month
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    ...tokens.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.md,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  cardIconText: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    marginBottom: tokens.spacing.xxs,
  },
  aprBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs,
    borderRadius: tokens.radius.sm,
  },
  aprText: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  interestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing.md,
    padding: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
  },
  interestLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  interestValue: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: tokens.spacing.md,
    paddingTop: tokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  streakInfo: {
    flex: 1,
  },
  streakText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  progressDots: {
    flexDirection: 'row',
    gap: tokens.spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actions: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.lg,
  },
  actionButton: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
  },
  secondaryAction: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
  actionButtonTextSecondary: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  paidBadge: {
    marginTop: tokens.spacing.md,
    padding: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
  },
  paidText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
});

export default CreditCardItem;
