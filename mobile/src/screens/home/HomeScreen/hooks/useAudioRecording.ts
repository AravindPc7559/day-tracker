import { useState, useRef } from 'react';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const startRecording = async () => {
    try {
      setErrorMessage(null);

      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setErrorMessage('Microphone permission denied');
        setRecordingState('error');
        return;
      }

      await recorder.prepareToRecordAsync();
      recorder.record();

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

    try {
      await recorder.stop();
      const uri = recorder.uri;
      return uri ?? null;
    } catch {
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
