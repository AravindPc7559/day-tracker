import type { Timestamp } from 'firebase-admin/firestore';

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  pushToken?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
