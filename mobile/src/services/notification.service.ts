/**
 * Notification Service
 *
 * Handles local notification scheduling for Money Date reminders,
 * streak protection, and bill alerts using expo-notifications.
 *
 * Note: SDK 52 has known bugs with immediate triggering.
 * Test on real devices, not simulators.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const NOTIFICATION_PREFS_KEY = '@notification_preferences';
const NOTIFICATION_IDS_KEY = '@scheduled_notification_ids';

// Default preferences (NOTIF-06: opt-in for habits, opt-out for marketing)
export interface NotificationPreferences {
  moneyDateReminder: boolean;
  streakProtection: boolean;
  billReminders: boolean;
  milestoneAlerts: boolean;
  reminderDay: number; // 0-6, Sunday=0
  reminderHour: number; // 0-23
  marketingUpdates: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  moneyDateReminder: true,
  streakProtection: true,
  billReminders: true,
  milestoneAlerts: true,
  reminderDay: 0, // Sunday
  reminderHour: 10, // 10 AM
  marketingUpdates: false,
};

/**
 * Configure notification handler (call once at app startup)
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Request notification permissions
 */
export async function requestPermissions(): Promise<boolean> {
  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habits', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED', // Purple brand color
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Get notification preferences from local storage
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save notification preferences to local storage
 */
export async function saveNotificationPreferences(
  prefs: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  try {
    const current = await getNotificationPreferences();
    const updated = { ...current, ...prefs };
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));

    // Reschedule notifications with new preferences
    await rescheduleAllNotifications(updated);

    return updated;
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
    throw error;
  }
}

/**
 * Schedule Money Date reminder (NOTIF-01)
 */
export async function scheduleMoneyDateReminder(
  dayOfWeek: number = 0, // 0 = Sunday
  hour: number = 10,
  minute: number = 0
): Promise<string | null> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return null;
  }

  try {
    // Cancel existing Money Date reminders
    await cancelNotificationsByType('money_date');

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Let's do your Money Date",
        body: "Take 10 minutes to check in with your finances. You've got this!",
        data: { type: 'money_date' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek + 1, // expo uses 1-7 (Sunday=1)
        hour,
        minute,
      },
    });

    // Store notification ID for later cancellation
    await storeNotificationId('money_date', notificationId);

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule Money Date reminder:', error);
    return null;
  }
}

/**
 * Schedule streak protection alert (NOTIF-02)
 * Fires if user hasn't checked in within grace period
 */
export async function scheduleStreakProtectionAlert(
  lastCheckInDate: Date
): Promise<string | null> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return null;

  try {
    // Cancel existing streak alerts
    await cancelNotificationsByType('streak_protection');

    // Calculate alert date: 9 days after last check-in (1 day before grace period ends)
    const alertDate = new Date(lastCheckInDate);
    alertDate.setDate(alertDate.getDate() + 9);

    // Only schedule if alert date is in the future
    if (alertDate <= new Date()) return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your streak needs you!',
        body: "Let's keep the momentum going. One quick check-in today?",
        data: { type: 'streak_protection' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alertDate,
      },
    });

    await storeNotificationId('streak_protection', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule streak protection alert:', error);
    return null;
  }
}

/**
 * Schedule bill due date reminder (NOTIF-03)
 */
export async function scheduleBillReminder(
  billId: string,
  billName: string,
  dueDate: Date
): Promise<string | null> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return null;

  try {
    // Alert 3 days before due date
    const alertDate = new Date(dueDate);
    alertDate.setDate(alertDate.getDate() - 3);
    alertDate.setHours(10, 0, 0, 0);

    // Only schedule if alert date is in the future
    if (alertDate <= new Date()) return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${billName} is due soon`,
        body: "Your bill is due in 3 days. Let's stay ahead of it!",
        data: { type: 'bill_reminder', billId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alertDate,
      },
    });

    await storeNotificationId(`bill_${billId}`, notificationId);
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule bill reminder:', error);
    return null;
  }
}

/**
 * Show milestone celebration notification (NOTIF-04)
 */
export async function showMilestoneCelebration(
  milestoneName: string,
  celebration: string
): Promise<void> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: milestoneName,
        body: celebration,
        data: { type: 'milestone_celebration' },
      },
      trigger: null, // Immediate notification
    });
  } catch (error) {
    console.error('Failed to show milestone celebration:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
}

/**
 * Cancel notifications by type
 */
async function cancelNotificationsByType(type: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!stored) return;

    const ids: Record<string, string> = JSON.parse(stored);
    const notificationId = ids[type];

    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      delete ids[type];
      await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
    }
  } catch (error) {
    console.error('Failed to cancel notifications by type:', error);
  }
}

/**
 * Store notification ID for later cancellation
 */
async function storeNotificationId(type: string, id: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const ids: Record<string, string> = stored ? JSON.parse(stored) : {};
    ids[type] = id;
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Failed to store notification ID:', error);
  }
}

/**
 * Reschedule all notifications based on preferences
 */
async function rescheduleAllNotifications(prefs: NotificationPreferences): Promise<void> {
  // Cancel all existing scheduled notifications
  await cancelAllNotifications();

  // Schedule Money Date reminder if enabled
  if (prefs.moneyDateReminder) {
    await scheduleMoneyDateReminder(prefs.reminderDay, prefs.reminderHour, 0);
  }

  // Other notifications (streak, bills) are scheduled contextually,
  // not in this bulk reschedule
}

export default {
  configureNotifications,
  requestPermissions,
  getNotificationPreferences,
  saveNotificationPreferences,
  scheduleMoneyDateReminder,
  scheduleStreakProtectionAlert,
  scheduleBillReminder,
  showMilestoneCelebration,
  cancelAllNotifications,
};
