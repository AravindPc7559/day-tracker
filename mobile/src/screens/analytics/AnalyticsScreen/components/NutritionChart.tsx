import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChartCustom } from '@/components/ui/BarChartCustom';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { PeriodEntry } from '@/features/logs/logs.types';

interface NutritionChartProps {
  data: PeriodEntry[];
}

const MEAL_KEYS = ['breakfast_food', 'lunch_food', 'dinner_food', 'snack_food'];

export const NutritionChart: React.FC<NutritionChartProps> = ({ data }) => {
  const mealData = data.map((d) => ({
    label: d.label,
    value: MEAL_KEYS.filter((k) => d.summary[k] !== undefined).length,
  }));

  const waterData = data.map((d) => ({
    label: d.label,
    value: parseFloat(String(d.summary['water_intake'] ?? '0')) || 0,
  }));

  const sleepData = data.map((d) => ({
    label: d.label,
    value: parseFloat(String(d.summary['sleep_hours'] ?? '0')) || 0,
  }));

  const hasMeals = mealData.some((d) => d.value > 0);
  const hasWater = waterData.some((d) => d.value > 0);
  const hasSleep = sleepData.some((d) => d.value > 0);

  if (!hasMeals && !hasWater && !hasSleep) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊  Daily Tracking</Text>

      {hasMeals && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>🍽️ Meals logged</Text>
          <BarChartCustom data={mealData} color="#10B981" height={120} decimalPlaces={0} />
        </View>
      )}

      {hasWater && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>💧 Water intake (L)</Text>
          <BarChartCustom data={waterData} color="#38BDF8" height={120} suffix="L" decimalPlaces={1} />
        </View>
      )}

      {hasSleep && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>😴 Sleep hours</Text>
          <BarChartCustom data={sleepData} color="#8B5CF6" height={120} suffix="h" decimalPlaces={1} />
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
    marginBottom: spacing.md,
  },
  section: { marginBottom: spacing.lg },
  subtitle: { fontSize: typography.size.sm, color: colors.neutral[300], marginBottom: spacing.sm },
});
