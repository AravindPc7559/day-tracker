import type { Category } from '@/features/audio/audio.types';

export interface LogEntry {
  id: string;
  transcription: string;
  categories: Category[];
  createdAt: string;
  date: string;
}

export interface DailySummary {
  [key: string]: string | number | undefined;
  total_expense?: number;
  updatedAt?: string;
}

export interface DailyLogsResponse {
  summary: DailySummary;
  entries: LogEntry[];
}

export interface WeeklyExpense {
  date: string;
  total_expense: number;
}

export interface WeeklySummaryEntry {
  date: string;
  summary: DailySummary;
}

export interface MonthlySummaryEntry {
  month: string; // YYYY-MM
  summary: DailySummary;
}

export interface CalendarDaysResponse {
  month: string;
  completedDates: string[];
}

export type AnalyticsPeriod = 'week' | 'month' | 'year';

// Unified entry type used across all periods
export interface PeriodEntry {
  label: string; // day label for week/month, month label for year
  summary: DailySummary;
}
