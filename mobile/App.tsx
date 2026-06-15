// Must be imported before any notification code so the handler
// is registered before the first notification can fire.
import './src/services/notifications/notification-handler';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { setupLocalNotifications } from './src/services/notifications/local-notifications.service';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

export default function App() {
  useEffect(() => {
    // Request permission and schedule daily reminders on every launch.
    // The service handles idempotency and permission-denial tracking internally.
    setupLocalNotifications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
