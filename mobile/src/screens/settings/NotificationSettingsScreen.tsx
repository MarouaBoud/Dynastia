/**
 * Notification Settings Screen
 *
 * Allows users to configure notification preferences (NOTIF-05).
 * Default: opt-in for habits, opt-out for marketing (NOTIF-06).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '../../theme';
import * as notificationService from '../../services/notification.service';
import * as habitService from '../../services/habit.service';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function NotificationSettingsScreen() {
  const colors = useColors();
  const [prefs, setPrefs] = useState<notificationService.NotificationPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Load preferences
  useEffect(() => {
    loadPreferences();
    checkPermission();
  }, []);

  const loadPreferences = async () => {
    const localPrefs = await notificationService.getNotificationPreferences();
    setPrefs(localPrefs);
  };

  const checkPermission = async () => {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
  };

  const updatePref = useCallback(async (key: keyof notificationService.NotificationPreferences, value: boolean | number) => {
    if (!prefs) return;

    const updated = { ...prefs, [key]: value };
    setPrefs(updated);

    setIsSaving(true);
    try {
      // Save locally
      await notificationService.saveNotificationPreferences({ [key]: value });

      // Sync to server
      await habitService.updateNotificationPreferences({ [key]: value });
    } catch (error) {
      console.error('Failed to save preference:', error);
      // Revert on error
      setPrefs(prefs);
      Alert.alert('Oops', "We couldn't save that change. Let's try again.");
    } finally {
      setIsSaving(false);
    }
  }, [prefs]);

  const renderToggle = (
    label: string,
    description: string,
    key: keyof notificationService.NotificationPreferences,
    value: boolean
  ) => (
    <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => updatePref(key, newValue)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
        disabled={!hasPermission}
      />
    </View>
  );

  if (!prefs) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loading}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission warning */}
        {!hasPermission && (
          <View style={[styles.warningBanner, { backgroundColor: 'rgba(212, 168, 75, 0.15)' }]}>
            <Feather name="alert-circle" size={20} color={colors.warning} />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: colors.warning }]}>
                Notifications are disabled
              </Text>
              <Text style={[styles.warningText, { color: colors.text }]}>
                Enable notifications in your device settings to receive reminders.
              </Text>
            </View>
          </View>
        )}

        {/* Habit reminders section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            HABIT REMINDERS
          </Text>

          {renderToggle(
            'Money Date Reminder',
            'Weekly reminder to complete your Money Date check-in',
            'moneyDateReminder',
            prefs.moneyDateReminder
          )}

          {renderToggle(
            'Streak Protection',
            "Alert when your streak is at risk",
            'streakProtection',
            prefs.streakProtection
          )}
        </View>

        {/* Timing section */}
        {prefs.moneyDateReminder && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              REMINDER TIMING
            </Text>

            <TouchableOpacity
              style={[styles.settingRow, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Day of Week
                </Text>
                <Text style={[styles.settingValue, { color: colors.primary }]}>
                  {DAYS_OF_WEEK[prefs.reminderDay]}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
            >
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Time
                </Text>
                <Text style={[styles.settingValue, { color: colors.primary }]}>
                  {prefs.reminderHour}:00
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Bill reminders section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            BILL REMINDERS
          </Text>

          {renderToggle(
            'Bill Due Dates',
            'Reminder 3 days before bills are due',
            'billReminders',
            prefs.billReminders
          )}
        </View>

        {/* Celebration section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CELEBRATIONS
          </Text>

          {renderToggle(
            'Milestone Alerts',
            'Notification when you achieve a milestone',
            'milestoneAlerts',
            prefs.milestoneAlerts
          )}
        </View>

        {/* Marketing section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            OTHER
          </Text>

          {renderToggle(
            'Product Updates',
            'Occasional news about new features',
            'marketingUpdates',
            prefs.marketingUpdates
          )}
        </View>

        {/* Info text */}
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          We'll never spam you. Your peace of mind matters.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  warningBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
});

export default NotificationSettingsScreen;
