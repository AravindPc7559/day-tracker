import React, { useEffect, useRef } from 'react';
import {
  TouchableWithoutFeedback,
  View,
  Animated,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows } from '@/theme';
import type { VoiceState } from '@/screens/home/HomeScreen/hooks/useVoiceInput';

const MIC = 96;
const RING = MIC + 24;

interface MicButtonProps {
  state: VoiceState;
  onPress: () => void;
}

export const MicButton: React.FC<MicButtonProps> = ({ state, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const rings = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  // Idle: soft scale pulse
  useEffect(() => {
    if (state !== 'idle') {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.055, duration: 1100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [state]);

  // Listening: staggered ripple rings
  useEffect(() => {
    if (state !== 'listening') {
      rings.forEach((r) => r.setValue(0));
      return;
    }
    const animations = rings.map((r, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 380),
          Animated.timing(r, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(r, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [state]);

  const onPressIn = () =>
    Animated.spring(pressScale, { toValue: 0.93, useNativeDriver: true, speed: 80, bounciness: 0 }).start();

  const onPressOut = () =>
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();

  const isListening = state === 'listening';
  const isProcessing = state === 'processing';

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isProcessing}
    >
      <View style={styles.hitArea}>
        {/* Ripple rings */}
        {rings.map((r, i) => (
          <Animated.View
            key={i}
            style={[
              styles.ring,
              {
                opacity: r.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.25, 0] }),
                transform: [{ scale: r.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
                backgroundColor: isListening ? colors.error : colors.primary[500],
              },
            ]}
          />
        ))}

        {/* Button */}
        <Animated.View
          style={[
            styles.buttonOuter,
            shadows.brand,
            { transform: [{ scale: Animated.multiply(scale, pressScale) }] },
          ]}
        >
          <LinearGradient
            colors={isListening ? ['#EF4444', '#DC2626'] : gradients.brand}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.gradient}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.neutral[0]} size="large" />
            ) : (
              <Text style={styles.icon}>{isListening ? '⏹' : '🎙️'}</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  hitArea: {
    width: MIC * 3,
    height: MIC * 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: MIC,
    height: MIC,
    borderRadius: MIC / 2,
  },
  buttonOuter: {
    width: MIC,
    height: MIC,
    borderRadius: MIC / 2,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 38,
  },
});
