import React, { useRef, useEffect, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { MicButton } from '@/components/ui/MicButton';
import { ListeningFace } from './ListeningFace';
import { ThinkingFace } from './ThinkingFace';
import { DoneFace } from './DoneFace';
import { ErrorFace } from './ErrorFace';

export type FaceState = 'idle' | 'listening' | 'thinking' | 'done' | 'error';

interface RecordingFaceProps {
  state: FaceState;
  volume: number;
  errorMessage?: string | null;
  onPress: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

type ContentSlot = 'mic' | 'face';

export const RecordingFace: React.FC<RecordingFaceProps> = ({
  state,
  volume,
  errorMessage,
  onPress,
  onCancel,
  onRetry,
}) => {
  const fade = useRef(new Animated.Value(1)).current;
  const innerFade = useRef(new Animated.Value(1)).current;

  // What is actually rendered (lags behind state during crossfades)
  const [displayed, setDisplayed] = useState<FaceState>(state);
  const [slot, setSlot] = useState<ContentSlot>(state === 'idle' ? 'mic' : 'face');

  const prevIdle = useRef(state === 'idle');

  useEffect(() => {
    const nowIdle = state === 'idle';
    const wasIdle = prevIdle.current;
    prevIdle.current = nowIdle;

    if (nowIdle === wasIdle) {
      // Same slot (face→face): inner fade to swap emoji
      if (!nowIdle && displayed !== state) {
        Animated.timing(innerFade, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
          setDisplayed(state);
          Animated.timing(innerFade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        });
      }
      return;
    }

    // Slot change (mic↔face): outer fade
    Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setSlot(nowIdle ? 'mic' : 'face');
      setDisplayed(state);
      innerFade.setValue(1);
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }, [state]);

  const renderFace = () => {
    switch (displayed) {
      case 'listening': return <ListeningFace volume={volume} onStop={onPress} onCancel={onCancel} />;
      case 'thinking':  return <ThinkingFace />;
      case 'done':      return <DoneFace />;
      case 'error':     return <ErrorFace message={errorMessage} onRetry={onRetry} />;
      default:          return null;
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fade }]}>
      {slot === 'mic' ? (
        <MicButton state="idle" onPress={onPress} />
      ) : (
        <Animated.View style={[styles.faceWrapper, { opacity: innerFade }]}>
          {renderFace()}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceWrapper: {
    alignItems: 'center',
  },
});
