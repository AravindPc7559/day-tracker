import React, { useRef, useEffect, useState } from 'react';
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
import { BlurtLogo } from '@/components/ui/BlurtLogo';
import { sendPasswordResetEmail } from '@/services/firebase/auth.service';
import { colors, gradients, spacing, typography, borderRadius, shadows } from '@/theme';
import type { AuthScreenProps } from '@/navigation/types';

const schema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
});

type FormValues = z.infer<typeof schema>;
type Props = AuthScreenProps<'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [sent, setSent] = useState(false);
  const cardAnim = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(cardAnim, { toValue: 0, tension: 55, friction: 11, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const { control, handleSubmit, setError, getValues, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { email: '' },
    });

  const onSubmit = async (values: FormValues) => {
    try {
      await sendPasswordResetEmail(values.email);
      setSent(true);
    } catch {
      setError('root', { message: 'Something went wrong. Please check the email and try again.' });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.bg}>
        <LinearGradient colors={gradients.brandSubtle} style={styles.topSection}>
          <Animated.View style={[styles.brandArea, { opacity: logoAnim }]}>
            <BlurtLogo size={80} />
            <Text style={styles.appName}>Blurt</Text>
          </Animated.View>
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
            {sent ? (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>📬</Text>
                <Text style={styles.title}>Email sent!</Text>
                <Text style={styles.successText}>
                  We sent a password reset link to{' '}
                  <Text style={styles.emailHighlight}>{getValues('email')}</Text>.
                  Check your inbox and follow the link to reset your password.
                </Text>
                <Text style={styles.spamHint}>
                  Can't find it? Check your spam or junk folder.
                </Text>
                <Button
                  label="Back to Sign In"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.backButton}
                />
              </View>
            ) : (
              <>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow} activeOpacity={0.7}>
                  <Text style={styles.backArrow}>←</Text>
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Forgot password?</Text>
                <Text style={styles.subtitle}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

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

                  {errors.root ? (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorText}>{errors.root.message}</Text>
                    </View>
                  ) : null}

                  <Button
                    label="Send Reset Link"
                    onPress={handleSubmit(onSubmit)}
                    isLoading={isSubmitting}
                    style={styles.submitButton}
                  />
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Remember your password? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.footerLink}>Sign in</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.neutral[900] },
  bg: { flex: 1, backgroundColor: colors.neutral[900] },
  topSection: { paddingBottom: spacing.sm },
  brandArea: {
    alignItems: 'center',
    paddingTop: spacing.xxxl + spacing.xl,
    paddingBottom: spacing.md,
  },
  appName: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: 0.3,
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  backArrow: {
    fontSize: typography.size.xl,
    color: colors.neutral[300],
  },
  backText: {
    fontSize: typography.size.md,
    color: colors.neutral[300],
    fontWeight: typography.weight.medium,
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
    lineHeight: 22,
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
  successContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  successIcon: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  successText: {
    fontSize: typography.size.md,
    color: colors.neutral[300],
    textAlign: 'center',
    lineHeight: 24,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emailHighlight: {
    color: colors.primary[400],
    fontWeight: typography.weight.semibold,
  },
  spamHint: {
    fontSize: typography.size.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: '100%',
    marginTop: spacing.md,
  },
});
