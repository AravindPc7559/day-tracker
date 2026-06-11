import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import HomeScreen from '@/screens/home/HomeScreen';
import ProgressScreen from '@/screens/progress/ProgressScreen';
import AnalyticsScreen from '@/screens/analytics/AnalyticsScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import { colors, typography } from '@/theme';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

const ICONS: Record<string, string> = {
  Home: '🎙️',
  Progress: '📅',
  Analytics: '📈',
  Settings: '⚙️',
};

export const AppNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.primary[400],
      tabBarInactiveTintColor: colors.neutral[400],
      tabBarLabelStyle: styles.tabLabel,
      tabBarIcon: ({ focused }) => (
        <Text style={[styles.icon, focused && styles.iconFocused]}>
          {ICONS[route.name]}
        </Text>
      ),
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Record' }} />
    <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: 'Progress' }} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarLabel: 'Analytics' }} />
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.neutral[800],
    borderTopColor: colors.neutral[600],
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  icon: { fontSize: 22, opacity: 0.5 },
  iconFocused: { opacity: 1 },
});
