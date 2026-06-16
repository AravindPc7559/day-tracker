import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import type { Persistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// getReactNativePersistence is only in the RN bundle (@firebase/auth/dist/rn) and is not
// re-exported from the main firebase/auth typings in v12 — require directly with type cast.
// Wrapped in a function so a missing file throws at call time (inside the IIFE try/catch)
// rather than at module load time where it cannot be recovered.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const loadRnPersistence = (): Persistence =>
  (require('@firebase/auth/dist/rn/index.js') as {
    getReactNativePersistence: (storage: unknown) => Persistence;
  }).getReactNativePersistence(AsyncStorage);

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth must only be called once. On HMR/Fast Refresh the provider is already
// initialized with the same app — initializeAuth throws 'already-initialized' and getAuth
// returns the correctly persisted instance. Any other error is re-thrown so it surfaces
// visibly rather than silently degrading to in-memory persistence.
export const auth = (() => {
  try {
    return initializeAuth(app, { persistence: loadRnPersistence() });
  } catch (err) {
    if (err instanceof Error && err.message.includes('already-initialized')) {
      return getAuth(app);
    }
    throw err;
  }
})();
