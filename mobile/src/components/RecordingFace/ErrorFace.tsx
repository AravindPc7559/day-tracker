import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface ErrorFaceProps {
  message?: string | null;
  onRetry: () => void;
}

export const ErrorFace: React.FC<ErrorFaceProps> = ({ message, onRetry }) => {
  const shakeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -14, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 14, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.face, { transform: [{ translateX: shakeX }] }]}>
        😕
      </Animated.Text>

      <Text style={styles.label}>
        {message ? message : "Oops, didn't catch that."}
      </Text>
      <Text style={styles.hint}>Try again?</Text>

      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
        <Text style={styles.retryText}>🔄  Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  face: {
    fontSize: 96,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.size.md,
    color: colors.neutral[100],
    fontWeight: typography.weight.medium,
    textAlign: 'center',
  },
  hint: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  retryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[700],
    borderWidth: 1.5,
    borderColor: colors.primary[600],
  },
  retryText: {
    fontSize: typography.size.sm,
    color: colors.primary[300],
    fontWeight: typography.weight.semibold,
  },
});
