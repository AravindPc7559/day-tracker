import { useEffect, useState } from 'react';
import { useAuthRequest } from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { signInWithGoogle } from '@/services/firebase/auth.service';

WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.params['id_token'];
      if (!idToken) {
        setError('Google sign-in failed — no ID token returned.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      signInWithGoogle(idToken)
        .catch(() => setError('Google sign-in failed. Please try again.'))
        .finally(() => setIsLoading(false));
    } else if (response.type === 'error') {
      setError(response.error?.message ?? 'Google sign-in failed.');
      setIsLoading(false);
    } else if (response.type === 'dismiss') {
      setIsLoading(false);
    }
  }, [response]);

  const signIn = async () => {
    setError(null);
    setIsLoading(true);
    await promptAsync();
  };

  return {
    signIn,
    isLoading: isLoading || !request,
    error,
    clearError: () => setError(null),
  };
};
