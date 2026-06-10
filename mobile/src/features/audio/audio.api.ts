import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types/api.types';
import type {
  ProcessAudioResponse,
  ConfirmSaveInput,
  ConfirmSaveResponse,
} from './audio.types';

export const useProcessAudio = () =>
  useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post<ApiResponse<ProcessAudioResponse>>(
        ENDPOINTS.AUDIO.PROCESS,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data;
    },
  });

export const useProcessText = () =>
  useMutation({
    mutationFn: async (text: string) => {
      const response = await apiClient.post<ApiResponse<ProcessAudioResponse>>(
        ENDPOINTS.AUDIO.PROCESS_TEXT,
        { text }
      );
      return response.data.data;
    },
  });

export const useConfirmSave = () =>
  useMutation({
    mutationFn: async (input: ConfirmSaveInput) => {
      const response = await apiClient.post<ApiResponse<ConfirmSaveResponse>>(
        ENDPOINTS.AUDIO.CONFIRM,
        input
      );
      return response.data.data;
    },
  });
