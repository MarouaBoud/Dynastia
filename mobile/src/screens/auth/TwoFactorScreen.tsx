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

export default function TwoFactorScreen() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { state, signIn, clear2FARequirement } = useAuth();

  useEffect(() => {
    // Auto-focus input when screen appears
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    // Auto-submit when 6 digits entered
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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code from your authenticator app
        </Text>

        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="000000"
          value={token}
          onChangeText={(text) => setToken(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading}
          autoComplete="one-time-code"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || token.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={loading}
        >
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 64,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
    backgroundColor: '#f9f9f9',
  },
  button: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
