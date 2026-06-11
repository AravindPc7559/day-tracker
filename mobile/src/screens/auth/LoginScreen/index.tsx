import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input } from '@/components/ui';
import { signInWithEmail } from '@/services/firebase/auth.service';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { colors, gradients, spacing, typography, borderRadius, shadows } from '@/theme';
import type { LoginPayload } from '@/features/auth/auth.types';
import type { AuthScreenProps } from '@/navigation/types';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type Props = AuthScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const google = useGoogleAuth();
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

  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<LoginPayload>({
      resolver: zodResolver(loginSchema),
      defaultValues: { email: '', password: '' },
    });

  const onSubmit = async (values: LoginPayload) => {
    try {
      await signInWithEmail(values.email, values.password);
    } catch {
      setError('root', { message: 'Invalid email or password. Please try again.' });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.bg}>
        {/* Top gradient header */}
        <LinearGradient colors={gradients.brandSubtle} style={styles.topSection}>
          <Animated.View style={[styles.brandArea, { opacity: logoAnim }]}>
            <View style={styles.logoRing}>
              <Text style={styles.logoLetter}>D</Text>
            </View>
            <Text style={styles.appName}>Day Tracker</Text>
            <Text style={styles.tagline}>Track · Reflect · Grow</Text>
          </Animated.View>
        </LinearGradient>

        {/* Card */}
        <Animated.View
          style={[styles.cardWrapper, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}
        >
          <ScrollView
            style={styles.card}
            contentContainerStyle={styles.cardContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email address"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    secureTextEntry
                    autoComplete="password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              {errors.root || google.error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errors.root?.message ?? google.error}</Text>
                </View>
              ) : null}

              <Button
                label="Sign In"
                onPress={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
                style={styles.submitButton}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={google.signIn}
                disabled={google.isLoading}
                activeOpacity={0.8}
              >
                {google.isLoading ? (
                  <Text style={styles.googleLabel}>Signing in…</Text>
                ) : (
                  <>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.googleLabel}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: colors.neutral[900] },
  topSection: { paddingBottom: spacing.xxl },
  brandArea: {
    alignItems: 'center',
    paddingTop: spacing.xxxl + spacing.xl,
    paddingBottom: spacing.xl,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(59,130,246,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoLetter: {
    fontSize: 34,
    fontWeight: typography.weight.extrabold,
    color: colors.neutral[0],
  },
  appName: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.45)',
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  cardWrapper: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: colors.neutral[900],
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    ...shadows.lg,
  },
  cardContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.extrabold,
    color: colors.neutral[0],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.neutral[300],
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  form: { gap: spacing.xs },
  errorBanner: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: {
    fontSize: typography.size.sm,
    color: '#FCA5A5',
  },
  submitButton: { marginTop: spacing.md },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[700],
  },
  dividerText: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    fontWeight: typography.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[600],
    backgroundColor: colors.neutral[800],
    marginTop: spacing.md,
  },
  googleIcon: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
    color: '#4285F4',
  },
  googleLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[100],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: { fontSize: typography.size.sm, color: colors.neutral[300] },
  footerLink: {
    fontSize: typography.size.sm,
    color: colors.primary[400],
    fontWeight: typography.weight.semibold,
  },
});
