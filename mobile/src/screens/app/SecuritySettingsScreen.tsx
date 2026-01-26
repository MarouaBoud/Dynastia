import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/auth.service';

interface SecuritySettingsScreenProps {
  navigation: any;
}

export default function SecuritySettingsScreen({ navigation }: SecuritySettingsScreenProps) {
  const { state } = useAuth();
  const [loading, setLoading] = useState(false);

  const has2FAEnabled = state.user?.has2FAEnabled || false;

  const handleEnable2FA = () => {
    navigation.navigate('TwoFactorSetup');
  };

  const handleDisable2FA = async () => {
    Alert.alert(
      'Disable Two-Factor Authentication',
      'Are you sure you want to turn off two-factor authentication? This will make your account less secure.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await authService.disable2FA();
              Alert.alert(
                'Success',
                'Two-factor authentication has been disabled. You can re-enable it anytime.'
              );
              // In a real app, you'd refresh the user profile here
            } catch (error) {
              console.error('Disable 2FA error:', error);
              Alert.alert(
                'Unable to Disable',
                "We couldn't disable two-factor authentication right now. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
          <Text style={styles.description}>
            Two-factor authentication adds an extra layer of protection to your financial
            sanctuary. When enabled, you'll need both your password and a code from your
            authenticator app to log in.
          </Text>

          {has2FAEnabled ? (
            <View style={styles.statusContainer}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusIcon}>✓</Text>
                <Text style={styles.statusText}>2FA is Active</Text>
              </View>
              <TouchableOpacity
                style={[styles.disableButton, loading && styles.buttonDisabled]}
                onPress={handleDisable2FA}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#DC3545" />
                ) : (
                  <Text style={styles.disableButtonText}>Disable 2FA</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.enableButton} onPress={handleEnable2FA}>
              <Text style={styles.enableButtonText}>Enable Two-Factor Authentication</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Two-Factor Authentication</Text>
          <Text style={styles.infoText}>
            • Requires a code from your authenticator app when logging in
          </Text>
          <Text style={styles.infoText}>
            • Works with Google Authenticator, Authy, and other TOTP apps
          </Text>
          <Text style={styles.infoText}>
            • Protects your account even if your password is compromised
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4EDDA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#155724',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
  },
  enableButton: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disableButton: {
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DC3545',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  disableButtonText: {
    color: '#DC3545',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 8,
  },
});
