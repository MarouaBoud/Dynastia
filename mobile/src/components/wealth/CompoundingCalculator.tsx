/**
 * Compounding Calculator
 *
 * Interactive calculator showing compound growth over time.
 * Uses sliders for monthly contribution and years.
 * Implements WEALTH-02 (compounding visualization).
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui';

interface CompoundingCalculatorProps {
  initialBalance?: number;
  initialContribution?: number;
}

export function CompoundingCalculator({
  initialBalance = 0,
  initialContribution = 500
}: CompoundingCalculatorProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const [monthlyContribution, setMonthlyContribution] = useState(initialContribution);
  const [years, setYears] = useState(20);
  const annualReturn = 7; // Conservative default (7% annual return)

  const projection = useMemo(() => {
    const monthlyRate = annualReturn / 100 / 12;
    const months = years * 12;

    // Future value calculation with monthly contributions
    let futureValue = initialBalance;
    for (let i = 0; i < months; i++) {
      futureValue = (futureValue + monthlyContribution) * (1 + monthlyRate);
    }

    const totalContributed = initialBalance + (monthlyContribution * months);
    const totalGrowth = futureValue - totalContributed;

    return {
      futureValue: Math.round(futureValue),
      totalContributed: Math.round(totalContributed),
      totalGrowth: Math.round(totalGrowth),
      growthPercent: totalContributed > 0
        ? Math.round((totalGrowth / totalContributed) * 100)
        : 0
    };
  }, [initialBalance, monthlyContribution, years, annualReturn]);

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString()}`;

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Compounding Calculator
      </Text>

      {/* Monthly contribution slider */}
      <View style={styles.sliderRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Monthly Investment
        </Text>
        <Text style={[styles.value, { color: colors.primary }]}>
          ${monthlyContribution}/mo
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={100}
        maximumValue={2000}
        step={50}
        value={monthlyContribution}
        onValueChange={setMonthlyContribution}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />

      {/* Years slider */}
      <View style={styles.sliderRow}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Time Horizon
        </Text>
        <Text style={[styles.value, { color: colors.primary }]}>
          {years} years
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={5}
        maximumValue={40}
        step={1}
        value={years}
        onValueChange={setYears}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />

      {/* Results */}
      <View style={[styles.resultsBox, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.resultRow}>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
            You Contribute
          </Text>
          <Text style={[styles.resultValue, { color: colors.text }]}>
            {formatCurrency(projection.totalContributed)}
          </Text>
        </View>

        <View style={styles.resultRow}>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
            Growth (at {annualReturn}% avg)
          </Text>
          <Text style={[styles.resultValue, { color: colors.success }]}>
            +{formatCurrency(projection.totalGrowth)}
          </Text>
        </View>

        <View style={[styles.resultRow, styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>
            Total Value
          </Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            {formatCurrency(projection.futureValue)}
          </Text>
        </View>
      </View>

      <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
        Assumes {annualReturn}% annual return (conservative estimate). Past performance doesn't guarantee future results.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  label: {
    fontSize: 14
  },
  value: {
    fontSize: 16,
    fontWeight: '600'
  },
  slider: {
    width: '100%',
    height: 40
  },
  resultsBox: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  resultLabel: {
    fontSize: 14
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500'
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 0
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600'
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700'
  },
  disclaimer: {
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center'
  }
});

export default CompoundingCalculator;
