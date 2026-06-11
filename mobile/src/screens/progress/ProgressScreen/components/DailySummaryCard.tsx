import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { DailySummary } from '@/features/logs/logs.types';

interface DailySummaryCardProps {
  summary: DailySummary;
  onEdit?: (key: string, rawValue: string | number) => void;
}

interface SummaryRow {
  key: string | null;
  label: string;
  value: string;
  rawValue: string | number;
}

interface SummaryGroup {
  title: string;
  icon: string;
  rows: SummaryRow[];
}

const FOOD_KEYS = ['breakfast_food', 'lunch_food', 'dinner_food', 'snack_food'];
const FOOD_LABELS: Record<string, string> = {
  breakfast_food: 'Breakfast',
  lunch_food: 'Lunch',
  dinner_food: 'Dinner',
  snack_food: 'Snack',
};

const EXPENSE_KEYS = [
  'breakfast_expense', 'lunch_expense', 'dinner_expense', 'snack_expense',
  'entertainment_expense', 'transport_expense', 'shopping_expense', 'health_expense', 'other_expense',
];
const EXPENSE_LABELS: Record<string, string> = {
  breakfast_expense: 'Breakfast',
  lunch_expense: 'Lunch',
  dinner_expense: 'Dinner',
  snack_expense: 'Snack',
  entertainment_expense: 'Entertainment',
  transport_expense: 'Transport',
  shopping_expense: 'Shopping',
  health_expense: 'Health',
  other_expense: 'Other',
};

const OTHER_KEYS: Record<string, { label: string; icon: string; format: (v: string | number) => string }> = {
  water_intake: { label: 'Water Intake', icon: '💧', format: (v) => `${v}L` },
  exercise: { label: 'Exercise', icon: '🏃', format: (v) => String(v) },
  mood: { label: 'Mood', icon: '😊', format: (v) => String(v) },
  sleep_hours: { label: 'Sleep', icon: '😴', format: (v) => `${v}h` },
  weight: { label: 'Weight', icon: '⚖️', format: (v) => `${v}kg` },
  notes: { label: 'Notes', icon: '📝', format: (v) => String(v) },
};

export const NUMERIC_KEYS = new Set([
  'breakfast_expense', 'lunch_expense', 'dinner_expense', 'snack_expense',
  'entertainment_expense', 'transport_expense', 'shopping_expense', 'health_expense', 'other_expense',
  'water_intake', 'sleep_hours', 'weight',
]);

export const CATEGORY_LABELS: Record<string, string> = {
  breakfast_food: 'Breakfast',
  lunch_food: 'Lunch',
  dinner_food: 'Dinner',
  snack_food: 'Snack',
  breakfast_expense: 'Breakfast Cost',
  lunch_expense: 'Lunch Cost',
  dinner_expense: 'Dinner Cost',
  snack_expense: 'Snack Cost',
  entertainment_expense: 'Entertainment',
  transport_expense: 'Transport',
  shopping_expense: 'Shopping',
  health_expense: 'Health',
  other_expense: 'Other Expense',
  water_intake: 'Water Intake',
  exercise: 'Exercise',
  mood: 'Mood',
  sleep_hours: 'Sleep',
  weight: 'Weight',
  notes: 'Notes',
};

const buildGroups = (summary: DailySummary): SummaryGroup[] => {
  const groups: SummaryGroup[] = [];

  const foodRows: SummaryRow[] = FOOD_KEYS
    .filter((k) => summary[k] !== undefined)
    .map((k) => ({
      key: k,
      label: FOOD_LABELS[k],
      value: String(summary[k]),
      rawValue: summary[k] as string | number,
    }));
  if (foodRows.length) groups.push({ title: 'Meals', icon: '🍽️', rows: foodRows });

  const expenseRows: SummaryRow[] = EXPENSE_KEYS
    .filter((k) => summary[k] !== undefined)
    .map((k) => ({
      key: k,
      label: EXPENSE_LABELS[k],
      value: `₹${summary[k]}`,
      rawValue: summary[k] as string | number,
    }));
  if (summary.total_expense !== undefined) {
    expenseRows.push({
      key: null,
      label: 'Total Today',
      value: `₹${summary.total_expense}`,
      rawValue: summary.total_expense,
    });
  }
  if (expenseRows.length) groups.push({ title: 'Expenses', icon: '💸', rows: expenseRows });

  for (const [key, meta] of Object.entries(OTHER_KEYS)) {
    if (summary[key] !== undefined) {
      groups.push({
        title: meta.label,
        icon: meta.icon,
        rows: [{
          key,
          label: meta.label,
          value: meta.format(summary[key] as string | number),
          rawValue: summary[key] as string | number,
        }],
      });
    }
  }

  return groups;
};

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ summary, onEdit }) => {
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
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{row.value}</Text>
                {row.key !== null && onEdit ? (
                  <TouchableOpacity
                    onPress={() => onEdit(row.key!, row.rawValue)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.editBtn}
                  >
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editBtnPlaceholder} />
                )}
              </View>
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
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderColor: colors.neutral[700],
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
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.neutral[700],
    gap: spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.neutral[300],
    paddingTop: 1,
  },
  rowRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  rowValue: {
    flexShrink: 1,
    fontSize: typography.size.sm,
    color: colors.neutral[0],
    fontWeight: typography.weight.semibold,
    textAlign: 'right',
  },
  editBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  editBtnText: {
    fontSize: 13,
  },
  editBtnPlaceholder: {
    width: 28,
    flexShrink: 0,
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
