import React from 'react';
import { View, StyleSheet, Platform, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PassengerColors } from '../../../../shared/theme/colors';

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

import { Home, Calendar, Navigation, Headphones, User } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 5-Item Bottom Navigation mandated by User Specification #4
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        tabBarActiveTintColor: '#D97706', // Golden Yellow Accent
        tabBarInactiveTintColor: '#94A3B8', // Muted Slate
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          marginTop: 2,
        },
      }}
    >
      {/* 1. Home */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={21} strokeWidth={2.3} />,
        }}
      />

      {/* 2. My Bookings */}
      <Tab.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{
          tabBarLabel: 'My Bookings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={21} strokeWidth={2.3} />,
        }}
      />

      {/* 3. Track */}
      <Tab.Screen
        name="Track"
        component={BookingTimelineScreen}
        options={{
          tabBarLabel: 'Track',
          tabBarIcon: ({ color, size }) => <Navigation color={color} size={21} strokeWidth={2.3} />,
        }}
      />

      {/* 4. Support */}
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{
          tabBarLabel: 'Support',
          tabBarIcon: ({ color, size }) => <Headphones color={color} size={21} strokeWidth={2.3} />,
        }}
      />

      {/* 5. Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={21} strokeWidth={2.3} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const PassengerNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="AddressSelect" component={AddressSelectScreen} />
        <Stack.Screen name="CabSelect" component={CabSelectScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
        <Stack.Screen name="BookingTimeline" component={BookingTimelineScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
