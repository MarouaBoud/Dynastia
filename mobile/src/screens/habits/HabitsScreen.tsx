/**
 * Habits Screen
 *
 * Main dashboard for habit tracking with:
 * - Current streak display
 * - Contribution grid visualization (HABIT-03)
 * - Money Date quick access
 * - Next step recommendation (HABIT-04)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { useHabits } from '../../contexts/HabitContext';
import { useBudget } from '../../contexts/BudgetContext';
import { ContributionGrid, ContributionLegend } from '../../components/habits/ContributionGrid';
import { NextStepCard, determineNextStep, NextStepType } from '../../components/habits/NextStepCard';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HabitsScreen() {
  const colors = useColors();
  const navigation = useNavigation<NavigationProp>();
  const {
    currentStreak,
    longestStreak,
    gridData,
    totalCheckIns,
    completedThisWeek,
    streakMessage,
    isLoading,
    refreshStreak,
    refreshCheckIns,
  } = useHabits();

  const { state: budgetState } = useBudget();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshStreak(), refreshCheckIns()]);
    setRefreshing(false);
  };

  // Determine next step
  const nextStep: NextStepType = determineNextStep({
    hasBudget: !!budgetState.currentBudget,
    completedMoneyDateThisWeek: completedThisWeek,
    hasPendingCreditCard: false, // TODO: Get from BillContext
    emergencyFundProgress: 0, // TODO: Calculate from assets
    hasSinkingFund: false, // TODO: Get from SinkingFund
    hasAutomatedSavings: false, // TODO: Track this
  });

  const handleNextStepAction = () => {
    switch (nextStep) {
      case 'create_budget':
        navigation.navigate('BudgetSetupIncome');
        break;
      case 'complete_money_date':
        navigation.navigate('MoneyDate');
        break;
      case 'pay_credit_card':
        navigation.navigate('CreditCards');
        break;
      case 'review_spending':
        navigation.navigate('SpendingCharts');
        break;
      case 'create_sinking_fund':
        navigation.navigate('AddSinkingFund');
        break;
      default:
        navigation.navigate('BudgetDashboard');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Your Habits</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Build wealth one week at a time
            </Text>
          </View>
        </View>

        {/* Streak Card */}
        <View style={[styles.streakCard, { backgroundColor: colors.card }]}>
          <View style={styles.streakMain}>
            <View style={[styles.streakBadge, { backgroundColor: colors.primaryLight }]}>
              <Feather name="zap" size={24} color={colors.primary} />
            </View>
            <View style={styles.streakInfo}>
              <Text style={[styles.streakNumber, { color: colors.text }]}>
                {currentStreak}
              </Text>
              <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
                week streak
              </Text>
            </View>
          </View>

          <View style={styles.streakStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                longest
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {totalCheckIns}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                total
              </Text>
            </View>
          </View>

          {streakMessage && (
            <Text style={[styles.streakMessage, { color: colors.textSecondary }]}>
              {streakMessage}
            </Text>
          )}
        </View>

        {/* Money Date CTA */}
        <TouchableOpacity
          style={[
            styles.moneyDateButton,
            {
              backgroundColor: completedThisWeek ? colors.card : colors.primary,
            },
          ]}
          onPress={() => navigation.navigate('MoneyDate')}
          activeOpacity={0.8}
        >
          <View style={styles.moneyDateContent}>
            <Feather
              name={completedThisWeek ? 'check-circle' : 'calendar'}
              size={24}
              color={completedThisWeek ? colors.success : '#fff'}
            />
            <View style={styles.moneyDateText}>
              <Text
                style={[
                  styles.moneyDateTitle,
                  { color: completedThisWeek ? colors.text : '#fff' },
                ]}
              >
                {completedThisWeek ? 'Money Date Complete' : "Start Your Money Date"}
              </Text>
              <Text
                style={[
                  styles.moneyDateSubtitle,
                  { color: completedThisWeek ? colors.textSecondary : 'rgba(255,255,255,0.8)' },
                ]}
              >
                {completedThisWeek
                  ? 'Great job! See you next week.'
                  : 'Your weekly 10-minute check-in'}
              </Text>
            </View>
          </View>
          <Feather
            name="chevron-right"
            size={24}
            color={completedThisWeek ? colors.textSecondary : '#fff'}
          />
        </TouchableOpacity>

        {/* Next Step Card */}
        {!completedThisWeek && (
          <View style={styles.nextStepContainer}>
            <NextStepCard stepType={nextStep} onAction={handleNextStepAction} />
          </View>
        )}

        {/* Contribution Grid */}
        <View style={[styles.gridCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.gridTitle, { color: colors.text }]}>
            Check-in History
          </Text>
          <Text style={[styles.gridSubtitle, { color: colors.textSecondary }]}>
            Last 90 days
          </Text>

          <View style={styles.gridContainer}>
            <ContributionGrid data={gridData} days={90} />
          </View>

          <ContributionLegend />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  streakCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
  },
  streakLabel: {
    fontSize: 14,
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 16,
  },
  streakMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  moneyDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  moneyDateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moneyDateText: {
    marginLeft: 12,
    flex: 1,
  },
  moneyDateTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  moneyDateSubtitle: {
    fontSize: 14,
  },
  nextStepContainer: {
    marginBottom: 16,
  },
  gridCard: {
    borderRadius: 16,
    padding: 20,
  },
  gridTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  gridContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default HabitsScreen;
