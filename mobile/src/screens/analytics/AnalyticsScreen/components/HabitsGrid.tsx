import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { PeriodEntry, AnalyticsPeriod } from '@/features/logs/logs.types';

interface HabitsGridProps {
  data: PeriodEntry[];
  period: AnalyticsPeriod;
}

const HABITS = [
  { key: 'water_intake', icon: '💧', label: 'Water' },
  { key: 'exercise', icon: '🏃', label: 'Exercise' },
  { key: 'sleep_hours', icon: '😴', label: 'Sleep' },
  { key: 'mood', icon: '😊', label: 'Mood' },
  { key: 'lunch_food', icon: '🍽️', label: 'Meals' },
];

export const HabitsGrid: React.FC<HabitsGridProps> = ({ data, period }) => {
  const hasAnyHabit = data.some((d) => HABITS.some((h) => d.summary[h.key] !== undefined));
  if (!hasAnyHabit) return null;

  // For month/year views, show habit completion counts instead of grid
  if (period !== 'week') {
    const total = data.length;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📋  Habit Summary</Text>
        <View style={styles.countGrid}>
          {HABITS.map((habit) => {
            const count = data.filter((d) => d.summary[habit.key] !== undefined).length;
            if (count === 0) return null;
            const pct = Math.round((count / total) * 100);
            return (
              <View key={habit.key} style={styles.countCard}>
                <Text style={styles.countIcon}>{habit.icon}</Text>
                <Text style={styles.countValue}>{count}/{total}</Text>
                <Text style={styles.countPct}>{pct}%</Text>
                <Text style={styles.countLabel}>{habit.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // Week view: day-by-day grid
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋  Weekly Habits</Text>
      <View style={styles.headerRow}>
        <View style={styles.habitLabelCell} />
        {data.map((d, i) => (
          <Text key={i} style={styles.dayLabel}>{d.label}</Text>
        ))}
      </View>
      {HABITS.map((habit) => {
        const hasHabit = data.some((d) => d.summary[habit.key] !== undefined);
        if (!hasHabit) return null;
        return (
          <View key={habit.key} style={styles.habitRow}>
            <View style={styles.habitLabelCell}>
              <Text style={styles.habitIcon}>{habit.icon}</Text>
              <Text style={styles.habitName}>{habit.label}</Text>
            </View>
            {data.map((d, i) => {
              const logged = d.summary[habit.key] !== undefined;
              return (
                <View key={i} style={[styles.dot, logged ? styles.dotFilled : styles.dotEmpty]}>
                  {logged && <Text style={styles.checkmark}>✓</Text>}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
    marginBottom: spacing.lg,
  },
  // Week grid
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    fontWeight: typography.weight.semibold,
  },
  habitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  habitLabelCell: { width: 80, flexDirection: 'row', alignItems: 'center', gap: 4 },
  habitIcon: { fontSize: 14 },
  habitName: { fontSize: typography.size.xs, color: colors.neutral[300] },
  dot: {
    flex: 1, height: 26, marginHorizontal: 2,
    borderRadius: borderRadius.sm, justifyContent: 'center', alignItems: 'center',
  },
  dotFilled: { backgroundColor: colors.primary[700] },
  dotEmpty: { backgroundColor: colors.neutral[700] },
  checkmark: { fontSize: 11, color: colors.primary[300], fontWeight: typography.weight.bold },
  // Month/Year count cards
  countGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  countCard: {
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minWidth: 80,
    gap: 2,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  countIcon: { fontSize: 20 },
  countValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  countPct: {
    fontSize: typography.size.xs,
    color: colors.primary[400],
    fontWeight: typography.weight.semibold,
  },
  countLabel: { fontSize: typography.size.xs, color: colors.neutral[400] },
});
