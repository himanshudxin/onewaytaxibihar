import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Calendar, Users, Radio, Settings } from 'lucide-react-native';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { useAdmin } from '../context/AdminContext';

// Screens
import { AdminLoginScreen } from '../screens/AdminLoginScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { AdminBookingsScreen } from '../screens/AdminBookingsScreen';
import { AdminDriversScreen } from '../screens/AdminDriversScreen';
import { AdminDispatchScreen } from '../screens/AdminDispatchScreen';
import { AdminSettingsScreen } from '../screens/AdminSettingsScreen';
import { NotFoundScreen } from '../../../../shared/components/NotFoundScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800'
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Command V2',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={AdminBookingsScreen}
        options={{
          tabBarLabel: 'Trips & Dispatch',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Dispatch"
        component={AdminDispatchScreen}
        options={{
          tabBarLabel: 'Dispatch Hub',
          tabBarIcon: ({ color, size }) => <Radio size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Drivers"
        component={AdminDriversScreen}
        options={{
          tabBarLabel: 'Fleet KYC',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AdminSettingsScreen}
        options={{
          tabBarLabel: 'Desk Config',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />
        }}
      />
    </Tab.Navigator>
  );
};

export const AdminNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAdmin();
  const { colors } = useTheme();

  if (isLoading && !isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        ) : (
          <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
        )}
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
