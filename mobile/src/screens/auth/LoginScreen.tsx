/**
 * LoginScreen
 *
 * Welcome back screen with email/password login and biometric unlock option.
 * Uses design system components for consistent styling.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';
import * as biometrics from '../../utils/biometrics';
import * as storage from '../../services/storage.service';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [showBiometric, setShowBiometric] = useState(false);
  const { signIn, require2FA, restoreSession } = useAuth();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const existingToken = await storage.getAccessToken();
      const user = await storage.getUser();

      if (!existingToken || !user) {
        return;
      }

      const userId = (user as any).id;
      const isEnabled = await biometrics.isBiometricEnabled(userId);

      if (!isEnabled) {
        return;
      }

      const capability = await biometrics.getBiometricCapability();

      if (capability.available && capability.types.length > 0) {
        setBiometricAvailable(true);
        setBiometricType(capability.types[0]);
        setShowBiometric(true);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const handleBiometricUnlock = async () => {
    setLoading(true);
    try {
      const success = await biometrics.authenticateWithBiometrics();

      if (success) {
        await restoreSession();
      } else {
        setShowBiometric(false);
        Alert.alert(
          'Alternative Login',
          "We couldn't verify your biometrics. Let's use your password instead."
        );
      }
    } catch (error) {
      console.error('Biometric unlock error:', error);
      setShowBiometric(false);
      Alert.alert(
        'Alternative Login',
        "We couldn't verify your biometrics. Let's use your password instead."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(email, password);

      if (response.requires2FA && response.tempUserId) {
        require2FA(response.tempUserId);
      } else if (response.accessToken && response.refreshToken && response.user) {
        await signIn(response.accessToken, response.refreshToken, response.user);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Issue',
        "We couldn't find that email and password combination. Let's try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Log in to continue your wealth journey
        </Text>

        {showBiometric && biometricAvailable ? (
          <>
            <TouchableOpacity
              style={[
                styles.biometricButton,
                {
                  backgroundColor: colors.primary + '10',
                  borderColor: colors.primary,
                },
                loading ? styles.buttonDisabled : {},
              ]}
              onPress={handleBiometricUnlock}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text style={styles.biometricIcon}>🔐</Text>
                  <Text style={[styles.biometricButtonText, { color: colors.primary }]}>
                    Unlock with {biometricType}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>
                or use password
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>
          </>
        ) : null}

        <Input
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <Button
          onPress={handleLogin}
          loading={loading}
          fullWidth
          style={styles.loginButton}
        >
          Continue
        </Button>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={[styles.linkText, { color: colors.primary }]}>
            New to Dynastia? Create your account
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
  title: {
    fontSize: tokens.typography.sizes.displayMd.fontSize,
    fontWeight: tokens.typography.weights.bold,
    marginBottom: tokens.spacing.xs,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    marginBottom: tokens.spacing.xl,
  },
  biometricButton: {
    height: 56,
    borderRadius: tokens.radius.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing.md,
    flexDirection: 'row',
  },
  biometricIcon: {
    fontSize: 24,
    marginRight: tokens.spacing.sm,
  },
  biometricButtonText: {
    fontSize: tokens.typography.sizes.bodyLg.fontSize,
    fontWeight: tokens.typography.weights.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: tokens.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: tokens.spacing.md,
    fontSize: tokens.typography.sizes.bodySm.fontSize,
  },
  loginButton: {
    marginTop: tokens.spacing.md,
  },
  linkButton: {
    marginTop: tokens.spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
});
