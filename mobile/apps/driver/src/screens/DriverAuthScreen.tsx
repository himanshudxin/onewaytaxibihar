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
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { MobileApiClient } from '../../../../shared/services/api';
import { useDriver } from '../context/DriverContext';
import { StorageService } from '../../../../shared/services/storage';
import { isValidIndianMobile, sanitizePhoneNumber } from '../../../../shared/utils/formatters';
import { ShieldCheck, Phone, KeyRound, ArrowRight, ArrowLeft, Navigation } from 'lucide-react-native';

export const DriverAuthScreen = ({ navigation }: any) => {
  const { refreshProfile } = useDriver();
  const { colors, isDark } = useTheme();

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
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit registered chauffeur mobile number.');
      return;
    }

    setLoading(true);
    try {
      await MobileApiClient.sendOtp(clean, 'driver');
      setStep('otp');
      setResendTimer(30);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    try {
      const demoPhone = '6206494214';
      await StorageService.removeItem('otb_driver_explicit_logout');
      await MobileApiClient.driverLogin(demoPhone, '4214');
      await StorageService.setItem('otb_driver_phone', demoPhone);
      await refreshProfile();
      navigation.replace('DriverTabs');
    } catch (e: any) {
      await StorageService.removeItem('otb_driver_explicit_logout');
      await StorageService.setItem('otb_driver_phone', '6206494214');
      await refreshProfile();
      navigation.replace('DriverTabs');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('OTP Required', 'Please enter your 4-digit chauffeur PIN or last 4 digits of phone.');
      return;
    }

    setLoading(true);
    try {
      const clean = sanitizePhoneNumber(phone);
      await StorageService.removeItem('otb_driver_explicit_logout');
      await MobileApiClient.driverLogin(clean, otp.trim());
      await StorageService.setItem('otb_driver_phone', clean);
      await refreshProfile();
      navigation.replace('DriverTabs');
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {step === 'phone' ? 'Driver Partner Login' : 'Verify Chauffeur OTP'}
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.content}>
          <BrandLogo size="hero" showSubtitle subtitleText="Driver & Fleet Partner Network" style={{ marginBottom: 20 }} />

          <Text style={[styles.title, { color: colors.text }]}>
            {step === 'phone' ? 'Chauffeur Phone Login' : 'Enter 4-Digit Code'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 'phone'
              ? 'Enter your registered mobile number to access the dispatch console and daily earnings.'
              : `Verification SMS sent to +91 ${sanitizePhoneNumber(phone)}. Test code: 1234`}
          </Text>

          {step === 'phone' ? (
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.prefix, { color: colors.textSecondary }]}>+91</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="10-digit Mobile Number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                autoFocus
              />
            </View>
          ) : (
            <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.otpInput, { color: colors.text }]}
                placeholder="• • • •"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={step === 'phone' ? handleSendOtp : handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  {step === 'phone' ? 'Send Driver Login Code' : 'Verify & Enter Console'}
                </Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {step === 'phone' && (
            <TouchableOpacity
              style={[styles.demoLoginBtn, { borderColor: colors.primary }]}
              onPress={handleQuickDemoLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.demoLoginText, { color: colors.primary }]}>
                Quick Demo Chauffeur Login (9876508888)
              </Text>
            </TouchableOpacity>
          )}

          {step === 'otp' && (
            <View style={styles.resendRow}>
              {resendTimer > 0 ? (
                <Text style={[styles.resendText, { color: colors.textMuted }]}>
                  Resend code in {resendTimer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={[styles.resendLink, { color: colors.primary }]}>Resend OTP via SMS</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {step === 'phone' && (
            <TouchableOpacity
              style={styles.applyLink}
              onPress={() => navigation.navigate('DriverApplication')}
            >
              <Text style={[styles.applyText, { color: colors.gold }]}>
                New Driver Partner? Apply with Documents →
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.disclaimerBox}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
              Official Chauffeur Gateway of OneWayTaxiBihar Mobility Pvt Ltd. Helpline: 6206494214.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingTop: 30,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  inputBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  otpInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoLoginBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
  },
  demoLoginText: {
    fontSize: 14,
    fontWeight: '700',
  },
  resendRow: {
    marginTop: 18,
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  applyLink: {
    marginTop: 20,
    padding: 10,
  },
  applyText: {
    fontSize: 14,
    fontWeight: '700',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
