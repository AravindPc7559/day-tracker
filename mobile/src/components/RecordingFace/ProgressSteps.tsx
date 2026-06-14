import React, { useRef, useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

const VOICE_STEPS = [
  '🎤 Listening carefully...',
  '📝 Taking notes like a good student...',
  '🧠 Using 100% of my brain...',
  '✨ Cooking up your result...',
];

const TEXT_STEPS = [
  '🔍 Investigating your input...',
  '📚 Gathering clues...',
  '🧠 Thinking really hard...',
  '🚀 Preparing your result...',
];

const IMAGE_STEPS = [
  '👀 Taking a peek...',
  '🧾 Reading the paperwork...',
  '🧠 Thinking hard...',
  '🎉 Almost ready...',
];

const STEP_MS = 2600;

const STEPS_BY_SOURCE: Record<string, string[]> = {
  audio: VOICE_STEPS,
  text: TEXT_STEPS,
  image: IMAGE_STEPS,
};

interface ProgressStepsProps {
  source?: 'audio' | 'text' | 'image';
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ source = 'audio' }) => {
  const steps = STEPS_BY_SOURCE[source] ?? VOICE_STEPS;
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setStep(0);
  }, [source]);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
        setStep((s) => Math.min(s + 1, steps.length - 1));
        Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start();
      });
    }, STEP_MS);
    return () => clearInterval(interval);
  }, [steps]);

  return (
    <Animated.Text style={[styles.text, { opacity: fade }]}>
      {steps[step]}
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
