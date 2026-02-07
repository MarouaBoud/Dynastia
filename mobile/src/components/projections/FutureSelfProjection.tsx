/**
 * FutureSelfProjection Component
 *
 * COACH-04: Compounding visualization showing projected net worth over 10/20/30 years.
 * Visually explains compound interest with year-by-year breakdown.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AnimatedCounterFallback as AnimatedCounter } from './AnimatedCounter';
import {
  calculateCompoundingProjection,
  CompoundingProjection
} from '../../services/projections.service';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface FutureSelfProjectionProps {
  currentBalance: number;
  monthlyContribution: number;
  annualReturnRate?: number;
}

type TimeHorizon = 10 | 20 | 30;

export function FutureSelfProjection({
  currentBalance,
  monthlyContribution,
  annualReturnRate = 0.07
}: FutureSelfProjectionProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const spacing = theme.tokens.spacing;
  const borderRadius = theme.tokens.radius;

  const [selectedYears, setSelectedYears] = useState<TimeHorizon>(20);

  // Calculate projections for all time horizons
  const projections = useMemo(() => {
    return calculateCompoundingProjection(
      currentBalance,
      monthlyContribution,
      annualReturnRate,
      30
    );
  }, [currentBalance, monthlyContribution, annualReturnRate]);

  // Get data for selected time horizon
  const selectedProjection = projections[selectedYears - 1];
  const maxBalance = projections[29]?.balance || 1;

  // Key milestone years for display
  const milestoneYears = [10, 20, 30] as const;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.lg,
          padding: spacing.lg
        }
      ]}
    >
      {/* Header */}
      <Text style={[styles.title, { color: colors.text }]}>
        Your Future Self
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        See how your money grows over time
      </Text>

      {/* Time horizon selector */}
      <View style={[styles.horizonSelector, { marginTop: spacing.md }]}>
        {milestoneYears.map((years) => (
          <TouchableOpacity
            key={years}
            style={[
              styles.horizonButton,
              {
                backgroundColor:
                  selectedYears === years
                    ? colors.primary
                    : colors.backgroundSecondary,
                borderRadius: borderRadius.md
              }
            ]}
            onPress={() => setSelectedYears(years)}
          >
            <Text
              style={[
                styles.horizonText,
                {
                  color:
                    selectedYears === years ? '#FFFFFF' : colors.textSecondary
                }
              ]}
            >
              {years} years
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Future balance display */}
      <View style={[styles.balanceContainer, { marginTop: spacing.lg }]}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>
          In {selectedYears} years, you could have
        </Text>
        <AnimatedCounter
          value={selectedProjection?.balance || 0}
          prefix="$"
          style={{ fontSize: 40, color: colors.primary, fontWeight: '700' }}
        />
      </View>

      {/* Breakdown: Contributions vs Growth */}
      <View style={[styles.breakdownContainer, { marginTop: spacing.lg }]}>
        {/* Contributions bar */}
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLabelContainer}>
            <View
              style={[
                styles.breakdownDot,
                { backgroundColor: colors.textSecondary }
              ]}
            />
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
              Your contributions
            </Text>
          </View>
          <Text style={[styles.breakdownValue, { color: colors.text }]}>
            ${(selectedProjection?.contributions || 0).toLocaleString()}
          </Text>
        </View>

        {/* Growth bar */}
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownLabelContainer}>
            <View
              style={[styles.breakdownDot, { backgroundColor: colors.success }]}
            />
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
              Compound growth
            </Text>
          </View>
          <Text style={[styles.breakdownValue, { color: colors.success }]}>
            +${(selectedProjection?.growth || 0).toLocaleString()}
          </Text>
        </View>

        {/* Visual bar chart */}
        <View style={[styles.barChart, { marginTop: spacing.sm }]}>
          <View
            style={[
              styles.contributionBar,
              {
                backgroundColor: colors.textSecondary,
                flex: selectedProjection?.contributions || 1
              }
            ]}
          />
          <View
            style={[
              styles.growthBar,
              {
                backgroundColor: colors.success,
                flex: selectedProjection?.growth || 0
              }
            ]}
          />
        </View>
      </View>

      {/* Compound interest explanation */}
      <View
        style={[
          styles.explanationBox,
          {
            backgroundColor: `${colors.primary}10`,
            borderRadius: borderRadius.md,
            marginTop: spacing.lg,
            padding: spacing.md
          }
        ]}
      >
        <Text style={[styles.explanationTitle, { color: colors.primary }]}>
          The magic of compounding
        </Text>
        <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
          Your money earns returns. Then those returns earn returns. Over{' '}
          {selectedYears} years, ${(selectedProjection?.growth || 0).toLocaleString()}{' '}
          of your total comes from growth alone - that's money you didn't have
          to work for.
        </Text>
      </View>

      {/* Year-by-year preview (last 5 years of selected range) */}
      <View style={{ marginTop: spacing.lg }}>
        <Text style={[styles.yearByYearTitle, { color: colors.text }]}>
          Year-by-year growth
        </Text>
        <View style={styles.yearByYearContainer}>
          {projections
            .filter((_, i) => {
              // Show years 1, selectedYears/2, and last 3 years
              const year = i + 1;
              return (
                year === 1 ||
                year === Math.floor(selectedYears / 2) ||
                year >= selectedYears - 2
              );
            })
            .slice(0, 5)
            .map((proj) => (
              <View key={proj.year} style={styles.yearItem}>
                <Text
                  style={[styles.yearLabel, { color: colors.textMuted }]}
                >
                  Year {proj.year}
                </Text>
                <Text style={[styles.yearValue, { color: colors.text }]}>
                  ${proj.balance.toLocaleString()}
                </Text>
              </View>
            ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  title: {
    fontSize: 20,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4
  },
  horizonSelector: {
    flexDirection: 'row',
    gap: 8
  },
  horizonButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  horizonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  balanceContainer: {
    alignItems: 'center'
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4
  },
  breakdownContainer: {},
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  breakdownLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  breakdownLabel: {
    fontSize: 13
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '600'
  },
  barChart: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden'
  },
  contributionBar: {
    height: '100%'
  },
  growthBar: {
    height: '100%'
  },
  explanationBox: {},
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 18
  },
  yearByYearTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12
  },
  yearByYearContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  yearItem: {
    alignItems: 'center'
  },
  yearLabel: {
    fontSize: 11
  },
  yearValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2
  }
});

export default FutureSelfProjection;
