import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { PaymentRequiredError } from '../utils/errors';
import { getSubscriptionStatus } from '../modules/subscription/subscription.service';

export const subscriptionMiddleware = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { subscriptionStatus } = await getSubscriptionStatus(req.user!.uid);

    if (subscriptionStatus !== 'active') {
      throw new PaymentRequiredError('An active subscription is required to use this feature');
    }

    next();
  }
);
