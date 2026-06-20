import { z } from 'zod';

export const revenueCatWebhookSchema = z.object({
  event: z.object({
    app_user_id: z.string().min(1),
    type: z.enum([
      'INITIAL_PURCHASE',
      'RENEWAL',
      'UNCANCELLATION',
      'CANCELLATION',
      'EXPIRATION',
      'BILLING_ISSUE',
      'PRODUCT_CHANGE',
    ]),
    expiration_at_ms: z.number().nullable(),
  }),
});

export type RevenueCatWebhookInput = z.infer<typeof revenueCatWebhookSchema>;
