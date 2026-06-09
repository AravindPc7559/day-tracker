import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
    setIsFocused(true);
    Animated.timing(focusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
    setIsFocused(false);
    Animated.timing(focusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    onBlur?.(e);
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.error : colors.neutral[500],
      error ? colors.error : colors.primary[500],
    ],
  });

  const bgColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.neutral[700], colors.neutral[800]],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, isFocused && styles.labelFocused, error ? styles.labelError : null]}>
          {label}
        </Text>
      ) : null}
      <Animated.View style={[styles.inputWrapper, { borderColor, backgroundColor: bgColor }]}>
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeftIcon : null, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.neutral[400]}
          selectionColor={colors.primary[500]}
          keyboardAppearance="dark"
          {...props}
        />
        {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.neutral[200],
    marginBottom: spacing.xs,
    letterSpacing: 0.1,
  },
  labelFocused: {
    color: colors.primary[400],
  },
  labelError: {
    color: colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
    color: colors.neutral[0],
    height: 52,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  iconLeft: { paddingLeft: spacing.md },
  iconRight: { paddingRight: spacing.md },
  errorText: {
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
    color: colors.error,
    letterSpacing: 0.1,
  },
});
