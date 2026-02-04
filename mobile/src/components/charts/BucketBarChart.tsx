/**
 * BucketBarChart
 *
 * Displays budget allocation vs actual spending by bucket.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { BUCKET_COLORS } from '../../services/spending.service';
import { formatCurrency } from '../../utils/currency';

const screenWidth = Dimensions.get('window').width;

interface BucketBarChartProps {
  allocated: { savings: number; bills: number; lifestyle: number };
  spent: { savings: number; bills: number; lifestyle: number };
}

export function BucketBarChart({ allocated, spent }: BucketBarChartProps) {
  const colors = useColors();

  const data = {
    labels: ['Savings', 'Bills', 'Lifestyle'],
    datasets: [
      {
        data: [
          allocated.savings / 100,
          allocated.bills / 100,
          allocated.lifestyle / 100,
        ],
        color: () => colors.primary + '60', // Allocated (lighter)
      },
      {
        data: [
          spent.savings / 100,
          spent.bills / 100,
          spent.lifestyle / 100,
        ],
        color: () => colors.primary, // Spent (darker)
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
    barPercentage: 0.6,
  };

  // Calculate totals for summary
  const allocatedTotal = allocated.savings + allocated.bills + allocated.lifestyle;
  const spentTotal = spent.savings + spent.bills + spent.lifestyle;
  const remaining = allocatedTotal - spentTotal;

  return (
    <View style={styles.container}>
      <BarChart
        data={data}
        width={screenWidth - tokens.spacing.lg * 2}
        height={220}
        chartConfig={chartConfig}
        fromZero
        showValuesOnTopOfBars
        withInnerLines={false}
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix=""
      />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: colors.primary + '60' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Allocated
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Spent
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Budget
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(allocatedTotal)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Spent
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(spentTotal)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
            Remaining
          </Text>
          <Text
            style={[
              styles.summaryValue,
              { color: remaining >= 0 ? colors.success : colors.error },
            ]}
          >
            {formatCurrency(remaining)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: tokens.radius.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: tokens.spacing.xl,
    marginTop: tokens.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  },
  legendBar: {
    width: 16,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  summary: {
    width: '100%',
    marginTop: tokens.spacing.lg,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: tokens.spacing.xs,
  },
  summaryLabel: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
  summaryValue: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
});

export default BucketBarChart;
