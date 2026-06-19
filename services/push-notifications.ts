import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { storeFcmToken } from '../api/fcm-api';

export const DEFAULT_NOTIFICATION_CHANNEL_ID = 'default';

export type PushNotificationData = {
  screen?: string;
  submissionId?: string;
  notificationType?: 'submission' | 'announcement' | 'system';
  title?: string;
  body?: string;
  [key: string]: string | number | boolean | null | undefined;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function configureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(DEFAULT_NOTIFICATION_CHANNEL_ID, {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

/**
 * Handles errors during push notification registration.
 * @param errorMessage 
 */
function handleRegistrationError(errorMessage: string) {
  throw new Error(errorMessage);
}

export async function registerForPushNotificationsAsync() {
  await configureAndroidNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted to get push token for push notification!');
  }

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) {
    handleRegistrationError('Project ID not found');
  }

  const devicePushToken = await Notifications.getDevicePushTokenAsync();

  return devicePushToken.data;
}

export async function registerAndStorePushTokenAsync() {
  const deviceToken = await registerForPushNotificationsAsync();
  await storeFcmToken(deviceToken);
  return deviceToken;
}

export function getPushNotificationData(notification: Notifications.Notification) {
  return notification.request.content.data as PushNotificationData | undefined;
}

export function getPushNotificationRoute(data?: PushNotificationData) {
  if (typeof data?.screen === 'string' && data.screen.startsWith('/')) {
    if (data.request_number) {
      return `${data.screen}${data.screen.includes('?') ? '&' : '?'}request_number=${data.request_number}`;
    }
    return data.screen;
  }

  if (data?.request_number) {
    return `/(tabs)/?request_number=${data.request_number}`;
  }

  if (data?.submissionId) {
    return '/(tabs)/notification';
  }

  return null;
}