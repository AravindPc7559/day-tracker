import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

export const configureRevenueCat = (): void => {
  if (!REVENUECAT_API_KEY) return;
  Purchases.configure({ apiKey: REVENUECAT_API_KEY });
};
