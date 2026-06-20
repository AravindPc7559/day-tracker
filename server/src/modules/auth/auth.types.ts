import type { Timestamp } from 'firebase-admin/firestore';

export type UserRole = 'user' | 'admin';

export type SubscriptionStatus = 'active' | 'expired' | 'none';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  pushToken?: string;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionExpiresAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
