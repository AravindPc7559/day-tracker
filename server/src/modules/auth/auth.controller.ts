import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { getUserProfile, createUserProfile, updateUserProfile, savePushToken } from './auth.service';
import type { CreateProfileInput, UpdateProfileInput, SavePushTokenInput } from './auth.schema';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await getUserProfile(req.user!.uid);
  sendSuccess(res, profile, 'Profile retrieved');
});

export const createProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = req.validatedBody as CreateProfileInput;
  const profile = await createUserProfile(req.user!.uid, req.user!.email, input);
  sendSuccess(res, profile, 'Profile created', 201);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const input = req.validatedBody as UpdateProfileInput;
  const profile = await updateUserProfile(req.user!.uid, input);
  sendSuccess(res, profile, 'Profile updated');
});

export const savePushTokenController = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.validatedBody as SavePushTokenInput;
  await savePushToken(req.user!.uid, token);
  sendSuccess(res, null, 'Push token saved');
});
