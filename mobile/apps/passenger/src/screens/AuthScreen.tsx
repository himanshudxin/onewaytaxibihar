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
import { OtpService } from '../../../../shared/services/otpService';
import { usePassenger } from '../context/PassengerContext';
import { isValidIndianMobile, sanitizePhoneNumber } from '../../../../shared/utils/formatters';
import {
  ShieldCheck,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Smartphone,
  Car,
  Headphones,
  Check
} from 'lucide-react-native';

export const AuthScreen = ({ navigation }: any) => {
  const { updateSearch, login } = usePassenger();

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
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
      return;
    }

    setChannel(selectedChannel);
    setLoading(true);
    try {
      const res = await OtpService.sendOtp(clean, 'passenger', selectedChannel);
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
    if (!otp.trim()) {
      Alert.alert('OTP Required', `Please enter the 6-digit verification code received on your ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}.`);
      return;
    }

    setLoading(true);
    try {
      const clean = sanitizePhoneNumber(phone);
      const res = await OtpService.verifyOtp(clean, otp.trim(), 'passenger');
      await login(clean, res.token);
      updateSearch({ phone: clean });

      // Seamlessly navigate to map as authenticated user
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }]
      });
    } catch (e: any) {
      Alert.alert('Verification Failed', e.message || 'Invalid verification code. Please check your WhatsApp/SMS and re-enter.');
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Security Badge */}
          <View style={styles.topBar}>
            {step === 'otp' ? (
              <TouchableOpacity
                onPress={() => setStep('phone')}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <ArrowLeft size={20} color="#0F172A" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}
            <View style={styles.secureBadge}>
              <ShieldCheck size={13} color="#059669" />
              <Text style={styles.secureText}>256-Bit SSL Encrypted</Text>
            </View>
          </View>

          {/* Executive Brand Hero Header */}
          <View style={styles.heroSection}>
            <View style={styles.brandEmblemWrap}>
              <View style={styles.emblemIconCircle}>
                <Car size={26} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.brandTitlePrimary}>OneWay</Text>
                  <Text style={styles.brandTitleAccent}>Taxi</Text>
                  <Text style={styles.brandTitleState}>Bihar</Text>
                </View>
                <Text style={styles.brandSubtitle}>OFFICIAL INTERCITY MOBILITY</Text>
              </View>
            </View>

            <Text style={styles.headline}>
              {step === 'phone' ? 'Sign In or Register' : 'Enter 6-Digit Code'}
            </Text>
            <Text style={styles.subheadline}>
              {step === 'phone'
                ? 'Bihar’s trusted outstation network. Guaranteed fixed tariffs, commercial fleet & zero surge pricing.'
                : channel === 'whatsapp'
                  ? `6-digit verification code sent to your WhatsApp at +91 ${sanitizePhoneNumber(phone)}.`
                  : `6-digit SMS verification code sent to +91 ${sanitizePhoneNumber(phone)}.`}
            </Text>

            {/* Trust Metric Chips */}
            {step === 'phone' && (
              <View style={styles.trustChipsRow}>
                <View style={styles.trustChip}>
                  <Check size={11} color="#059669" strokeWidth={3} />
                  <Text style={styles.trustChipText}>Guaranteed Fixed Rates</Text>
                </View>
                <View style={styles.trustChip}>
                  <Check size={11} color="#059669" strokeWidth={3} />
                  <Text style={styles.trustChipText}>Zero Cancellation Fee</Text>
                </View>
                <View style={styles.trustChip}>
                  <Check size={11} color="#059669" strokeWidth={3} />
                  <Text style={styles.trustChipText}>24x7 Patna Helpdesk</Text>
                </View>
              </View>
            )}
          </View>

          {/* Main Auth Form Card */}
          <View style={styles.authCard}>
            {step === 'phone' ? (
              <View style={styles.fieldSection}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputHeaderLabel}>ENTER MOBILE NUMBER</Text>
                  <Text style={styles.inputHeaderSub}>Valid 10-Digit Phone</Text>
                </View>

                <View style={styles.phoneInputRow}>
                  <View style={styles.flagBox}>
                    <Text style={styles.flagIcon}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                    autoFocus
                  />
                </View>

                <Text style={styles.otpNoticeHint}>
                  We’ll send a secure one-time passcode to verify your account.
                </Text>

                {/* Primary CTA: WhatsApp OTP (Fastest) */}
                <TouchableOpacity
                  style={styles.btnPrimaryWhatsApp}
                  onPress={() => handleSendOtp('whatsapp')}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading && channel === 'whatsapp' ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <MessageSquare size={18} color="#FFFFFF" />
                      <Text style={styles.btnPrimaryText}>
                        Get OTP on WhatsApp (Instant)
                      </Text>
                      <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
                    </>
                  )}
                </TouchableOpacity>

                {/* Secondary CTA: SMS OTP */}
                <TouchableOpacity
                  style={styles.btnSecondarySms}
                  onPress={() => handleSendOtp('sms')}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading && channel === 'sms' ? (
                    <ActivityIndicator color="#0F172A" />
                  ) : (
                    <>
                      <Smartphone size={16} color="#475569" />
                      <Text style={styles.btnSecondaryText}>
                        Receive OTP via Telecom SMS instead
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Divider Line */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Guest Browsing Link */}
                <TouchableOpacity
                  onPress={() => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainTabs' }]
                    });
                  }}
                  style={styles.btnGuestLink}
                  activeOpacity={0.7}
                >
                  <Text style={styles.btnGuestText}>
                    Skip &amp; Browse Outstation Routes as Guest ➔
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.fieldSection}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputHeaderLabel}>ENTER 6-DIGIT CODE</Text>
                  <TouchableOpacity onPress={() => setStep('phone')} activeOpacity={0.7}>
                    <Text style={styles.editPhoneLink}>Change Number</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.otpInputRow}>
                  <KeyRound size={20} color="#059669" style={{ marginLeft: 14 }} />
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

                {/* WhatsApp App Quick Link */}
                {channel === 'whatsapp' && (
                  <TouchableOpacity
                    style={styles.openWhatsAppBanner}
                    onPress={handleOpenWhatsAppApp}
                    activeOpacity={0.8}
                  >
                    <MessageSquare size={15} color="#16a34a" />
                    <Text style={styles.openWhatsAppText}>
                      Open WhatsApp App to Check Incoming Code
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Dev Code Auto-Fill Chip */}
                {devCode && (
                  <TouchableOpacity
                    onPress={() => setOtp(devCode)}
                    style={styles.devCodeChip}
                    activeOpacity={0.8}
                  >
                    <CheckCircle2 size={13} color="#059669" />
                    <Text style={styles.devCodeText}>
                      Test Code: {devCode} (Tap to auto-fill)
                    </Text>
                  </TouchableOpacity>
                )}

                {statusMessage && (
                  <View style={styles.statusBadge}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <Text style={styles.statusBadgeText}>{statusMessage}</Text>
                  </View>
                )}

                {/* Verify Submit Button */}
                <TouchableOpacity
                  style={styles.btnPrimaryVerify}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.btnPrimaryVerifyText}>
                        Verify Code &amp; Continue
                      </Text>
                      <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
                    </>
                  )}
                </TouchableOpacity>

                {/* Resend Actions */}
                <View style={styles.resendContainer}>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendWaitText}>
                      Resend code in <Text style={{ fontWeight: '800', color: '#0F172A' }}>{resendTimer}s</Text>
                    </Text>
                  ) : (
                    <View style={styles.resendButtonsRow}>
                      <TouchableOpacity onPress={() => handleSendOtp('whatsapp')} activeOpacity={0.7}>
                        <Text style={styles.resendActionWhatsApp}>Resend on WhatsApp</Text>
                      </TouchableOpacity>
                      <Text style={styles.resendDot}>•</Text>
                      <TouchableOpacity onPress={() => handleSendOtp('sms')} activeOpacity={0.7}>
                        <Text style={styles.resendActionSms}>Send via SMS</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Welcome Bonus Callout */}
          <View style={styles.bonusCallout}>
            <View style={styles.bonusIconWrap}>
              <Sparkles size={16} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bonusTitle}>₹100 First Ride Welcome Reward</Text>
              <Text style={styles.bonusDesc}>
                Applied automatically to your wallet on mobile verification.
              </Text>
            </View>
          </View>

          {/* Statutory Protection Notice */}
          <View style={styles.statutoryFooter}>
            <ShieldCheck size={15} color="#059669" />
            <Text style={styles.statutoryText}>
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
    paddingBottom: 36
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  secureText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 18
  },
  brandEmblemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  emblemIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3
  },
  brandTitlePrimary: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3
  },
  brandTitleAccent: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: -0.3
  },
  brandTitleState: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: -0.3
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
    marginTop: 1
  },
  headline: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3
  },
  subheadline: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 320,
    marginBottom: 12
  },
  trustChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  trustChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16
  },
  fieldSection: {
    gap: 12
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  inputHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6
  },
  inputHeaderSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8'
  },
  editPhoneLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669'
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1.5,
    borderRightColor: '#E2E8F0'
  },
  flagIcon: {
    fontSize: 18
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    letterSpacing: 1
  },
  otpNoticeHint: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16
  },
  btnPrimaryWhatsApp: {
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 12,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4
  },
  btnPrimaryText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  btnSecondarySms: {
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#CBD5E1'
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0'
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8'
  },
  btnGuestLink: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9'
  },
  btnGuestText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#059669'
  },
  otpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#059669',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    height: 52
  },
  otpInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 10,
    textAlign: 'center',
    color: '#0F172A'
  },
  openWhatsAppBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  openWhatsAppText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803D'
  },
  devCodeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  devCodeText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#10B981'
  },
  btnPrimaryVerify: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4
  },
  btnPrimaryVerifyText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 6
  },
  resendWaitText: {
    fontSize: 12,
    color: '#64748B'
  },
  resendButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  resendActionWhatsApp: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#16A34A'
  },
  resendDot: {
    color: '#94A3B8'
  },
  resendActionSms: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155'
  },
  bonusCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16
  },
  bonusIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bonusTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E'
  },
  bonusDesc: {
    fontSize: 11.5,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16
  },
  statutoryFooter: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  statutoryText: {
    flex: 1,
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 15
  }
});
