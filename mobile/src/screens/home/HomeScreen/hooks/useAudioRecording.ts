import { useState, useRef } from 'react';
import { Audio } from 'expo-av';

export type RecordingState = 'idle' | 'recording' | 'processing' | 'error';

interface UseAudioRecordingReturn {
  recordingState: RecordingState;
  duration: number;
  errorMessage: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  reset: () => void;
}

export const useAudioRecording = (): UseAudioRecordingReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      setErrorMessage(null);

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

      // Creates a brand-new native recorder instance every call
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setRecordingState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (e) {
      console.log('[AudioRecording] start error:', e);
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
      console.log('[AudioRecording] URI:', uri);
      recordingRef.current = null;

      if (!uri) {
        setErrorMessage('Recording produced no file');
        setRecordingState('error');
        return null;
      }

      return uri;
    } catch (e) {
      console.log('[AudioRecording] stop error:', e);
      recordingRef.current = null;
      setErrorMessage('Failed to stop recording');
      setRecordingState('error');
      return null;
    }
  };

  const reset = () => {
    setRecordingState('idle');
    setDuration(0);
    setErrorMessage(null);
  };

  return { recordingState, duration, errorMessage, startRecording, stopRecording, reset };
};
