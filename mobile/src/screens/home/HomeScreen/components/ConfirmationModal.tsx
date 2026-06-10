import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, typography, borderRadius } from '@/theme';
import type { Category, ProcessAudioResponse } from '@/features/audio/audio.types';

interface ConfirmationModalProps {
  visible: boolean;
  data: ProcessAudioResponse | null;
  isSaving: boolean;
  onConfirm: () => void;
  onDiscard: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  breakfast_food: 'Breakfast',
  lunch_food: 'Lunch',
  dinner_food: 'Dinner',
  snack_food: 'Snack',
  breakfast_expense: 'Breakfast Cost',
  lunch_expense: 'Lunch Cost',
  dinner_expense: 'Dinner Cost',
  snack_expense: 'Snack Cost',
  water_intake: 'Water Intake',
  exercise: 'Exercise',
  mood: 'Mood',
  sleep_hours: 'Sleep',
  weight: 'Weight',
  notes: 'Notes',
};

const CATEGORY_ICONS: Record<string, string> = {
  breakfast_food: '🍳',
  lunch_food: '🍽️',
  dinner_food: '🌙',
  snack_food: '🍎',
  breakfast_expense: '💸',
  lunch_expense: '💸',
  dinner_expense: '💸',
  snack_expense: '💸',
  water_intake: '💧',
  exercise: '🏃',
  mood: '😊',
  sleep_hours: '😴',
  weight: '⚖️',
  notes: '📝',
};

const formatValue = (cat: Category): string => {
  if (cat.category.endsWith('_expense') && typeof cat.value === 'number') {
    return `₹${cat.value}`;
  }
  if (cat.category === 'water_intake') return `${cat.value}L`;
  if (cat.category === 'sleep_hours') return `${cat.value}h`;
  if (cat.category === 'weight') return `${cat.value}kg`;
  return String(cat.value);
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  data,
  isSaving,
  onConfirm,
  onDiscard,
}) => {
  const slideY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      slideY.setValue(60);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!data) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideY }] }]}>
          <View style={styles.handle} />

          <Text style={styles.title}>We captured</Text>

          <View style={styles.transcriptionBox}>
            <Text style={styles.transcriptionText} numberOfLines={3}>
              "{data.transcription}"
            </Text>
          </View>

          {data.categories.length > 0 ? (
            <ScrollView style={styles.categoriesScroll} showsVerticalScrollIndicator={false}>
              {data.categories.map((cat, i) => (
                <View key={i} style={styles.categoryRow}>
                  <Text style={styles.categoryIcon}>
                    {CATEGORY_ICONS[cat.category] ?? '📌'}
                  </Text>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryLabel}>
                      {CATEGORY_LABELS[cat.category] ?? cat.category}
                    </Text>
                    <Text style={styles.categoryValue}>{formatValue(cat)}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyCategories}>
              <Text style={styles.emptyCategoriesText}>
                No categories detected. Save as a note?
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.discardButton} onPress={onDiscard} disabled={isSaving}>
              <Text style={styles.discardText}>Discard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} disabled={isSaving} activeOpacity={0.8}>
              <LinearGradient
                colors={gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.neutral[0]} size="small" />
                ) : (
                  <Text style={styles.confirmText}>Confirm & Save</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  sheet: {
    backgroundColor: colors.neutral[800],
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderColor: colors.neutral[600],
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[500],
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    marginBottom: spacing.md,
  },
  transcriptionBox: {
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[500],
    marginBottom: spacing.lg,
  },
  transcriptionText: {
    fontSize: typography.size.sm,
    color: colors.neutral[200],
    fontStyle: 'italic',
    lineHeight: typography.size.sm * 1.6,
  },
  categoriesScroll: {
    maxHeight: 240,
    marginBottom: spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.neutral[700],
    gap: spacing.md,
  },
  categoryIcon: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: typography.size.sm,
    color: colors.neutral[200],
    fontWeight: typography.weight.medium,
  },
  categoryValue: {
    fontSize: typography.size.md,
    color: colors.neutral[0],
    fontWeight: typography.weight.semibold,
  },
  emptyCategories: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyCategoriesText: {
    fontSize: typography.size.sm,
    color: colors.neutral[300],
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  discardButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[500],
    backgroundColor: colors.neutral[700],
  },
  discardText: {
    fontSize: typography.size.md,
    color: colors.neutral[200],
    fontWeight: typography.weight.medium,
  },
  confirmButton: {
    flex: 2,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    height: 52,
  },
  confirmGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
    letterSpacing: 0.3,
  },
});
