/**
 * CategoryPieChart
 *
 * Displays spending breakdown by category as a pie chart.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { CategorySpending, CATEGORY_COLORS } from '../../services/spending.service';
import { MoneyText } from '../ui/MoneyText';

const screenWidth = Dimensions.get('window').width;

interface CategoryPieChartProps {
  data: CategorySpending[];
  total: number;
}

export function CategoryPieChart({ data, total }: CategoryPieChartProps) {
  const colors = useColors();

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No spending data for this month
        </Text>
      </View>
    );
  }

  // Transform data for react-native-chart-kit
  const chartData = data.slice(0, 6).map((item) => ({
    name: item.category,
    amount: item.amount / 100, // Convert cents to dollars for display
    color: item.color,
    legendFontColor: colors.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        width={screenWidth - tokens.spacing.lg * 2}
        height={200}
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
      />

      {/* Total in center overlay */}
      <View style={styles.totalOverlay}>
        <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total</Text>
        <MoneyText value={total} size="lg" />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.category} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendCategory, { color: colors.text }]}>
              {item.category}
            </Text>
            <Text style={[styles.legendPercentage, { color: colors.textMuted }]}>
              {item.percentage.toFixed(0)}%
            </Text>
          </View>
        ))}
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
  totalOverlay: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  legend: {
    marginTop: tokens.spacing.lg,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: tokens.spacing.sm,
  },
  legendCategory: {
    flex: 1,
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
  legendPercentage: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
});

export default CategoryPieChart;
