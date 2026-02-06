import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import TwoFactorScreen from '../screens/auth/TwoFactorScreen';

// Onboarding screens
import CountryDetectionScreen from '../screens/onboarding/CountryDetectionScreen';

// App screens
import HomeScreen from '../screens/app/HomeScreen';
import SecuritySettingsScreen from '../screens/app/SecuritySettingsScreen';
import TwoFactorSetupScreen from '../screens/auth/TwoFactorSetupScreen';

// Transaction screens
import { TransactionListScreen } from '../screens/transactions/TransactionListScreen';
import { AddTransactionScreen } from '../screens/transactions/AddTransactionScreen';
import { TransactionDetailScreen } from '../screens/transactions/TransactionDetailScreen';

// Net Worth screens
import { NetWorthDashboard } from '../screens/networth/NetWorthDashboard';
import { AddAssetScreen } from '../screens/networth/AddAssetScreen';
import { AddLiabilityScreen } from '../screens/networth/AddLiabilityScreen';
import { AssetDetailScreen } from '../screens/networth/AssetDetailScreen';
import { LiabilityDetailScreen } from '../screens/networth/LiabilityDetailScreen';

// Budget screens
import {
  BudgetSetupIncomeScreen,
  BudgetSetupAllocationScreen,
  BudgetDashboardScreen,
  BillsListScreen,
  AddBillScreen,
  BillDetailScreen,
  SinkingFundsScreen,
  AddSinkingFundScreen,
  SinkingFundDetailScreen,
  SpendingChartsScreen,
  CreditCardsScreen,
} from '../screens/budget';

// Habits screens
import { HabitsScreen } from '../screens/habits/HabitsScreen';

// Type definitions for navigation
export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Signup: undefined;
  TwoFactor: undefined;
  // Onboarding screens
  CountryDetection: undefined;
  // App screens
  Home: undefined;
  SecuritySettings: undefined;
  TwoFactorSetup: undefined;
  // Transaction screens
  TransactionList: undefined;
  AddTransaction: undefined;
  TransactionDetail: { transactionId: string };
  // Net Worth screens
  NetWorthDashboard: undefined;
  AddAsset: undefined;
  AddLiability: undefined;
  AssetDetail: { assetId: string };
  LiabilityDetail: { liabilityId: string };
  // Budget screens
  BudgetSetupIncome: undefined;
  BudgetSetupAllocation: undefined;
  BudgetDashboard: undefined;
  BillsList: undefined;
  AddBill: undefined;
  BillDetail: { billId: string };
  SinkingFunds: undefined;
  AddSinkingFund: undefined;
  SinkingFundDetail: { fundId: string };
  SpendingCharts: undefined;
  CreditCards: undefined;
  // Habits screens
  Habits: undefined;
  MoneyDate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator implements 4-state conditional navigation:
 * 1. Loading: Show splash screen while restoring token
 * 2. Unauthenticated: Show auth stack (Login, Signup) OR 2FA verification
 * 3. Onboarding: Show country detection for new users without country set
 * 4. Authenticated: Show app stack (Home, Settings, etc.)
 *
 * This pattern avoids manual navigation between auth/app stacks which causes errors.
 * State changes in AuthContext automatically trigger navigation.
 */
export default function RootNavigator() {
  const { state, user } = useAuth();

  // State 1: Loading - Restoring token from secure storage
  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {state.userToken === null ? (
        // User is NOT authenticated
        state.requires2FA ? (
          // State 2b: User needs to complete 2FA verification
          // Render 2FA screen directly (not in navigator) as intermediate state
          <TwoFactorScreen />
        ) : (
          // State 2a: User needs to log in or sign up
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Navigator>
        )
      ) : !user?.country ? (
        // State 3: User is authenticated but needs to complete onboarding
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="CountryDetection"
            component={CountryDetectionScreen}
          />
        </Stack.Navigator>
      ) : (
        // State 4: User is authenticated and onboarding complete - show app stack
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="TransactionList"
            component={TransactionListScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AddTransaction"
            component={AddTransactionScreen}
            options={{
              title: 'Add Transaction',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetailScreen}
            options={{
              title: 'Transaction Details',
            }}
          />
          <Stack.Screen
            name="NetWorthDashboard"
            component={NetWorthDashboard}
            options={{
              title: 'Net Worth',
            }}
          />
          <Stack.Screen
            name="AddAsset"
            component={AddAssetScreen}
            options={{
              title: 'Add Asset',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="AddLiability"
            component={AddLiabilityScreen}
            options={{
              title: 'Add Liability',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="AssetDetail"
            component={AssetDetailScreen}
            options={{
              title: 'Asset Details',
            }}
          />
          <Stack.Screen
            name="LiabilityDetail"
            component={LiabilityDetailScreen}
            options={{
              title: 'Liability Details',
            }}
          />
          <Stack.Screen
            name="SecuritySettings"
            component={SecuritySettingsScreen}
            options={{
              title: 'Security Settings',
            }}
          />
          <Stack.Screen
            name="TwoFactorSetup"
            component={TwoFactorSetupScreen}
            options={{
              title: 'Enable 2FA',
            }}
          />
          <Stack.Screen
            name="BudgetDashboard"
            component={BudgetDashboardScreen}
            options={{
              title: 'Budget',
            }}
          />
          <Stack.Screen
            name="BudgetSetupIncome"
            component={BudgetSetupIncomeScreen}
            options={{
              title: 'Set Up Budget',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="BudgetSetupAllocation"
            component={BudgetSetupAllocationScreen}
            options={{
              title: 'Choose Allocation',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="BillsList"
            component={BillsListScreen}
            options={{
              title: 'Your Bills',
            }}
          />
          <Stack.Screen
            name="AddBill"
            component={AddBillScreen}
            options={{
              title: 'Add a Bill',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="BillDetail"
            component={BillDetailScreen}
            options={{
              title: 'Bill Details',
            }}
          />
          <Stack.Screen
            name="SinkingFunds"
            component={SinkingFundsScreen}
            options={{
              title: 'Savings Goals',
            }}
          />
          <Stack.Screen
            name="AddSinkingFund"
            component={AddSinkingFundScreen}
            options={{
              title: 'Create a Savings Goal',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="SinkingFundDetail"
            component={SinkingFundDetailScreen}
            options={{
              title: 'Goal Details',
            }}
          />
          <Stack.Screen
            name="SpendingCharts"
            component={SpendingChartsScreen}
            options={{
              title: 'Spending Breakdown',
            }}
          />
          <Stack.Screen
            name="CreditCards"
            component={CreditCardsScreen}
            options={{
              title: 'Credit Cards',
            }}
          />
          <Stack.Screen
            name="Habits"
            component={HabitsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="MoneyDate"
            component={HabitsScreen}
            options={{
              title: 'Money Date',
              presentation: 'modal',
            }}
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
    backgroundColor: '#fff',
  },
});
