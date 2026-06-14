import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types/api.types';
import type { ProcessAudioResponse } from '@/features/audio/audio.types';

export const useProcessImage = () =>
  useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post<ApiResponse<ProcessAudioResponse>>(
        ENDPOINTS.IMAGE.PROCESS,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data;
    },
  });
