import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/auth.store';
import { TextInputModal } from './components/TextInputModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useCameraCapture } from './hooks/useCameraCapture';
import { useQueryClient } from '@tanstack/react-query';
import { useProcessAudio, useProcessText, useConfirmSave } from '@/features/audio/audio.api';
import { useProcessImage } from '@/features/image/image.api';
import { LOGS_QUERY_KEYS } from '@/features/logs/logs.api';
import { useGetStreak, STREAK_QUERY_KEY } from '@/features/streak/streak.api';
import { StreakCard } from './components/StreakCard';
import { RecordingFace } from '@/components/RecordingFace/RecordingFace';
import type { FaceState } from '@/components/RecordingFace/RecordingFace';
import { colors, spacing, typography, borderRadius } from '@/theme';
import { extractErrorMessage } from '@/utils/error';
import type { ProcessAudioResponse } from '@/features/audio/audio.types';

const HomeScreen: React.FC = () => {
  const { userProfile } = useAuthStore();
  const queryClient = useQueryClient();

  const [showTextInput, setShowTextInput] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processedData, setProcessedData] = useState<ProcessAudioResponse | null>(null);
  const [currentSource, setCurrentSource] = useState<'audio' | 'text' | 'image'>('audio');
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);

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

  const { data: streakData } = useGetStreak();

  const { recordingState, volume, errorMessage, startRecording, stopRecording, cancelRecording, reset } =
    useAudioRecording();

  const { openCamera } = useCameraCapture();

  const processAudioMutation = useProcessAudio();
  const processTextMutation = useProcessText();
  const processImageMutation = useProcessImage();
  const confirmSaveMutation = useConfirmSave();

  const isProcessing = processAudioMutation.isPending || processTextMutation.isPending || processImageMutation.isPending;

  const faceState: FaceState =
    showConfirmation ? 'idle' :
    showDone ? 'done' :
    recordingState === 'recording' ? 'listening' :
    (recordingState === 'processing' || isProcessing) ? 'thinking' :
    (recordingState === 'error' || apiErrorMsg !== null) ? 'error' :
    'idle';

  const faceErrorMsg =
    apiErrorMsg ??
    errorMessage ??
    "Oops, didn't catch that. Try again?";

  const handleMicPress = useCallback(async () => {
    if (recordingState === 'idle' || recordingState === 'error') {
      setApiErrorMsg(null);
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
        setCurrentSource('audio');
        const result = await processAudioMutation.mutateAsync(formData);
        setShowDone(true);
        await new Promise<void>((r) => setTimeout(r, 700));
        setShowDone(false);
        setProcessedData(result);
        setShowConfirmation(true);
      } catch (err: unknown) {
        setApiErrorMsg(extractErrorMessage(err));
      }
    }
  }, [recordingState, startRecording, stopRecording, reset, processAudioMutation]);

  const handleTextSubmit = useCallback(async (text: string) => {
    setShowTextInput(false);
    setApiErrorMsg(null);
    try {
      setCurrentSource('text');
      const result = await processTextMutation.mutateAsync(text);
      setShowDone(true);
      await new Promise<void>((r) => setTimeout(r, 700));
      setShowDone(false);
      setProcessedData(result);
      setShowConfirmation(true);
    } catch (err: unknown) {
      Alert.alert('Error', extractErrorMessage(err));
    }
  }, [processTextMutation]);

  const handleCameraPress = useCallback(async () => {
    const uri = await openCamera();
    if (!uri) return;

    setCapturedImageUri(uri);

    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'bill.jpg',
    } as unknown as Blob);

    try {
      setCurrentSource('image');
      const result = await processImageMutation.mutateAsync(formData);
      setShowDone(true);
      await new Promise<void>((r) => setTimeout(r, 700));
      setShowDone(false);
      setProcessedData(result);
      setShowConfirmation(true);
    } catch (err: unknown) {
      setCapturedImageUri(null);
      Alert.alert('Error', extractErrorMessage(err));
    }
  }, [openCamera, processImageMutation]);

  const handleConfirm = useCallback(async (updated: ProcessAudioResponse) => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    try {
      await confirmSaveMutation.mutateAsync({
        transcription: updated.transcription,
        categories: updated.categories,
        date: today,
        source: currentSource,
      });
      setShowConfirmation(false);
      setProcessedData(null);
      setApiErrorMsg(null);
      setCapturedImageUri(null);
      reset();
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.daily(today) });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weekly });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.weeklySummary });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.monthlySummary });
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEYS.yearlySummary });
      queryClient.invalidateQueries({ queryKey: STREAK_QUERY_KEY });
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    }
  }, [confirmSaveMutation, reset, queryClient, currentSource]);

  const handleDiscard = useCallback(() => {
    setShowConfirmation(false);
    setProcessedData(null);
    setApiErrorMsg(null);
    setCapturedImageUri(null);
    reset();
  }, [reset]);

  const handleCancel = useCallback(async () => {
    await cancelRecording();
    setApiErrorMsg(null);
  }, [cancelRecording]);

  const handleRetry = useCallback(() => {
    setApiErrorMsg(null);
    reset();
  }, [reset]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

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
      </Animated.View>

      <StreakCard streak={streakData} />

      <Animated.View
        style={[styles.micArea, { opacity: micOpacity, transform: [{ translateY: micY }] }]}
      >
        <RecordingFace
          state={faceState}
          volume={volume}
          errorMessage={faceErrorMsg}
          source={currentSource}
          onPress={handleMicPress}
          onCancel={handleCancel}
          onRetry={handleRetry}
        />
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        {faceState === 'idle' ? (
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={styles.typeButton}
              onPress={handleCameraPress}
              activeOpacity={0.7}
            >
              <Text style={styles.typeButtonText}>📷  Scan bill</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.typeButton}
              onPress={() => setShowTextInput(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.typeButtonText}>⌨  Type instead</Text>
            </TouchableOpacity>
          </View>
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
        imageUri={currentSource === 'image' ? capturedImageUri ?? undefined : undefined}
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
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
  micArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
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
