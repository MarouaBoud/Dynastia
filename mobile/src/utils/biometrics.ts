import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

/**
 * Biometric authentication utilities for secure, emotionally safe app unlock.
 *
 * Biometrics act as a LOCAL gate after valid session established (not primary authentication).
 * Token must already exist in SecureStore before biometric unlock can be used.
 *
 * Research: Lines 243-287 (biometric authentication pattern)
 * Research: Lines 617-672 (biometric capability check example)
 */

interface BiometricCapability {
  available: boolean;
  types: string[];
}

/**
 * Checks if biometric authentication is available and enrolled on this device.
 *
 * @returns {Promise<BiometricCapability>} Object with availability and biometric types
 *
 * Returns available: true only if:
 * 1. Device has biometric hardware
 * 2. User has enrolled at least one biometric (Face ID, Touch ID, fingerprint)
 *
 * Types are human-readable: "Fingerprint", "Face ID", "Iris"
 */
export const getBiometricCapability = async (): Promise<BiometricCapability> => {
  try {
    // Check if device has biometric hardware
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return { available: false, types: [] };
    }

    // Check if user has enrolled biometrics
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return { available: false, types: [] };
    }

    // Get supported biometric types
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    // Map enum values to human-readable strings
    const typeStrings = supportedTypes.map((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Biometric';
      }
    });

    return {
      available: true,
      types: typeStrings,
    };
  } catch (error) {
    console.error('Error checking biometric capability:', error);
    return { available: false, types: [] };
  }
};

/**
 * Enables biometric authentication for a specific user.
 * Stores a flag in SecureStore indicating biometrics are enabled.
 *
 * @param {string} userId - User ID to enable biometrics for
 * @returns {Promise<boolean>} True if enabled successfully, false if unavailable
 */
export const setupBiometrics = async (userId: string): Promise<boolean> => {
  try {
    // Check if biometrics are available first
    const capability = await getBiometricCapability();
    if (!capability.available) {
      return false;
    }

    // Store enable flag in SecureStore
    const key = `biometrics_enabled_${userId}`;
    await SecureStore.setItemAsync(key, 'true');

    return true;
  } catch (error) {
    console.error('Error setting up biometrics:', error);
    return false;
  }
};

/**
 * Checks if biometric authentication is enabled for a specific user.
 *
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True if biometrics enabled, false otherwise
 */
export const isBiometricEnabled = async (userId: string): Promise<boolean> => {
  try {
    const key = `biometrics_enabled_${userId}`;
    const value = await SecureStore.getItemAsync(key);
    return value === 'true';
  } catch (error) {
    console.error('Error checking biometric status:', error);
    return false;
  }
};

/**
 * Triggers biometric authentication with emotionally safe prompt message.
 * Shows native Face ID, Touch ID, or fingerprint prompt.
 *
 * @returns {Promise<boolean>} True if authentication successful, false otherwise
 *
 * Prompt message: "Unlock your financial sanctuary" (empowering, not technical)
 * Fallback: "Use password instead" (supportive, not shaming)
 */
export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock your financial sanctuary',
      fallbackLabel: 'Use password instead',
      disableDeviceFallback: false, // Allow PIN fallback
      cancelLabel: 'Cancel',
    });

    return result.success;
  } catch (error) {
    console.error('Error authenticating with biometrics:', error);
    return false;
  }
};

/**
 * Disables biometric authentication for a specific user.
 * Removes the enable flag from SecureStore.
 *
 * @param {string} userId - User ID to disable biometrics for
 * @returns {Promise<void>}
 */
export const disableBiometrics = async (userId: string): Promise<void> => {
  try {
    const key = `biometrics_enabled_${userId}`;
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error disabling biometrics:', error);
    throw error;
  }
};
