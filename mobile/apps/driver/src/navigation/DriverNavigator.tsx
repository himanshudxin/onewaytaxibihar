import React from 'react';
import { View, StyleSheet, Platform, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';

// Screens
import { DriverSplashScreen } from '../screens/DriverSplashScreen';
import { DriverHomeScreen } from '../screens/DriverHomeScreen';
import { DriverAuthScreen } from '../screens/DriverAuthScreen';
import { DriverApplicationScreen } from '../screens/DriverApplicationScreen';
import { DriverVerificationStatusScreen } from '../screens/DriverVerificationStatusScreen';
import { TripOfferModal } from '../screens/TripOfferModal';
import { TripExecutionScreen } from '../screens/TripExecutionScreen';
import { DriverEarningsScreen } from '../screens/DriverEarningsScreen';
import { DriverProfileScreen } from '../screens/DriverProfileScreen';
import { NotFoundScreen } from '../../../../shared/components/NotFoundScreen';

import { Navigation, DollarSign, User, ShieldAlert } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DriverTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="DutyHome"
        component={DriverHomeScreen}
        options={{
          tabBarLabel: 'Duty Console',
          tabBarIcon: ({ color, size }) => <Navigation color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={DriverEarningsScreen}
        options={{
          tabBarLabel: 'Payouts',
          tabBarIcon: ({ color, size }) => <DollarSign color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DriverProfileScreen}
        options={{
          tabBarLabel: 'Profile & Docs',
          tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const DriverNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={DriverSplashScreen} />
        <Stack.Screen name="DriverTabs" component={DriverTabNavigator} />
        <Stack.Screen name="DriverAuth" component={DriverAuthScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="DriverApplication" component={DriverApplicationScreen} />
        <Stack.Screen name="VerificationStatus" component={DriverVerificationStatusScreen} />
        <Stack.Screen
          name="TripOfferModal"
          component={TripOfferModal}
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen name="TripExecution" component={TripExecutionScreen} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
