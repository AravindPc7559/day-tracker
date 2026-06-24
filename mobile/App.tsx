// Must be imported before any notification code so the handler
// is registered before the first notification can fire.
import './src/services/notifications/notification-handler';

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setupLocalNotifications } from './src/services/notifications/local-notifications.service';
import { configureRevenueCat } from './src/services/subscription/revenuecat.config';
import { OfflineBanner } from './src/components/shared/OfflineBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

export default function App() {
  useEffect(() => {
    configureRevenueCat();
    setupLocalNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={styles.root}>
          <OfflineBanner />
          <RootNavigator />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
