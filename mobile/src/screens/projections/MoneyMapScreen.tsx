/**
 * MoneyMapScreen
 *
 * Visualizes financial journey: Today -> Foundation -> Growth -> Sovereignty
 * PLAN-02: Money Map showing progression.
 * FREE-01: Sovereignty countdown.
 * COACH-04: Future self projection with compounding visualization.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { MoneyMapTimeline } from '../../components/projections/MoneyMapTimeline';
import { AnimatedCounterFallback as AnimatedCounter } from '../../components/projections/AnimatedCounter';
import { FutureSelfProjection } from '../../components/projections/FutureSelfProjection';
import { Card } from '../../components/ui';
import { getFIProjection, FIProjection, formatMonthsToFI } from '../../services/projections.service';
import {
  getMilestones,
  calculateTierProgress,
  getCurrentTier,
  TIER_MILESTONES
} from '../../services/milestone.service';
import { useBudget } from '../../contexts/BudgetContext';

export function MoneyMapScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const spacing = theme.tokens.spacing;

  const { state: budgetState } = useBudget();
  const budget = budgetState.currentBudget;

  const [loading, setLoading] = useState(true);
  const [fiProjection, setFIProjection] = useState<FIProjection | null>(null);
  const [currentTier, setCurrentTier] = useState(1);
  const [tierProgress, setTierProgress] = useState<Record<number, { completed: number; total: number }>>({});

  useEffect(() => {
    loadData();
  }, [budget]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load milestones for tier progress
      const milestones = await getMilestones();
      const achievedIds = milestones.map(m => m.type);

      const tier = getCurrentTier(achievedIds);
      setCurrentTier(tier);

      // Calculate progress for each tier
      const progress: Record<number, { completed: number; total: number }> = {};
      for (let t = 1; t <= 4; t++) {
        const tierCalc = calculateTierProgress(t as 1 | 2 | 3 | 4, achievedIds);
        progress[t] = { completed: tierCalc.completed, total: tierCalc.total };
      }
      setTierProgress(progress);

      // Load FI projection if we have budget data
      if (budget) {
        const monthlyExpenses = Number(budget.billsAmount || 0) + Number(budget.lifestyleAmount || 0);
        const monthlySavings = Number(budget.savingsAmount || 0);

        const projection = await getFIProjection({
          monthlyExpenses,
          currentSavings: 0, // Would come from assets
          currentInvestments: 0, // Would come from assets
          monthlySavingsRate: monthlySavings
        });
        setFIProjection(projection);
      }
    } catch (error) {
      console.error('Failed to load Money Map data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get monthly contribution from budget
  const monthlyContribution = Number(budget?.savingsAmount || 500);
  const currentBalance = fiProjection?.currentNetWorth || 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>
          Your Money Map
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          From where you are to financial sovereignty
        </Text>

        {/* Timeline */}
        <View style={{ marginVertical: spacing.lg }}>
          <MoneyMapTimeline
            currentTier={currentTier}
            tierProgress={tierProgress}
          />
        </View>

        {/* Sovereignty Countdown (FREE-01) */}
        <Card style={{ padding: spacing.lg, marginBottom: spacing.md }}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            SOVEREIGNTY COUNTDOWN
          </Text>
          {fiProjection && isFinite(fiProjection.monthsToFI) ? (
            <>
              <View style={styles.countdownRow}>
                <AnimatedCounter
                  value={fiProjection.monthsToFI}
                  style={{ fontSize: 48, color: colors.primary }}
                />
                <Text style={[styles.countdownUnit, { color: colors.text }]}>
                  months
                </Text>
              </View>
              <Text style={[styles.fiLabel, { color: colors.textSecondary }]}>
                until financial independence
              </Text>
              <View style={[styles.progressBar, { backgroundColor: colors.backgroundSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width: `${Math.min(fiProjection.progressPercent, 100)}%`
                    }
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textMuted }]}>
                {fiProjection.progressPercent.toFixed(1)}% to your FI number
              </Text>
            </>
          ) : (
            <Text style={[styles.noData, { color: colors.textSecondary }]}>
              Add your income and expenses to see your countdown
            </Text>
          )}
        </Card>

        {/* Future Self Projection (COACH-04) */}
        <View style={{ marginBottom: spacing.md }}>
          <FutureSelfProjection
            currentBalance={currentBalance}
            monthlyContribution={monthlyContribution}
          />
        </View>

        {/* Current Stage Details */}
        <Card style={{ padding: spacing.lg }}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
            YOU ARE HERE
          </Text>
          <Text style={[styles.stageName, { color: colors.text }]}>
            {currentTier === 1 ? 'Foundation' :
             currentTier === 2 ? 'Stability' :
             currentTier === 3 ? 'Growth' : 'Sovereignty'}
          </Text>
          <Text style={[styles.stageDescription, { color: colors.textSecondary }]}>
            {currentTier === 1 ? 'Building your first safety cushion and financial habits' :
             currentTier === 2 ? 'Creating stability with 3+ months runway' :
             currentTier === 3 ? 'Growing your wealth through investments' :
             'Financial independence achieved'}
          </Text>

          {/* Tier milestones */}
          <View style={{ marginTop: spacing.md }}>
            {TIER_MILESTONES[currentTier as 1 | 2 | 3 | 4].map(milestone => {
              const isComplete = tierProgress[currentTier]?.completed > 0; // Simplified
              return (
                <View
                  key={milestone.id}
                  style={[styles.milestoneRow, { borderBottomColor: colors.border }]}
                >
                  <Text
                    style={{
                      color: isComplete ? colors.success : colors.textSecondary
                    }}
                  >
                    {milestone.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  countdownUnit: {
    fontSize: 20,
    fontWeight: '500',
    marginLeft: 8
  },
  fiLabel: {
    fontSize: 14,
    marginTop: 4
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right'
  },
  noData: {
    fontSize: 14,
    fontStyle: 'italic'
  },
  stageName: {
    fontSize: 24,
    fontWeight: '700'
  },
  stageDescription: {
    fontSize: 14,
    marginTop: 4
  },
  milestoneRow: {
    paddingVertical: 10,
    borderBottomWidth: 1
  }
});

export default MoneyMapScreen;
