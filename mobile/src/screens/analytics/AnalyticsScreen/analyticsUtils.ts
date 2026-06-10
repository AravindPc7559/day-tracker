import type { WeeklySummaryEntry, MonthlySummaryEntry, PeriodEntry, AnalyticsPeriod, DailySummary } from '@/features/logs/logs.types';

const shortDay = (dateStr: string) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);

const shortMonth = (monthStr: string) =>
  new Date(monthStr + '-01T00:00:00').toLocaleDateString('en-US', { month: 'short' }).slice(0, 3);

// Merge N daily summaries into one aggregated summary
const aggregateSummaries = (entries: WeeklySummaryEntry[]): DailySummary => {
  const result: DailySummary = {};
  for (const entry of entries) {
    for (const [key, val] of Object.entries(entry.summary)) {
      if (typeof val === 'number' && key !== 'updatedAt' as string) {
        result[key] = ((result[key] as number) ?? 0) + val;
      }
    }
  }
  return result;
};

// Group 30 daily entries into ~4 weekly buckets for month view chart
const groupByWeek = (entries: WeeklySummaryEntry[]): PeriodEntry[] => {
  const weeks: PeriodEntry[] = [];
  const chunkSize = Math.ceil(entries.length / 4);
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    const weekNum = Math.floor(i / chunkSize) + 1;
    weeks.push({
      label: `W${weekNum}`,
      summary: aggregateSummaries(chunk),
    });
  }
  return weeks;
};

export const toPeriodEntries = (
  period: AnalyticsPeriod,
  weeklyData?: WeeklySummaryEntry[],
  monthlyData?: WeeklySummaryEntry[],
  yearlyData?: MonthlySummaryEntry[]
): PeriodEntry[] => {
  if (period === 'week' && weeklyData) {
    return weeklyData.map((d) => ({ label: shortDay(d.date), summary: d.summary }));
  }
  if (period === 'month' && monthlyData) {
    return groupByWeek(monthlyData);
  }
  if (period === 'year' && yearlyData) {
    return yearlyData.map((d) => ({ label: shortMonth(d.month), summary: d.summary }));
  }
  return [];
};

export interface StatsResult {
  total: number;
  avg: number;
  logged: number;
  totalLabel: string;
  avgLabel: string;
  loggedLabel: string;
  count: number;
}

export const computeStats = (
  period: AnalyticsPeriod,
  weeklyData?: WeeklySummaryEntry[],
  monthlyData?: WeeklySummaryEntry[],
  yearlyData?: MonthlySummaryEntry[]
): StatsResult => {
  const base: Omit<StatsResult, 'total' | 'avg' | 'logged'> =
    period === 'week'
      ? { totalLabel: 'Week Total', avgLabel: 'Daily Avg', loggedLabel: 'Days Logged', count: 7 }
      : period === 'month'
      ? { totalLabel: 'Month Total', avgLabel: 'Daily Avg', loggedLabel: 'Days Logged', count: 30 }
      : { totalLabel: 'Year Total', avgLabel: 'Monthly Avg', loggedLabel: 'Months Active', count: 12 };

  if (period === 'week' && weeklyData) {
    const total = weeklyData.reduce((s, d) => s + ((d.summary.total_expense as number) ?? 0), 0);
    const logged = weeklyData.filter((d) => Object.keys(d.summary).length > 0).length;
    return { total, avg: logged > 0 ? Math.round(total / logged) : 0, logged, ...base };
  }
  if (period === 'month' && monthlyData) {
    const total = monthlyData.reduce((s, d) => s + ((d.summary.total_expense as number) ?? 0), 0);
    const logged = monthlyData.filter((d) => Object.keys(d.summary).length > 0).length;
    return { total, avg: logged > 0 ? Math.round(total / logged) : 0, logged, ...base };
  }
  if (period === 'year' && yearlyData) {
    const total = yearlyData.reduce((s, d) => s + ((d.summary.total_expense as number) ?? 0), 0);
    const logged = yearlyData.filter((d) => Object.keys(d.summary).length > 0).length;
    return { total, avg: logged > 0 ? Math.round(total / logged) : 0, logged, ...base };
  }
  return { total: 0, avg: 0, logged: 0, ...base };
};
