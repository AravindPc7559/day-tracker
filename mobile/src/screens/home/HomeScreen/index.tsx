import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useAuthStore } from '@/features/auth/auth.store';
import { MicButton } from '@/components/ui/MicButton';
import { TextInputModal } from './components/TextInputModal';
import { useVoiceInput } from './hooks/useVoiceInput';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { AppScreenProps } from '@/navigation/types';

const { width: W } = Dimensions.get('window');
type Props = AppScreenProps<'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { userProfile, logout } = useAuthStore();
  const [showTextInput, setShowTextInput] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-16)).current;
  const micOpacity = useRef(new Animated.Value(0)).current;
  const micY = useRef(new Animated.Value(32)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(headerY, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(micOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(micY, { toValue: 0, tension: 50, friction: 12, useNativeDriver: true }),
      ]),
      Animated.timing(footerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleUserInput = useCallback(
    (text: string) => {
      setShowTextInput(false);
      navigation.navigate('InputResult', { input: text });
    },
    [navigation]
  );

  const { voiceState, partialText, errorMessage, startListening, stopListening } = useVoiceInput({
    onResult: handleUserInput,
  });

  const handleMicPress = () => {
    if (voiceState === 'listening') stopListening();
    else if (voiceState === 'idle' || voiceState === 'error') startListening();
  };

  const instructionLabel =
    voiceState === 'listening' ? 'Listening… tap to stop' :
    voiceState === 'processing' ? 'Processing…' :
    voiceState === 'error' ? (errorMessage ?? 'Something went wrong') :
    'Tap the mic to speak';

  const instructionColor =
    voiceState === 'error' ? colors.error :
    voiceState === 'listening' ? colors.primary[400] :
    voiceState === 'processing' ? colors.neutral[300] :
    colors.neutral[300];

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Background glow blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {/* Header */}
      <Animated.View
        style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}
      >
        <View>
          <Text style={styles.dateLabel}>{today}</Text>
          <Text style={styles.greeting}>
            Good {timeOfDay()},{' '}
            <Text style={styles.greetingName}>
              {userProfile?.displayName?.split(' ')[0] ?? 'there'}
            </Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Text style={styles.signOut}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Mic area */}
      <Animated.View
        style={[styles.micArea, { opacity: micOpacity, transform: [{ translateY: micY }] }]}
      >
        <Text style={[styles.instruction, { color: instructionColor }]}>
          {instructionLabel}
        </Text>

        <MicButton state={voiceState} onPress={handleMicPress} />

        {partialText ? (
          <View style={styles.partialBubble}>
            <Text style={styles.partialText}>{partialText}</Text>
          </View>
        ) : null}
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        {voiceState === 'idle' || voiceState === 'error' ? (
          <TouchableOpacity
            style={styles.typeButton}
            onPress={() => setShowTextInput(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.typeButtonText}>⌨  Type instead</Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>

      <TextInputModal
        visible={showTextInput}
        onSubmit={handleUserInput}
        onDismiss={() => setShowTextInput(false)}
      />
    </SafeAreaView>
  );
};

const timeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: 340,
    height: 340,
    top: -100,
    right: -120,
    backgroundColor: 'rgba(37,99,235,0.12)',
  },
  blob2: {
    width: 280,
    height: 280,
    bottom: 40,
    left: -100,
    backgroundColor: 'rgba(29,78,216,0.08)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  dateLabel: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  greeting: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: -0.2,
  },
  greetingName: {
    color: colors.primary[400],
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    borderWidth: 1.5,
    borderColor: colors.primary[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: colors.primary[400],
  },
  signOut: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
  },
  micArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  instruction: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  partialBubble: {
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxWidth: W - spacing.xxxl,
    borderWidth: 1,
    borderColor: colors.primary[700],
  },
  partialText: {
    fontSize: typography.size.md,
    color: colors.neutral[100],
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  typeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[700],
    borderWidth: 1,
    borderColor: colors.neutral[500],
  },
  typeButtonText: {
    fontSize: typography.size.sm,
    color: colors.neutral[200],
    fontWeight: typography.weight.medium,
  },
});
