import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface EditFieldModalProps {
  visible: boolean;
  label: string;
  currentValue: string;
  isNumeric: boolean;
  isSaving: boolean;
  onSave: (value: string | number) => void;
  onDismiss: () => void;
}

export const EditFieldModal: React.FC<EditFieldModalProps> = ({
  visible,
  label,
  currentValue,
  isNumeric,
  isSaving,
  onSave,
  onDismiss,
}) => {
  const [value, setValue] = useState(currentValue);

  useEffect(() => {
    if (visible) setValue(currentValue);
  }, [visible, currentValue]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (isNumeric) {
      const n = parseFloat(trimmed);
      onSave(isNaN(n) ? trimmed : n);
    } else {
      onSave(trimmed);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.dialog}>
          <Text style={styles.label}>Edit {label}</Text>

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            keyboardType={isNumeric ? 'numeric' : 'default'}
            keyboardAppearance="dark"
            autoFocus
            selectionColor={colors.primary[400]}
            onSubmitEditing={handleSave}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onDismiss} disabled={isSaving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving} activeOpacity={0.8}>
              {isSaving ? (
                <ActivityIndicator color={colors.neutral[0]} size="small" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    gap: spacing.lg,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
  input: {
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary[600],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.md,
    color: colors.neutral[0],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[500],
  },
  cancelText: {
    fontSize: typography.size.sm,
    color: colors.neutral[300],
    fontWeight: typography.weight.medium,
  },
  saveBtn: {
    flex: 2,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[600],
  },
  saveText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
});
