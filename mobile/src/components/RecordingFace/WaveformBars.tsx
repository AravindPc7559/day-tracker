import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '@/theme';

const BAR_COUNT = 7;
const MIN_H = 4;
const MAX_H = 50;

// Centre-weighted heights — middle bar tallest
const SHAPE = [0.45, 0.65, 0.82, 1.0, 0.82, 0.65, 0.45] as const;

interface WaveformBarsProps {
  volume: number; // 0–1
}

export const WaveformBars: React.FC<WaveformBarsProps> = ({ volume }) => {
  const bars = useRef<Animated.Value[]>(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_H))
  ).current;

  // Stable per-bar jitter multipliers refreshed each volume update
  const jitter = useRef<number[]>(SHAPE.map(() => 1)).current;

  useEffect(() => {
    // Refresh jitter so bars move organically
    for (let i = 0; i < BAR_COUNT; i++) {
      jitter[i] = 0.65 + Math.random() * 0.7;
    }

    const effective = Math.max(volume, 0.04); // tiny baseline so bars never flat-line
    bars.forEach((bar, i) => {
      const target = MIN_H + effective * SHAPE[i] * jitter[i] * (MAX_H - MIN_H);
      Animated.timing(bar, {
        toValue: Math.max(MIN_H, Math.min(MAX_H, target)),
        duration: 90,
        useNativeDriver: false,
      }).start();
    });
  }, [volume]);

  return (
    <View style={styles.container}>
      {bars.map((h, i) => (
        <Animated.View
          key={i}
          style={[styles.bar, { height: h, opacity: 0.55 + SHAPE[i] * 0.45 }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: MAX_H + 4,
  },
  bar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: colors.primary[400],
  },
});
