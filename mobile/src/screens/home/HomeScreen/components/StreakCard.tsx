import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { StreakData } from '@/features/streak/streak.types';

interface StreakCardProps {
  streak: StreakData | undefined;
}

const MILESTONES = [
  { days: 7, label: '1 Week', icon: '⭐' },
  { days: 30, label: '1 Month', icon: '🥈' },
  { days: 100, label: '100 Days', icon: '🥇' },
  { days: 365, label: '1 Year', icon: '👑' },
];

const getMilestone = (current: number) =>
  MILESTONES.slice()
    .reverse()
    .find((m) => current >= m.days) ?? null;

const getNextMilestone = (current: number) =>
  MILESTONES.find((m) => current < m.days) ?? null;

export const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  const current = streak?.current ?? 0;
  const longest = streak?.longest ?? 0;
  const milestone = getMilestone(current);
  const next = getNextMilestone(current);

  if (current === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🎯</Text>
        <Text style={styles.emptyText}>Start your streak today!</Text>
        <Text style={styles.emptyHint}>Log once a day to build your streak</Text>
      </View>
    );
  }

  const streakColor =
    current >= 100 ? '#F59E0B' :
    current >= 30  ? '#8B5CF6' :
    current >= 7   ? '#10B981' :
    colors.primary[400];

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.mainStat}>
          <Text style={[styles.flame, { color: streakColor }]}>🔥</Text>
          <View>
            <Text style={[styles.currentCount, { color: streakColor }]}>
              {current} {current === 1 ? 'day' : 'days'}
            </Text>
            <Text style={styles.currentLabel}>Current Streak</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.longestStat}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <View>
            <Text style={styles.longestCount}>{longest}</Text>
            <Text style={styles.longestLabel}>Best</Text>
          </View>
        </View>
      </View>

      {milestone && (
        <View style={styles.badgeRow}>
          <Text style={styles.badgeIcon}>{milestone.icon}</Text>
          <Text style={styles.badgeText}>{milestone.label} streak achieved!</Text>
        </View>
      )}

      {next && (
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((current / next.days) * 100, 100)}%` as `${number}%`,
                  backgroundColor: streakColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {next.days - current}d to {next.label}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flame: {
    fontSize: 28,
  },
  currentCount: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    letterSpacing: -0.5,
  },
  currentLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: colors.neutral[600],
    marginHorizontal: spacing.lg,
  },
  longestStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trophyIcon: {
    fontSize: 20,
  },
  longestCount: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[100],
  },
  longestLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  badgeIcon: { fontSize: 14 },
  badgeText: {
    fontSize: typography.size.xs,
    color: '#F59E0B',
    fontWeight: typography.weight.semibold,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    minWidth: 4,
  },
  progressLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    minWidth: 72,
    textAlign: 'right',
  },
  emptyCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyIcon: { fontSize: 28 },
  emptyText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[100],
  },
  emptyHint: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },
});
