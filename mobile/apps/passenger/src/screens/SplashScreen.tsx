import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors } from '../../../../shared/theme/colors';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react-native';

export const SplashScreen = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Smooth entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('MainTabs');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.glowCircleTop} />
      <View style={styles.glowCircleBottom} />

      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Preserved Authentic Brand Logo with Green Badge */}
        <View style={styles.logoCard}>
          <BrandLogo size="hero" showSubtitle subtitleText="BIHAR INTERCITY CAB NETWORK" />
        </View>

        {/* Professional App Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.pillBadge}>
            <Sparkles size={14} color="#0F172A" />
            <Text style={styles.pillText}>Zero Return Fare</Text>
          </View>
          <View style={styles.pillBadge}>
            <CheckCircle2 size={14} color="#059669" />
            <Text style={styles.pillText}>Doorstep Pickup</Text>
          </View>
          <View style={styles.pillBadge}>
            <ShieldCheck size={14} color="#0F172A" />
            <Text style={styles.pillText}>Commercial GPS</Text>
          </View>
        </View>

        <Text style={styles.tagline}>
          Premium Intercity Cab Service Across All 38 Districts of Bihar
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#0F172A" />
        <Text style={styles.footerText}>Connecting to Bihar Outstation Dispatch Network...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F59E0B', // Premium Golden Yellow
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  glowCircleTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  glowCircleBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(234, 179, 8, 0.35)',
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  tagline: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  footer: {
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#451A03',
  },
});
