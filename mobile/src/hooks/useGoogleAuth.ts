import { useEffect, useState } from 'react';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { signInWithGoogle } from '@/services/firebase/auth.service';

WebBrowser.maybeCompleteAuthSession();

// Google's OAuth 2.0 endpoints
const DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

interface UseGoogleAuthReturn {
  signIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUri = makeRedirectUri();
  console.log('[GoogleAuth] redirectUri:', redirectUri);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      usePKCE: false,
      extraParams: { access_type: 'online' },
    },
    DISCOVERY
  );

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
