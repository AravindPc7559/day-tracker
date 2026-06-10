import React, { useState, useRef, useEffect } from 'react';
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
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, typography, borderRadius } from '@/theme';

interface TextInputModalProps {
  visible: boolean;
  onSubmit: (text: string) => void;
  onDismiss: () => void;
}

const MAX = 500;
const SHEET_HEIGHT = 340;

export const TextInputModal: React.FC<TextInputModalProps> = ({ visible, onSubmit, onDismiss }) => {
  const [text, setText] = useState('');
  const [mounted, setMounted] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const sendScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(sheetY, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(sheetY, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

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
    Animated.spring(sendScale, { toValue: 0.92, useNativeDriver: true, speed: 80, bounciness: 0 }).start();
  const onPressOut = () =>
    Animated.spring(sendScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();

  const hasText = text.trim().length > 0;
  const remaining = MAX - text.length;

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={handleDismiss}>
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'position' : 'height'}>
              <Animated.View
                style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}
              >
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
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Animated.View>
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
