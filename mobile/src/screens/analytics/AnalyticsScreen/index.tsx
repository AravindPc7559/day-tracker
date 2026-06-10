import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetWeeklySummary, useGetMonthlySummary, useGetYearlySummary } from '@/features/logs/logs.api';
import { StatsRow } from './components/StatsRow';
import { ExpenseTrendChart } from './components/ExpenseTrendChart';
import { MealBreakdown } from './components/MealBreakdown';
import { HabitsGrid } from './components/HabitsGrid';
import { NutritionChart } from './components/NutritionChart';
import { toPeriodEntries, computeStats } from './analyticsUtils';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { AnalyticsPeriod } from '@/features/logs/logs.types';

const PERIODS: { key: AnalyticsPeriod; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const AnalyticsScreen: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');

  const { data: weeklyData, isLoading: weeklyLoading, refetch: refetchWeekly } = useGetWeeklySummary();
  const { data: monthlyData, isLoading: monthlyLoading, refetch: refetchMonthly } = useGetMonthlySummary();
  const { data: yearlyData, isLoading: yearlyLoading, refetch: refetchYearly } = useGetYearlySummary();

  const isLoading =
    (period === 'week' && weeklyLoading) ||
    (period === 'month' && monthlyLoading) ||
    (period === 'year' && yearlyLoading);

  const handleRefresh = async () => {
    if (period === 'week') await refetchWeekly();
    if (period === 'month') await refetchMonthly();
    if (period === 'year') await refetchYearly();
  };

  const entries = toPeriodEntries(period, weeklyData, monthlyData, yearlyData);
  const stats = computeStats(period, weeklyData, monthlyData, yearlyData);
  const hasData = entries.length > 0 && entries.some((e) => Object.keys(e.summary).length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>

        <View style={styles.switcher}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.switcherTab, period === p.key && styles.switcherTabActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.switcherLabel, period === p.key && styles.switcherLabelActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary[400]} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} tintColor={colors.primary[400]} />
          }
        >
          {hasData ? (
            <>
              <StatsRow
                total={stats.total}
                avg={stats.avg}
                logged={stats.logged}
                totalLabel={stats.totalLabel}
                avgLabel={stats.avgLabel}
                loggedLabel={stats.loggedLabel}
                count={stats.count}
              />
              <ExpenseTrendChart data={entries} />
              <MealBreakdown data={entries} />
              <HabitsGrid data={entries} period={period} />
              <NutritionChart data={entries} />
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📈</Text>
              <Text style={styles.emptyTitle}>No data yet</Text>
              <Text style={styles.emptyText}>
                Start recording your day on the Home tab — your analytics will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AnalyticsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[900] },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: -0.3,
  },
  switcher: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  switcherTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  switcherTabActive: {
    backgroundColor: colors.primary[700],
  },
  switcherLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[400],
  },
  switcherLabelActive: {
    color: colors.neutral[0],
    fontWeight: typography.weight.semibold,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[200],
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
    textAlign: 'center',
    lineHeight: typography.size.sm * 1.6,
  },
});
