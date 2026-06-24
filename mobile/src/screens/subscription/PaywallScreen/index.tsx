import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { PurchasesPackage } from 'react-native-purchases';
import { useAuthStore } from '@/features/auth/auth.store';
import { useSubscriptionStore } from '@/features/subscription/subscription.store';
import { AppLogo } from '@/components/ui/AppLogo';
import { Button } from '@/components/ui';
import { colors, gradients, spacing, typography, borderRadius, shadows } from '@/theme';

const FEATURES = [
  'Unlimited voice & photo capture',
  'AI-powered expense categorization',
  'Daily, weekly & monthly insights',
];

const PaywallScreen: React.FC = () => {
  const logout = useAuthStore((s) => s.logout);
  const { offering, isLoading, refresh, purchase } = useSubscriptionStore();
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  const monthlyPackage: PurchasesPackage | undefined = offering?.monthly ?? offering?.availablePackages[0];

  const handlePurchase = async () => {
    if (!monthlyPackage) return;
    setError(null);
    setPurchasing(true);
    try {
      await purchase(monthlyPackage);
    } catch {
      setError('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View style={styles.bg}>
      <LinearGradient colors={gradients.brandSubtle} style={styles.topSection}>
        <View style={styles.brandArea}>
          <AppLogo size={72} />
          <Text style={styles.appName}>CaptureDay</Text>
        </View>
      </LinearGradient>

      <View style={styles.cardWrapper}>
        <SafeAreaView edges={['bottom']} style={styles.card}>
          <Text style={styles.title}>Start your free trial</Text>
          <Text style={styles.subtitle}>7 days free, then {monthlyPackage?.product.priceString ?? '$1.60'}/month</Text>

          <View style={styles.featureList}>
            {FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary[500]} style={styles.loader} />
          ) : (
            <Button
              label={purchasing ? 'Starting trial...' : 'Start 7-day free trial'}
              onPress={handlePurchase}
              disabled={purchasing || !monthlyPackage}
              isLoading={purchasing}
              style={styles.primaryButton}
            />
          )}

          {error && <Text style={styles.statusError}>{error}</Text>}

          <Text style={styles.disclaimer}>
            Cancel anytime before the trial ends to avoid being charged.
          </Text>

          <TouchableOpacity onPress={logout} activeOpacity={0.7} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default PaywallScreen;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  topSection: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  brandArea: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  appName: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.primary[700],
    letterSpacing: -0.5,
  },
  cardWrapper: {
    flex: 1,
    marginTop: -spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    ...shadows.md,
  },
  title: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.extrabold,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  featureList: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureBullet: {
    fontSize: typography.size.md,
    color: colors.success,
    fontWeight: typography.weight.bold,
  },
  featureText: {
    fontSize: typography.size.md,
    color: colors.neutral[900],
    flex: 1,
  },
  loader: {
    marginBottom: spacing.lg,
  },
  primaryButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  disclaimer: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signOutText: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
  },
  statusError: {
    fontSize: typography.size.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
