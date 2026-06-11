import React, { useRef, useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

const STEPS = [
  '🎤 Listening carefully...',
  '📝 Taking notes like a good student...',
  '🧠 Using 100% of my brain...',
  '✨ Cooking up your result...',
];
const STEP_MS = 2600;

export const ProgressSteps: React.FC = () => {
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
        Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
      });
    }, STEP_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.Text style={[styles.text, { opacity: fade }]}>
      {STEPS[step]}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: typography.size.sm,
    color: colors.neutral[300],
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
