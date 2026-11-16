import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../../../shared/theme/ThemeContext';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { AddressSelectScreen } from '../screens/AddressSelectScreen';
import { CabSelectScreen } from '../screens/CabSelectScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { BookingConfirmScreen } from '../screens/BookingConfirmScreen';
import { BookingTimelineScreen } from '../screens/BookingTimelineScreen';
import { MyTripsScreen } from '../screens/MyTripsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { PrivacyPolicyScreen } from '../../../../shared/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../../../../shared/screens/TermsOfServiceScreen';
import { NotFoundScreen } from '../../../../shared/components/NotFoundScreen';

import { Compass, Calendar, Navigation2, Headphones, User } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 5-Item Bottom Navigation styled like Uber / Bolt
const MainTabNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '800',
          letterSpacing: 0.2,
          marginTop: 2,
        },
      }}
    >
      {/* 1. Explore / Home */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ride',
          tabBarIcon: ({ color, size }) => (
            <Compass size={22} color={color} strokeWidth={2.4} />
          ),
        }}
      />

      {/* 2. My Bookings */}
      <Tab.Screen
        name="MyBookings"
        component={MyTripsScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={21} color={color} strokeWidth={2.4} />
          ),
        }}
      />

      {/* 3. Track Ride */}
      <Tab.Screen
        name="TrackRide"
        component={BookingTimelineScreen}
        options={{
          tabBarLabel: 'Tracking',
          tabBarIcon: ({ color, size }) => (
            <Navigation2 size={21} color={color} strokeWidth={2.4} />
          ),
        }}
      />

      {/* 4. Support Desk */}
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{
          tabBarLabel: 'Helpdesk',
          tabBarIcon: ({ color, size }) => (
            <Headphones size={21} color={color} strokeWidth={2.4} />
          ),
        }}
      />

      {/* 5. Account / Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => (
            <User size={21} color={color} strokeWidth={2.4} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const PassengerNavigator = () => {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.cardSurface,
      text: colors.textPrimary,
      border: colors.cardBorder,
      primary: colors.accentGold,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="AddressSelect" component={AddressSelectScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="CabSelect" component={CabSelectScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="BookingTimeline" component={BookingTimelineScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
