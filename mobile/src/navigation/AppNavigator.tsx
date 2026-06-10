import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import HomeScreen from '@/screens/home/HomeScreen';
import ProgressScreen from '@/screens/progress/ProgressScreen';
import { colors, typography } from '@/theme';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

const tabIcon = (name: string, focused: boolean) => (
  <Text style={[styles.icon, focused && styles.iconFocused]}>
    {name === 'Home' ? '🎙️' : '📊'}
  </Text>
);

export const AppNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.primary[400],
      tabBarInactiveTintColor: colors.neutral[400],
      tabBarLabelStyle: styles.tabLabel,
      tabBarIcon: ({ focused }) => tabIcon(route.name, focused),
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Record' }} />
    <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: 'Progress' }} />
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
  icon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
});
