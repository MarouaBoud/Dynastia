/**
 * BillItem Component
 *
 * Displays a single bill in a list with status indicator,
 * amount, and due date. Supports swipe-to-mark-paid gesture.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { MoneyText } from '../ui/MoneyText';
import {
  Bill,
  BillStatus,
  getBillCategoryIcon,
  getBillStatusColor,
  formatDueDate,
} from '../../services/bill.service';

// =============================================================================
// Types
// =============================================================================

interface BillItemProps {
  bill: Bill;
  onPress: () => void;
  onMarkPaid: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function BillItem({ bill, onPress, onMarkPaid }: BillItemProps) {
  const colors = useColors();
  const status = bill.status || 'upcoming';
  const statusColor = getBillStatusColor(status);

  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.swipeAction, { backgroundColor: colors.success }]}
      onPress={onMarkPaid}
    >
      <Text style={styles.swipeActionText}>Mark Paid</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderRightActions={status !== 'paid' ? renderRightActions : undefined}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.container, { backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Category Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={styles.iconText}>
            {getCategoryEmoji(bill.category)}
          </Text>
        </View>

        {/* Bill Info */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {bill.name}
            </Text>
            <MoneyText value={bill.amount} size="sm" />
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.dueInfo}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.dueText, { color: colors.textMuted }]}>
                {bill.daysUntilDue !== undefined
                  ? formatDueDate(bill.daysUntilDue)
                  : 'No due date'}
              </Text>
            </View>

            {bill.isCreditCard && (
              <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  Credit Card
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status indicator */}
        {status === 'paid' && (
          <View style={[styles.paidBadge, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.paidText, { color: colors.success }]}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Swipeable>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    housing: '🏠',
    utilities: '⚡',
    subscription: '🔄',
    insurance: '🛡️',
    other: '📄',
  };
  return emojis[category] || '📄';
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    marginLeft: tokens.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  name: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    flex: 1,
    marginRight: tokens.spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: tokens.spacing.xs,
  },
  dueText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  badge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs,
    borderRadius: tokens.radius.full,
  },
  badgeText: {
    fontSize: tokens.typography.sizes.caption.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  paidBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: tokens.spacing.sm,
  },
  paidText: {
    fontSize: 16,
    fontWeight: tokens.typography.weights.bold,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    marginBottom: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    marginRight: tokens.spacing.lg,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
});

export default BillItem;
