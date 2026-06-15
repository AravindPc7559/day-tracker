import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  type User,
} from 'firebase/auth';
import { auth } from './firebase.config';

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async (email: string, password: string): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const setFirebaseDisplayName = async (user: User, displayName: string): Promise<void> => {
  await updateProfile(user, { displayName });
};

export const sendEmailVerification = (user: User) =>
  firebaseSendEmailVerification(user);

export const sendPasswordResetEmail = (email: string) =>
  firebaseSendPasswordResetEmail(auth, email);

export const reloadUser = (user: User) => user.reload();

export const signInWithGoogle = (idToken: string) => {
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
};

export const getCurrentToken = (forceRefresh = false): Promise<string | null> =>
  auth.currentUser ? auth.currentUser.getIdToken(forceRefresh) : Promise.resolve(null);

export const signOut = () => firebaseSignOut(auth);

export const onAuthStateChanged = (callback: (user: User | null) => void) =>
  firebaseOnAuthStateChanged(auth, callback);
