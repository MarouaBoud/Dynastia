/**
 * SpendingChartsScreen
 *
 * Displays spending visualization with multiple chart types.
 * Tabs: By Category | By Bucket | Trends
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Card } from '../../components/ui/Card';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { BucketBarChart } from '../../components/charts/BucketBarChart';
import { SpendingTrendChart } from '../../components/charts/SpendingTrendChart';
import {
  getMonthlySpendingSummary,
  getSpendingTrend,
  MonthlySpendingSummary,
  SpendingTrend,
} from '../../services/spending.service';
import { useBudget } from '../../contexts/BudgetContext';
import { format, subMonths, addMonths } from 'date-fns';
import { hapticLight } from '../../utils/haptics';

type TabType = 'category' | 'bucket' | 'trends';

export function SpendingChartsScreen() {
  const colors = useColors();
  const { state } = useBudget();
  const currentBudget = state.currentBudget;
  const progress = state.progress;

  const [activeTab, setActiveTab] = useState<TabType>('category');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [spendingSummary, setSpendingSummary] = useState<MonthlySpendingSummary | null>(null);
  const [trends, setTrends] = useState<SpendingTrend[]>([]);

  const month = selectedDate.getMonth();
  const year = selectedDate.getFullYear();

  useEffect(() => {
    loadData();
  }, [selectedDate, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'trends') {
        const trendData = await getSpendingTrend(6);
        setTrends(trendData);
      } else {
        const summary = await getMonthlySpendingSummary(month, year);
        setSpendingSummary(summary);
      }
    } catch (error) {
      console.error('Error loading spending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    hapticLight();
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    hapticLight();
    const next = addMonths(selectedDate, 1);
    if (next <= new Date()) {
      setSelectedDate(next);
    }
  };

  const handleTabChange = (tab: TabType) => {
    hapticLight();
    setActiveTab(tab);
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'category', label: 'By Category' },
    { key: 'bucket', label: 'By Bucket' },
    { key: 'trends', label: 'Trends' },
  ];

  // Get allocated amounts from budget progress
  const allocated = progress
    ? {
        savings: progress.buckets.savings.allocated,
        bills: progress.buckets.bills.allocated,
        lifestyle: progress.buckets.lifestyle.allocated,
      }
    : { savings: 0, bills: 0, lifestyle: 0 };

  // Get spent amounts from summary
  const spent = spendingSummary
    ? {
        savings: spendingSummary.byBucket.find((b) => b.bucket === 'savings')?.amount || 0,
        bills: spendingSummary.byBucket.find((b) => b.bucket === 'bills')?.amount || 0,
        lifestyle: spendingSummary.byBucket.find((b) => b.bucket === 'lifestyle')?.amount || 0,
      }
    : { savings: 0, bills: 0, lifestyle: 0 };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Month Selector (hidden for trends tab) */}
      {activeTab !== 'trends' && (
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthArrow}>
            <Text style={[styles.monthArrowText, { color: colors.primary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: colors.text }]}>
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity
            onPress={handleNextMonth}
            style={styles.monthArrow}
            disabled={addMonths(selectedDate, 1) > new Date()}
          >
            <Text
              style={[
                styles.monthArrowText,
                {
                  color:
                    addMonths(selectedDate, 1) > new Date()
                      ? colors.textMuted
                      : colors.primary,
                },
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.backgroundSecondary }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key
                ? { backgroundColor: colors.primary }
                : {},
            ]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key ? colors.textInverse : colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Content */}
      <Card style={styles.chartCard}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {activeTab === 'category' && spendingSummary && (
              <CategoryPieChart
                data={spendingSummary.byCategory}
                total={spendingSummary.total}
              />
            )}

            {activeTab === 'bucket' && (
              <BucketBarChart allocated={allocated} spent={spent} />
            )}

            {activeTab === 'trends' && <SpendingTrendChart data={trends} />}
          </>
        )}
      </Card>

      {/* Summary Stats */}
      {spendingSummary && activeTab !== 'trends' && (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Transactions
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {spendingSummary.transactionCount}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Categories
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {spendingSummary.byCategory.length}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Avg/transaction
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {spendingSummary.transactionCount > 0
                  ? `$${(spendingSummary.total / 100 / spendingSummary.transactionCount).toFixed(0)}`
                  : '$0'}
              </Text>
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: tokens.spacing.lg,
    paddingBottom: tokens.spacing.xxl * 2,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.spacing.lg,
  },
  monthArrow: {
    padding: tokens.spacing.md,
  },
  monthArrowText: {
    fontSize: 28,
    fontWeight: tokens.typography.weights.bold,
  },
  monthText: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
    minWidth: 150,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.xxs,
    marginBottom: tokens.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.radius.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    fontWeight: tokens.typography.weights.medium,
  },
  chartCard: {
    padding: tokens.spacing.lg,
    marginBottom: tokens.spacing.lg,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    padding: tokens.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: tokens.typography.sizes.bodySm.fontSize,
    marginBottom: tokens.spacing.xxs,
  },
  summaryValue: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
});

export default SpendingChartsScreen;
