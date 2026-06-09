import type { User } from 'firebase/auth';

export type AppUser = Pick<
  User,
  'uid' | 'email' | 'displayName' | 'photoURL' | 'emailVerified'
>;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
