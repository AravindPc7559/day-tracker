import { create } from 'zustand';
import type { User } from 'firebase/auth';
import Purchases from 'react-native-purchases';
import { onAuthStateChanged, signOut } from '@/services/firebase/auth.service';
import { storeToken, clearToken } from '@/services/storage/secure-storage.service';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { registerForPushNotifications } from '@/services/notifications/push-token.service';
import { queryClient } from '@/services/api/queryClient';
import { useSubscriptionStore } from '@/features/subscription/subscription.store';
import type { ApiResponse } from '@/types/api.types';
import type { UserProfile } from './auth.types';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
  setEmailVerified: (verified: boolean) => void;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  initialize: () => () => void;
}

const registerPushToken = () => {
  registerForPushNotifications().then((pushToken) => {
    if (pushToken) {
      apiClient.patch(ENDPOINTS.AUTH.PUSH_TOKEN, { token: pushToken }).catch(() => {});
    }
  });
};

const syncSubscriptionIdentity = async (uid: string): Promise<void> => {
  try {
    await Purchases.logIn(uid);
  } catch (err) {
    console.warn('[RevenueCat] logIn failed during identity sync', err);
  }
  await useSubscriptionStore.getState().refresh();
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  token: null,
  isAuthenticated: false,
  emailVerified: false,
  isLoading: true,
  isInitialized: false,

  setUserProfile: (userProfile) => set({ userProfile }),

  setEmailVerified: (emailVerified) => set({ emailVerified }),

  logout: async () => {
    await signOut();
    await clearToken();
    await Purchases.logOut().catch(() => {});
    useSubscriptionStore.getState().reset();
    queryClient.clear();
    set({ user: null, userProfile: null, token: null, isAuthenticated: false, emailVerified: false });
  },

  deleteAccount: async () => {
    await apiClient.delete(ENDPOINTS.AUTH.DELETE_ACCOUNT);
    await signOut();
    await clearToken();
    await Purchases.logOut().catch(() => {});
    useSubscriptionStore.getState().reset();
    queryClient.clear();
    set({ user: null, userProfile: null, token: null, isAuthenticated: false, emailVerified: false });
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        const wasSignedIn = get().isAuthenticated;
        const previousUid = get().user?.uid;
        const isNewSignIn = !wasSignedIn || previousUid !== user.uid;
        if (isNewSignIn && previousUid && previousUid !== user.uid) {
          queryClient.clear();
        }

        try {
          const token = await user.getIdToken();
          await storeToken(token);

          const { data } = await apiClient.get<ApiResponse<UserProfile | null>>(ENDPOINTS.AUTH.PROFILE);
          set({
            user,
            token,
            userProfile: data.data,
            isAuthenticated: true,
            emailVerified: user.emailVerified,
            isLoading: false,
            isInitialized: true,
          });

          if (isNewSignIn) {
            registerPushToken();
            await syncSubscriptionIdentity(user.uid);
          }
        } catch {
          // Network failure or server error — preserve any profile already in state
          const token = await user.getIdToken().catch(() => null);
          set((state) => ({
            user,
            token,
            userProfile: state.userProfile,
            isAuthenticated: true,
            emailVerified: user.emailVerified,
            isLoading: false,
            isInitialized: true,
          }));

          if (isNewSignIn) {
            registerPushToken();
            await syncSubscriptionIdentity(user.uid);
          }
        }
      } else {
        await clearToken().catch(() => null);
        set({
          user: null,
          token: null,
          userProfile: null,
          isAuthenticated: false,
          emailVerified: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    });
    return unsubscribe;
  },
}));
