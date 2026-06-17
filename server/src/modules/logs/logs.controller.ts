import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { ValidationError } from '../../utils/errors';
import { getDailyLogs, getWeeklyExpenses, getWeeklySummary, getMonthlySummary, getYearlySummary, getCalendarDays, updateDailySummary, updateCategoryField, deleteEntry } from './logs.service';

export const updateCategoryFieldController = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params['date'] as string;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Date must be in YYYY-MM-DD format');
  }
  const { category, value } = req.body as { category: string; value: string | number };
  if (!category || typeof category !== 'string') {
    throw new ValidationError('category is required');
  }
  if (value === undefined || value === null) {
    throw new ValidationError('value is required');
  }
  await updateCategoryField(req.user!.uid, date, category, value);
  sendSuccess(res, null, 'Field updated successfully');
});

export const updateDailySummaryController = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params['date'] as string;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Date must be in YYYY-MM-DD format');
  }
  const updates = req.body as Record<string, string | number>;
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    throw new ValidationError('Updates object is required');
  }
  await updateDailySummary(req.user!.uid, date, updates);
  sendSuccess(res, null, 'Summary updated successfully');
});

export const getDailyLogsController = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params['date'] as string;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Date must be in YYYY-MM-DD format');
  }
  const data = await getDailyLogs(req.user!.uid, date);
  sendSuccess(res, data, 'Daily logs fetched successfully');
});

export const getWeeklyExpensesController = asyncHandler(async (req: Request, res: Response) => {
  const data = await getWeeklyExpenses(req.user!.uid);
  sendSuccess(res, data, 'Weekly expenses fetched successfully');
});

export const getWeeklySummaryController = asyncHandler(async (req: Request, res: Response) => {
  const data = await getWeeklySummary(req.user!.uid);
  sendSuccess(res, data, 'Weekly summary fetched successfully');
});

export const getMonthlySummaryController = asyncHandler(async (req: Request, res: Response) => {
  const data = await getMonthlySummary(req.user!.uid);
  sendSuccess(res, data, 'Monthly summary fetched successfully');
});

export const getYearlySummaryController = asyncHandler(async (req: Request, res: Response) => {
  const data = await getYearlySummary(req.user!.uid);
  sendSuccess(res, data, 'Yearly summary fetched successfully');
});

export const getCalendarDaysController = asyncHandler(async (req: Request, res: Response) => {
  const month = req.params['month'] as string;
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new ValidationError('Month must be in YYYY-MM format');
  }
  const data = await getCalendarDays(req.user!.uid, month);
  sendSuccess(res, data, 'Calendar days fetched successfully');
});

export const deleteEntryController = asyncHandler(async (req: Request, res: Response) => {
  const { date, entryId } = req.params as { date: string; entryId: string };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Date must be in YYYY-MM-DD format');
  }
  if (!entryId) throw new ValidationError('entryId is required');
  await deleteEntry(req.user!.uid, date, entryId);
  sendSuccess(res, null, 'Entry deleted successfully');
});
