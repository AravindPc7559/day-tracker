import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types/api.types';

interface SubscriptionStatusResponse {
  subscriptionStatus: 'active' | 'expired' | 'none';
  subscriptionExpiresAt: string | null;
}

export const fetchSubscriptionStatus = async (): Promise<SubscriptionStatusResponse> => {
  const { data } = await apiClient.get<ApiResponse<SubscriptionStatusResponse>>(
    ENDPOINTS.SUBSCRIPTION.STATUS
  );
  return data.data;
};
