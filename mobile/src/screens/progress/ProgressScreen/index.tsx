import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetDailyLogs, useUpdateCategoryField } from '@/features/logs/logs.api';
import { DailySummaryCard, NUMERIC_KEYS, CATEGORY_LABELS } from './components/DailySummaryCard';
import { EntryList } from './components/EntryList';
import { EditFieldModal } from './components/EditFieldModal';
import { colors, spacing, typography, borderRadius } from '@/theme';

const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

interface EditingField {
  key: string;
  label: string;
  rawValue: string | number;
  isNumeric: boolean;
}

const ProgressScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [editingField, setEditingField] = useState<EditingField | null>(null);

  const {
    data: dailyData,
    isLoading: dailyLoading,
    isFetching: dailyFetching,
    refetch: refetchDaily,
  } = useGetDailyLogs(selectedDate);

  const updateFieldMutation = useUpdateCategoryField(selectedDate);

  const goToPrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateStr(d));
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const today = toDateStr(new Date());
    if (toDateStr(d) > today) return;
    setSelectedDate(toDateStr(d));
  };

  const isToday = selectedDate === toDateStr(new Date());

  const handleRefresh = async () => {
    await refetchDaily();
  };

  const handleEdit = (key: string, rawValue: string | number) => {
    setEditingField({
      key,
      label: CATEGORY_LABELS[key] ?? key,
      rawValue,
      isNumeric: NUMERIC_KEYS.has(key),
    });
  };

  const handleSave = async (value: string | number) => {
    if (!editingField) return;
    try {
      await updateFieldMutation.mutateAsync({ category: editingField.key, value });
      setEditingField(null);
    } catch {
      Alert.alert('Error', 'Failed to update. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Progress</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dailyFetching && !dailyLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary[400]}
          />
        }
      >
        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.arrowButton} onPress={goToPrevDay}>
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.dateCenter}>
            <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
            {isToday && <View style={styles.todayBadge}><Text style={styles.todayText}>Today</Text></View>}
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, isToday && styles.arrowDisabled]}
            onPress={goToNextDay}
            disabled={isToday}
          >
            <Text style={[styles.arrowText, isToday && styles.arrowTextDisabled]}>›</Text>
          </TouchableOpacity>
        </View>

        {dailyLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary[400]} />
          </View>
        ) : (
          <DailySummaryCard summary={dailyData?.summary ?? {}} isToday={isToday} onEdit={handleEdit} />
        )}

        {!dailyLoading && dailyData?.entries ? (
          <EntryList entries={dailyData.entries} />
        ) : null}
      </ScrollView>

      <EditFieldModal
        visible={editingField !== null}
        label={editingField?.label ?? ''}
        currentValue={String(editingField?.rawValue ?? '')}
        isNumeric={editingField?.isNumeric ?? false}
        isSaving={updateFieldMutation.isPending}
        onSave={handleSave}
        onDismiss={() => setEditingField(null)}
      />
    </SafeAreaView>
  );
};

export default ProgressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  screenTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: -0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  arrowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[700],
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  arrowText: {
    fontSize: typography.size.xxl,
    color: colors.neutral[0],
    lineHeight: typography.size.xxl * 1.2,
  },
  arrowTextDisabled: {
    color: colors.neutral[400],
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
    textAlign: 'center',
  },
  todayBadge: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.primary[700],
  },
  todayText: {
    fontSize: typography.size.xs,
    color: colors.primary[400],
    fontWeight: typography.weight.medium,
  },
  loadingContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
