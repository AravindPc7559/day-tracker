import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, typography, borderRadius } from '@/theme';
import type { Category, ProcessAudioResponse } from '@/features/audio/audio.types';

interface ConfirmationModalProps {
  visible: boolean;
  data: ProcessAudioResponse | null;
  isSaving: boolean;
  onConfirm: (updated: ProcessAudioResponse) => void;
  onDiscard: () => void;
}

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

export const CATEGORY_ICONS: Record<string, string> = {
  breakfast_food: '🍳',
  lunch_food: '🍽️',
  dinner_food: '🌙',
  snack_food: '🍎',
  breakfast_expense: '💸',
  lunch_expense: '💸',
  dinner_expense: '💸',
  snack_expense: '💸',
  entertainment_expense: '🎬',
  transport_expense: '🚗',
  shopping_expense: '🛍️',
  health_expense: '💊',
  other_expense: '💰',
  water_intake: '💧',
  exercise: '🏃',
  mood: '😊',
  sleep_hours: '😴',
  weight: '⚖️',
  notes: '📝',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);

const isNumericCategory = (category: string) =>
  category.endsWith('_expense') ||
  category === 'water_intake' ||
  category === 'sleep_hours' ||
  category === 'weight';

const parseValue = (category: string, raw: string): string | number => {
  if (isNumericCategory(category)) {
    const n = parseFloat(raw);
    return isNaN(n) ? raw : n;
  }
  return raw;
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (visible && data) {
      setCategories([...data.categories]);
      setEditingIndex(null);
      setEditValue('');
      setShowPicker(false);
    }
  }, [visible, data]);

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

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setEditValue(String(categories[i].value));
  };

  const commitEdit = (i: number) => {
    if (editValue.trim() === '') {
      cancelEdit();
      return;
    }
    const updated = [...categories];
    updated[i] = { ...updated[i], value: parseValue(updated[i].category, editValue.trim()) };
    setCategories(updated);
    setEditingIndex(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const deleteRow = (i: number) => {
    if (editingIndex === i) cancelEdit();
    setCategories(categories.filter((_, idx) => idx !== i));
  };

  const addCategory = (category: string) => {
    setShowPicker(false);
    const newCat: Category = { category, value: isNumericCategory(category) ? 0 : '' };
    const newIndex = categories.length;
    setCategories((prev) => [...prev, newCat]);
    // open edit immediately so user can enter the value
    setTimeout(() => {
      setEditingIndex(newIndex);
      setEditValue('');
    }, 50);
  };

  const handleConfirm = () => {
    if (!data) return;
    onConfirm({ ...data, categories });
  };

  const availableToAdd = ALL_CATEGORIES.filter(
    (c) => !categories.some((existing) => existing.category === c)
  );

  if (!data) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
        {/* Dimmed backdrop — absolute so it doesn't affect KAV layout */}
        <Animated.View style={[styles.backdrop, { opacity }]} />

        {/* KAV fills screen and pushes sheet above keyboard */}
        <KeyboardAvoidingView
          style={styles.kavContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideY }] }]}>
            <View style={styles.handle} />

            <Text style={styles.title}>We captured</Text>

            <View style={styles.transcriptionBox}>
              <Text style={styles.transcriptionText} numberOfLines={3}>
                "{data.transcription}"
              </Text>
            </View>

            {categories.length > 0 ? (
              <ScrollView style={styles.categoriesScroll} showsVerticalScrollIndicator={false}>
                {categories.map((cat, i) => (
                  <View key={i} style={styles.categoryRow}>
                    <Text style={styles.categoryIcon}>
                      {CATEGORY_ICONS[cat.category] ?? '📌'}
                    </Text>

                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryLabel}>
                        {CATEGORY_LABELS[cat.category] ?? cat.category}
                      </Text>

                      {editingIndex === i ? (
                        <View style={styles.editRow}>
                          <TextInput
                            style={styles.editInput}
                            value={editValue}
                            onChangeText={setEditValue}
                            autoFocus
                            keyboardType={isNumericCategory(cat.category) ? 'numeric' : 'default'}
                            keyboardAppearance="dark"
                            selectionColor={colors.primary[400]}
                            onSubmitEditing={() => commitEdit(i)}
                          />
                          <TouchableOpacity onPress={() => commitEdit(i)} style={styles.editAction}>
                            <Text style={styles.editActionDone}>✓</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={cancelEdit} style={styles.editAction}>
                            <Text style={styles.editActionCancel}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Text style={styles.categoryValue}>
                          {String(cat.value) || '—'}
                        </Text>
                      )}
                    </View>

                    {editingIndex !== i && (
                      <View style={styles.rowActions}>
                        <TouchableOpacity onPress={() => startEdit(i)} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}>
                          <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteRow(i)} style={styles.actionBtn} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                          <Text style={styles.deleteIcon}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyCategories}>
                <Text style={styles.emptyCategoriesText}>
                  No categories — save as a general note?
                </Text>
              </View>
            )}

            {availableToAdd.length > 0 && (
              <TouchableOpacity
                style={styles.addFieldButton}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addFieldText}>+ Add Field</Text>
              </TouchableOpacity>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.discardButton} onPress={onDiscard} disabled={isSaving}>
                <Text style={styles.discardText}>Discard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                disabled={isSaving}
                activeOpacity={0.8}
              >
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
        </KeyboardAvoidingView>
      </Modal>

      {/* Category Picker */}
      <Modal visible={showPicker} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Add a Field</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.pickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableToAdd.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.pickerRow}
                  onPress={() => addCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerIcon}>{CATEGORY_ICONS[cat] ?? '📌'}</Text>
                  <Text style={styles.pickerLabel}>{CATEGORY_LABELS[cat]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  kavContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.neutral[800],
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderColor: colors.neutral[600],
    maxHeight: '85%',
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
    marginBottom: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.neutral[700],
    gap: spacing.sm,
  },
  categoryIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryLabel: {
    fontSize: typography.size.sm,
    color: colors.neutral[200],
    fontWeight: typography.weight.medium,
    flex: 1,
  },
  categoryValue: {
    fontSize: typography.size.sm,
    color: colors.neutral[0],
    fontWeight: typography.weight.semibold,
    textAlign: 'right',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  editInput: {
    flex: 1,
    maxWidth: 120,
    height: 32,
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.primary[600],
    paddingHorizontal: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.neutral[0],
    textAlign: 'right',
  },
  editAction: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editActionDone: {
    fontSize: 16,
    color: colors.success,
    fontWeight: typography.weight.bold,
  },
  editActionCancel: {
    fontSize: 14,
    color: colors.neutral[400],
  },
  rowActions: {
    flexDirection: 'row',
    gap: 2,
  },
  actionBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: { fontSize: 14 },
  deleteIcon: { fontSize: 14 },
  emptyCategories: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyCategoriesText: {
    fontSize: typography.size.sm,
    color: colors.neutral[300],
    textAlign: 'center',
  },
  addFieldButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[700],
    backgroundColor: colors.primary[50],
  },
  addFieldText: {
    fontSize: typography.size.sm,
    color: colors.primary[400],
    fontWeight: typography.weight.medium,
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

  // Picker styles
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  pickerSheet: {
    backgroundColor: colors.neutral[800],
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderColor: colors.neutral[600],
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pickerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  pickerClose: {
    fontSize: typography.size.md,
    color: colors.neutral[400],
    fontWeight: typography.weight.medium,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.neutral[700],
    gap: spacing.md,
  },
  pickerIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  pickerLabel: {
    fontSize: typography.size.md,
    color: colors.neutral[100],
    fontWeight: typography.weight.medium,
  },
});
