import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/features/auth/auth.store';
import { sendEmailVerification, reloadUser } from '@/services/firebase/auth.service';
import { AppLogo } from '@/components/ui/AppLogo';
import { Button } from '@/components/ui';
import { colors, gradients, spacing, typography, borderRadius, shadows } from '@/theme';

const RESEND_COOLDOWN = 60;

const VerifyEmailScreen: React.FC = () => {
  const { user, logout, setEmailVerified } = useAuthStore();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(cardAnim, { toValue: 0, tension: 55, friction: 11, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        await reloadUser(user);
        if (user.emailVerified) {
          clearInterval(interval);
          setEmailVerified(true);
        }
      } catch {
        // ignore network errors
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!user) return;
    setResending(true);
    setResendStatus('idle');
    try {
      await sendEmailVerification(user);
      setResendCooldown(RESEND_COOLDOWN);
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    } finally {
      setResending(false);
    }
  };

  const handleCheckNow = async () => {
    if (!user) return;
    setChecking(true);
    try {
      await reloadUser(user);
      if (user.emailVerified) {
        setEmailVerified(true);
      }
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.bg}>
        <LinearGradient colors={gradients.brandSubtle} style={styles.topSection}>
          <Animated.View style={[styles.brandArea, { opacity: logoAnim }]}>
            <AppLogo size={72} />
            <Text style={styles.appName}>CaptureDay</Text>
          </Animated.View>
        </LinearGradient>

        <Animated.View
          style={[
            styles.cardWrapper,
            { transform: [{ translateY: cardAnim }], opacity: cardOpacity },
          ]}
        >
          <SafeAreaView edges={['bottom']} style={styles.card}>
            <View style={styles.iconRow}>
              <Text style={styles.emailIcon}>📧</Text>
            </View>

            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a verification link to
            </Text>
            <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>

            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                Open the email and tap the verification link. Once verified, press the button below to continue.
              </Text>
              <Text style={[styles.hintText, styles.hintSpam]}>
                Can't find it? Check your spam or junk folder.
              </Text>
            </View>

            <Button
              label={checking ? 'Checking...' : "I've verified my email — let me in"}
              onPress={handleCheckNow}
              disabled={checking}
              style={styles.primaryButton}
            />

            <TouchableOpacity
              style={[
                styles.resendButton,
                (resendCooldown > 0 || resending) && styles.resendDisabled,
              ]}
              onPress={handleResend}
              disabled={resendCooldown > 0 || resending}
              activeOpacity={0.7}
            >
              {resending ? (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              ) : (
                <Text
                  style={[
                    styles.resendText,
                    resendCooldown > 0 && styles.resendTextDisabled,
                  ]}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
                </Text>
              )}
            </TouchableOpacity>

            {resendStatus === 'sent' && (
              <Text style={styles.statusSent}>Email sent! Check your inbox.</Text>
            )}
            {resendStatus === 'error' && (
              <Text style={styles.statusError}>Failed to send. Please try again.</Text>
            )}

            <TouchableOpacity onPress={logout} activeOpacity={0.7} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default VerifyEmailScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  iconRow: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emailIcon: {
    fontSize: 52,
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
  },
  email: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.primary[600],
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  hintBox: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  hintText: {
    fontSize: typography.size.sm,
    color: colors.primary[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  hintSpam: {
    marginTop: spacing.sm,
    color: colors.primary[500],
  },
  primaryButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  resendButton: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary[300],
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resendDisabled: {
    borderColor: colors.neutral[200],
  },
  resendText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.primary[600],
  },
  resendTextDisabled: {
    color: colors.neutral[400],
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signOutText: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
  },
  statusSent: {
    fontSize: typography.size.sm,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statusError: {
    fontSize: typography.size.sm,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
