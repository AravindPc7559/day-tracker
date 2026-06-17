import type { Category } from '../audio/audio.types';

export interface LogEntry {
  id: string;
  transcription: string;
  categories: Category[];
  createdAt: string;
  date: string;
  source?: 'audio' | 'text' | 'image';
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
  month: string; // YYYY-MM
  completedDates: string[]; // YYYY-MM-DD
}
