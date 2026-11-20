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
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { OtpService } from '../../../../shared/services/otpService';
import { useDriver } from '../context/DriverContext';
import { StorageService } from '../../../../shared/services/storage';
import { isValidIndianMobile, sanitizePhoneNumber } from '../../../../shared/utils/formatters';
import { ShieldCheck, ArrowRight, ArrowLeft, MessageSquare, CheckCircle2, PhoneCall } from 'lucide-react-native';

export const DriverAuthScreen = ({ navigation }: any) => {
  const { refreshProfile } = useDriver();
  const { colors, isDark } = useTheme();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSendOtp = async (selectedChannel: 'whatsapp' | 'sms' = 'whatsapp') => {
    const clean = sanitizePhoneNumber(phone);
    if (!isValidIndianMobile(clean)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit registered chauffeur mobile number.');
      return;
    }

    setChannel(selectedChannel);
    setLoading(true);
    try {
      const res = await OtpService.sendOtp(clean, 'driver', selectedChannel);
      setStep('otp');
      setResendTimer(res.resendAfterSec || 30);
      setDevCode(res.devPreviewCode || null);
      setStatusMessage(res.message || (selectedChannel === 'whatsapp' ? 'OTP sent to your WhatsApp' : 'OTP sent via SMS'));
    } catch (e: any) {
      Alert.alert('Notice', e.message || 'Unable to dispatch code. Please retry.');
      setStep('otp');
      setResendTimer(30);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const clean = sanitizePhoneNumber(phone);
    if (!otp.trim()) {
      Alert.alert('OTP Required', 'Please enter the 6-digit verification code sent to your ' + (channel === 'whatsapp' ? 'WhatsApp' : 'mobile SMS') + '.');
      return;
    }

    setLoading(true);
    try {
      await OtpService.verifyOtp(clean, otp.trim(), 'driver');
      await refreshProfile();
      navigation.replace('DriverTabs');
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Invalid OTP code. Please check and re-enter.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsAppApp = () => {
    Linking.openURL('whatsapp://app').catch(() => {
      Linking.openURL('https://wa.me').catch(() => {
        Alert.alert('WhatsApp', 'Please open WhatsApp on your phone to view the incoming OTP code.');
      });
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (step === 'otp' ? setStep('phone') : navigation.goBack())} style={styles.backButton}>
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
            {step === 'phone' ? 'Chauffeur Phone Login' : 'Enter 6-Digit OTP'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 'phone'
              ? 'Enter your registered mobile number to receive a secure verification code.'
              : channel === 'whatsapp'
                ? `We sent a 6-digit OTP directly to your WhatsApp (+91 ${sanitizePhoneNumber(phone)}). Please check WhatsApp and enter code below.`
                : `We sent a 6-digit SMS OTP to +91 ${sanitizePhoneNumber(phone)}. Please enter code below.`}
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
            <>
              <View style={[styles.inputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.otpInput, { color: colors.text }]}
                  placeholder="• • • • • •"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                />
              </View>

              {/* 1-Tap Shortcut to View Incoming Code on WhatsApp */}
              {channel === 'whatsapp' && (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 8, padding: 8, backgroundColor: '#f0fdf4', borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' }}
                  onPress={handleOpenWhatsAppApp}
                  activeOpacity={0.8}
                >
                  <MessageSquare size={14} color="#16a34a" />
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#15803d' }}>
                    Open WhatsApp App to Check Incoming OTP
                  </Text>
                </TouchableOpacity>
              )}

              {devCode && (
                <TouchableOpacity 
                  onPress={() => setOtp(devCode)}
                  style={{ marginTop: 8, padding: 8, backgroundColor: '#ecfdf5', borderRadius: 8, borderWidth: 1, borderColor: '#a7f3d0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <CheckCircle2 size={13} color="#059669" />
                  <Text style={{ fontSize: 12, color: '#047857', fontWeight: '700' }}>Code: {devCode} (Tap to auto-fill)</Text>
                </TouchableOpacity>
              )}
              {statusMessage && (
                <View style={styles.statusBadge}>
                  <CheckCircle2 size={13} color="#10b981" />
                  <Text style={styles.statusText}>{statusMessage}</Text>
                </View>
              )}
            </>
          )}

          {step === 'phone' ? (
            <>
              {/* Primary: Get OTP on WhatsApp */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#16a34a' }]}
                onPress={() => handleSendOtp('whatsapp')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MessageSquare size={18} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>
                      Get OTP on WhatsApp (Instant)
                    </Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              {/* Secondary: Get OTP via SMS */}
              <TouchableOpacity
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => handleSendOtp('sms')}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 13.5 }}>
                  Get OTP via Telecom SMS instead
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    Verify &amp; Enter Console
                  </Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          )}

          {step === 'otp' && (
            <View style={styles.otpActions}>
              <View style={styles.resendRow}>
                {resendTimer > 0 ? (
                  <Text style={[styles.resendText, { color: colors.textMuted }]}>
                    Resend code in {resendTimer}s
                  </Text>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => handleSendOtp('whatsapp')}>
                      <Text style={[styles.resendLink, { color: '#16a34a', fontWeight: '700' }]}>Resend on WhatsApp</Text>
                    </TouchableOpacity>
                    <Text style={{ color: colors.textMuted }}>•</Text>
                    <TouchableOpacity onPress={() => handleSendOtp('sms')}>
                      <Text style={[styles.resendLink, { color: colors.primary }]}>Send via SMS</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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
              Official Chauffeur Gateway of OneWayTaxiBihar Mobility Pvt Ltd. 24×7 Driver Helpline: +91 80021 41816.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  keyboardContainer: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  backButton: {
    padding: 6
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
    maxWidth: 320
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    width: '100%',
    height: 56,
    marginBottom: 16
  },
  prefix: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 10
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600'
  },
  otpInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 10,
    textAlign: 'center'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 16
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#10b981'
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 54,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  demoLoginBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderStyle: 'dashed'
  },
  demoLoginText: {
    fontSize: 14,
    fontWeight: '700'
  },
  otpActions: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    gap: 12
  },
  resendRow: {
    alignItems: 'center'
  },
  resendText: {
    fontSize: 13,
    fontWeight: '500'
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700'
  },
  waFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(37, 211, 102, 0.1)'
  },
  waFallbackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#25D366'
  },
  applyLink: {
    marginTop: 20,
    padding: 8
  },
  applyText: {
    fontSize: 14,
    fontWeight: '700'
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
    paddingHorizontal: 12
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    flex: 1
  }
});
