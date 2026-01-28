import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../../utils/currency';

interface NetWorthCardProps {
  netWorth: number; // in cents
  monthlyDelta: number; // in cents
  currency?: string;
  locale?: string;
}

export function NetWorthCard({
  netWorth,
  monthlyDelta,
  currency = 'USD',
  locale = 'en-US',
}: NetWorthCardProps) {
  const isPositive = monthlyDelta >= 0;
  const deltaColor = isPositive ? '#10b981' : '#ef4444'; // green-500 : red-500
  const deltaPrefix = isPositive ? '+' : '';
  const deltaText = `${deltaPrefix}${formatCurrency(Math.abs(monthlyDelta), currency, locale)} this month`;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>YOUR NET WORTH</Text>
      <Text style={styles.netWorth}>
        {formatCurrency(netWorth, currency, locale)}
      </Text>
      <Text style={[styles.delta, { color: deltaColor }]}>{deltaText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280', // gray-500
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  netWorth: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#111827', // gray-900
    marginBottom: 4,
  },
  delta: {
    fontSize: 16,
    fontWeight: '500',
  },
});
