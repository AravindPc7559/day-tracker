import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { useAuthStore } from '@/features/auth/auth.store';
import { MicButton } from '@/components/ui/MicButton';
import { TextInputModal } from './components/TextInputModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useQueryClient } from '@tanstack/react-query';
import { useProcessAudio, useProcessText, useConfirmSave } from '@/features/audio/audio.api';
import { LOGS_QUERY_KEYS } from '@/features/logs/logs.api';
import { colors, spacing, typography, borderRadius } from '@/theme';
import type { ProcessAudioResponse } from '@/features/audio/audio.types';

const HomeScreen: React.FC = () => {
  const { userProfile, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [showTextInput, setShowTextInput] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessAudioResponse | null>(null);

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

  const { recordingState, duration, errorMessage, startRecording, stopRecording, reset } =
    useAudioRecording();

  const processAudioMutation = useProcessAudio();
  const processTextMutation = useProcessText();
  const confirmSaveMutation = useConfirmSave();

  const micState =
    recordingState === 'recording' ? 'listening' :
    recordingState === 'processing' || processAudioMutation.isPending || processTextMutation.isPending ? 'processing' :
    recordingState === 'error' ? 'error' :
    'idle';

  const handleMicPress = useCallback(async () => {
    if (recordingState === 'idle' || recordingState === 'error') {
      reset();
      await startRecording();
    } else if (recordingState === 'recording') {
      const uri = await stopRecording();
      if (!uri) return;

      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as unknown as Blob);

      try {
        const result = await processAudioMutation.mutateAsync(formData);
        setProcessedData(result);
        setShowConfirmation(true);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
        const msg =
          axiosErr?.response?.data?.message ??
          (err instanceof Error ? err.message : 'Unknown error');
        Alert.alert('Error', msg);
        reset();
      }
    }
  }, [recordingState, startRecording, stopRecording, reset, processAudioMutation]);

  const handleTextSubmit = useCallback(async (text: string) => {
    setShowTextInput(false);
    try {
      const result = await processTextMutation.mutateAsync(text);
      setProcessedData(result);
      setShowConfirmation(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
      const msg =
        axiosErr?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Unknown error');
      Alert.alert('Error', msg);
    }
  }, [processTextMutation]);

  const handleConfirm = useCallback(async () => {
    if (!processedData) return;
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    try {
      await confirmSaveMutation.mutateAsync({
        transcription: processedData.transcription,
        categories: processedData.categories,
        date: today,
      });
      await queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.daily(today) });
      await queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weekly });
      setShowConfirmation(false);
      setProcessedData(null);
      reset();
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  }, [processedData, confirmSaveMutation, reset, queryClient]);

  const handleDiscard = useCallback(() => {
    setShowConfirmation(false);
    setProcessedData(null);
    reset();
  }, [reset]);

  const instructionLabel =
    recordingState === 'recording'
      ? `Recording… ${duration}s — tap to stop`
      : processAudioMutation.isPending || processTextMutation.isPending
      ? 'Processing…'
      : recordingState === 'error'
      ? (errorMessage ?? 'Something went wrong')
      : 'Tap the mic to record';

  const instructionColor =
    recordingState === 'error' ? colors.error :
    recordingState === 'recording' ? colors.primary[400] :
    processAudioMutation.isPending ? colors.neutral[300] :
    colors.neutral[300];

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const isProcessing = processAudioMutation.isPending || processTextMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

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

      <Animated.View
        style={[styles.micArea, { opacity: micOpacity, transform: [{ translateY: micY }] }]}
      >
        <Text style={[styles.instruction, { color: instructionColor }]}>
          {instructionLabel}
        </Text>

        <MicButton
          state={micState}
          onPress={handleMicPress}
        />

        {recordingState === 'recording' && (
          <View style={styles.durationBubble}>
            <View style={styles.recordingDot} />
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
          </View>
        )}
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        {(recordingState === 'idle' || recordingState === 'error') && !isProcessing ? (
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
        onSubmit={handleTextSubmit}
        onDismiss={() => setShowTextInput(false)}
      />

      <ConfirmationModal
        visible={showConfirmation}
        data={processedData}
        isSaving={confirmSaveMutation.isPending}
        onConfirm={handleConfirm}
        onDiscard={handleDiscard}
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

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
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
    paddingHorizontal: spacing.xl,
  },
  durationBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary[700],
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  durationText: {
    fontSize: typography.size.sm,
    color: colors.neutral[100],
    fontWeight: typography.weight.medium,
    fontVariant: ['tabular-nums'],
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
