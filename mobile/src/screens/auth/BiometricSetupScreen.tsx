import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as biometrics from '../../utils/biometrics';

/**
 * BiometricSetupScreen allows users to enable/disable biometric unlock.
 *
 * Flow:
 * 1. Check device capability on mount
 * 2. If unavailable: Show supportive message (no shame)
 * 3. If available: Show biometric types and toggle
 * 4. On enable: Store flag in SecureStore
 * 5. On disable: Remove flag from SecureStore
 *
 * All copy uses emotionally safe language.
 * Research: Lines 646-672 (BiometricSetupScreen example)
 */

interface BiometricSetupScreenProps {
  navigation: any;
}

export default function BiometricSetupScreen({ navigation }: BiometricSetupScreenProps) {
  const { state } = useAuth();
  const [loading, setLoading] = useState(true);
  const [capability, setCapability] = useState<{ available: boolean; types: string[] }>({
    available: false,
    types: [],
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
  }, []);

  const checkBiometricStatus = async () => {
    setLoading(true);
    try {
      // Check device capability
      const cap = await biometrics.getBiometricCapability();
      setCapability(cap);

      // Check if currently enabled for this user
      if (cap.available && state.user?.id) {
        const enabled = await biometrics.isBiometricEnabled(state.user.id);
        setIsEnabled(enabled);
      }
    } catch (error) {
      console.error('Error checking biometric status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (value: boolean) => {
    if (!state.user?.id) return;

    setToggling(true);
    try {
      if (value) {
        // Enable biometrics
        const success = await biometrics.setupBiometrics(state.user.id);
        if (success) {
          setIsEnabled(true);
          Alert.alert(
            'Biometric Unlock Enabled',
            'Next time, you can access your financial sanctuary with just a tap.'
          );
        } else {
          Alert.alert(
            'Setup Issue',
            "We couldn't enable biometric unlock. Your account is still secure with your password."
          );
        }
      } else {
        // Disable biometrics
        await biometrics.disableBiometrics(state.user.id);
        setIsEnabled(false);
        Alert.alert(
          'Biometric Unlock Disabled',
          "You'll use your password to log in."
        );
      }
    } catch (error) {
      console.error('Error toggling biometrics:', error);
      Alert.alert(
        'Something Went Wrong',
        "We couldn't update your settings. Let's try again."
      );
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biometric Unlock</Text>

      {!capability.available ? (
        // Device doesn't support biometrics or user hasn't enrolled
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableIcon}>🔒</Text>
          <Text style={styles.unavailableTitle}>Biometric Authentication Unavailable</Text>
          <Text style={styles.unavailableMessage}>
            Biometric authentication isn't available on this device, but your account is still
            secure with your password.
          </Text>
          <Text style={styles.unavailableNote}>
            To use biometric unlock, please enroll Face ID, Touch ID, or fingerprint in your
            device settings.
          </Text>
        </View>
      ) : (
        // Biometrics available
        <View style={styles.availableContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Available on this device:</Text>
            {capability.types.map((type, index) => (
              <Text key={index} style={styles.infoItem}>
                • {type}
              </Text>
            ))}
          </View>

          <View style={styles.toggleSection}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleTitle}>Enable Biometric Unlock</Text>
              <Text style={styles.toggleDescription}>
                Access your financial sanctuary with {capability.types[0]} for faster, secure
                access.
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggle}
              disabled={toggling}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          {isEnabled && (
            <View style={styles.enabledNote}>
              <Text style={styles.enabledNoteIcon}>✓</Text>
              <Text style={styles.enabledNoteText}>
                Biometric unlock is active. You can use {capability.types[0]} next time you open
                the app.
              </Text>
            </View>
          )}

          <View style={styles.securityNote}>
            <Text style={styles.securityNoteTitle}>Security Note</Text>
            <Text style={styles.securityNoteText}>
              Biometric unlock uses your device's secure hardware. Your biometric data never
              leaves your device.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  unavailableIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  unavailableTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  unavailableMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  unavailableNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  availableContainer: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  infoItem: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    marginTop: 4,
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  enabledNote: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  enabledNoteIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  enabledNoteText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  securityNote: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  securityNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  securityNoteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
