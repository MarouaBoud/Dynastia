/**
 * Fix for jest-expo compatibility issues with newer React Native versions.
 * This file runs before jest-expo's setup to ensure mockNativeModules exists.
 */
'use strict';

// Ensure the NativeModules mock exists before jest-expo tries to use it
try {
  const NativeModules = require('react-native/Libraries/BatchedBridge/NativeModules');
  if (!NativeModules.default) {
    NativeModules.default = {};
  }
} catch (error) {
  // If the module doesn't exist, create a mock
  jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
    default: {},
  }));
}
