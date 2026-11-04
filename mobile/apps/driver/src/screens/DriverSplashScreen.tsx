import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { ShieldCheck, Navigation } from 'lucide-react-native';
import { useDriver } from '../context/DriverContext';

export const DriverSplashScreen = ({ navigation }: any) => {
  const { isLoggedIn } = useDriver();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        navigation.replace('DriverTabs');
      } else {
        navigation.replace('DriverAuth');
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigation, isLoggedIn]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.brandContainer}>
        <BrandLogo size="hero" showSubtitle subtitleText="Chauffeur & Fleet Partner Console" />

        <View style={styles.badgeRow}>
          <View style={[styles.pillBadge, { backgroundColor: 'rgba(5, 150, 105, 0.15)', borderColor: colors.primary }]}>
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={[styles.pillText, { color: colors.primary }]}>Instant Daily Payouts</Text>
          </View>
          <View style={[styles.pillBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: colors.gold }]}>
            <Text style={[styles.pillText, { color: colors.gold }]}>Fixed Outstation Fares</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Connecting to Central Fleet Dispatch Network...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontSize: 12,
  },
});
