import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, typography, borderRadius, shadows } from '@/theme';
import type { AppScreenProps } from '@/navigation/types';

type Props = AppScreenProps<'InputResult'>;

const InputResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { input } = route.params;

  const cardAnim = useRef(new Animated.Value(30)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 0, tension: 60, friction: 11, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.flex}>
      <LinearGradient colors={gradients.brandSubtle} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Input</Text>
        <Text style={styles.headerSubtitle}>Captured successfully</Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.card, shadows.md, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.dot} />
            <Text style={styles.cardLabel}>YOU SAID</Text>
          </View>
          <Text style={styles.inputText}>{input}</Text>
        </Animated.View>

        <Animated.View style={[styles.nextCard, { opacity: cardOpacity }]}>
          <Text style={styles.nextTitle}>What happens next?</Text>
          <Text style={styles.nextBody}>
            This is where the app processes your input — send to the server, start a task, log your day, or navigate forward.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InputResultScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl + spacing.md,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  backIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.7)',
  },
  backLabel: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: typography.weight.medium,
  },
  headerTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.extrabold,
    color: colors.neutral[0],
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.45)',
    marginTop: spacing.xs,
  },
  body: {
    flex: 1,
    marginTop: -spacing.xl,
  },
  bodyContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral[500],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
  cardLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral[300],
    letterSpacing: 1.2,
  },
  inputText: {
    fontSize: typography.size.lg,
    color: colors.neutral[0],
    lineHeight: typography.size.lg * 1.6,
    fontWeight: typography.weight.medium,
  },
  nextCard: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  nextTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.primary[400],
    marginBottom: spacing.sm,
  },
  nextBody: {
    fontSize: typography.size.sm,
    color: colors.primary[300],
    lineHeight: typography.size.sm * 1.7,
  },
});
