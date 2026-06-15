import { z } from 'zod';

export const createProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
});

export const savePushTokenSchema = z.object({
  token: z.string().min(1, 'Push token is required'),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SavePushTokenInput = z.infer<typeof savePushTokenSchema>;
