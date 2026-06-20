export type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'UNCANCELLATION'
  | 'CANCELLATION'
  | 'EXPIRATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE';

export interface RevenueCatWebhookEvent {
  app_user_id: string;
  type: RevenueCatEventType;
  expiration_at_ms: number | null;
}

export interface RevenueCatWebhookPayload {
  event: RevenueCatWebhookEvent;
}
