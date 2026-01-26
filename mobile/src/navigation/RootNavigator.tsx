import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import TwoFactorScreen from '../screens/auth/TwoFactorScreen';

// App screens
import HomeScreen from '../screens/app/HomeScreen';
import SecuritySettingsScreen from '../screens/app/SecuritySettingsScreen';
import TwoFactorSetupScreen from '../screens/auth/TwoFactorSetupScreen';

const Stack = createNativeStackNavigator();

/**
 * RootNavigator implements 3-state conditional navigation:
 * 1. Loading: Show splash screen while restoring token
 * 2. Unauthenticated: Show auth stack (Login, Signup) OR 2FA verification
 * 3. Authenticated: Show app stack (Home, Settings, etc.)
 *
 * This pattern avoids manual navigation between auth/app stacks which causes errors.
 * State changes in AuthContext automatically trigger navigation.
 */
export default function RootNavigator() {
  const { state } = useAuth();

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
      ) : (
        // State 3: User is authenticated - show app stack
        <Stack.Navigator
          screenOptions={{
            headerShown: true,
            headerBackTitleVisible: false,
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
