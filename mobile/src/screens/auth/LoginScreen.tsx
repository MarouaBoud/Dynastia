import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
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

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
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
      // Check if user has existing token
      const existingToken = await storage.getAccessToken();
      const user = await storage.getUser();

      if (!existingToken || !user) {
        // No existing session, don't show biometric option
        return;
      }

      // Check if biometrics are enabled for this user
      const userId = (user as any).id;
      const isEnabled = await biometrics.isBiometricEnabled(userId);

      if (!isEnabled) {
        // Biometrics not enabled, don't show option
        return;
      }

      // Check device capability
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
        // Biometric authentication successful - restore session from SecureStore
        await restoreSession();
      } else {
        // Biometric authentication failed - show password form with emotionally safe message
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
        // User has 2FA enabled - show 2FA screen
        require2FA(response.tempUserId);
      } else if (response.accessToken && response.refreshToken && response.user) {
        // No 2FA - sign in directly
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to continue your wealth journey</Text>

        {showBiometric && biometricAvailable ? (
          // Show biometric unlock option
          <>
            <TouchableOpacity
              style={[styles.biometricButton, loading && styles.buttonDisabled]}
              onPress={handleBiometricUnlock}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <>
                  <Text style={styles.biometricIcon}>🔐</Text>
                  <Text style={styles.biometricButtonText}>
                    Unlock with {biometricType}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or use password</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.linkText}>New to Dynastia? Create your account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  biometricButton: {
    height: 56,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
  },
  biometricIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  biometricButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
});
