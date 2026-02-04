import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useBudget } from '../../contexts/BudgetContext';
import { useAuth } from '../../contexts/AuthContext';
import { BucketCard } from '../../components/budget/BucketCard';
import { AllocationAdjustModal } from '../../components/budget/AllocationAdjustModal';
import { IncomeChangeAlert } from '../../components/budget/IncomeChangeAlert';

interface BudgetDashboardScreenProps {
  navigation: any;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Budget dashboard showing 3 buckets with progress
 */
export function BudgetDashboardScreen({ navigation }: BudgetDashboardScreenProps) {
  const {
    state,
    loadCurrentBudget,
    refreshProgress,
    updateAllocations,
    checkForRebalance,
    dismissRebalance,
  } = useBudget();
  const { user } = useAuth();
  const currency = user?.currency === 'USD' ? '$' : '€';

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      refreshProgress();
      checkForRebalance();
    }, [])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadCurrentBudget();
    await checkForRebalance();
    setIsRefreshing(false);
  };

  const handleAdjustAllocations = async (
    savings: number,
    bills: number,
    lifestyle: number
  ) => {
    try {
      await updateAllocations(savings, bills, lifestyle);
      setShowAdjustModal(false);
    } catch (error) {
      console.error('Failed to update allocations:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${currency}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Show setup CTA if no budget
  if (state.needsSetup && !state.isLoading) {
    return (
      <View style={styles.setupContainer}>
        <Text style={styles.setupEmoji}>📊</Text>
        <Text style={styles.setupTitle}>Set up your budget</Text>
        <Text style={styles.setupSubtitle}>
          Create a Pay Yourself First budget to take control of your money.
        </Text>
        <TouchableOpacity
          style={styles.setupButton}
          onPress={() => navigation.navigate('BudgetSetupIncome')}
        >
          <Text style={styles.setupButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (state.isLoading && !state.currentBudget) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const { currentBudget, progress } = state;

  if (!currentBudget || !progress) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.monthYear}>
            {MONTH_NAMES[currentBudget.month - 1]} {currentBudget.year}
          </Text>
          <Text style={styles.totalIncome}>
            {formatCurrency(progress.budget.totalIncome)} income
          </Text>
        </View>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => setShowAdjustModal(true)}
        >
          <Text style={styles.adjustButtonText}>Adjust</Text>
        </TouchableOpacity>
      </View>

      {/* Rebalance Alert */}
      {state.needsRebalance && state.rebalanceInfo && (
        <IncomeChangeAlert
          changePercent={state.rebalanceInfo.changePercent || 0}
          direction={state.rebalanceInfo.direction || 'increased'}
          onRebalance={() => setShowAdjustModal(true)}
          onDismiss={dismissRebalance}
        />
      )}

      {/* Budget Buckets */}
      <BucketCard
        name="Savings"
        displayName="Pay Yourself First"
        allocated={progress.buckets.savings.allocated}
        spent={progress.buckets.savings.spent}
        accentColor="#10B981"
        currency={currency}
      />

      <BucketCard
        name="Bills"
        displayName="Fixed Expenses"
        allocated={progress.buckets.bills.allocated}
        spent={progress.buckets.bills.spent}
        accentColor="#3B82F6"
        currency={currency}
        onPress={() => navigation.navigate('BillsList')}
      />

      <BucketCard
        name="Lifestyle"
        displayName="Enjoy Life"
        allocated={progress.buckets.lifestyle.allocated}
        spent={progress.buckets.lifestyle.spent}
        accentColor="#8B5CF6"
        currency={currency}
      />

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(progress.total.spent)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Remaining</Text>
          <Text
            style={[
              styles.summaryValue,
              progress.total.remaining < 0 && styles.summaryValueNegative,
            ]}
          >
            {formatCurrency(progress.total.remaining)}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SinkingFunds')}
        >
          <Text style={styles.actionEmoji}>🎯</Text>
          <Text style={styles.actionText}>Goals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreditCards')}
        >
          <Text style={styles.actionEmoji}>💳</Text>
          <Text style={styles.actionText}>Credit Cards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SpendingCharts')}
        >
          <Text style={styles.actionEmoji}>📊</Text>
          <Text style={styles.actionText}>Charts</Text>
        </TouchableOpacity>
      </View>

      {/* Allocation Adjust Modal */}
      <AllocationAdjustModal
        visible={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        onSave={handleAdjustAllocations}
        initialSavings={currentBudget.savingsPercent}
        initialBills={currentBudget.billsPercent}
        initialLifestyle={currentBudget.lifestylePercent}
        totalIncome={progress.budget.totalIncome}
        currency={currency}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  setupEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  setupSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  setupButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  setupButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthYear: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalIncome: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  adjustButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  adjustButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryValueNegative: {
    color: '#EF4444',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
