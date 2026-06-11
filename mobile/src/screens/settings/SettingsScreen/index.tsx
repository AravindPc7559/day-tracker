import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/auth.store';
import { colors, spacing, typography, borderRadius } from '@/theme';

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

// ─── Row variants ─────────────────────────────────────────────────────────────

interface RowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  badge?: string;
  destructive?: boolean;
}

const Row: React.FC<RowProps> = ({ icon, label, value, onPress, isLast, badge, destructive }) => (
  <TouchableOpacity
    style={[styles.row, isLast && styles.rowLast]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <Text style={styles.rowIcon}>{icon}</Text>
    <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>{label}</Text>
    <View style={styles.rowRight}>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : value ? (
        <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
      ) : null}
      {onPress && !badge && (
        <Text style={[styles.chevron, destructive && styles.chevronDestructive]}>›</Text>
      )}
    </View>
  </TouchableOpacity>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials || '?'}</Text>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const SettingsScreen: React.FC = () => {
  const { userProfile, user, logout } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = userProfile?.displayName ?? user?.displayName ?? 'User';
  const email = userProfile?.email ?? user?.email ?? '';
  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            await logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          <Avatar name={displayName} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            {memberSince && (
              <Text style={styles.profileMeta}>Member since {memberSince}</Text>
            )}
          </View>
        </View>

        {/* ── Notifications ── */}
        <Section title="Notifications">
          <Row
            icon="🔔"
            label="Daily Reminder"
            badge="Soon"
            isLast={false}
          />
          <Row
            icon="🔥"
            label="Streak Protection Alert"
            badge="Soon"
            isLast={true}
          />
        </Section>

        {/* ── Data ── */}
        <Section title="Data">
          <Row
            icon="📤"
            label="Export as CSV"
            badge="Soon"
            isLast={false}
          />
          <Row
            icon="🗃️"
            label="Backup & Restore"
            badge="Soon"
            isLast={true}
          />
        </Section>

        {/* ── About ── */}
        <Section title="About">
          <Row
            icon="📱"
            label="App Version"
            value="1.0.0"
            isLast={false}
          />
          <Row
            icon="🤖"
            label="Powered by"
            value="Whisper + GPT-4o"
            isLast={true}
          />
        </Section>

        {/* ── Account ── */}
        <Section title="Account">
          <Row
            icon="🚪"
            label={signingOut ? 'Signing out…' : 'Sign Out'}
            onPress={signingOut ? undefined : handleSignOut}
            isLast={true}
            destructive
          />
        </Section>

        <Text style={styles.footer}>Blurt • Made with ❤️</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  screenTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: -0.3,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xs,
  },

  // Profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
    letterSpacing: -0.5,
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.neutral[0],
  },
  profileEmail: {
    fontSize: typography.size.sm,
    color: colors.neutral[300],
  },
  profileMeta: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    marginTop: 2,
  },

  // Sections
  section: { gap: spacing.xs, marginBottom: spacing.sm },
  sectionTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[400],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[600],
    overflow: 'hidden',
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.neutral[700],
    minHeight: 52,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  rowLabel: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.neutral[100],
    fontWeight: typography.weight.medium,
  },
  rowLabelDestructive: { color: colors.error },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowValue: {
    fontSize: typography.size.sm,
    color: colors.neutral[400],
    maxWidth: 140,
    textAlign: 'right',
  },
  chevron: {
    fontSize: typography.size.lg,
    color: colors.neutral[500],
    lineHeight: typography.size.lg * 1.2,
  },
  chevronDestructive: { color: colors.error },

  // Badge
  badge: {
    backgroundColor: colors.neutral[700],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.neutral[500],
  },
  badgeText: {
    fontSize: typography.size.xs,
    color: colors.neutral[400],
    fontWeight: typography.weight.medium,
  },

  footer: {
    fontSize: typography.size.xs,
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
