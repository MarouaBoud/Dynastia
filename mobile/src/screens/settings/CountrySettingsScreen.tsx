/**
 * CountrySettingsScreen
 *
 * Screen for managing primary and secondary country preferences.
 * Enables expat support by allowing users to track wealth accounts in two countries.
 *
 * COUNTRY-04: Expat dual-country support
 * COUNTRY-06: Never show irrelevant advice
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui';
import { Button } from '../../components/ui/Button';
import { CountrySelector } from '../../components/wealth';
import { getProfile, updateProfile } from '../../services/users.service';

// =============================================================================
// Component
// =============================================================================

export function CountrySettingsScreen() {
  const { theme } = useTheme();
  const { colors } = theme;
  const navigation = useNavigation();
  const { setUser, state } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [primaryCountry, setPrimaryCountry] = useState('US');
  const [secondaryCountry, setSecondaryCountry] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialPrimary, setInitialPrimary] = useState('US');
  const [initialSecondary, setInitialSecondary] = useState<string | null>(null);

  // Load current profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Track changes
  useEffect(() => {
    const changed =
      primaryCountry !== initialPrimary ||
      secondaryCountry !== initialSecondary;
    setHasChanges(changed);
  }, [primaryCountry, secondaryCountry, initialPrimary, initialSecondary]);

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      const primary = profile.country || 'US';
      const secondary = profile.secondaryCountry || null;

      setPrimaryCountry(primary);
      setSecondaryCountry(secondary);
      setInitialPrimary(primary);
      setInitialSecondary(secondary);
    } catch (err) {
      console.error('Failed to load profile:', err);
      Alert.alert(
        'Unable to Load',
        "We couldn't load your settings. Please try again.",
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        country: primaryCountry,
        secondaryCountry: secondaryCountry,
      });

      // Update user in auth context to propagate changes
      if (setUser && state.user) {
        await setUser({
          ...state.user,
          country: primaryCountry,
        });
      }

      Alert.alert(
        'Settings Saved',
        'Your country preferences have been updated. Wealth guidance will now reflect your settings.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      console.error('Failed to save settings:', err);
      Alert.alert(
        'Save Failed',
        "We couldn't save your settings. Please try again.",
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Country Settings
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Set your country to get tailored wealth-building guidance
          </Text>
        </View>

        {/* Country Selector */}
        <CountrySelector
          primaryCountry={primaryCountry}
          secondaryCountry={secondaryCountry}
          onPrimaryChange={setPrimaryCountry}
          onSecondaryChange={setSecondaryCountry}
        />

        {/* Info Card - What country affects */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Feather name="info" size={18} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              What does this affect?
            </Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Tax-advantaged account recommendations
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Order of operations for wealth building
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Currency display preferences
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Investment account types shown
              </Text>
            </View>
          </View>
        </Card>

        {/* Expat explanation (when secondary is set) */}
        {secondaryCountry && (
          <Card style={{ ...styles.expatCard, backgroundColor: colors.primaryLight || colors.primary + '10' }}>
            <View style={styles.expatHeader}>
              <Feather name="globe" size={18} color={colors.primary} />
              <Text style={[styles.expatTitle, { color: colors.primary }]}>
                Expat Mode Active
              </Text>
            </View>
            <Text style={[styles.expatText, { color: colors.text }]}>
              You'll see investment accounts and guidance for both countries.
              This is helpful if you're an expat, planning to move, or have
              financial ties to multiple countries.
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button
          variant="primary"
          onPress={handleSave}
          disabled={!hasChanges || saving}
          loading={saving}
          fullWidth
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    marginTop: 24,
    padding: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  expatCard: {
    marginTop: 16,
    padding: 16,
  },
  expatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  expatTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  expatText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
});

export default CountrySettingsScreen;
