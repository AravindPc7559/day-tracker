import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, typography, borderRadius, shadows } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || isLoading;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 80, bounciness: 0 }).start();

  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 5 }).start();

  const content = isLoading ? (
    <ActivityIndicator
      color={variant === 'primary' ? colors.neutral[0] : colors.primary[500]}
      size="small"
    />
  ) : (
    <Text style={[styles.label, labelSizeStyles[size], variantLabelStyles[variant]]}>
      {label}
    </Text>
  );

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[styles.base, sizeStyles[size], isDisabled && styles.disabled, { transform: [{ scale }] }, style]}
      >
        {variant === 'primary' ? (
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: borderRadius.md }]}
          />
        ) : null}
        <View style={[styles.inner, variantInnerStyles[variant]]}>{content}</View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.2,
  },
});

const sizeStyles: Record<ButtonVariant | ButtonSize, ViewStyle> = {
  sm: { height: 36 },
  md: { height: 52 },
  lg: { height: 58 },
  primary: {},
  secondary: {},
  outline: {},
  ghost: {},
};

const labelSizeStyles: Record<ButtonSize, object> = {
  sm: { fontSize: typography.size.sm },
  md: { fontSize: typography.size.md },
  lg: { fontSize: typography.size.lg },
};

const variantInnerStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.brand,
  },
  secondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[600],
  },
  outline: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  ghost: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const variantLabelStyles: Record<ButtonVariant, object> = {
  primary: { color: colors.neutral[0] },
  secondary: { color: colors.neutral[50] },
  outline: { color: colors.primary[400] },
  ghost: { color: colors.neutral[200] },
};
