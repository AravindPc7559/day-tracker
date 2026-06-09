import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/constants';
import { NotFoundError } from '../../utils/errors';
import type { UserProfile } from './auth.types';
import type { CreateProfileInput, UpdateProfileInput } from './auth.schema';

const userConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore: (user) => ({ ...user }),
  fromFirestore: (snapshot: QueryDocumentSnapshot) =>
    ({ uid: snapshot.id, ...snapshot.data() } as UserProfile),
};

const usersCollection = () =>
  db.collection(COLLECTIONS.USERS).withConverter(userConverter);

export const getUserProfile = async (uid: string): Promise<UserProfile> => {
  const snapshot = await usersCollection().doc(uid).get();
  if (!snapshot.exists) {
    throw new NotFoundError('User profile not found');
  }
  return snapshot.data()!;
};

export const createUserProfile = async (
  uid: string,
  email: string,
  input: CreateProfileInput
): Promise<UserProfile> => {
  const now = Timestamp.now();
  const profile: UserProfile = {
    uid,
    email,
    displayName: input.displayName,
    role: 'user',
    createdAt: now,
    updatedAt: now,
  };
  await usersCollection().doc(uid).set(profile);
  return profile;
};

export const updateUserProfile = async (
  uid: string,
  input: UpdateProfileInput
): Promise<UserProfile> => {
  const docRef = usersCollection().doc(uid);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    throw new NotFoundError('User profile not found');
  }
  const updates = { ...input, updatedAt: Timestamp.now() };
  await docRef.update(updates);
  const updated = await docRef.get();
  return updated.data()!;
};
