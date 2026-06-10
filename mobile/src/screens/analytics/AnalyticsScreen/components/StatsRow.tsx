import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface StatsRowProps {
  total: number;
  avg: number;
  logged: number;
  totalLabel: string;
  avgLabel: string;
  loggedLabel: string;
  count: number;
}

export const StatsRow: React.FC<StatsRowProps> = ({
  total, avg, logged, totalLabel, avgLabel, loggedLabel, count,
}) => {
  const stats = [
    { label: totalLabel, value: `₹${total}`, icon: '💰' },
    { label: avgLabel, value: `₹${avg}`, icon: '📅' },
    { label: loggedLabel, value: `${logged}/${count}`, icon: '✅' },
  ];

  return (
    <View style={styles.row}>
      {stats.map((stat, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.icon}>{stat.icon}</Text>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  icon: { fontSize: 20 },
  value: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  label: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    textAlign: 'center',
  },
});
