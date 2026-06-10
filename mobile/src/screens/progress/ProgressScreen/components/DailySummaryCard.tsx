import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { DailySummary } from '@/features/logs/logs.types';

interface DailySummaryCardProps {
  summary: DailySummary;
}

interface SummaryGroup {
  title: string;
  icon: string;
  rows: { label: string; value: string }[];
}

const FOOD_KEYS = ['breakfast_food', 'lunch_food', 'dinner_food', 'snack_food'];
const FOOD_LABELS: Record<string, string> = {
  breakfast_food: 'Breakfast',
  lunch_food: 'Lunch',
  dinner_food: 'Dinner',
  snack_food: 'Snack',
};

const EXPENSE_KEYS = ['breakfast_expense', 'lunch_expense', 'dinner_expense', 'snack_expense'];
const EXPENSE_LABELS: Record<string, string> = {
  breakfast_expense: 'Breakfast',
  lunch_expense: 'Lunch',
  dinner_expense: 'Dinner',
  snack_expense: 'Snack',
};

const OTHER_KEYS: Record<string, { label: string; icon: string; format: (v: string | number) => string }> = {
  water_intake: { label: 'Water Intake', icon: '💧', format: (v) => `${v}L` },
  exercise: { label: 'Exercise', icon: '🏃', format: (v) => String(v) },
  mood: { label: 'Mood', icon: '😊', format: (v) => String(v) },
  sleep_hours: { label: 'Sleep', icon: '😴', format: (v) => `${v}h` },
  weight: { label: 'Weight', icon: '⚖️', format: (v) => `${v}kg` },
  notes: { label: 'Notes', icon: '📝', format: (v) => String(v) },
};

const buildGroups = (summary: DailySummary): SummaryGroup[] => {
  const groups: SummaryGroup[] = [];

  const foodRows = FOOD_KEYS
    .filter((k) => summary[k] !== undefined)
    .map((k) => ({ label: FOOD_LABELS[k], value: String(summary[k]) }));
  if (foodRows.length) groups.push({ title: 'Meals', icon: '🍽️', rows: foodRows });

  const expenseRows = EXPENSE_KEYS
    .filter((k) => summary[k] !== undefined)
    .map((k) => ({ label: EXPENSE_LABELS[k], value: `₹${summary[k]}` }));
  if (summary.total_expense !== undefined) {
    expenseRows.push({ label: 'Total Today', value: `₹${summary.total_expense}` });
  }
  if (expenseRows.length) groups.push({ title: 'Expenses', icon: '💸', rows: expenseRows });

  for (const [key, meta] of Object.entries(OTHER_KEYS)) {
    if (summary[key] !== undefined) {
      groups.push({
        title: meta.label,
        icon: meta.icon,
        rows: [{ label: meta.label, value: meta.format(summary[key] as string | number) }],
      });
    }
  }

  return groups;
};

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ summary }) => {
  const groups = buildGroups(summary);

  if (groups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data recorded for this day yet.</Text>
        <Text style={styles.emptyHint}>Tap the mic on the Home tab to log your day.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {groups.map((group, gi) => (
        <View key={gi} style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupIcon}>{group.icon}</Text>
            <Text style={styles.groupTitle}>{group.title}</Text>
          </View>
          {group.rows.map((row, ri) => (
            <View key={ri} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  group: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  groupIcon: {
    fontSize: 18,
  },
  groupTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderColor: colors.neutral[700],
  },
  rowLabel: {
    fontSize: typography.size.sm,
    color: colors.neutral[300],
  },
  rowValue: {
    fontSize: typography.size.sm,
    color: colors.neutral[0],
    fontWeight: typography.weight.medium,
  },
  emptyContainer: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[600],
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.size.md,
    color: colors.neutral[200],
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
    textAlign: 'center',
  },
});
