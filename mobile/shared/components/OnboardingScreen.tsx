import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Sparkles, MapPin, ShieldCheck, ArrowRight, Check } from 'lucide-react-native';
import { StorageService } from '../services/storage';

export interface OnboardingScreenProps {
  visible?: boolean;
  onClose?: () => void;
  navigation?: any;
}

export const ONBOARDING_SLIDES = [
  {
    title: 'Zero Return Fare',
    desc: 'Pay exclusively for the distance you travel across Bihar outstations. No round-trip penalty or return toll.',
    badge: '100% Guaranteed One-Way'
  },
  {
    title: 'Doorstep Pickup',
    desc: 'Guaranteed on-time pickup from your exact doorstep in Patna, Gaya, Muzaffarpur, Bhagalpur, or any Bihar town.',
    badge: 'Doorstep Convenience'
  },
  {
    title: 'Verified Safety',
    desc: 'Police-verified commercial chauffeurs, clean AC vehicles, and real-time live GPS trip sharing with your family.',
    badge: 'Safety First Fleet'
  }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  visible = true,
  onClose,
  navigation
}) => {
  const [index, setIndex] = useState(0);

  const handleComplete = async () => {
    try {
      await StorageService.setItem('otb_has_seen_onboarding', 'true');
    } catch (e) {}
    if (onClose) {
      onClose();
    } else if (navigation) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('MainTabs');
      }
    }
  };

  const currentSlide = ONBOARDING_SLIDES[index];

  const content = (
    <View style={styles.card}>
      <View style={styles.badgeRow}>
        <Text style={styles.badgeText}>{currentSlide.badge}</Text>
      </View>
      <Text style={styles.title}>{currentSlide.title}</Text>
      <Text style={styles.description}>{currentSlide.desc}</Text>

      <View style={styles.dotsRow}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={handleComplete} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {index < ONBOARDING_SLIDES.length - 1 ? (
          <TouchableOpacity onPress={() => setIndex(index + 1)} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleComplete} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (onClose) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>{content}</View>
      </Modal>
    );
  }

  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar style="dark" />
      <View style={styles.screenContent}>{content}</View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  screenContent: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center'
  },
  badgeRow: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16
  },
  badgeText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12
  },
  description: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: 28
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4
  },
  dotActive: {
    width: 24,
    backgroundColor: '#0F172A'
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  skipText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600'
  },
  primaryButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  }
});
