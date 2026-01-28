/**
 * Country Detection Screen
 *
 * Onboarding screen shown after signup to confirm user's country.
 * Auto-detects country from device locale and allows user to change if needed.
 * Saves country and currency to user profile for country-specific features.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { detectCountry, getCurrencyForCountry, SUPPORTED_COUNTRIES, getCountryName } from '../../utils/locale';
import { updateProfile } from '../../services/users.service';
import { useAuth } from '../../contexts/AuthContext';

export default function CountryDetectionScreen() {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [currency, setCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Auto-detect country on mount
  useEffect(() => {
    const detectedCountry = detectCountry();
    setSelectedCountry(detectedCountry);
    setCurrency(getCurrencyForCountry(detectedCountry));
  }, []);

  // Update currency when country changes
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setCurrency(getCurrencyForCountry(countryCode));
    setError('');
  };

  // Save country and continue
  const handleContinue = async () => {
    try {
      setLoading(true);
      setError('');

      // Update profile with country and currency
      const updatedUser = await updateProfile({
        country: selectedCountry,
        currency: currency,
      });

      // Update auth context with new user data
      setUser(updatedUser);

      // Navigate to main app
      navigation.navigate('Home' as never);
    } catch (err: any) {
      console.error('Save country error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Let's set up your account</Text>
        <Text style={styles.subtitle}>
          We'll personalize your experience based on where you're located.
          This helps us provide relevant financial guidance for your country.
        </Text>
      </View>

      <View style={styles.detectionSection}>
        <Text style={styles.sectionTitle}>Your Location</Text>
        <Text style={styles.detectionText}>
          We detected you're in <Text style={styles.bold}>{getCountryName(selectedCountry)}</Text>.
          Is this correct?
        </Text>
      </View>

      <View style={styles.pickerSection}>
        <Text style={styles.sectionTitle}>Select Your Country</Text>
        <View style={styles.countriesGrid}>
          {SUPPORTED_COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={[
                styles.countryCard,
                selectedCountry === country.code && styles.countryCardSelected,
              ]}
              onPress={() => handleCountryChange(country.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.countryFlag}>{country.flag}</Text>
              <Text
                style={[
                  styles.countryName,
                  selectedCountry === country.code && styles.countryNameSelected,
                ]}
              >
                {country.name}
              </Text>
              <Text
                style={[
                  styles.countryCurrency,
                  selectedCountry === country.code && styles.countryCurrencySelected,
                ]}
              >
                {country.currency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.currencySection}>
        <Text style={styles.currencyLabel}>Currency</Text>
        <Text style={styles.currencyValue}>{currency}</Text>
        <Text style={styles.currencyHelp}>
          Your currency is automatically set based on your country.
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.continueButton, loading && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  detectionSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  detectionText: {
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  bold: {
    fontWeight: '700',
  },
  pickerSection: {
    marginBottom: 24,
  },
  countriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  countryCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  countryCardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  countryFlag: {
    fontSize: 32,
    marginBottom: 8,
  },
  countryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  countryNameSelected: {
    color: '#4F46E5',
  },
  countryCurrency: {
    fontSize: 12,
    color: '#6B7280',
  },
  countryCurrencySelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  currencySection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  currencyValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  currencyHelp: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
});
