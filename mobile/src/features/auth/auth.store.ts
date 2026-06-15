import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from '@/services/firebase/auth.service';
import { storeToken, clearToken } from '@/services/storage/secure-storage.service';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { registerForPushNotifications } from '@/services/notifications/push-token.service';
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
  initialize: () => () => void;
}

const registerPushToken = () => {
  registerForPushNotifications().then((pushToken) => {
    if (pushToken) {
      apiClient.patch(ENDPOINTS.AUTH.PUSH_TOKEN, { token: pushToken }).catch(() => {});
    }
  });
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
    set({ user: null, userProfile: null, token: null, isAuthenticated: false, emailVerified: false });
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        const wasSignedIn = get().isAuthenticated;
        const previousUid = get().user?.uid;
        const isNewSignIn = !wasSignedIn || previousUid !== user.uid;

        try {
          const token = await user.getIdToken();
          await storeToken(token);

          const { data } = await apiClient.get<ApiResponse<UserProfile>>(ENDPOINTS.AUTH.PROFILE);
          set({
            user,
            token,
            userProfile: data.data,
            isAuthenticated: true,
            emailVerified: user.emailVerified,
            isLoading: false,
            isInitialized: true,
          });

          if (isNewSignIn) registerPushToken();
        } catch {
          // Profile may not exist yet (new registration flow) — preserve any profile
          // already set (e.g. by the registration screen) to avoid a race condition
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

          if (isNewSignIn) registerPushToken();
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
