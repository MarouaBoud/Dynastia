/**
 * AntiFeaturesBanner
 *
 * Reusable component explicitly stating what we DON'T teach.
 * WEALTH-06: Anti-features visible.
 *
 * These behaviors destroy wealth over time. We focus exclusively
 * on evidence-based strategies: diversification, low fees, and staying invested.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface AntiFeaturesBannerProps {
  style?: ViewStyle;
  variant?: 'full' | 'compact';
}

const ANTI_FEATURES = [
  {
    feature: 'Day trading',
    reason: 'speculation, not investing'
  },
  {
    feature: 'Stock picking',
    reason: 'unnecessary risk'
  },
  {
    feature: 'Market timing',
    reason: 'statistically loses money'
  }
];

export function AntiFeaturesBanner({
  style,
  variant = 'full'
}: AntiFeaturesBannerProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  if (variant === 'compact') {
    return (
      <View
        style={[
          styles.compactContainer,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          style
        ]}
      >
        <Text style={[styles.compactText, { color: colors.textSecondary }]}>
          No day trading. No stock picking. No gambling.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
        style
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{'}'}</Text>
        <Text style={[styles.title, { color: colors.text }]}>
          What we won't help you do
        </Text>
      </View>

      {ANTI_FEATURES.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <Text style={[styles.feature, { color: colors.text }]}>
            {'\u2022'} {item.feature}
          </Text>
          <Text style={[styles.reason, { color: colors.textMuted }]}>
            ({item.reason})
          </Text>
        </View>
      ))}

      <Text style={[styles.explanation, { color: colors.textSecondary }]}>
        These behaviors destroy wealth over time. We focus exclusively on evidence-based strategies: diversification, low fees, and staying invested.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  icon: {
    fontSize: 20,
    marginRight: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '600'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  feature: {
    fontSize: 14,
    fontWeight: '500'
  },
  reason: {
    fontSize: 13,
    marginLeft: 6
  },
  explanation: {
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18
  },
  compactContainer: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  compactText: {
    fontSize: 12,
    textAlign: 'center'
  }
});

export default AntiFeaturesBanner;
