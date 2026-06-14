import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from '@/services/firebase/auth.service';
import { signOut } from '@/services/firebase/auth.service';
import { storeToken, clearToken } from '@/services/storage/secure-storage.service';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types/api.types';
import type { UserProfile } from './auth.types';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  setUserProfile: (userProfile) => set({ userProfile }),

  logout: async () => {
    await signOut();
    await clearToken();
    set({ user: null, userProfile: null, token: null, isAuthenticated: false });
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          await storeToken(token);

          const { data } = await apiClient.get<ApiResponse<UserProfile>>(ENDPOINTS.AUTH.PROFILE);
          set({
            user,
            token,
            userProfile: data.data,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch {
          // Profile may not exist yet (new registration flow) — preserve any profile
          // already set (e.g. by the registration screen) to avoid a race condition
          const token = await user.getIdToken().catch(() => null);
          set((state) => ({
            user,
            token,
            userProfile: state.userProfile,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          }));
        }
      } else {
        await clearToken().catch(() => null);
        set({
          user: null,
          token: null,
          userProfile: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    });
    return unsubscribe;
  },
}));
