import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useColors } from '../theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import TwoFactorScreen from '../screens/auth/TwoFactorScreen';
import TwoFactorSetupScreen from '../screens/auth/TwoFactorSetupScreen';

// Onboarding screens
import MoneyBlueprintScreen from '../screens/onboarding/MoneyBlueprintScreen';

// Main app screens
import HomeScreen from '../screens/HomeScreen';

// Net Worth screens (named exports)
import { NetWorthDashboard } from '../screens/networth/NetWorthDashboard';
import { AddAssetScreen } from '../screens/networth/AddAssetScreen';
import { AddLiabilityScreen } from '../screens/networth/AddLiabilityScreen';
import { AssetDetailScreen } from '../screens/networth/AssetDetailScreen';
import { LiabilityDetailScreen } from '../screens/networth/LiabilityDetailScreen';

// Settings screens
import SecuritySettingsScreen from '../screens/app/SecuritySettingsScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import CountrySettingsScreen from '../screens/settings/CountrySettingsScreen';

// Budget screens (named exports)
import { BudgetDashboardScreen } from '../screens/budget/BudgetDashboardScreen';
import { BudgetSetupIncomeScreen } from '../screens/budget/BudgetSetupIncomeScreen';
import { BudgetSetupAllocationScreen } from '../screens/budget/BudgetSetupAllocationScreen';
import { BillsListScreen } from '../screens/budget/BillsListScreen';
import { AddBillScreen } from '../screens/budget/AddBillScreen';
import { BillDetailScreen } from '../screens/budget/BillDetailScreen';
import { SinkingFundsScreen } from '../screens/budget/SinkingFundsScreen';
import { AddSinkingFundScreen } from '../screens/budget/AddSinkingFundScreen';
import { SinkingFundDetailScreen } from '../screens/budget/SinkingFundDetailScreen';
import { SpendingChartsScreen } from '../screens/budget/SpendingChartsScreen';
import { CreditCardsScreen } from '../screens/budget/CreditCardsScreen';

// Habits screens
import { HabitsScreen } from '../screens/habits/HabitsScreen';
import { MoneyDateScreen } from '../screens/habits/MoneyDateScreen';

// Milestone screens
import { SovereigntyLadderScreen } from '../screens/milestones/SovereigntyLadderScreen';
import { MilestoneHistoryScreen } from '../screens/milestones/MilestoneHistoryScreen';

// Projections screens
import { MoneyMapScreen } from '../screens/projections/MoneyMapScreen';
import { ScenarioScreen } from '../screens/projections/ScenarioScreen';

// Wealth screens
import { WealthPathScreen } from '../screens/wealth/WealthPathScreen';
import { InvestingLearnScreen } from '../screens/wealth/InvestingLearnScreen';

// Navigation types
export type RootStackParamList = {
  // Auth
  Login: undefined;
  Signup: undefined;
  TwoFactor: { userId: string };
  TwoFactorSetup: undefined;

  // Onboarding
  MoneyBlueprint: undefined;

  // Main
  Home: undefined;
  MoneyDate: undefined;
  Habits: undefined;

  // Journey / Milestones
  SovereigntyLadder: undefined;
  MilestoneHistory: undefined;

  // Budget
  BudgetDashboard: undefined;
  BudgetSetupIncome: undefined;
  BudgetSetupAllocation: undefined;
  SpendingCharts: undefined;

  // Bills
  BillsList: undefined;
  AddBill: undefined;
  BillDetail: { billId: string };

  // Sinking Funds
  SinkingFunds: undefined;
  AddSinkingFund: undefined;
  SinkingFundDetail: { fundId: string };

  // Credit Cards
  CreditCards: undefined;

  // Net Worth
  NetWorthDashboard: undefined;
  AddAsset: undefined;
  AddLiability: undefined;
  AssetDetail: { assetId: string };
  LiabilityDetail: { liabilityId: string };

  // Wealth / Investing
  WealthPath: undefined;
  InvestingLearn: undefined;

  // Projections
  MoneyMap: undefined;
  Scenario: undefined;

  // Settings
  NotificationSettings: undefined;
  CountrySettings: undefined;
  SecuritySettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { state, user } = useAuth();
  const colors = useColors();

  // Show loading spinner while checking auth state
  if (state.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        // State 1: Not authenticated - show auth stack
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
        </Stack.Navigator>
      ) : !user?.country ? (
        // State 2: Authenticated but needs onboarding
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MoneyBlueprint" component={MoneyBlueprintScreen} />
        </Stack.Navigator>
      ) : (
        // State 3: Authenticated and onboarded - show main app
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        >
          {/* Home - The Hero Dashboard */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          {/* Money Date - THE Hero Feature */}
          <Stack.Screen
            name="MoneyDate"
            component={MoneyDateScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />

          {/* Journey / Milestones */}
          <Stack.Screen
            name="SovereigntyLadder"
            component={SovereigntyLadderScreen}
            options={{ title: 'Your Journey' }}
          />
          <Stack.Screen
            name="MilestoneHistory"
            component={MilestoneHistoryScreen}
            options={{ title: 'Achievements' }}
          />

          {/* Habits */}
          <Stack.Screen
            name="Habits"
            component={HabitsScreen}
            options={{ headerShown: false }}
          />

          {/* Budget - Progressive unlock */}
          <Stack.Screen
            name="BudgetDashboard"
            component={BudgetDashboardScreen}
            options={{ title: 'Budget' }}
          />
          <Stack.Screen
            name="BudgetSetupIncome"
            component={BudgetSetupIncomeScreen}
            options={{ title: 'Set Up Budget', presentation: 'modal' }}
          />
          <Stack.Screen
            name="BudgetSetupAllocation"
            component={BudgetSetupAllocationScreen}
            options={{ title: 'Choose Allocation', presentation: 'modal' }}
          />
          <Stack.Screen
            name="SpendingCharts"
            component={SpendingChartsScreen}
            options={{ title: 'Spending Breakdown' }}
          />

          {/* Bills - Tier 3 */}
          <Stack.Screen
            name="BillsList"
            component={BillsListScreen}
            options={{ title: 'Your Bills' }}
          />
          <Stack.Screen
            name="AddBill"
            component={AddBillScreen}
            options={{ title: 'Add a Bill', presentation: 'modal' }}
          />
          <Stack.Screen
            name="BillDetail"
            component={BillDetailScreen}
            options={{ title: 'Bill Details' }}
          />

          {/* Sinking Funds - Tier 3 */}
          <Stack.Screen
            name="SinkingFunds"
            component={SinkingFundsScreen}
            options={{ title: 'Savings Goals' }}
          />
          <Stack.Screen
            name="AddSinkingFund"
            component={AddSinkingFundScreen}
            options={{ title: 'Create a Goal', presentation: 'modal' }}
          />
          <Stack.Screen
            name="SinkingFundDetail"
            component={SinkingFundDetailScreen}
            options={{ title: 'Goal Details' }}
          />

          {/* Credit Cards - Tier 2 (if user has debt) */}
          <Stack.Screen
            name="CreditCards"
            component={CreditCardsScreen}
            options={{ title: 'Credit Cards' }}
          />

          {/* Net Worth - Tier 4 */}
          <Stack.Screen
            name="NetWorthDashboard"
            component={NetWorthDashboard}
            options={{ title: 'Net Worth' }}
          />
          <Stack.Screen
            name="AddAsset"
            component={AddAssetScreen}
            options={{ title: 'Add Asset', presentation: 'modal' }}
          />
          <Stack.Screen
            name="AddLiability"
            component={AddLiabilityScreen}
            options={{ title: 'Add Liability', presentation: 'modal' }}
          />
          <Stack.Screen
            name="AssetDetail"
            component={AssetDetailScreen}
            options={{ title: 'Asset Details' }}
          />
          <Stack.Screen
            name="LiabilityDetail"
            component={LiabilityDetailScreen}
            options={{ title: 'Liability Details' }}
          />

          {/* Wealth / Investing - Tier 4 */}
          <Stack.Screen
            name="WealthPath"
            component={WealthPathScreen}
            options={{ title: 'Build Wealth' }}
          />
          <Stack.Screen
            name="InvestingLearn"
            component={InvestingLearnScreen}
            options={{ title: 'Learn to Invest' }}
          />

          {/* Projections - Tier 5 */}
          <Stack.Screen
            name="MoneyMap"
            component={MoneyMapScreen}
            options={{ title: 'Money Map' }}
          />
          <Stack.Screen
            name="Scenario"
            component={ScenarioScreen}
            options={{ title: 'What If?' }}
          />

          {/* Settings */}
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
            options={{ title: 'Notifications' }}
          />
          <Stack.Screen
            name="CountrySettings"
            component={CountrySettingsScreen}
            options={{ title: 'Country Settings' }}
          />
          <Stack.Screen
            name="SecuritySettings"
            component={SecuritySettingsScreen}
            options={{ title: 'Security' }}
          />
          <Stack.Screen
            name="TwoFactorSetup"
            component={TwoFactorSetupScreen}
            options={{ title: 'Enable 2FA' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
