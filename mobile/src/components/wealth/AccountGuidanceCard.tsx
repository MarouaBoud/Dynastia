/**
 * AccountGuidanceCard Component
 *
 * Displays individual account guidance with priority badge, contribution limits,
 * and eligibility notes. Used in WealthPathScreen for country-specific account order.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { WealthAccount, formatCurrencyLimit } from '../../services/wealth.service';

// =============================================================================
// Types
// =============================================================================

export interface AccountGuidanceCardProps {
  account: WealthAccount;
  isChecked: boolean;
  onToggle: (id: string) => void;
  currency: string;
}

// =============================================================================
// Component
// =============================================================================

export function AccountGuidanceCard({
  account,
  isChecked,
  onToggle,
  currency,
}: AccountGuidanceCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          opacity: isChecked ? 0.7 : 1,
        },
      ]}
      onPress={() => onToggle(account.id)}
      activeOpacity={0.7}
    >
      {/* Header Row: Priority Badge + Checkbox */}
      <View style={styles.header}>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: colors.primaryLight || colors.primary + '20' },
          ]}
        >
          <Text style={[styles.priorityText, { color: colors.primary }]}>
            Step {account.priority}
          </Text>
        </View>

        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isChecked ? colors.success : 'transparent',
              borderColor: isChecked ? colors.success : colors.border,
            },
          ]}
        >
          {isChecked && (
            <Feather name="check" size={14} color="#fff" />
          )}
        </View>
      </View>

      {/* Account Name */}
      <Text style={[styles.accountName, { color: colors.text }]}>
        {account.name}
      </Text>

      {/* Description */}
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {account.description}
      </Text>

      {/* 2026 Limit Row */}
      <View style={styles.limitRow}>
        <Text style={[styles.limitLabel, { color: colors.textMuted }]}>
          2026 Limit:
        </Text>
        <Text style={[styles.limitValue, { color: colors.text }]}>
          {formatCurrencyLimit(account.limit2026, currency)}
        </Text>
      </View>

      {/* Eligibility Note (if present) */}
      {account.eligibilityNote && (
        <View style={styles.eligibilityRow}>
          <Feather
            name="info"
            size={12}
            color={colors.textMuted}
            style={styles.eligibilityIcon}
          />
          <Text style={[styles.eligibilityText, { color: colors.textMuted }]}>
            {account.eligibilityNote}
          </Text>
        </View>
      )}

      {/* Completion indicator */}
      {isChecked && (
        <View style={[styles.completedBadge, { backgroundColor: colors.success + '15' }]}>
          <Feather name="check-circle" size={14} color={colors.success} />
          <Text style={[styles.completedText, { color: colors.success }]}>
            Addressed
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    ...tokens.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs,
    borderRadius: tokens.radius.full,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: tokens.spacing.xs,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: tokens.spacing.md,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing.xs,
  },
  limitLabel: {
    fontSize: 13,
    marginRight: tokens.spacing.xs,
  },
  limitValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: tokens.spacing.sm,
    paddingTop: tokens.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  eligibilityIcon: {
    marginRight: tokens.spacing.xs,
    marginTop: 2,
  },
  eligibilityText: {
    flex: 1,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xxs,
    borderRadius: tokens.radius.full,
    marginTop: tokens.spacing.sm,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: tokens.spacing.xs,
  },
});

export default AccountGuidanceCard;
