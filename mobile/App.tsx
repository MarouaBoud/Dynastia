import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { BudgetProvider } from './src/contexts/BudgetContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BudgetProvider>
          <View style={styles.container}>
            <StatusBar style="auto" />
            <RootNavigator />
          </View>
        </BudgetProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
