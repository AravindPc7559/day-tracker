import { Timestamp, FieldValue, FieldPath } from 'firebase-admin/firestore';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/constants';
import { FirebaseError } from '../../utils/errors';
import type { Category, ConfirmSaveInput } from '../audio/audio.types';
import { updateStreak } from '../../services/streak.service';
import type { DailyLogsResponse, LogEntry, WeeklyExpense, WeeklySummaryEntry, MonthlySummaryEntry, DailySummary, CalendarDaysResponse } from './logs.types';

const EXPENSE_KEYS = [
  'breakfast_expense', 'lunch_expense', 'dinner_expense', 'snack_expense',
  'entertainment_expense', 'transport_expense', 'shopping_expense', 'health_expense', 'other_expense',
] as const;

const toLocalDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const last7Days = (): string[] =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return toLocalDateStr(d);
  });

export const saveEntry = async (uid: string, input: ConfirmSaveInput): Promise<string> => {
  const { transcription, categories, date, source } = input;

  try {
    const entriesRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.LOGS)
      .doc(date)
      .collection(COLLECTIONS.ENTRIES);

    const entryRef = await entriesRef.add({
      transcription,
      categories,
      createdAt: Timestamp.now(),
      date,
      ...(source ? { source } : {}),
    });

    const summaryRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.DAILY_SUMMARY)
      .doc(date);

    const summaryUpdate: Record<string, unknown> = { updatedAt: Timestamp.now() };
    let expenseDelta = 0;

    // Always read existing summary to compute accurate expense deltas and append notes
    const snap = await summaryRef.get();
    const existingData: Record<string, unknown> = snap.exists ? (snap.data() ?? {}) : {};
    const existingNotes = existingData['notes'] as string | undefined;

    for (const cat of categories) {
      if (cat.category === 'notes' && typeof cat.value === 'string') {
        const newNote = cat.value.trim();
        summaryUpdate['notes'] = existingNotes
          ? `${existingNotes}\n${newNote}`
          : newNote;
      } else {
        summaryUpdate[cat.category] = cat.value;
        if (cat.category.endsWith('_expense') && typeof cat.value === 'number') {
          const oldValue = typeof existingData[cat.category] === 'number'
            ? (existingData[cat.category] as number)
            : 0;
          expenseDelta += cat.value - oldValue;
        }
      }
    }

    if (expenseDelta !== 0) {
      summaryUpdate['total_expense'] = FieldValue.increment(expenseDelta);
    }

    await summaryRef.set(summaryUpdate, { merge: true });

    // Also update monthly_summary for year-view analytics
    const month = date.slice(0, 7); // YYYY-MM
    const monthlyRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.MONTHLY_SUMMARY)
      .doc(month);

    const monthlyUpdate: Record<string, unknown> = { updatedAt: Timestamp.now() };
    for (const cat of categories) {
      if (cat.category.endsWith('_expense') && typeof cat.value === 'number') {
        const oldValue = typeof existingData[cat.category] === 'number'
          ? (existingData[cat.category] as number)
          : 0;
        const catDelta = cat.value - oldValue;
        if (catDelta !== 0) {
          monthlyUpdate[cat.category] = FieldValue.increment(catDelta);
        }
      }
    }
    if (expenseDelta !== 0) {
      monthlyUpdate['total_expense'] = FieldValue.increment(expenseDelta);
    }
    await monthlyRef.set(monthlyUpdate, { merge: true });

    // Update streak — runs after all writes, non-blocking on failure
    await updateStreak(uid, date);

    return entryRef.id;
  } catch (err) {
    throw new FirebaseError(`Failed to save entry: ${String(err)}`);
  }
};

export const updateCategoryField = async (
  uid: string,
  date: string,
  category: string,
  value: string | number
): Promise<void> => {
  try {
    const summaryRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.DAILY_SUMMARY)
      .doc(date);

    let expenseDelta = 0;

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(summaryRef);
      const data = snap.data() ?? {};

      const updates: Record<string, unknown> = {
        [category]: value,
        updatedAt: Timestamp.now(),
      };

      if (category.endsWith('_expense') && typeof value === 'number') {
        const oldValue = typeof data[category] === 'number' ? (data[category] as number) : 0;
        expenseDelta = value - oldValue;

        const total = EXPENSE_KEYS.reduce((sum, k) => {
          const v = k === category ? value : (typeof data[k] === 'number' ? (data[k] as number) : 0);
          return sum + v;
        }, 0);
        updates['total_expense'] = total;
      }

      tx.set(summaryRef, updates, { merge: true });
    });

    if (category.endsWith('_expense') && expenseDelta !== 0) {
      const month = date.slice(0, 7);
      const monthlyRef = db
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .collection(COLLECTIONS.MONTHLY_SUMMARY)
        .doc(month);
      await monthlyRef.set(
        {
          [category]: FieldValue.increment(expenseDelta),
          total_expense: FieldValue.increment(expenseDelta),
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    }

    // Update the most recent entry that has this category
    const entriesSnap = await db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.LOGS)
      .doc(date)
      .collection(COLLECTIONS.ENTRIES)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    for (const doc of entriesSnap.docs) {
      const cats = doc.data()['categories'] as Array<{ category: string; value: string | number }>;
      const idx = cats.findIndex((c) => c.category === category);
      if (idx !== -1) {
        const updated = [...cats];
        updated[idx] = { category, value };
        await doc.ref.update({ categories: updated });
        break;
      }
    }
  } catch (err) {
    throw new FirebaseError(`Failed to update category field: ${String(err)}`);
  }
};

export const updateDailySummary = async (
  uid: string,
  date: string,
  updates: Record<string, string | number>
): Promise<void> => {
  try {
    const summaryRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.DAILY_SUMMARY)
      .doc(date);

    await summaryRef.set(updates, { merge: true });

    // Sync expense totals in monthly_summary
    const expenseDelta = Object.entries(updates)
      .filter(([k, v]) => k.endsWith('_expense') && typeof v === 'number')
      .reduce((sum, [, v]) => sum + (v as number), 0);

    if (expenseDelta > 0) {
      const month = date.slice(0, 7);
      const monthlyRef = db
        .collection(COLLECTIONS.USERS)
        .doc(uid)
        .collection(COLLECTIONS.MONTHLY_SUMMARY)
        .doc(month);
      const monthlyUpdate: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(updates)) {
        if (k.endsWith('_expense') && typeof v === 'number') monthlyUpdate[k] = v;
      }
      await monthlyRef.set(monthlyUpdate, { merge: true });
    }
  } catch (err) {
    throw new FirebaseError(`Failed to update daily summary: ${String(err)}`);
  }
};

export const getDailyLogs = async (uid: string, date: string): Promise<DailyLogsResponse> => {
  try {
    const summaryRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.DAILY_SUMMARY)
      .doc(date);

    const summarySnap = await summaryRef.get();
    const summary = parseSummarySnap(summarySnap);

    const entriesSnap = await db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.LOGS)
      .doc(date)
      .collection(COLLECTIONS.ENTRIES)
      .orderBy('createdAt', 'desc')
      .get();

    const entries: LogEntry[] = entriesSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        transcription: data['transcription'] as string,
        categories: data['categories'] as LogEntry['categories'],
        createdAt: (data['createdAt'] as Timestamp).toDate().toISOString(),
        date: data['date'] as string,
        ...(data['source'] ? { source: data['source'] as LogEntry['source'] } : {}),
      };
    });

    return { summary, entries };
  } catch (err) {
    throw new FirebaseError(`Failed to fetch daily logs: ${String(err)}`);
  }
};

export const getWeeklyExpenses = async (uid: string): Promise<WeeklyExpense[]> => {
  const dateStrings = last7Days();
  try {
    const snaps = await Promise.all(
      dateStrings.map((date) =>
        db.collection(COLLECTIONS.USERS).doc(uid).collection(COLLECTIONS.DAILY_SUMMARY).doc(date).get()
      )
    );
    return dateStrings.map((date, i) => ({
      date,
      total_expense: snaps[i].exists ? ((snaps[i].data()?.['total_expense'] as number) ?? 0) : 0,
    }));
  } catch (err) {
    throw new FirebaseError(`Failed to fetch weekly expenses: ${String(err)}`);
  }
};

const parseSummarySnap = (snap: FirebaseFirestore.DocumentSnapshot): DailySummary => {
  if (!snap.exists) return {};
  const raw = snap.data() ?? {};
  const summary: DailySummary = {};
  for (const [key, val] of Object.entries(raw)) {
    if (val && typeof val === 'object' && typeof (val as { toDate?: unknown }).toDate === 'function') {
      summary[key] = (val as { toDate: () => Date }).toDate().toISOString();
    } else {
      summary[key] = val as string | number;
    }
  }
  return summary;
};

export const getWeeklySummary = async (uid: string): Promise<WeeklySummaryEntry[]> => {
  const dateStrings = last7Days();
  try {
    const snaps = await Promise.all(
      dateStrings.map((date) =>
        db.collection(COLLECTIONS.USERS).doc(uid).collection(COLLECTIONS.DAILY_SUMMARY).doc(date).get()
      )
    );
    return dateStrings.map((date, i) => ({
      date,
      summary: parseSummarySnap(snaps[i]),
    }));
  } catch (err) {
    throw new FirebaseError(`Failed to fetch weekly summary: ${String(err)}`);
  }
};

export const getMonthlySummary = async (uid: string): Promise<WeeklySummaryEntry[]> => {
  const today = new Date();
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return toLocalDateStr(d);
  });

  try {
    const snaps = await Promise.all(
      daysInMonth.map((date) =>
        db.collection(COLLECTIONS.USERS).doc(uid).collection(COLLECTIONS.DAILY_SUMMARY).doc(date).get()
      )
    );
    return daysInMonth.map((date, i) => ({
      date,
      summary: parseSummarySnap(snaps[i]),
    }));
  } catch (err) {
    throw new FirebaseError(`Failed to fetch monthly summary: ${String(err)}`);
  }
};

export const deleteEntry = async (uid: string, date: string, entryId: string): Promise<void> => {
  try {
    const entriesRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.LOGS)
      .doc(date)
      .collection(COLLECTIONS.ENTRIES);

    const summaryRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.DAILY_SUMMARY)
      .doc(date);

    const month = date.slice(0, 7);
    const monthlyRef = db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.MONTHLY_SUMMARY)
      .doc(month);

    await db.runTransaction(async (tx) => {
      const entryRef = entriesRef.doc(entryId);
      const entrySnap = await tx.get(entryRef);
      if (!entrySnap.exists) return;

      const deletedCategories = (entrySnap.data()?.['categories'] as Category[]) ?? [];
      tx.delete(entryRef);
      if (deletedCategories.length === 0) return;

      const [summarySnap, remainingSnap] = await Promise.all([
        tx.get(summaryRef),
        tx.get(entriesRef.orderBy('createdAt', 'desc')),
      ]);
      const summaryData = summarySnap.data() ?? {};
      const remainingCategories = remainingSnap.docs
        .filter((doc) => doc.id !== entryId)
        .flatMap((doc) => (doc.data()['categories'] as Category[]) ?? []);

      // Re-derive each field the deleted entry contributed from the next most recent
      // remaining entry that still sets it — mirrors the "latest entry wins" model
      // used by updateCategoryField. 'notes' is append-only and left as-is (best effort).
      const summaryUpdates: Record<string, unknown> = { updatedAt: Timestamp.now() };
      const monthlyUpdates: Record<string, unknown> = { updatedAt: Timestamp.now() };
      let totalExpenseDelta = 0;
      const affectedCategories = new Set(
        deletedCategories.map((c) => c.category).filter((c) => c !== 'notes')
      );

      for (const categoryKey of affectedCategories) {
        const fallback = remainingCategories.find((c) => c.category === categoryKey);
        summaryUpdates[categoryKey] = fallback ? fallback.value : FieldValue.delete();

        if (categoryKey.endsWith('_expense')) {
          const oldNum = typeof summaryData[categoryKey] === 'number' ? (summaryData[categoryKey] as number) : 0;
          const newNum = typeof fallback?.value === 'number' ? fallback.value : 0;
          const delta = newNum - oldNum;
          if (delta !== 0) {
            totalExpenseDelta += delta;
            monthlyUpdates[categoryKey] = FieldValue.increment(delta);
          }
        }
      }

      if (totalExpenseDelta !== 0) {
        summaryUpdates['total_expense'] = FieldValue.increment(totalExpenseDelta);
        monthlyUpdates['total_expense'] = FieldValue.increment(totalExpenseDelta);
      }

      tx.set(summaryRef, summaryUpdates, { merge: true });
      if (Object.keys(monthlyUpdates).length > 1) {
        tx.set(monthlyRef, monthlyUpdates, { merge: true });
      }
    });
  } catch (err) {
    throw new FirebaseError(`Failed to delete entry: ${String(err)}`);
  }
};

export const getCalendarDays = async (uid: string, month: string): Promise<CalendarDaysResponse> => {
  const start = `${month}-01`;
  const end = `${month}-31`;
  try {
    const snap = await db
      .collection(COLLECTIONS.USERS)
      .doc(uid)
      .collection(COLLECTIONS.DAILY_SUMMARY)
      .where(FieldPath.documentId(), '>=', start)
      .where(FieldPath.documentId(), '<=', end)
      .select()
      .get();
    const completedDates = snap.docs.map((doc) => doc.id);
    return { month, completedDates };
  } catch (err) {
    throw new FirebaseError(`Failed to fetch calendar days: ${String(err)}`);
  }
};

export const getYearlySummary = async (uid: string): Promise<MonthlySummaryEntry[]> => {
  const today = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  try {
    const snaps = await Promise.all(
      months.map((month) =>
        db.collection(COLLECTIONS.USERS).doc(uid).collection(COLLECTIONS.MONTHLY_SUMMARY).doc(month).get()
      )
    );
    return months.map((month, i) => ({
      month,
      summary: parseSummarySnap(snaps[i]),
    }));
  } catch (err) {
    throw new FirebaseError(`Failed to fetch yearly summary: ${String(err)}`);
  }
};
