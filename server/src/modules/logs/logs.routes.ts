import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  getDailyLogsController,
  updateDailySummaryController,
  updateCategoryFieldController,
  getWeeklyExpensesController,
  getWeeklySummaryController,
  getMonthlySummaryController,
  getYearlySummaryController,
  getCalendarDaysController,
  deleteEntryController,
} from './logs.controller';

const router = Router();

router.use(authMiddleware);

router.get('/weekly', getWeeklyExpensesController);
router.get('/weekly-summary', getWeeklySummaryController);
router.get('/monthly-summary', getMonthlySummaryController);
router.get('/yearly-summary', getYearlySummaryController);
router.get('/calendar/:month', getCalendarDaysController);
router.get('/:date', getDailyLogsController);
router.patch('/field/:date', updateCategoryFieldController);
router.patch('/summary/:date', updateDailySummaryController);
router.delete('/:date/entries/:entryId', deleteEntryController);

export default router;
