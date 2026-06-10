import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChartCustom } from '@/components/ui/BarChartCustom';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { PeriodEntry } from '@/features/logs/logs.types';

interface ExpenseTrendChartProps {
  data: PeriodEntry[];
}

export const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ data }) => {
  const chartData = data.map((d) => ({
    label: d.label,
    value: (d.summary.total_expense as number) ?? 0,
  }));

  const hasData = chartData.some((d) => d.value > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💸  Expense Trend</Text>
      {hasData ? (
        <BarChartCustom data={chartData} color={colors.primary[600]} prefix="₹" height={140} />
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
  empty: { height: 100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: typography.size.sm, color: colors.neutral[400] },
});
