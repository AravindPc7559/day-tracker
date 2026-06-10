import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { LogEntry } from '@/features/logs/logs.types';

interface EntryListProps {
  entries: LogEntry[];
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const EntryList: React.FC<EntryListProps> = ({ entries }) => {
  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entries</Text>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <View style={styles.entryDot} />
            <Text style={styles.entryTime}>{formatTime(entry.createdAt)}</Text>
          </View>
          <Text style={styles.entryText}>"{entry.transcription}"</Text>
          <View style={styles.tags}>
            {entry.categories.slice(0, 4).map((cat, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{cat.category.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
    marginBottom: spacing.xs,
  },
  entryCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    gap: spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  entryTime: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    fontWeight: typography.weight.medium,
  },
  entryText: {
    fontSize: typography.size.sm,
    color: colors.neutral[200],
    fontStyle: 'italic',
    lineHeight: typography.size.sm * 1.6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.primary[700],
  },
  tagText: {
    fontSize: typography.size.xs,
    color: colors.primary[400],
    fontWeight: typography.weight.medium,
  },
});
