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
import { registerWithEmail, setFirebaseDisplayName, sendEmailVerification } from '@/services/firebase/auth.service';
import { useCreateProfile } from '@/features/auth/auth.api';
import { useAuthStore } from '@/features/auth/auth.store';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { AppLogo } from '@/components/ui/AppLogo';
import { colors, gradients, spacing, typography, borderRadius, shadows } from '@/theme';
import type { RegisterPayload } from '@/features/auth/auth.types';
import type { AuthScreenProps } from '@/navigation/types';

const registerSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email({ message: 'Enter a valid email address' }),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Props = AuthScreenProps<'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { mutateAsync: createProfile } = useCreateProfile();
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const google = useGoogleAuth();

  const cardAnim = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 0, tension: 55, friction: 11, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<RegisterPayload>({
      resolver: zodResolver(registerSchema),
      defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
    });

  const onSubmit = async (values: RegisterPayload) => {
    try {
      const firebaseUser = await registerWithEmail(values.email, values.password);
      await setFirebaseDisplayName(firebaseUser, values.displayName);
      await sendEmailVerification(firebaseUser);
      const profile = await createProfile({ displayName: values.displayName });
      setUserProfile(profile);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message.includes('email-already-in-use')
          ? 'An account with this email already exists'
          : 'Registration failed. Please try again.';
      setError('root', { message });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.bg}>
        <LinearGradient colors={gradients.brandSubtle} style={styles.topSection}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←  Back</Text>
          </TouchableOpacity>
          <AppLogo size={60} />
          <Text style={styles.headerTitle}>Create account</Text>
          <Text style={styles.headerSubtitle}>Start your journey today</Text>
        </LinearGradient>

        <Animated.View
          style={[styles.cardWrapper, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}
        >
          <ScrollView
            style={styles.card}
            contentContainerStyle={styles.cardContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Your details</Text>
            <Text style={styles.subtitle}>Fill in the information below</Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="displayName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Full Name" placeholder="John Doe" autoCapitalize="words"
                    autoComplete="name" value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.displayName?.message} />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Email address" placeholder="you@example.com" keyboardType="email-address"
                    autoCapitalize="none" autoComplete="email" value={value} onChangeText={onChange}
                    onBlur={onBlur} error={errors.email?.message} />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Password" placeholder="Min. 6 characters" showPasswordToggle
                    autoComplete="new-password" value={value} onChangeText={onChange}
                    onBlur={onBlur} error={errors.password?.message} />
                )}
              />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Confirm Password" placeholder="Repeat your password" showPasswordToggle
                    autoComplete="new-password" value={value} onChangeText={onChange}
                    onBlur={onBlur} error={errors.confirmPassword?.message} />
                )}
              />

              {errors.root || google.error ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{errors.root?.message ?? google.error}</Text>
                </View>
              ) : null}

              <Button label="Create Account" onPress={handleSubmit(onSubmit)}
                isLoading={isSubmitting} style={styles.submitButton} />

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
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.neutral[900] },
  bg: { flex: 1, backgroundColor: colors.neutral[900] },
  topSection: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  backButton: { marginBottom: spacing.xl },
  backIcon: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: typography.weight.medium,
  },
  headerTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.45)',
    marginTop: spacing.xs,
  },
  cardWrapper: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: colors.neutral[900],
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
  },
  cardContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.extrabold,
    color: colors.neutral[0],
    letterSpacing: -0.4,
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
  errorText: { fontSize: typography.size.sm, color: '#FCA5A5' },
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
