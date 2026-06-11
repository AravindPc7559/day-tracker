import { useState, useRef } from 'react';
import { Audio } from 'expo-av';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

interface UseAudioRecordingReturn {
  recordingState: RecordingState;
  duration: number;
  volume: number;
  errorMessage: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
  reset: () => void;
}

const METERING_FLOOR_DB = -60;

export const useAudioRecording = (): UseAudioRecordingReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      setErrorMessage(null);
      setVolume(0);

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        setErrorMessage('Microphone permission denied');
        setRecordingState('error');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        { ...Audio.RecordingOptionsPresets.HIGH_QUALITY, isMeteringEnabled: true },
        (status) => {
          if (status.metering !== undefined) {
            // Normalize dBFS (floor at METERING_FLOOR_DB) → 0..1
            const level = Math.max(0, Math.min(1, (status.metering - METERING_FLOOR_DB) / -METERING_FLOOR_DB));
            setVolume(level);
          }
        },
        100, // 10 fps
      );

      recordingRef.current = recording;
      setRecordingState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      setErrorMessage('Failed to start recording');
      setRecordingState('error');
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRecordingState('processing');
    setVolume(0);

    const recording = recordingRef.current;
    if (!recording) {
      setErrorMessage('No active recording');
      setRecordingState('error');
      return null;
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      recordingRef.current = null;

      if (!uri) {
        setErrorMessage('Recording produced no file');
        setRecordingState('error');
        return null;
      }

      return uri;
    } catch {
      recordingRef.current = null;
      setErrorMessage('Failed to stop recording');
      setRecordingState('error');
      return null;
    }
  };

  const cancelRecording = async (): Promise<void> => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recording = recordingRef.current;
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      } catch {
        // ignore — we're discarding anyway
      }
      recordingRef.current = null;
    }

    setRecordingState('idle');
    setDuration(0);
    setVolume(0);
    setErrorMessage(null);
  };

  const reset = () => {
    setRecordingState('idle');
    setDuration(0);
    setVolume(0);
    setErrorMessage(null);
  };

  return { recordingState, duration, volume, errorMessage, startRecording, stopRecording, cancelRecording, reset };
};
