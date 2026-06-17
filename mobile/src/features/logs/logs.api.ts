import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { ApiResponse } from '@/types/api.types';
import type { DailyLogsResponse, WeeklyExpense, WeeklySummaryEntry, MonthlySummaryEntry, CalendarDaysResponse } from './logs.types';

export const LOGS_QUERY_KEYS = {
  daily: (date: string) => ['logs', 'daily', date] as const,
  weekly: ['logs', 'weekly'] as const,
  weeklySummary: ['logs', 'weekly-summary'] as const,
  monthlySummary: ['logs', 'monthly-summary'] as const,
  yearlySummary: ['logs', 'yearly-summary'] as const,
  calendarDays: (month: string) => ['logs', 'calendar', month] as const,
};

export const useGetDailyLogs = (date: string) =>
  useQuery({
    queryKey: LOGS_QUERY_KEYS.daily(date),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DailyLogsResponse>>(
        ENDPOINTS.LOGS.DAILY(date)
      );
      return response.data.data;
    },
  });

export const useGetWeeklyExpenses = () =>
  useQuery({
    queryKey: LOGS_QUERY_KEYS.weekly,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WeeklyExpense[]>>(ENDPOINTS.LOGS.WEEKLY);
      return response.data.data;
    },
  });

export const useGetWeeklySummary = () =>
  useQuery({
    queryKey: LOGS_QUERY_KEYS.weeklySummary,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WeeklySummaryEntry[]>>(
        ENDPOINTS.LOGS.WEEKLY_SUMMARY
      );
      return response.data.data;
    },
  });

export const useGetMonthlySummary = () =>
  useQuery({
    queryKey: LOGS_QUERY_KEYS.monthlySummary,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WeeklySummaryEntry[]>>(
        ENDPOINTS.LOGS.MONTHLY_SUMMARY
      );
      return response.data.data;
    },
  });

export const useGetYearlySummary = () =>
  useQuery({
    queryKey: LOGS_QUERY_KEYS.yearlySummary,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MonthlySummaryEntry[]>>(
        ENDPOINTS.LOGS.YEARLY_SUMMARY
      );
      return response.data.data;
    },
  });

export const useGetCalendarDays = (month: string) =>
  useQuery({
    queryKey: LOGS_QUERY_KEYS.calendarDays(month),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CalendarDaysResponse>>(
        ENDPOINTS.LOGS.CALENDAR(month)
      );
      return response.data.data;
    },
  });

export const useUpdateCategoryField = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ category, value }: { category: string; value: string | number }) => {
      await apiClient.patch(ENDPOINTS.LOGS.UPDATE_FIELD(date), { category, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.daily(date) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weekly });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weeklySummary });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.monthlySummary });
    },
  });
};

export const useDeleteEntry = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      await apiClient.delete(ENDPOINTS.LOGS.DELETE_ENTRY(date, entryId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.daily(date) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weekly });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weeklySummary });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.monthlySummary });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.calendarDays(date.slice(0, 7)) });
    },
  });
};

export const useUpdateDailySummary = (date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, string | number>) => {
      await apiClient.patch(ENDPOINTS.LOGS.UPDATE_SUMMARY(date), updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.daily(date) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weeklySummary });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.monthlySummary });
    },
  });
};
