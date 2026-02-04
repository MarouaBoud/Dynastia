/**
 * SpendingTrendChart
 *
 * Displays spending trends over multiple months as a line chart.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { SpendingTrend, BUCKET_COLORS } from '../../services/spending.service';
import { formatCurrency } from '../../utils/currency';

const screenWidth = Dimensions.get('window').width;

interface SpendingTrendChartProps {
  data: SpendingTrend[];
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const colors = useColors();

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Not enough data for trends
        </Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.total / 100),
        color: () => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: () => colors.textSecondary,
    style: {
      borderRadius: tokens.radius.md,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  // Calculate stats
  const totalSpent = data.reduce((sum, d) => sum + d.total, 0);
  const avgMonthly = totalSpent / data.length;
  const latestMonth = data[data.length - 1];
  const previousMonth = data.length > 1 ? data[data.length - 2] : null;
  const changePercent = previousMonth
    ? ((latestMonth.total - previousMonth.total) / previousMonth.total) * 100
    : 0;

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - tokens.spacing.lg * 2}
        height={200}
        chartConfig={chartConfig}
        bezier
        withInnerLines={false}
        withOuterLines={false}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix=""
      />

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Avg/month
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatCurrency(avgMonthly)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            This month
          </Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatCurrency(latestMonth.total)}
          </Text>
        </View>

        {previousMonth && (
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              vs last month
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: changePercent <= 0 ? colors.success : colors.warning },
              ]}
            >
              {changePercent > 0 ? '+' : ''}
              {changePercent.toFixed(0)}%
            </Text>
          </View>
        )}
      </View>

      {/* Bucket breakdown for latest month */}
      <View style={[styles.breakdown, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.breakdownTitle, { color: colors.textSecondary }]}>
          This month by bucket
        </Text>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownItem}>
            <View style={[styles.bucketDot, { backgroundColor: BUCKET_COLORS.savings }]} />
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>Savings</Text>
            <Text style={[styles.breakdownValue, { color: colors.textMuted }]}>
              {formatCurrency(latestMonth.savings)}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.bucketDot, { backgroundColor: BUCKET_COLORS.bills }]} />
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>Bills</Text>
            <Text style={[styles.breakdownValue, { color: colors.textMuted }]}>
              {formatCurrency(latestMonth.bills)}
            </Text>
          </View>
          <View style={styles.breakdownItem}>
            <View style={[styles.bucketDot, { backgroundColor: BUCKET_COLORS.lifestyle }]} />
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>Lifestyle</Text>
            <Text style={[styles.breakdownValue, { color: colors.textMuted }]}>
              {formatCurrency(latestMonth.lifestyle)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
  chart: {
    borderRadius: tokens.radius.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: tokens.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.xxs,
  },
  statValue: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
  breakdown: {
    width: '100%',
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  breakdownTitle: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  bucketDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: tokens.spacing.xxs,
  },
  breakdownLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  breakdownValue: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
});

export default SpendingTrendChart;
