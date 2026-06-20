import { Timestamp } from 'firebase-admin/firestore';
import { usersCollection } from '../auth/auth.service';
import { NotFoundError } from '../../utils/errors';
import type { SubscriptionStatus, UserProfile } from '../auth/auth.types';
import type { RevenueCatEventType } from './subscription.types';

const ACTIVE_EVENT_TYPES: ReadonlySet<RevenueCatEventType> = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'UNCANCELLATION',
  'PRODUCT_CHANGE',
]);

const statusForEvent = (type: RevenueCatEventType): SubscriptionStatus =>
  ACTIVE_EVENT_TYPES.has(type) ? 'active' : 'expired';

export const applySubscriptionEvent = async (
  uid: string,
  type: RevenueCatEventType,
  expirationAtMs: number | null
): Promise<void> => {
  await usersCollection().doc(uid).set(
    {
      subscriptionStatus: statusForEvent(type),
      subscriptionExpiresAt: expirationAtMs ? Timestamp.fromMillis(expirationAtMs) : undefined,
      updatedAt: Timestamp.now(),
    } as Partial<UserProfile> as UserProfile,
    { merge: true }
  );
};

export const getSubscriptionStatus = async (
  uid: string
): Promise<{ subscriptionStatus: SubscriptionStatus; subscriptionExpiresAt: Timestamp | null }> => {
  const snapshot = await usersCollection().doc(uid).get();
  if (!snapshot.exists) {
    throw new NotFoundError('User profile not found');
  }
  const profile = snapshot.data()!;
  return {
    subscriptionStatus: profile.subscriptionStatus ?? 'none',
    subscriptionExpiresAt: profile.subscriptionExpiresAt ?? null,
  };
};
