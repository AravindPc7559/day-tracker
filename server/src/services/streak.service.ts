import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { logger } from '../utils/logger';

interface StreakData {
  current: number;
  longest: number;
  lastLoggedDate: string | null;
}

export interface StreakResult {
  current: number;
  longest: number;
  lastLoggedDate: string | null;
}

const prevDay = (dateStr: string): string => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const updateStreak = async (uid: string, today: string): Promise<void> => {
  const userRef = db.collection(COLLECTIONS.USERS).doc(uid);

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);

      const existing = snap.exists
        ? ((snap.data()?.['streak'] ?? {}) as Partial<StreakData>)
        : {};

      const current = existing.current ?? 0;
      const longest = existing.longest ?? 0;
      const lastLoggedDate = existing.lastLoggedDate ?? null;

      // Already logged today — nothing to update
      if (lastLoggedDate === today) return;

      let newCurrent: number;

      if (lastLoggedDate === prevDay(today)) {
        // Consecutive day — extend streak
        newCurrent = current + 1;
      } else {
        // Missed day(s) or first ever log — reset
        newCurrent = 1;
      }

      const newLongest = Math.max(longest, newCurrent);

      tx.set(
        userRef,
        {
          streak: {
            current: newCurrent,
            longest: newLongest,
            lastLoggedDate: today,
          },
        },
        { merge: true }
      );
    });
  } catch (err) {
    // Non-critical — log but don't surface to user
    logger.error('Failed to update streak', { uid, err: String(err) });
  }
};

export const getStreak = async (uid: string): Promise<StreakResult> => {
  const snap = await db.collection(COLLECTIONS.USERS).doc(uid).get();

  if (!snap.exists) {
    return { current: 0, longest: 0, lastLoggedDate: null };
  }

  const streakData = snap.data()?.['streak'] as Partial<StreakData> | undefined;

  return {
    current: streakData?.current ?? 0,
    longest: streakData?.longest ?? 0,
    lastLoggedDate: streakData?.lastLoggedDate ?? null,
  };
};
