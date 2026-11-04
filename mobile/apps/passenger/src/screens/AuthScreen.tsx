import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { MobileApiClient } from '../../../../shared/services/api';
import { usePassenger } from '../context/PassengerContext';
import { isValidIndianMobile, sanitizePhoneNumber } from '../../../../shared/utils/formatters';
import { ShieldCheck, Phone, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react-native';

export const AuthScreen = ({ navigation }: any) => {
  const { setUserPhone, updateSearch } = usePassenger();
  const { isDark } = useTheme();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSendOtp = async () => {
    const clean = sanitizePhoneNumber(phone);
    if (!isValidIndianMobile(clean)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    setLoading(true);
    try {
      await MobileApiClient.sendOtp(clean, 'passenger');
      setStep('otp');
      setResendTimer(30);
    } catch (e: any) {
      Alert.alert('Notice', e.message || 'OTP triggered. Use test code 1234 if SMS delay occurs.');
      setStep('otp');
      setResendTimer(30);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('OTP Required', 'Please enter the 4-digit code sent to your phone (or test code 1234).');
      return;
    }

    setLoading(true);
    try {
      const clean = sanitizePhoneNumber(phone);
      await MobileApiClient.verifyOtp(clean, otp.trim(), 'passenger');
      setUserPhone(clean);
      updateSearch({ phone: clean });
      Alert.alert('Verified!', 'Welcome to OneWayTaxiBihar.', [
        { text: 'Continue', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    try {
      const demoPhone = '9876543210';
      await MobileApiClient.verifyOtp(demoPhone, '1234', 'passenger');
      setUserPhone(demoPhone);
      updateSearch({ phone: demoPhone, passengerName: 'Verified Passenger' });
      Alert.alert('Sign In Successful', 'Logged in as Verified Passenger (+91 9876543210)', [
        { text: 'Continue', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Demo Login Error', e.message || 'Failed demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <ArrowLeft size={22} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {step === 'phone' ? 'Passenger Sign In' : 'Verify Mobile OTP'}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Logo Header */}
          <View style={styles.logoSection}>
            <BrandLogo size="hero" showSubtitle subtitleText="BIHAR INTERCITY CAB NETWORK" />
          </View>

          {/* Clean White Card Form */}
          <View style={styles.authCard}>
            <View style={styles.cardHeaderBadge}>
              <Sparkles size={14} color="#D97706" />
              <Text style={styles.cardHeaderBadgeText}>Instant Passenger Account</Text>
            </View>

            <Text style={styles.title}>
              {step === 'phone' ? 'Enter Mobile Number' : 'Enter 4-Digit OTP'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'phone'
                ? 'Enter your 10-digit Indian phone number to book outstation taxis with zero return fare.'
                : `Verification code dispatched to +91 ${sanitizePhoneNumber(phone)}. Test code: 1234`}
            </Text>

            {step === 'phone' ? (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.prefix}>+91</Text>
                  <View style={styles.divider} />
                  <TextInput
                    style={styles.input}
                    placeholder="98765 43210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                    autoFocus
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>One-Time Passcode</Text>
                <View style={styles.inputBox}>
                  <KeyRound size={20} color="#D97706" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.otpInput}
                    placeholder="• • • •"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                  />
                </View>
              </View>
            )}

            {/* Golden Primary CTA */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {step === 'phone' ? 'Get Verification Code' : 'Verify & Continue'}
                  </Text>
                  <ArrowRight size={18} color="#0F172A" strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

            {/* 1-Tap Quick Demo Login */}
            <TouchableOpacity
              style={styles.quickDemoBtn}
              onPress={handleQuickDemoLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <CheckCircle2 size={16} color="#059669" />
              <Text style={styles.quickDemoText}>
                1-Tap Instant Guest Login (9876543210)
              </Text>
            </TouchableOpacity>

            {step === 'otp' && (
              <View style={styles.resendRow}>
                {resendTimer > 0 ? (
                  <Text style={styles.resendText}>
                    Resend code in <Text style={{ fontWeight: '700', color: '#D97706' }}>{resendTimer}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.resendLink}>Resend OTP via SMS</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Privacy & Statutory DPDP Notice */}
          <View style={styles.disclaimerBox}>
            <ShieldCheck size={16} color="#059669" />
            <Text style={styles.disclaimerText}>
              Statutory Protection: Your data is protected under India DPDP Act 2023. We never share customer records with third-party advertisers.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  cardHeaderBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 14,
  },
  cardHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 22,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
  },
  prefix: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  otpInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 8,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#F59E0B', // Golden Yellow
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  quickDemoBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  quickDemoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  resendRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: '#64748B',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#065F46',
    flex: 1,
    fontWeight: '500',
  },
});
