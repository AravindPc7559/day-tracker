import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types/api.types';
import type { StreakData } from './streak.types';

export const STREAK_QUERY_KEY = ['streak'] as const;

export const useGetStreak = () =>
  useQuery({
    queryKey: STREAK_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<StreakData>>(ENDPOINTS.STREAK);
      return response.data.data;
    },
  });
