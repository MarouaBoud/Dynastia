/**
 * Country Selector Component
 *
 * Allows users to select primary and optionally secondary country (expat support).
 * Expats can toggle on dual-country mode to track assets in multiple countries.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

// =============================================================================
// Types
// =============================================================================

export interface CountrySelectorProps {
  primaryCountry: string;
  secondaryCountry: string | null;
  onPrimaryChange: (country: string) => void;
  onSecondaryChange: (country: string | null) => void;
  supportedCountries?: string[];
}

// =============================================================================
// Country Data
// =============================================================================

const COUNTRY_INFO: Record<string, { name: string; flag: string; currency: string }> = {
  US: { name: 'United States', flag: '🇺🇸', currency: 'USD' },
  FR: { name: 'France', flag: '🇫🇷', currency: 'EUR' },
  DE: { name: 'Germany', flag: '🇩🇪', currency: 'EUR' },
  GB: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  CA: { name: 'Canada', flag: '🇨🇦', currency: 'CAD' },
  AU: { name: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  JP: { name: 'Japan', flag: '🇯🇵', currency: 'JPY' },
  CH: { name: 'Switzerland', flag: '🇨🇭', currency: 'CHF' },
  ES: { name: 'Spain', flag: '🇪🇸', currency: 'EUR' },
  IT: { name: 'Italy', flag: '🇮🇹', currency: 'EUR' },
  NL: { name: 'Netherlands', flag: '🇳🇱', currency: 'EUR' },
  BE: { name: 'Belgium', flag: '🇧🇪', currency: 'EUR' },
  AT: { name: 'Austria', flag: '🇦🇹', currency: 'EUR' },
  IE: { name: 'Ireland', flag: '🇮🇪', currency: 'EUR' },
  PT: { name: 'Portugal', flag: '🇵🇹', currency: 'EUR' },
  FI: { name: 'Finland', flag: '🇫🇮', currency: 'EUR' },
  GR: { name: 'Greece', flag: '🇬🇷', currency: 'EUR' },
};

const DEFAULT_COUNTRIES = Object.keys(COUNTRY_INFO);

// =============================================================================
// Component
// =============================================================================

export function CountrySelector({
  primaryCountry,
  secondaryCountry,
  onPrimaryChange,
  onSecondaryChange,
  supportedCountries = DEFAULT_COUNTRIES,
}: CountrySelectorProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);

  // Filter countries to only supported ones
  const availableCountries = supportedCountries.filter((code) => COUNTRY_INFO[code]);

  // Get country info with fallback
  const getCountryInfo = (code: string) =>
    COUNTRY_INFO[code] || { name: code, flag: '🏳️', currency: 'USD' };

  // Handle expat toggle
  const handleExpatToggle = () => {
    if (secondaryCountry) {
      // Turn off expat mode
      onSecondaryChange(null);
    } else {
      // Turn on expat mode - default to first country different from primary
      const defaultSecondary = availableCountries.find((c) => c !== primaryCountry) || 'FR';
      onSecondaryChange(defaultSecondary);
    }
  };

  // Render country option in modal
  const renderCountryOption = (
    code: string,
    onSelect: (code: string) => void,
    closeModal: () => void
  ) => {
    const info = getCountryInfo(code);
    return (
      <TouchableOpacity
        key={code}
        style={[styles.countryOption, { borderBottomColor: colors.border }]}
        onPress={() => {
          onSelect(code);
          closeModal();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.countryFlag}>{info.flag}</Text>
        <View style={styles.countryTextContainer}>
          <Text style={[styles.countryName, { color: colors.text }]}>{info.name}</Text>
          <Text style={[styles.countryCurrency, { color: colors.textMuted }]}>
            {info.currency}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render picker modal
  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    onSelect: (code: string) => void,
    excludeCountry?: string,
    title: string = 'Select Country'
  ) => {
    const filteredCountries = excludeCountry
      ? availableCountries.filter((c) => c !== excludeCountry)
      : availableCountries;

    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item}
            renderItem={({ item }) => renderCountryOption(item, onSelect, onClose)}
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  const primaryInfo = getCountryInfo(primaryCountry);
  const secondaryInfo = secondaryCountry ? getCountryInfo(secondaryCountry) : null;

  return (
    <View style={styles.container}>
      {/* Primary Country */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Primary Country</Text>
        <TouchableOpacity
          style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowPrimaryPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.selectorFlag}>{primaryInfo.flag}</Text>
          <View style={styles.selectorTextContainer}>
            <Text style={[styles.selectorName, { color: colors.text }]}>{primaryInfo.name}</Text>
            <Text style={[styles.selectorCurrency, { color: colors.textMuted }]}>
              {primaryInfo.currency}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Expat Toggle */}
      <TouchableOpacity
        style={[styles.expatToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={handleExpatToggle}
        activeOpacity={0.8}
      >
        <View style={styles.expatTextContainer}>
          <Text style={[styles.expatTitle, { color: colors.text }]}>
            I also have financial ties to another country
          </Text>
          <Text style={[styles.expatSubtitle, { color: colors.textMuted }]}>
            Enable this if you're an expat or have assets abroad
          </Text>
        </View>
        <Switch
          value={!!secondaryCountry}
          onValueChange={handleExpatToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.card}
        />
      </TouchableOpacity>

      {/* Secondary Country (visible when expat mode is on) */}
      {secondaryCountry && secondaryInfo && (
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Secondary Country</Text>
          <TouchableOpacity
            style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowSecondaryPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.selectorFlag}>{secondaryInfo.flag}</Text>
            <View style={styles.selectorTextContainer}>
              <Text style={[styles.selectorName, { color: colors.text }]}>
                {secondaryInfo.name}
              </Text>
              <Text style={[styles.selectorCurrency, { color: colors.textMuted }]}>
                {secondaryInfo.currency}
              </Text>
            </View>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Primary Country Picker Modal */}
      {renderPickerModal(
        showPrimaryPicker,
        () => setShowPrimaryPicker(false),
        onPrimaryChange,
        undefined,
        'Select Primary Country'
      )}

      {/* Secondary Country Picker Modal */}
      {renderPickerModal(
        showSecondaryPicker,
        () => setShowSecondaryPicker(false),
        (code) => onSecondaryChange(code),
        primaryCountry, // Exclude primary country from secondary selection
        'Select Secondary Country'
      )}
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectorCurrency: {
    fontSize: 14,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  expatToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  expatTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  expatTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  expatSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  countryFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  countryTextContainer: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  countryCurrency: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default CountrySelector;
