/**
 * SignupScreen
 *
 * Account creation screen with name, email, and password fields.
 * Uses design system components for consistent styling.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';
import { useColors } from '../../theme';
import { tokens } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface SignupScreenProps {
  navigation: any;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter your email and a password.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Password Too Short', 'Please choose a password with at least 8 characters.');
      return;
    }

    // Password must contain both letters and numbers
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      Alert.alert(
        'Password Needs Variety',
        "Let's make your password stronger with a mix of letters and numbers."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await authService.signup(email, password, firstName, lastName);
      await signUp(response.accessToken, response.refreshToken, response.user);
    } catch (error: any) {
      console.error('Signup error:', error);
      const message =
        error.response?.status === 409
          ? 'That email is already registered. Try logging in instead.'
          : "We couldn't create your account right now. Please try again.";
      Alert.alert('Account Creation Issue', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Create Your Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Start building your financial sovereignty
          </Text>

          <Input
            label="First Name"
            placeholder="Your first name (optional)"
            value={firstName}
            onChangeText={setFirstName}
            autoComplete="given-name"
          />

          <Input
            label="Last Name"
            placeholder="Your last name (optional)"
            value={lastName}
            onChangeText={setLastName}
            autoComplete="family-name"
          />

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
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            helperText="At least 8 characters with letters and numbers"
          />

          <Button
            onPress={handleSignup}
            loading={loading}
            fullWidth
            style={styles.signupButton}
          >
            Create Account
          </Button>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.xl,
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
  signupButton: {
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
