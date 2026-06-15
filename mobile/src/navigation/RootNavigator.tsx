import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import type { User } from 'firebase/auth';
import { useAuthStore } from '@/features/auth/auth.store';
import { colors } from '@/theme';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import VerifyEmailScreen from '@/screens/auth/VerifyEmailScreen';

const isEmailPasswordUser = (user: User | null) =>
  user?.providerData?.some((p) => p.providerId === 'password') ?? false;

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isInitialized, initialize, user, emailVerified } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  const needsEmailVerification =
    isAuthenticated &&
    isEmailPasswordUser(user) &&
    !emailVerified;

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : needsEmailVerification ? (
        <VerifyEmailScreen />
      ) : (
        <AppNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
  },
});
