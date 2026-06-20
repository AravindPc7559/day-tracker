import type { FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import { db, adminAuth } from '../../config/firebase';
import { COLLECTIONS } from '../../config/constants';
import { NotFoundError, FirebaseError } from '../../utils/errors';
import type { UserProfile } from './auth.types';
import type { CreateProfileInput, UpdateProfileInput } from './auth.schema';

const userConverter: FirestoreDataConverter<UserProfile> = {
  toFirestore: (user) => ({ ...user }),
  fromFirestore: (snapshot: QueryDocumentSnapshot) =>
    ({ uid: snapshot.id, ...snapshot.data() } as UserProfile),
};

export const usersCollection = () =>
  db.collection(COLLECTIONS.USERS).withConverter(userConverter);

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snapshot = await usersCollection().doc(uid).get();
  if (!snapshot.exists) {
    return null;
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

export const savePushToken = async (uid: string, token: string): Promise<void> => {
  await usersCollection().doc(uid).set(
    { pushToken: token, updatedAt: Timestamp.now() } as Partial<UserProfile> as UserProfile,
    { merge: true },
  );
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


export const deleteAccount = async (uid: string): Promise<void> => {
  try {
    // Delete Auth user first — if this fails, no data has been touched yet (safe to retry)
    await adminAuth.deleteUser(uid);

    // Recursively delete all Firestore data under the user document
    // recursiveDelete handles all subcollections automatically, including any added in future
    await db.recursiveDelete(db.collection(COLLECTIONS.USERS).doc(uid));
  } catch (err) {
    throw new FirebaseError(`Failed to delete account: ${String(err)}`);
  }
};
