import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { UnauthorizedError } from '../../utils/errors';
import { env } from '../../config/env';
import { applySubscriptionEvent, getSubscriptionStatus } from './subscription.service';
import type { RevenueCatWebhookInput } from './subscription.schema';

export const webhookController = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${env.REVENUECAT_WEBHOOK_SECRET}`) {
    throw new UnauthorizedError('Invalid webhook secret');
  }

  const { event } = req.validatedBody as RevenueCatWebhookInput;
  await applySubscriptionEvent(event.app_user_id, event.type, event.expiration_at_ms);
  sendSuccess(res, null, 'Webhook processed');
});

export const getStatusController = asyncHandler(async (req: Request, res: Response) => {
  const status = await getSubscriptionStatus(req.user!.uid);
  sendSuccess(res, status, 'Subscription status retrieved');
});
