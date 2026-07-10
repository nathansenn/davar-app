/**
 * Local daily-reminder notifications. Uses expo-notifications (local
 * scheduling works in Expo Go). Time parsing lives in ../utils/reminderTime so
 * it can be unit-tested without the native module.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { parseTimeHHMM } from '../utils/reminderTime';

const CHANNEL_ID = 'daily-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function configureNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === 'granted') return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted || requested.status === 'granted';
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule (or reschedule) the daily reminder. Returns false if permission was
 * denied so the caller can revert the toggle.
 */
export async function scheduleDailyReminder(timeHHMM: string | null): Promise<boolean> {
  const granted = await ensurePermission();
  if (!granted) return false;

  await configureNotifications();
  await cancelDailyReminder();

  const { hour, minute } = parseTimeHHMM(timeHHMM);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to read 📖',
      body: 'Continue your Davar reading and keep your streak going.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return true;
}
