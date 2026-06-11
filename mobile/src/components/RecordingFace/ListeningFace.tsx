import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { WaveformBars } from './WaveformBars';
import { colors, spacing, typography, borderRadius } from '@/theme';

interface ListeningFaceProps {
  volume: number;
  onStop: () => void;
  onCancel: () => void;
}

export const ListeningFace: React.FC<ListeningFaceProps> = ({ volume, onStop, onCancel }) => {
  const bobY = useRef(new Animated.Value(0)).current;
  const [isBlinking, setIsBlinking] = useState(false);

  // Gentle float bob
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bobY, { toValue: -12, duration: 1300, useNativeDriver: true }),
        Animated.timing(bobY, { toValue: 0, duration: 1300, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  // Random blinks
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      timer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, 1800 + Math.random() * 2800);
    };
    scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  const face = isBlinking ? '😑' : volume > 0.25 ? '😮' : '😐';

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.face, { transform: [{ translateY: bobY }] }]}>
        {face}
      </Animated.Text>

      <WaveformBars volume={volume} />

      <Text style={styles.label}>Listening...</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stopBtn} onPress={onStop} activeOpacity={0.8}>
          <Text style={styles.stopIcon}>⏹</Text>
          <Text style={styles.stopLabel}>Stop</Text>
        </TouchableOpacity>
      </View>
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
  label: {
    fontSize: typography.size.md,
    color: colors.primary[400],
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.3,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[800],
    borderWidth: 1,
    borderColor: colors.neutral[500],
  },
  cancelText: {
    fontSize: typography.size.sm,
    color: colors.neutral[300],
    fontWeight: typography.weight.medium,
  },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[700],
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  stopIcon: { fontSize: 14 },
  stopLabel: {
    fontSize: typography.size.sm,
    color: colors.neutral[100],
    fontWeight: typography.weight.semibold,
  },
});
