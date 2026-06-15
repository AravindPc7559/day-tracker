import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  MORNING_NOTIFICATION_VARIANTS,
  EVENING_NOTIFICATION_VARIANTS,
  type NotificationVariant,
} from '@/constants/notifications';

const MORNING_ID = 'blurt_daily_morning';
const EVENING_ID = 'blurt_daily_evening';
const PERMISSION_DENIED_KEY = 'blurt_notifications_permission_denied';

const MORNING_HOUR = 8;
const EVENING_HOUR = 20;

const pickRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const scheduleDailyNotification = async (
  identifier: string,
  hour: number,
  variant: NotificationVariant,
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title: variant.title, body: variant.body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  });
};

/**
 * Request permission and schedule the two daily reminders with random content.
 * Safe to call on every app launch — re-scheduling with the same identifier
 * replaces the existing notification rather than duplicating it, and the random
 * pick means the user sees a different message each time the app is opened.
 */
export const setupLocalNotifications = async (): Promise<void> => {
  const wasDenied = await SecureStore.getItemAsync(PERMISSION_DENIED_KEY);
  if (wasDenied === 'true') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    await SecureStore.setItemAsync(PERMISSION_DENIED_KEY, 'true');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
      sound: 'default',
    });
  }

  await scheduleDailyNotification(MORNING_ID, MORNING_HOUR, pickRandom(MORNING_NOTIFICATION_VARIANTS));
  await scheduleDailyNotification(EVENING_ID, EVENING_HOUR, pickRandom(EVENING_NOTIFICATION_VARIANTS));
};

export const cancelLocalNotifications = async (): Promise<void> => {
  await Promise.allSettled([
    Notifications.cancelScheduledNotificationAsync(MORNING_ID),
    Notifications.cancelScheduledNotificationAsync(EVENING_ID),
  ]);
};

export const resetNotificationPermissionState = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(PERMISSION_DENIED_KEY);
};
