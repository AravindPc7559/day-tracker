import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/features/auth/auth.store';
import { colors, typography, spacing } from '@/theme';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, userProfile } = useAuthStore();

  if (!isAuthenticated) return null;

  if (requiredRole && userProfile?.role !== requiredRole) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.message}>You don't have permission to view this screen.</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.neutral[0],
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.size.md,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
