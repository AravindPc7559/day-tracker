import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { ProgressSteps } from './ProgressSteps';
import { colors, spacing, typography, borderRadius } from '@/theme';

export const ThinkingFace: React.FC = () => {
  const tilt = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const dots = [
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
  ];

  // Side-to-side tilt
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: -9, duration: 650, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 9, duration: 650, useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 0, duration: 380, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Cascading dot pulse
  useEffect(() => {
    const makeLoop = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.2, duration: 280, useNativeDriver: true }),
          Animated.delay(560),
        ])
      );
    const anims = dots.map((d, i) => makeLoop(d, i * 280));
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  // Fake progress bar fills over ~10 s, pauses near 90%
  useEffect(() => {
    Animated.timing(progress, { toValue: 0.9, duration: 9000, useNativeDriver: false }).start();
    return () => progress.stopAnimation();
  }, []);

  const rotate = tilt.interpolate({ inputRange: [-9, 9], outputRange: ['-9deg', '9deg'] });

  return (
    <View style={styles.container}>
      {/* Thought dots */}
      <View style={styles.dotsRow}>
        {dots.map((op, i) => (
          <Animated.Text key={i} style={[styles.dot, { opacity: op }]}>
            •
          </Animated.Text>
        ))}
      </View>

      <Animated.Text style={[styles.face, { transform: [{ rotate }] }]}>
        🤔
      </Animated.Text>

      {/* Progress bar */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <ProgressSteps />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: -spacing.sm,
  },
  dot: {
    fontSize: 22,
    color: colors.primary[300],
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
    backgroundColor: colors.primary[500],
  },
});
