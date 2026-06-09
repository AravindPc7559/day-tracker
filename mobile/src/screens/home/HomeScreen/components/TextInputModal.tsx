import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, typography, borderRadius } from '@/theme';

interface TextInputModalProps {
  visible: boolean;
  onSubmit: (text: string) => void;
  onDismiss: () => void;
}

const MAX = 500;

export const TextInputModal: React.FC<TextInputModalProps> = ({ visible, onSubmit, onDismiss }) => {
  const [text, setText] = useState('');
  const sendScale = useRef(new Animated.Value(1)).current;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  const handleDismiss = () => {
    setText('');
    onDismiss();
  };

  const onPressIn = () =>
    Animated.spring(sendScale, { toValue: 0.9, useNativeDriver: true, speed: 80, bounciness: 0 }).start();
  const onPressOut = () =>
    Animated.spring(sendScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();

  const hasText = text.trim().length > 0;
  const remaining = MAX - text.length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
              <View style={styles.sheet}>
                <View style={styles.handle} />

                <View style={styles.labelRow}>
                  <Text style={styles.label}>What's on your mind?</Text>
                  <Text style={[styles.charCount, remaining < 50 && styles.charCountWarn]}>
                    {remaining}
                  </Text>
                </View>

                <View style={[styles.inputWrapper, hasText && styles.inputWrapperActive]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Describe your day, a task, a thought…"
                    placeholderTextColor={colors.neutral[400]}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={MAX}
                    autoFocus
                    selectionColor={colors.primary[500]}
                    keyboardAppearance="dark"
                  />
                </View>

                <TouchableWithoutFeedback
                  onPress={handleSubmit}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  disabled={!hasText}
                >
                  <Animated.View
                    style={[
                      styles.sendButton,
                      { transform: [{ scale: sendScale }], opacity: hasText ? 1 : 0.3 },
                    ]}
                  >
                    <LinearGradient
                      colors={gradients.brand}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.sendGradient}
                    >
                      <Text style={styles.sendLabel}>Send  ↑</Text>
                    </LinearGradient>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    backgroundColor: colors.neutral[800],
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
    borderColor: colors.neutral[600],
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[500],
    marginBottom: spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
  },
  charCount: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },
  charCountWarn: {
    color: colors.warning,
  },
  inputWrapper: {
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[500],
    marginBottom: spacing.md,
    padding: spacing.md,
    minHeight: 100,
  },
  inputWrapperActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.neutral[800],
  },
  input: {
    fontSize: typography.size.md,
    color: colors.neutral[0],
    lineHeight: typography.size.md * 1.6,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    height: 52,
  },
  sendGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[0],
    letterSpacing: 0.3,
  },
});
