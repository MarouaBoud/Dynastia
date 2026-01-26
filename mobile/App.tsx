import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <RootNavigator />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
