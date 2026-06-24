import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { useAuthStore } from '@/features/auth/auth.store';
import type { ApiResponse } from '@/types/api.types';
import type { DailyLogsResponse, WeeklyExpense, WeeklySummaryEntry, MonthlySummaryEntry, CalendarDaysResponse } from './logs.types';

export const LOGS_QUERY_KEYS = {
  daily: (uid: string | undefined, date: string) => ['logs', uid, 'daily', date] as const,
  weekly: (uid: string | undefined) => ['logs', uid, 'weekly'] as const,
  weeklySummary: (uid: string | undefined) => ['logs', uid, 'weekly-summary'] as const,
  monthlySummary: (uid: string | undefined) => ['logs', uid, 'monthly-summary'] as const,
  yearlySummary: (uid: string | undefined) => ['logs', uid, 'yearly-summary'] as const,
  calendarDays: (uid: string | undefined, month: string) => ['logs', uid, 'calendar', month] as const,
};

export const useGetDailyLogs = (date: string) => {
  const uid = useAuthStore((s) => s.user?.uid);
  return useQuery({
    queryKey: LOGS_QUERY_KEYS.daily(uid, date),
    enabled: !!uid,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DailyLogsResponse>>(
        ENDPOINTS.LOGS.DAILY(date)
      );
      return response.data.data;
    },
  });
};

export const useGetWeeklyExpenses = () => {
  const uid = useAuthStore((s) => s.user?.uid);
  return useQuery({
    queryKey: LOGS_QUERY_KEYS.weekly(uid),
    enabled: !!uid,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WeeklyExpense[]>>(ENDPOINTS.LOGS.WEEKLY);
      return response.data.data;
    },
  });
};

export const useGetWeeklySummary = () => {
  const uid = useAuthStore((s) => s.user?.uid);
  return useQuery({
    queryKey: LOGS_QUERY_KEYS.weeklySummary(uid),
    enabled: !!uid,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WeeklySummaryEntry[]>>(
        ENDPOINTS.LOGS.WEEKLY_SUMMARY
      );
      return response.data.data;
    },
  });
};

export const useGetMonthlySummary = () => {
  const uid = useAuthStore((s) => s.user?.uid);
  return useQuery({
    queryKey: LOGS_QUERY_KEYS.monthlySummary(uid),
    enabled: !!uid,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<WeeklySummaryEntry[]>>(
        ENDPOINTS.LOGS.MONTHLY_SUMMARY
      );
      return response.data.data;
    },
  });
};

export const useGetYearlySummary = () => {
  const uid = useAuthStore((s) => s.user?.uid);
  return useQuery({
    queryKey: LOGS_QUERY_KEYS.yearlySummary(uid),
    enabled: !!uid,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MonthlySummaryEntry[]>>(
        ENDPOINTS.LOGS.YEARLY_SUMMARY
      );
      return response.data.data;
    },
  });
};

export const useGetCalendarDays = (month: string) => {
  const uid = useAuthStore((s) => s.user?.uid);
  return useQuery({
    queryKey: LOGS_QUERY_KEYS.calendarDays(uid, month),
    enabled: !!uid,
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CalendarDaysResponse>>(
        ENDPOINTS.LOGS.CALENDAR(month)
      );
      return response.data.data;
    },
  });
};

export const useUpdateCategoryField = (date: string) => {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.user?.uid);
  return useMutation({
    mutationFn: async ({ category, value }: { category: string; value: string | number }) => {
      await apiClient.patch(ENDPOINTS.LOGS.UPDATE_FIELD(date), { category, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.daily(uid, date) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weekly(uid) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weeklySummary(uid) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.monthlySummary(uid) });
    },
  });
};

export const useDeleteEntry = (date: string) => {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.user?.uid);
  return useMutation({
    mutationFn: async (entryId: string) => {
      await apiClient.delete(ENDPOINTS.LOGS.DELETE_ENTRY(date, entryId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.daily(uid, date) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weekly(uid) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weeklySummary(uid) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.monthlySummary(uid) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.calendarDays(uid, date.slice(0, 7)) });
    },
  });
};

export const useUpdateDailySummary = (date: string) => {
  const queryClient = useQueryClient();
  const uid = useAuthStore((s) => s.user?.uid);
  return useMutation({
    mutationFn: async (updates: Record<string, string | number>) => {
      await apiClient.patch(ENDPOINTS.LOGS.UPDATE_SUMMARY(date), updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.daily(uid, date) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weeklySummary(uid) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.monthlySummary(uid) });
    },
  });
};
