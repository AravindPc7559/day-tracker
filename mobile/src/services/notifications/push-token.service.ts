import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) return null;
  // Remote push tokens are unsupported in Expo Go since SDK 53 — avoid the library's console warning.
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
};
