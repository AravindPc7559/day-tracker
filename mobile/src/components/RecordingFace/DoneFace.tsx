import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

export const DoneFace: React.FC = () => {
  const bounceY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const fillColor = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pop in + bounce
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.15, tension: 220, friction: 5, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();

    // Bounce up-down
    Animated.sequence([
      Animated.timing(bounceY, { toValue: -18, duration: 220, useNativeDriver: true }),
      Animated.spring(bounceY, { toValue: 0, tension: 140, friction: 7, useNativeDriver: true }),
    ]).start();

    // Progress bar fills to 100 % and goes green
    Animated.timing(progress, { toValue: 1, duration: 550, useNativeDriver: false }).start();
    Animated.timing(fillColor, { toValue: 1, duration: 600, useNativeDriver: false }).start();
  }, []);

  const barBg = fillColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary[500], colors.success],
  });

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[styles.face, { transform: [{ translateY: bounceY }, { scale }] }]}
      >
        😊
      </Animated.Text>

      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: barBg,
            },
          ]}
        />
      </View>

      <Text style={styles.label}>Got it!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  face: {
    fontSize: 96,
  },
  track: {
    width: 200,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[700],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.success,
    letterSpacing: 0.3,
  },
});
