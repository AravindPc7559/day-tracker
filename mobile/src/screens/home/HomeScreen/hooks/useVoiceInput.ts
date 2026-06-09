import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { Audio } from 'expo-av';

// Loaded lazily so the app doesn't crash in Expo Go (native module unavailable)
let Voice: typeof import('@react-native-voice/voice').default | null = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch {
  // Expo Go managed workflow — voice requires a dev build (npx expo run:android)
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

interface UseVoiceInputOptions {
  onResult: (text: string) => void;
  locale?: string;
}

interface UseVoiceInputReturn {
  voiceState: VoiceState;
  partialText: string;
  errorMessage: string | null;
  isVoiceAvailable: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  cancelListening: () => Promise<void>;
}

export const useVoiceInput = ({
  onResult,
  locale = 'en-US',
}: UseVoiceInputOptions): UseVoiceInputReturn => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [partialText, setPartialText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isVoiceAvailable = Voice !== null;

  useEffect(() => {
    if (!Voice) return;

    Voice.onSpeechStart = () => {
      setVoiceState('listening');
      setErrorMessage(null);
    };
    Voice.onSpeechEnd = () => setVoiceState('processing');
    Voice.onSpeechPartialResults = (e) => setPartialText(e.value?.[0] ?? '');
    Voice.onSpeechResults = (e) => {
      setVoiceState('idle');
      setPartialText('');
      const text = e.value?.[0];
      if (text) onResult(text);
    };
    Voice.onSpeechError = (e) => {
      const msg = e.error?.message ?? 'Speech recognition failed';
      // Ignore "no speech" errors silently
      if (msg.includes('No speech') || msg.includes('7')) {
        setVoiceState('idle');
      } else {
        setVoiceState('error');
        setErrorMessage(msg);
      }
      setPartialText('');
    };

    return () => {
      Voice?.destroy().then(() => Voice?.removeAllListeners());
    };
  }, [onResult]);

  const requestMicPermission = async (): Promise<boolean> => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status === 'granted') return true;

    Alert.alert(
      'Microphone Permission Required',
      'Please enable microphone access in your device settings to use voice input.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    return false;
  };

  const startListening = useCallback(async () => {
    if (!isVoiceAvailable) {
      Alert.alert(
        'Voice Not Available',
        'Voice input requires a development build.\n\nRun: npx expo run:android\n\nUse "Type instead" for now.',
        [{ text: 'OK' }]
      );
      return;
    }

    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;

    try {
      setErrorMessage(null);
      setPartialText('');
      setVoiceState('listening');
      await Voice!.start(locale);
    } catch {
      setVoiceState('error');
      setErrorMessage('Failed to start voice recognition. Try again.');
    }
  }, [isVoiceAvailable, locale]);

  const stopListening = useCallback(async () => {
    if (!Voice) return;
    try {
      await Voice.stop();
      setVoiceState('processing');
    } catch {
      setVoiceState('idle');
    }
  }, []);

  const cancelListening = useCallback(async () => {
    if (!Voice) return;
    try {
      await Voice.cancel();
    } catch {
      // ignore
    } finally {
      setVoiceState('idle');
      setPartialText('');
      setErrorMessage(null);
    }
  }, []);

  return {
    voiceState,
    partialText,
    errorMessage,
    isVoiceAvailable,
    startListening,
    stopListening,
    cancelListening,
  };
};
