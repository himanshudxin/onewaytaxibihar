import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './context/AppContext';
import { Colors } from './theme/colors';

// Customer Screens
import { HomeScreen } from './screens/customer/HomeScreen';
import { CabSelectScreen } from './screens/customer/CabSelectScreen';
import { CheckoutScreen } from './screens/customer/CheckoutScreen';

// Driver Screens
import { DriverDashboardScreen } from './screens/driver/DriverDashboardScreen';

// Icons
import { Compass, Car, History, PhoneCall, Shield } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Rider Stack Navigator
const CustomerStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.dark.surface },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CabSelect"
        component={CabSelectScreen}
        options={{ title: 'Select Vehicle Tier' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Confirm Cab Booking' }}
      />
    </Stack.Navigator>
  );
};

// Rider Trips Screen Placeholder
const CustomerTripsScreen = () => {
  const colors = Colors.dark;
  return (
    <View style={[styles.centerScreen, { backgroundColor: colors.background }]}>
      <History color={colors.primary} size={48} />
      <Text style={[styles.centerTitle, { color: colors.text }]}>My Booking History</Text>
      <Text style={[styles.centerSubtitle, { color: colors.textSecondary }]}>
        Your confirmed outstation trips and live driver dispatch vouchers are saved here automatically.
      </Text>
    </View>
  );
};

// 24x7 Helpdesk Screen
const SupportScreen = () => {
  const colors = Colors.dark;
  return (
    <View style={[styles.centerScreen, { backgroundColor: colors.background }]}>
      <PhoneCall color={colors.primary} size={48} />
      <Text style={[styles.centerTitle, { color: colors.text }]}>24×7 Central Dispatch Helpdesk</Text>
      <Text style={[styles.centerSubtitle, { color: colors.textSecondary }]}>
        Dedicated booking &amp; emergency driver coordination across all 38 districts of Bihar.
      </Text>
      <Text style={[styles.hotlineText, { color: colors.primary }]}>+91 80021 41816</Text>
      <Text style={[styles.hotlineSub, { color: colors.whatsapp }]}>WhatsApp Helpdesk: +91 77394 06400</Text>
    </View>
  );
};

// Driver Earnings & Ledger Screen
const DriverLedgerScreen = () => {
  const colors = Colors.dark;
  return (
    <View style={[styles.centerScreen, { backgroundColor: colors.background }]}>
      <Shield color={colors.primary} size={48} />
      <Text style={[styles.centerTitle, { color: colors.text }]}>Driver Partner Ledger</Text>
      <Text style={[styles.centerSubtitle, { color: colors.textSecondary }]}>
        Daily cash collections, bank payouts, and fuel settlement summaries.
      </Text>
    </View>
  );
};

// Main Dynamic Role Navigator (Rider vs Driver)
const MainNavigator = () => {
  const { activeRole } = useApp();
  const colors = Colors.dark;

  if (activeRole === 'driver') {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          headerShown: false
        }}
      >
        <Tab.Screen
          name="DutyConsole"
          component={DriverDashboardScreen}
          options={{
            tabBarLabel: 'Duty Console',
            tabBarIcon: ({ color, size }) => <Car color={color} size={size} />
          }}
        />
        <Tab.Screen
          name="DriverLedger"
          component={DriverLedgerScreen}
          options={{
            tabBarLabel: 'Duty Ledger',
            tabBarIcon: ({ color, size }) => <History color={color} size={size} />
          }}
        />
        <Tab.Screen
          name="DriverSupport"
          component={SupportScreen}
          options={{
            tabBarLabel: 'Dispatch Desk',
            tabBarIcon: ({ color, size }) => <PhoneCall color={color} size={size} />
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false
      }}
    >
      <Tab.Screen
        name="BookCab"
        component={CustomerStackNavigator}
        options={{
          tabBarLabel: 'Book Cab',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="MyTrips"
        component={CustomerTripsScreen}
        options={{
          tabBarLabel: 'My Trips',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="CustomerSupport"
        component={SupportScreen}
        options={{
          tabBarLabel: '24×7 Helpdesk',
          tabBarIcon: ({ color, size }) => <PhoneCall color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  centerTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16
  },
  centerSubtitle: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8
  },
  hotlineText: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 16
  },
  hotlineSub: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6
  }
});
