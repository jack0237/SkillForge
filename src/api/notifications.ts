import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// NO static top-level import of expo-notifications here.
// expo-notifications executes module-level code (DevicePushTokenAutoRegistration)
// that calls addPushTokenListener() → throws on Android Expo Go (SDK 53+).
// Using a lazy require() inside each function avoids this entirely.
function getNotifications() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('expo-notifications') as typeof import('expo-notifications');
}

const REMINDER_ID_KEY = 'sf_daily_reminder_id';
const PERMISSION_ASKED_KEY = 'sf_notification_permission_asked';

/** Call once on app startup — registers the Android notification channel. */
export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const N = getNotifications();
    await N.setNotificationChannelAsync('default', {
      name: 'Daily Reminders',
      importance: N.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0050cb',
    });
  } catch {
    // Not available in Expo Go on Android — silently ignore
  }
}

/**
 * Ask for notification permission once.
 * Returns true if granted, false otherwise (including Expo Go).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const N = getNotifications();
    const { status: existing } = await N.getPermissionsAsync();
    if (existing === 'granted') return true;

    const alreadyAsked = await AsyncStorage.getItem(PERMISSION_ASKED_KEY);
    if (alreadyAsked === 'true') return false;

    await AsyncStorage.setItem(PERMISSION_ASKED_KEY, 'true');
    const { status } = await N.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Schedule (or replace) a daily 7pm reminder.
 * Requires SDK 53+ trigger format: SchedulableTriggerInputTypes.DAILY
 */
export async function scheduleDailyReminder(streak: number): Promise<void> {
  try {
    const N = getNotifications();

    const existingId = await AsyncStorage.getItem(REMINDER_ID_KEY);
    if (existingId) {
      try { await N.cancelScheduledNotificationAsync(existingId); } catch {}
    }

    const body =
      streak > 1
        ? `Keep your ${streak}-day streak alive! 🔥 Just one lesson away.`
        : "Ready to learn something new? Your next lesson is waiting 📚";

    const id = await N.scheduleNotificationAsync({
      content: {
        title: 'SkillForge',
        body,
        sound: false,
        data: { screen: 'Home' },
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 0,
      },
    });

    await AsyncStorage.setItem(REMINDER_ID_KEY, id);
  } catch {
    // Not available in Expo Go on Android — silently ignore
  }
}

/** Cancel the daily reminder. */
export async function cancelDailyReminder(): Promise<void> {
  try {
    const N = getNotifications();
    const id = await AsyncStorage.getItem(REMINDER_ID_KEY);
    if (!id) return;
    try { await N.cancelScheduledNotificationAsync(id); } catch {}
    await AsyncStorage.removeItem(REMINDER_ID_KEY);
  } catch {}
}

/** True if a reminder is stored in AsyncStorage. */
export async function hasDailyReminder(): Promise<boolean> {
  const id = await AsyncStorage.getItem(REMINDER_ID_KEY);
  return Boolean(id);
}
