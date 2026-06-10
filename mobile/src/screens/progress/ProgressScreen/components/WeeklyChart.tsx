import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { WeeklyExpense } from '@/features/logs/logs.types';

interface WeeklyChartProps {
  data: WeeklyExpense[];
}

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - spacing.xl * 2;

const shortDay = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
};

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const labels = data.map((d) => shortDay(d.date));
  const values = data.map((d) => d.total_expense);
  const hasData = values.some((v) => v > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Expenses</Text>
      {hasData ? (
        <BarChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={CHART_W}
          height={180}
          yAxisLabel="₹"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.neutral[800],
            backgroundGradientFrom: colors.neutral[800],
            backgroundGradientTo: colors.neutral[800],
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
            labelColor: () => colors.neutral[300],
            barPercentage: 0.6,
            propsForBackgroundLines: {
              stroke: colors.neutral[700],
              strokeDasharray: '',
            },
          }}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
          withInnerLines
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No expenses recorded this week</Text>
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
  chart: {
    borderRadius: borderRadius.lg,
    marginLeft: -spacing.md,
  },
  empty: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
  },
});
