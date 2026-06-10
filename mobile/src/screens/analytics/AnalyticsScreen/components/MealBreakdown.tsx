import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { PeriodEntry } from '@/features/logs/logs.types';

interface MealBreakdownProps {
  data: PeriodEntry[];
}

const EXPENSES = [
  { key: 'breakfast_expense', label: 'Breakfast', color: '#F59E0B' },
  { key: 'lunch_expense', label: 'Lunch', color: '#10B981' },
  { key: 'dinner_expense', label: 'Dinner', color: '#3B82F6' },
  { key: 'snack_expense', label: 'Snacks', color: '#8B5CF6' },
  { key: 'entertainment_expense', label: 'Entertain', color: '#EC4899' },
  { key: 'transport_expense', label: 'Transport', color: '#F97316' },
  { key: 'shopping_expense', label: 'Shopping', color: '#14B8A6' },
  { key: 'health_expense', label: 'Health', color: '#EF4444' },
  { key: 'other_expense', label: 'Other', color: '#64748B' },
];

const { width: SCREEN_W } = Dimensions.get('window');
const BAR_W = SCREEN_W - spacing.xl * 2 - spacing.lg * 2 - 90;

export const MealBreakdown: React.FC<MealBreakdownProps> = ({ data }) => {
  const totals = EXPENSES.map((e) => ({
    ...e,
    total: data.reduce((sum, d) => sum + ((d.summary[e.key] as number) ?? 0), 0),
  })).filter((e) => e.total > 0);

  const max = Math.max(...totals.map((t) => t.total), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰  Expense Breakdown</Text>
      {totals.length > 0 ? (
        <View style={styles.bars}>
          {totals.map((item) => (
            <View key={item.key} style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: (item.total / max) * BAR_W, backgroundColor: item.color },
                  ]}
                />
              </View>
              <Text style={styles.amount}>₹{item.total}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No expenses for this period</Text>
        </View>
      )}
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
  bars: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: {
    width: 76,
    fontSize: typography.size.xs,
    color: colors.neutral[300],
    fontWeight: typography.weight.medium,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: borderRadius.full, minWidth: 4 },
  amount: {
    width: 52,
    fontSize: typography.size.xs,
    color: colors.neutral[200],
    fontWeight: typography.weight.semibold,
    textAlign: 'right',
  },
  empty: { height: 80, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: typography.size.sm, color: colors.neutral[400] },
});
