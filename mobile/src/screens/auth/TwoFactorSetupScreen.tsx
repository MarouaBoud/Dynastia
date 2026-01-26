import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as authService from '../../services/auth.service';

interface TwoFactorSetupScreenProps {
  navigation: any;
}

export default function TwoFactorSetupScreen({ navigation }: TwoFactorSetupScreenProps) {
  const [step, setStep] = useState<'loading' | 'qr' | 'verify'>('loading');
  const [secret, setSecret] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    initiate2FASetup();
  }, []);

  const initiate2FASetup = async () => {
    try {
      const response = await authService.enable2FA();
      setSecret(response.secret);
      setOtpauthUrl(response.otpauthUrl);
      setStep('qr');
    } catch (error) {
      console.error('Enable 2FA error:', error);
      Alert.alert(
        'Setup Issue',
        "We couldn't start the 2FA setup process. Please try again.",
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const handleContinueToVerify = () => {
    setStep('verify');
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit code.');
      return;
    }

    setVerifying(true);

    try {
      await authService.verify2FASetup(verificationCode);
      Alert.alert(
        'Success!',
        'Two-factor authentication is now active. Your account is more secure.',
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Verify 2FA setup error:', error);
      Alert.alert(
        'Code Not Recognized',
        "That code didn't match. Make sure you've scanned the QR code and try again."
      );
      setVerificationCode('');
    } finally {
      setVerifying(false);
    }
  };

  if (step === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Setting up 2FA...</Text>
      </View>
    );
  }

  if (step === 'qr') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Scan QR Code</Text>
          <Text style={styles.instructions}>
            Open your authenticator app (like Google Authenticator or Authy) and scan this QR
            code:
          </Text>

          <View style={styles.qrContainer}>
            {otpauthUrl && <QRCode value={otpauthUrl} size={240} />}
          </View>

          <View style={styles.manualCodeContainer}>
            <Text style={styles.manualCodeLabel}>Can't scan? Enter this code:</Text>
            <Text style={styles.manualCodeText}>{secret}</Text>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinueToVerify}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // step === 'verify'
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Setup</Text>
        <Text style={styles.instructions}>
          Enter the 6-digit code from your authenticator app to confirm everything is working:
        </Text>

        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          value={verificationCode}
          onChangeText={(text) => setVerificationCode(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          editable={!verifying}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.verifyButton, verifying && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={verifying || verificationCode.length !== 6}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Enable 2FA</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setStep('qr')}
          disabled={verifying}
        >
          <Text style={styles.backButtonText}>Back to QR Code</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 24,
  },
  manualCodeContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  manualCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  manualCodeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 2,
  },
  continueButton: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  codeInput: {
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
  verifyButton: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
