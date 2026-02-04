import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar } from './ProgressBar';

interface BucketCardProps {
  name: string;
  displayName: string;
  allocated: number;
  spent: number;
  accentColor: string;
  currency?: string;
  onPress?: () => void;
}

/**
 * Get status text based on spending
 */
function getStatusText(spent: number, allocated: number): { text: string; color: string } {
  if (allocated === 0) return { text: 'No allocation', color: '#6B7280' };

  const percent = (spent / allocated) * 100;

  if (percent < 90) {
    return { text: 'On track', color: '#10B981' };
  } else if (percent < 100) {
    return { text: 'Almost at your limit', color: '#F59E0B' };
  } else {
    return { text: "Let's adjust for next month", color: '#EF4444' };
  }
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string = '€'): string {
  return `${currency}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Budget bucket card with progress visualization
 */
export function BucketCard({
  name,
  displayName,
  allocated,
  spent,
  accentColor,
  currency = '€',
  onPress,
}: BucketCardProps) {
  const remaining = allocated - spent;
  const percentUsed = allocated > 0 ? (spent / allocated) * 100 : 0;
  const status = getStatusText(spent, allocated);

  const CardContent = (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.spentAmount}>{formatCurrency(spent, currency)}</Text>
          <Text style={styles.allocatedAmount}>of {formatCurrency(allocated, currency)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar progress={percentUsed} height={10} />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.text}
        </Text>
        <Text style={styles.remainingText}>
          {remaining >= 0 ? formatCurrency(remaining, currency) : `-${formatCurrency(Math.abs(remaining), currency)}`} remaining
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  displayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  name: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  spentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  allocatedAmount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
