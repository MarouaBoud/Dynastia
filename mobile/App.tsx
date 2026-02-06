import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { BudgetProvider } from './src/contexts/BudgetContext';
import { HabitProvider } from './src/contexts/HabitContext';
import { ThemeProvider, useColors, useIsDarkMode } from './src/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';

function AppContent() {
  const colors = useColors();
  const isDark = useIsDarkMode();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BudgetProvider>
            <HabitProvider>
              <AppContent />
            </HabitProvider>
          </BudgetProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
