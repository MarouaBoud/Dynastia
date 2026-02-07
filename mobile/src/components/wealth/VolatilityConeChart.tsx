/**
 * VolatilityConeChart
 *
 * Visualization showing probability bands, not single scary line.
 * WEALTH-05: Explain volatility with probability bands, not scary charts.
 *
 * Key design choices:
 * - Uses indigo/purple tones, NOT red (fear color)
 * - Shows "This is normal" prominently
 * - Historical context normalizes volatility
 * - Probability bands show range, not scary single line
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui';
import {
  calculateVolatilityCone,
  getConeLabels,
  VOLATILITY_CONTEXT
} from '../../utils/volatility';

interface VolatilityConeChartProps {
  initialAmount?: number;
  monthlyContribution?: number;
  years?: number;
  showContext?: boolean;
}

export function VolatilityConeChart({
  initialAmount = 10000,
  monthlyContribution = 500,
  years = 30,
  showContext = true
}: VolatilityConeChartProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const coneData = useMemo(
    () => calculateVolatilityCone(initialAmount, monthlyContribution, 0.07, 0.15, years),
    [initialAmount, monthlyContribution, years]
  );

  const labels = getConeLabels(coneData);
  const screenWidth = Dimensions.get('window').width - 48;

  // Sample data every 5 years for cleaner chart
  const sampledData = coneData.filter((_, i) => i % 5 === 0);

  // Calm indigo color - not fear-based red
  const calmIndigo = 'rgba(99, 102, 241, 1)';
  const calmIndigoLight = 'rgba(99, 102, 241, 0.3)';

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => colors.textSecondary,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: calmIndigo
    },
    propsForBackgroundLines: {
      strokeDasharray: '4, 4',
      stroke: colors.border
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Expected Range of Outcomes
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        80% of the time, your balance will fall within this range
      </Text>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels,
            datasets: [
              {
                data: sampledData.map(d => d.upper80),
                color: () => calmIndigoLight,
                strokeWidth: 2
              },
              {
                data: sampledData.map(d => d.median),
                color: () => calmIndigo,
                strokeWidth: 3
              },
              {
                data: sampledData.map(d => d.lower80),
                color: () => calmIndigoLight,
                strokeWidth: 2
              }
            ],
            legend: ['Upper 80%', 'Expected', 'Lower 80%']
          }}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          formatYLabel={(yValue: string) => {
            const value = parseFloat(yValue);
            if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `$${Math.round(value / 1000)}K`;
            return `$${value}`;
          }}
        />
      </View>

      {/* Legend explanation */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: calmIndigoLight }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Possible range
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: calmIndigo }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Expected path
          </Text>
        </View>
      </View>

      {/* Normalization message - KEY for WEALTH-05 */}
      <View style={[styles.normalizeBox, { backgroundColor: colors.backgroundSecondary }]}>
        <Text style={[styles.normalizeTitle, { color: colors.text }]}>
          This is normal.
        </Text>
        <Text style={[styles.normalizeText, { color: colors.textSecondary }]}>
          Short-term swings are the price of long-term growth. The wider the cone, the longer the timeline—and the higher the potential reward.
        </Text>
      </View>

      {/* Historical context */}
      {showContext && (
        <View style={styles.contextBox}>
          <Text style={[styles.contextTitle, { color: colors.textSecondary }]}>
            HISTORICAL CONTEXT
          </Text>
          <Text style={[styles.contextItem, { color: colors.text }]}>
            {'\u2022'} {VOLATILITY_CONTEXT.annualDropFrequency}
          </Text>
          <Text style={[styles.contextItem, { color: colors.text }]}>
            {'\u2022'} {VOLATILITY_CONTEXT.correctionFrequency}
          </Text>
          <Text style={[styles.contextItem, { color: colors.text }]}>
            {'\u2022'} {VOLATILITY_CONTEXT.recoveryNote}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '600'
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8
  },
  chart: {
    borderRadius: 8
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 2
  },
  legendText: {
    fontSize: 12
  },
  normalizeBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8
  },
  normalizeTitle: {
    fontSize: 16,
    fontWeight: '600'
  },
  normalizeText: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18
  },
  contextBox: {
    marginTop: 16
  },
  contextTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8
  },
  contextItem: {
    fontSize: 13,
    marginBottom: 4
  }
});

export default VolatilityConeChart;
