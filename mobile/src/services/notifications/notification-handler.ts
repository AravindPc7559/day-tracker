import * as Notifications from 'expo-notifications';

// Configure how notifications behave when the app is in the foreground.
// Must be called once before any notification can fire.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
