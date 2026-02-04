import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface IncomeChangeAlertProps {
  changePercent: number;
  direction: 'increased' | 'decreased';
  onRebalance: () => void;
  onDismiss: () => void;
}

/**
 * Alert banner for income change notification
 */
export function IncomeChangeAlert({
  changePercent,
  direction,
  onRebalance,
  onDismiss,
}: IncomeChangeAlertProps) {
  const emoji = direction === 'increased' ? '📈' : '📉';
  const actionText = direction === 'increased'
    ? 'grow your savings'
    : 'adjust your spending';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Your income {direction} by {Math.round(changePercent)}%
          </Text>
          <Text style={styles.subtitle}>
            Want to rebalance to {actionText}?
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Later</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rebalanceButton} onPress={onRebalance}>
          <Text style={styles.rebalanceText}>Rebalance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#B45309',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  rebalanceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
  },
  rebalanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
