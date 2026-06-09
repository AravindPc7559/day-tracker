import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types/api.types';
import type { UserProfile } from './auth.types';

export const AUTH_QUERY_KEYS = {
  profile: ['auth', 'profile'] as const,
} as const;

export const useGetProfile = () =>
  useQuery({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<UserProfile>>(ENDPOINTS.AUTH.PROFILE);
      return data.data;
    },
  });

export const useCreateProfile = () =>
  useMutation({
    mutationFn: async (input: { displayName: string }) => {
      const { data } = await apiClient.post<ApiResponse<UserProfile>>(ENDPOINTS.AUTH.PROFILE, input);
      return data.data;
    },
  });
