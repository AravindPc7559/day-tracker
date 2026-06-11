import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { DailySummary } from '@/features/logs/logs.types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Public exports consumed by ProgressScreen ────────────────────────────────

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

// ─── Meal categories — always rendered even when empty ─────────────────────────

const MEAL_SLOTS = [
  { key: 'breakfast_food', label: 'Breakfast', icon: '🍳' },
  { key: 'lunch_food',     label: 'Lunch',     icon: '🍽️' },
  { key: 'dinner_food',    label: 'Dinner',    icon: '🌙' },
  { key: 'snack_food',     label: 'Snack',     icon: '🍎' },
] as const;

// ─── Non-meal groups ───────────────────────────────────────────────────────────

const EXPENSE_KEYS = [
  'breakfast_expense', 'lunch_expense', 'dinner_expense', 'snack_expense',
  'entertainment_expense', 'transport_expense', 'shopping_expense', 'health_expense', 'other_expense',
];
const EXPENSE_LABELS: Record<string, string> = {
  breakfast_expense: 'Breakfast', lunch_expense: 'Lunch', dinner_expense: 'Dinner',
  snack_expense: 'Snack', entertainment_expense: 'Entertainment', transport_expense: 'Transport',
  shopping_expense: 'Shopping', health_expense: 'Health', other_expense: 'Other',
};

const OTHER_KEYS: Record<string, { label: string; icon: string; format: (v: string | number) => string }> = {
  water_intake: { label: 'Water Intake', icon: '💧', format: (v) => `${v}L` },
  exercise:     { label: 'Exercise',     icon: '🏃', format: (v) => String(v) },
  mood:         { label: 'Mood',         icon: '😊', format: (v) => String(v) },
  sleep_hours:  { label: 'Sleep',        icon: '😴', format: (v) => `${v}h` },
  weight:       { label: 'Weight',       icon: '⚖️', format: (v) => `${v}kg` },
  notes:        { label: 'Notes',        icon: '📝', format: (v) => String(v) },
};

// ─── Meal accordion row ────────────────────────────────────────────────────────

interface MealRowProps {
  icon: string;
  label: string;
  foodKey: string;
  value?: string | number;
  isLast: boolean;
  onEdit?: (key: string, rawValue: string | number) => void;
}

const MealRow: React.FC<MealRowProps> = ({ icon, label, foodKey, value, isLast, onEdit }) => {
  const hasData = value !== undefined && value !== '';
  const [expanded, setExpanded] = useState(false);
  const chevron = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const next = !expanded;
    LayoutAnimation.configureNext({
      duration: 240,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    Animated.timing(chevron, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: true }).start();
    setExpanded(next);
  };

  const rotate = chevron.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const preview = hasData ? String(value) : '';

  return (
    <View style={[styles.mealRow, isLast && styles.mealRowLast]}>
      {/* Header — always visible, tap to toggle */}
      <TouchableOpacity style={styles.mealHeader} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.mealIcon}>{icon}</Text>
        <Text style={styles.mealLabel}>{label}</Text>

        {/* Collapsed preview — food name or "Not logged" */}
        {!expanded && (
          <Text
            style={[styles.mealPreview, !hasData && styles.mealPreviewEmpty]}
            numberOfLines={1}
          >
            {hasData ? preview : 'Not logged'}
          </Text>
        )}

        <Animated.Text style={[styles.chevron, { transform: [{ rotate }] }]}>▼</Animated.Text>
      </TouchableOpacity>

      {/* Expanded body */}
      {expanded && (
        <View style={styles.mealBody}>
          {hasData ? (
            <View style={styles.mealContent}>
              <Text style={styles.mealValue}>{String(value)}</Text>
              {onEdit && (
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => onEdit(foodKey, value!)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.editBtnText}>✏️</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyMeal}>
              <Text style={styles.emptyMealEmoji}>🍽️</Text>
              <Text style={styles.emptyMealText}>Nothing logged yet</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// ─── Generic summary row (expenses / other) ────────────────────────────────────

interface SummaryRowProps {
  label: string;
  value: string;
  rowKey: string | null;
  rawValue: string | number;
  isLast: boolean;
  onEdit?: (key: string, rawValue: string | number) => void;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, rowKey, rawValue, isLast, onEdit }) => (
  <View style={[styles.row, isLast && styles.rowLast]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowRight}>
      <Text style={styles.rowValue}>{value}</Text>
      {rowKey !== null && onEdit ? (
        <TouchableOpacity
          onPress={() => onEdit(rowKey, rawValue)}
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
);

// ─── Main component ────────────────────────────────────────────────────────────

interface DailySummaryCardProps {
  summary: DailySummary;
  isToday?: boolean;
  onEdit?: (key: string, rawValue: string | number) => void;
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
  summary,
  isToday = true,
  onEdit,
}) => {
  // Build non-meal groups
  const expenseRows = EXPENSE_KEYS
    .filter((k) => summary[k] !== undefined)
    .map((k) => ({ key: k, label: EXPENSE_LABELS[k], value: `₹${summary[k]}`, rawValue: summary[k] as string | number }));
  if (summary.total_expense !== undefined) {
    expenseRows.push({ key: null, label: 'Total Today', value: `₹${summary.total_expense}`, rawValue: summary.total_expense });
  }

  const otherGroups: Array<{ title: string; icon: string; rows: typeof expenseRows }> = [];
  for (const [key, meta] of Object.entries(OTHER_KEYS)) {
    if (summary[key] !== undefined) {
      otherGroups.push({
        title: meta.label,
        icon: meta.icon,
        rows: [{ key, label: meta.label, value: meta.format(summary[key] as string | number), rawValue: summary[key] as string | number }],
      });
    }
  }

  const hasAnyData =
    MEAL_SLOTS.some((s) => summary[s.key] !== undefined) ||
    expenseRows.length > 0 ||
    otherGroups.length > 0;

  if (!hasAnyData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data recorded for this day yet.</Text>
        <Text style={styles.emptyHint}>Tap the mic on the Home tab to log your day.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── Meals section ── */}
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>🍽️  Meals</Text>
      </View>
      <View style={styles.group}>
        {MEAL_SLOTS.map((slot, i) => (
          <MealRow
            key={slot.key}
            icon={slot.icon}
            label={slot.label}
            foodKey={slot.key}
            value={summary[slot.key] as string | number | undefined}
            isLast={i === MEAL_SLOTS.length - 1}
            onEdit={onEdit}
          />
        ))}
      </View>

      {/* ── Expenses section ── */}
      {expenseRows.length > 0 && (
        <>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>💸  Expenses</Text>
          </View>
          <View style={styles.group}>
            {expenseRows.map((row, ri) => (
              <SummaryRow
                key={ri}
                label={row.label}
                value={row.value}
                rowKey={row.key}
                rawValue={row.rawValue}
                isLast={ri === expenseRows.length - 1}
                onEdit={onEdit}
              />
            ))}
          </View>
        </>
      )}

      {/* ── Other metrics ── */}
      {otherGroups.map((group, gi) => (
        <View key={gi} style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupIcon}>{group.icon}</Text>
            <Text style={styles.groupTitle}>{group.title}</Text>
          </View>
          {group.rows.map((row, ri) => (
            <SummaryRow
              key={ri}
              label={row.label}
              value={row.value}
              rowKey={row.key}
              rawValue={row.rawValue}
              isLast={ri === group.rows.length - 1}
              onEdit={onEdit}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },

  // Section label sits above its card
  sectionLabel: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sectionLabelText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Card wrapper
  group: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.neutral[700],
  },
  groupIcon: { fontSize: 17 },
  groupTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
    flex: 1,
  },

  // ── Meal accordion row ──
  mealRow: {
    borderBottomWidth: 1,
    borderColor: colors.neutral[700],
  },
  mealRowLast: {
    borderBottomWidth: 0,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  mealIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  mealLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[100],
    width: 72,
  },
  mealPreview: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.neutral[200],
    textAlign: 'right',
    marginRight: spacing.xs,
  },
  mealPreviewEmpty: {
    color: colors.neutral[500],
    fontStyle: 'italic',
  },
  chevron: {
    fontSize: 10,
    color: colors.neutral[400],
  },
  mealBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  mealContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  mealValue: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.neutral[0],
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.md * 1.5,
  },
  emptyMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emptyMealEmoji: { fontSize: 16, opacity: 0.4 },
  emptyMealText: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    fontStyle: 'italic',
  },

  // ── Generic summary row (expenses / other) ──
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.neutral[700],
    gap: spacing.md,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: spacing.md,
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
  editBtnText: { fontSize: 13 },
  editBtnPlaceholder: { width: 28, flexShrink: 0 },

  // ── Empty state ──
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
