import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { useGetCalendarDays } from '@/features/logs/logs.api';

interface CalendarModalProps {
  visible: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onDismiss: () => void;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const toMonthStr = (year: number, month: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}`;

const todayStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const toDateStr = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const CalendarModal: React.FC<CalendarModalProps> = ({ visible, selectedDate, onSelectDate, onDismiss }) => {
  const parseView = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  const [view, setView] = useState(() => parseView(selectedDate));

  useEffect(() => {
    if (visible) {
      setView(parseView(selectedDate));
    }
  }, [visible, selectedDate]);

  const today = todayStr();
  const currentMonthStr = toMonthStr(view.year, view.month);
  const { data: calendarData } = useGetCalendarDays(currentMonthStr);

  const completedSet = new Set(calendarData?.completedDates ?? []);

  const firstDayOfMonth = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const todayDate = new Date(today + 'T00:00:00');
  const isFutureMonth =
    view.year > todayDate.getFullYear() ||
    (view.year === todayDate.getFullYear() && view.month > todayDate.getMonth());

  const goToPrevMonth = () => {
    setView(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  };

  const goToNextMonth = () => {
    if (isFutureMonth) return;
    setView(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  };

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const handleDayPress = (day: number) => {
    const dateStr = toDateStr(view.year, view.month, day);
    if (dateStr > today) return;
    onSelectDate(dateStr);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.monthNav}>
                <TouchableOpacity style={styles.navButton} onPress={goToPrevMonth}>
                  <Text style={styles.navArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthLabel}>{monthLabel}</Text>
                <TouchableOpacity
                  style={[styles.navButton, isFutureMonth && styles.navButtonDisabled]}
                  onPress={goToNextMonth}
                  disabled={isFutureMonth}
                >
                  <Text style={[styles.navArrow, isFutureMonth && styles.navArrowDisabled]}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dayLabelsRow}>
                {DAY_LABELS.map((label) => (
                  <View key={label} style={styles.dayLabelCell}>
                    <Text style={styles.dayLabelText}>{label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.grid}>
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty-${idx}`} style={styles.cell} />;
                  }
                  const dateStr = toDateStr(view.year, view.month, day);
                  const isFuture = dateStr > today;
                  const isSelected = dateStr === selectedDate;
                  const isCompleted = completedSet.has(dateStr);
                  const isToday = dateStr === today;

                  return (
                    <TouchableOpacity
                      key={dateStr}
                      style={styles.cell}
                      onPress={() => handleDayPress(day)}
                      disabled={isFuture}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.dayCircle,
                          isCompleted && styles.completedCircle,
                          isSelected && styles.selectedCircle,
                          isToday && !isSelected && styles.todayCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isFuture && styles.futureText,
                            isCompleted && styles.completedText,
                            isSelected && styles.selectedText,
                            isToday && !isSelected && styles.todayText,
                          ]}
                        >
                          {day}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                  <Text style={styles.legendText}>Day logged</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary[500] }]} />
                  <Text style={styles.legendText}>Selected</Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CalendarModal;

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[600],
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[600],
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navArrow: {
    fontSize: typography.size.xl,
    color: colors.neutral[0],
    lineHeight: typography.size.xl * 1.2,
  },
  navArrowDisabled: {
    color: colors.neutral[400],
  },
  monthLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayLabelText: {
    fontSize: typography.size.xs,
    color: colors.neutral[200],
    fontWeight: typography.weight.medium,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  dayCircle: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  selectedCircle: {
    backgroundColor: colors.primary[500],
    borderWidth: 0,
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: colors.primary[400],
  },
  dayText: {
    fontSize: typography.size.sm,
    color: colors.neutral[100],
    fontWeight: typography.weight.medium,
  },
  futureText: {
    color: colors.neutral[400],
  },
  completedText: {
    color: colors.success,
    fontWeight: typography.weight.semibold,
  },
  selectedText: {
    color: colors.neutral[0],
    fontWeight: typography.weight.bold,
  },
  todayText: {
    color: colors.primary[400],
    fontWeight: typography.weight.semibold,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[600],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.size.xs,
    color: colors.neutral[200],
  },
});
