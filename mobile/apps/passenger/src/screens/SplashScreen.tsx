import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { Shield, Sparkles, Navigation } from 'lucide-react-native';
import { usePassenger } from '../context/PassengerContext';

export const SplashScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { isLoggedIn } = usePassenger();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Auth');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, isLoggedIn]);

  // Executive high-contrast colors
  const bgCanvas = isDark ? '#0B0F19' : '#FFFFFF';
  const cardSurface = isDark ? '#131B2E' : '#F8FAFC';
  const cardBorder = isDark ? '#1E293B' : '#E2E8F0';
  const primaryText = isDark ? '#FFFFFF' : '#0F172A';
  const subText = isDark ? '#94A3B8' : '#64748B';

  return (
    <View style={[styles.container, { backgroundColor: bgCanvas }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Subtle background glow */}
      <View
        style={[
          styles.ambientGlow,
          {
            backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(5, 150, 105, 0.06)',
          }
        ]}
      />

      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Executive Minimalist Brand Header - Guaranteed Contrast on Light & Dark */}
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: cardSurface,
              borderColor: cardBorder,
            }
          ]}
        >
          <BrandLogo
            size="hero"
            variant="website"
            showSubtitle={true}
            subtitleText="BIHAR INTERCITY CAB NETWORK"
            onLightBackground={!isDark}
          />
        </View>

        {/* Minimalist Micro-Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.pillBadge, { backgroundColor: cardSurface, borderColor: cardBorder }]}>
            <Sparkles size={13} color="#F59E0B" />
            <Text style={[styles.pillText, { color: primaryText }]}>Zero Return Fare</Text>
          </View>
          <View style={[styles.pillBadge, { backgroundColor: cardSurface, borderColor: cardBorder }]}>
            <Navigation size={13} color="#10B981" />
            <Text style={[styles.pillText, { color: primaryText }]}>Doorstep GPS</Text>
          </View>
          <View style={[styles.pillBadge, { backgroundColor: cardSurface, borderColor: cardBorder }]}>
            <Shield size={13} color="#38BDF8" />
            <Text style={[styles.pillText, { color: primaryText }]}>All 38 Districts</Text>
          </View>
        </View>

        <Text style={[styles.tagline, { color: subText }]}>
          Guaranteed One-Way Outstation Taxi Service
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#F59E0B" />
        <Text style={[styles.footerText, { color: subText }]}>
          Connecting to Dispatch Network...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  ambientGlow: {
    position: 'absolute',
    top: '25%',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 26,
    gap: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  tagline: {
    marginTop: 20,
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
