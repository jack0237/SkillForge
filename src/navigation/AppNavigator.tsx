import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { NavigatorScreenParams } from '@react-navigation/native';
import { Home, Search, BookOpen, User } from 'lucide-react-native';
import CatalogStack from './CatalogStack';
import { CatalogStackParamList } from './CatalogStack';
import DashboardScreen from '../screens/home/DashboardScreen';
import { colors, spacing } from '../constants/theme';

export type AppTabParamList = {
  Home: undefined;
  Catalog: NavigatorScreenParams<CatalogStackParamList>;
  'My Learning': undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

function Placeholder({ label }: { label: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{label}</Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2} /> }}
      />

      <Tab.Screen
        name="Catalog"
        component={CatalogStack}
        options={{ tabBarIcon: ({ color, size }) => <Search size={size} color={color} strokeWidth={2} /> }}
      />

      <Tab.Screen
        name="My Learning"
        options={{ tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} strokeWidth={2} /> }}
      >
        {() => <Placeholder label="My Courses — Issue #8" />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{ tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2} /> }}
      >
        {() => <Placeholder label="Profile — coming soon" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    height: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
});
