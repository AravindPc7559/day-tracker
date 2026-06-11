import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { getStreak } from '../../services/streak.service';

export const getStreakController = asyncHandler(async (req: Request, res: Response) => {
  const data = await getStreak(req.user!.uid);
  sendSuccess(res, data, 'Streak fetched successfully');
});
