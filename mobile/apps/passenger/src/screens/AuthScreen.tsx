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
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { OtpService } from '../../../../shared/services/otpService';
import { usePassenger } from '../context/PassengerContext';
import { isValidIndianMobile, sanitizePhoneNumber } from '../../../../shared/utils/formatters';
import { ShieldCheck, Phone, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react-native';

export const AuthScreen = ({ navigation }: any) => {
  const { setUserPhone, updateSearch } = usePassenger();
  const { isDark } = useTheme();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [smsStatus, setSmsStatus] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSendOtp = async (viaWhatsApp: boolean = false) => {
    const clean = sanitizePhoneNumber(phone);
    if (!isValidIndianMobile(clean)) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    setLoading(true);
    try {
      const res = await OtpService.sendOtp(clean, 'passenger');
      setStep('otp');
      setResendTimer(res.resendAfterSec || 30);
      setDevCode(res.devPreviewCode || null);
      setWaLink(res.whatsappOtpUrl || res.whatsappUrl || null);
      setSmsStatus(res.isTelecomDelivered ? `SMS delivered via ${res.provider?.toUpperCase()}` : 'Verification code ready');
      
      if (viaWhatsApp) {
        const targetUrl = res.whatsappOtpUrl || res.whatsappUrl || OtpService.getWhatsAppFallbackUrl(clean, 'passenger');
        Linking.openURL(targetUrl).catch(() => {});
      }
    } catch (e: any) {
      Alert.alert('Notice', e.message || 'Unable to send SMS. Please try WhatsApp verification.');
      setStep('otp');
      setResendTimer(30);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('OTP Required', 'Please enter the 6-digit verification code sent to your phone.');
      return;
    }

    setLoading(true);
    try {
      const clean = sanitizePhoneNumber(phone);
      const res = await OtpService.verifyOtp(clean, otp.trim(), 'passenger');
      setUserPhone(clean);
      updateSearch({ phone: clean });
      Alert.alert('Verified!', res.message || 'Welcome to OneWayTaxiBihar.', [
        { text: 'Continue', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Invalid verification code. Please check and re-enter.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppHelp = () => {
    const clean = sanitizePhoneNumber(phone);
    const url = waLink || OtpService.getWhatsAppFallbackUrl(clean, 'passenger');
    Linking.openURL(url).catch(() => {
      Alert.alert('Support', 'Contact passenger helpline at +91 80021 41816');
    });
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
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => (step === 'otp' ? setStep('phone') : navigation.goBack())}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={22} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.secureBadge}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={styles.secureText}>256-Bit SSL Encrypted</Text>
            </View>
          </View>

          {/* Hero Header */}
          <View style={styles.header}>
            <BrandLogo size="hero" showSubtitle subtitleText="Intercity Cabs & Airport Transfers" style={{ marginBottom: 12 }} />
            <Text style={styles.title}>
              {step === 'phone' ? 'Welcome to OneWayTaxi' : 'Verify Your Mobile'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'phone'
                ? 'Sign in to access lowest fixed tariffs, live radar trip tracking, and GST invoicing.'
                : `Enter the 6-digit verification code sent to +91 ${sanitizePhoneNumber(phone)}.`}
            </Text>
          </View>

          {/* Welcome Bonus Strip */}
          <View style={styles.bonusStrip}>
            <Sparkles size={16} color="#D97706" />
            <Text style={styles.bonusText}>
              <Text style={{ fontWeight: '800' }}>₹100 Welcome Credit</Text> auto-credited to wallet on new mobile verification!
            </Text>
          </View>

          {/* Auth Card */}
          <View style={styles.authCard}>
            {step === 'phone' ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>YOUR 10-DIGIT MOBILE NUMBER</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.flagBox}>
                    <Text style={styles.flagIcon}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter mobile number"
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
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>ENTER 6-DIGIT VERIFICATION CODE</Text>
                <View style={styles.otpInputRow}>
                  <KeyRound size={20} color="#059669" style={{ marginLeft: 16 }} />
                  <TextInput
                    style={styles.otpInput}
                    placeholder="• • • • • •"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                  />
                </View>
                {devCode && (
                  <TouchableOpacity 
                    onPress={() => setOtp(devCode)}
                    style={{ marginTop: 8, padding: 8, backgroundColor: '#ecfdf5', borderRadius: 8, borderWidth: 1, borderColor: '#a7f3d0', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <CheckCircle2 size={13} color="#059669" />
                    <Text style={{ fontSize: 12, color: '#047857', fontWeight: '700' }}>Code: {devCode} (Tap to auto-fill)</Text>
                  </TouchableOpacity>
                )}
                {smsStatus && (
                  <View style={styles.statusBadge}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <Text style={styles.statusBadgeText}>{smsStatus}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Golden Primary CTA */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={step === 'phone' ? () => handleSendOtp(false) : handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0F172A" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {step === 'phone' ? 'Get SMS Verification Code' : 'Verify & Continue'}
                  </Text>
                  <ArrowRight size={18} color="#0F172A" strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>

            {/* 1-Tap WhatsApp OTP Action (Instant & Free) */}
            {step === 'phone' ? (
              <TouchableOpacity
                style={[styles.quickDemoBtn, { backgroundColor: '#ecfdf5', borderColor: '#86efac' }]}
                onPress={() => handleSendOtp(true)}
                disabled={loading}
                activeOpacity={0.8}
              >
                <MessageSquare size={16} color="#16a34a" />
                <Text style={[styles.quickDemoText, { color: '#15803d', fontWeight: '700' }]}>
                  Verify via WhatsApp (Instant &amp; Free)
                </Text>
              </TouchableOpacity>
            ) : null}

            {step === 'otp' && (
              <View style={styles.otpActions}>
                <View style={styles.resendRow}>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendText}>
                      Resend SMS in <Text style={{ fontWeight: '700', color: '#D97706' }}>{resendTimer}s</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={() => handleSendOtp(false)}>
                      <Text style={styles.resendLink}>Resend OTP via SMS</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity style={styles.waBtn} onPress={handleWhatsAppHelp}>
                  <MessageSquare size={13} color="#25D366" />
                  <Text style={styles.waText}>Didn't receive SMS? Verify via WhatsApp</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Privacy & Statutory DPDP Notice */}
          <View style={styles.disclaimerBox}>
            <ShieldCheck size={16} color="#059669" />
            <Text style={styles.disclaimerText}>
              Statutory Protection: Your data is protected under India DPDP Act 2023. We never share customer records with third-party advertisers. 24×7 Passenger Helpline: +91 80021 41816.
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
    backgroundColor: '#F8FAFC'
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  secureText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320
  },
  bonusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20
  },
  bonusText: {
    fontSize: 12.5,
    color: '#92400E',
    flex: 1,
    lineHeight: 17
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  fieldGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF'
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: '#CBD5E1'
  },
  flagIcon: {
    fontSize: 18
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A'
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  otpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: 54
  },
  otpInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 10,
    textAlign: 'center',
    color: '#0F172A'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#10b981'
  },
  primaryButton: {
    backgroundColor: PassengerColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    marginTop: 6,
    shadowColor: PassengerColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  quickDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#059669',
    borderStyle: 'dashed',
    marginTop: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.04)'
  },
  quickDemoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669'
  },
  otpActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 4
  },
  resendRow: {},
  resendText: {
    fontSize: 12.5,
    color: '#64748B'
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706'
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  waText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#25D366'
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
    flex: 1
  }
});
