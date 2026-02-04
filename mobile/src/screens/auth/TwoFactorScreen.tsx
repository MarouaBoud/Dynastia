/**
 * TwoFactorScreen
 *
 * 2FA verification screen with 6-digit code input.
 * Auto-submits when all digits are entered.
 * Uses design system components for consistent styling.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';

export default function TwoFactorScreen() {
  const colors = useColors();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { state, signIn, clear2FARequirement } = useAuth();

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (token.length === 6) {
      handleVerify();
    }
  }, [token]);

  const handleVerify = async () => {
    if (token.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit code.');
      return;
    }

    if (!state.tempUserId) {
      Alert.alert('Error', 'No user ID found. Please try logging in again.');
      clear2FARequirement();
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verify2FA(state.tempUserId, token);
      await signIn(response.accessToken, response.refreshToken, response.user);
    } catch (error: any) {
      console.error('2FA verification error:', error);
      Alert.alert('Code Not Recognized', "That code didn't match. Let's try again.");
      setToken('');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    clear2FARequirement();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Two-Factor Authentication
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter the 6-digit code from your authenticator app
        </Text>

        <TextInput
          ref={inputRef}
          style={[
            styles.codeInput,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.primary,
              color: colors.text,
            },
          ]}
          placeholder="000000"
          placeholderTextColor={colors.textMuted}
          value={token}
          onChangeText={(text) => setToken(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
          autoComplete="one-time-code"
        />

        <Button
          onPress={handleVerify}
          loading={loading}
          disabled={token.length !== 6}
          fullWidth
        >
          Verify
        </Button>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={loading}
        >
          <Text style={[styles.backText, { color: colors.primary }]}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    fontSize: tokens.typography.sizes.headingLg.fontSize,
    fontWeight: tokens.typography.weights.bold,
    marginBottom: tokens.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
    marginBottom: tokens.spacing.xl,
    textAlign: 'center',
  },
  codeInput: {
    height: 64,
    borderWidth: 2,
    borderRadius: tokens.radius.md,
    paddingHorizontal: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: tokens.typography.weights.semibold,
  },
  backButton: {
    marginTop: tokens.spacing.lg,
    alignItems: 'center',
  },
  backText: {
    fontSize: tokens.typography.sizes.bodyMd.fontSize,
  },
});
