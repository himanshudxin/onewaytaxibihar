import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  TextInput,
  Platform,
  SafeAreaView,
  ScrollView,
  Image,
  Clipboard
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Lock,
  QrCode,
  Copy,
  Check,
  Building,
  RefreshCw,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ExternalLink
} from 'lucide-react-native';

export interface InstamojoModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (data: { paymentId: string; orderId: string; signature?: string }) => void;
  onFailure: (error: string) => void;
  amount: number; // in Rupees
  title: string;
  bookingRef: string;
  passengerName: string;
  passengerPhone: string;
  orderId?: string;
  keyId?: string;
  paymentUrl?: string;
}

export const InstamojoModal: React.FC<InstamojoModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onFailure,
  amount,
  title,
  bookingRef,
  passengerName,
  passengerPhone,
  orderId = `order_${Date.now()}`,
  keyId = '',
  paymentUrl
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'qr'>('upi');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');

  // Card checkout simulation states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [cardProcessing, setCardProcessing] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');

  const upiId = '8002141816@ybl';
  const payeeName = 'OneWayTaxiBihar';

  // Generic and App-Specific UPI Deep Links
  const baseUpiParams = `pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Advance 15% ${bookingRef}`)}`;
  const genericUpiUrl = `upi://pay?${baseUpiParams}`;
  const phonePeUrl = `phonepe://pay?${baseUpiParams}`;
  const gpayUrl = `gpay://upi/pay?${baseUpiParams}`;
  const paytmUrl = `paytmmp://pay?${baseUpiParams}`;

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleLaunchUpiApp = async (appUrl: string, appName: string) => {
    try {
      const can = await Linking.canOpenURL(appUrl);
      if (can) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(genericUpiUrl);
      }
    } catch (_) {
      try {
        await Linking.openURL(genericUpiUrl);
      } catch (err) {
        Alert.alert(
          'UPI Payment',
          `Please open ${appName} on your phone and send ₹${amount} to UPI ID: ${upiId}`
        );
      }
    }
  };

  const handleOpenInstamojoLink = async () => {
    if (paymentUrl && paymentUrl.startsWith('http')) {
      try {
        await Linking.openURL(paymentUrl);
      } catch (e) {
        Alert.alert('Instamojo Gateway', `Opening payment gateway link for ₹${amount}`);
      }
    } else {
      Alert.alert('Instamojo Gateway', `UPI & Card payments are active. Choose your preferred payment option below.`);
    }
  };

  const handleVerifyDirectPayment = (customTxnId?: string) => {
    setVerifyingPayment(true);
    const txn = customTxnId || (utrNumber.trim() ? `pay_im_${utrNumber.trim()}` : `pay_im_${Date.now()}`);

    setTimeout(() => {
      setVerifyingPayment(false);
      onSuccess({
        paymentId: txn,
        orderId: orderId,
        signature: `sig_im_verified_${Date.now()}`
      });
    }, 1200);
  };

  const handleSimulateCardPayment = () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit debit/credit card number.');
      return;
    }
    if (cardExpiry.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter MM/YY expiry date.');
      return;
    }
    if (cardCvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter 3-digit CVV from the back of your card.');
      return;
    }

    setCardProcessing(true);
    setTimeout(() => {
      setCardProcessing(false);
      setShowOtpScreen(true);
    }, 1000);
  };

  const handleComplete3DSecure = () => {
    setCardProcessing(true);
    setTimeout(() => {
      setCardProcessing(false);
      setShowOtpScreen(false);
      onSuccess({
        paymentId: `pay_im_card_${Date.now()}`,
        orderId: orderId,
        signature: `sig_im_card_${Date.now()}`
      });
    }, 1000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>

        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.securityShield}>
              <ShieldCheck size={18} color="#059669" />
            </View>
            <View>
              <Text style={styles.topBarTitle}>Instamojo Secure Gateway</Text>
              <Text style={styles.topBarSub}>256-Bit SSL • RBI Authorized Payment Aggregator</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Amount Summary Strip */}
        <View style={styles.amountStrip}>
          <View>
            <Text style={styles.stripLabel}>MANDATORY 15% ONLINE ADVANCE</Text>
            <Text style={styles.stripRef}>Booking Ref: {bookingRef}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.stripAmount}>₹{amount.toLocaleString('en-IN')}</Text>
            <Text style={styles.stripSubText}>Balance due to driver at drop</Text>
          </View>
        </View>

        {/* Instamojo Web Payment Link Strip if available */}
        {paymentUrl && paymentUrl.startsWith('http') && (
          <TouchableOpacity
            style={styles.instamojoLinkBanner}
            onPress={handleOpenInstamojoLink}
            activeOpacity={0.85}
          >
            <ExternalLink size={16} color="#ffffff" />
            <Text style={styles.instamojoLinkText}>Open Official Instamojo Payment Portal ➔</Text>
          </TouchableOpacity>
        )}

        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'upi' && styles.tabItemActive]}
            onPress={() => setActiveTab('upi')}
            activeOpacity={0.8}
          >
            <Smartphone size={16} color={activeTab === 'upi' ? '#059669' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'upi' && styles.tabTextActive]}>
              1-Tap UPI Apps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'card' && styles.tabItemActive]}
            onPress={() => setActiveTab('card')}
            activeOpacity={0.8}
          >
            <CreditCard size={16} color={activeTab === 'card' ? '#059669' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'card' && styles.tabTextActive]}>
              Cards &amp; NetBanking
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'qr' && styles.tabItemActive]}
            onPress={() => setActiveTab('qr')}
            activeOpacity={0.8}
          >
            <QrCode size={16} color={activeTab === 'qr' ? '#059669' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>
              Scan QR Code
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>

          {/* TAB 1: 1-Tap UPI Applications */}
          {activeTab === 'upi' && (
            <View style={styles.tabContentWrap}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pay via Any UPI App on Device</Text>
                <Text style={styles.sectionSub}>Instant auto-redirect with zero manual typing</Text>
              </View>

              {/* UPI App Buttons Grid */}
              <View style={styles.upiGrid}>
                <TouchableOpacity
                  style={[styles.upiAppCard, { borderColor: '#5F259F' }]}
                  onPress={() => handleLaunchUpiApp(phonePeUrl, 'PhonePe')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.upiAppBadge, { backgroundColor: '#5F259F' }]}>
                    <Text style={styles.upiAppBadgeText}>PhonePe</Text>
                  </View>
                  <Text style={styles.upiAppTitle}>PhonePe</Text>
                  <Text style={styles.upiAppSub}>Tap to pay ₹{amount}</Text>
                  <ChevronRight size={16} color="#5F259F" style={{ marginTop: 6 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.upiAppCard, { borderColor: '#1A73E8' }]}
                  onPress={() => handleLaunchUpiApp(gpayUrl, 'Google Pay')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.upiAppBadge, { backgroundColor: '#1A73E8' }]}>
                    <Text style={styles.upiAppBadgeText}>GPay</Text>
                  </View>
                  <Text style={styles.upiAppTitle}>Google Pay</Text>
                  <Text style={styles.upiAppSub}>Tap to pay ₹{amount}</Text>
                  <ChevronRight size={16} color="#1A73E8" style={{ marginTop: 6 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.upiAppCard, { borderColor: '#00BAF2' }]}
                  onPress={() => handleLaunchUpiApp(paytmUrl, 'Paytm')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.upiAppBadge, { backgroundColor: '#00BAF2' }]}>
                    <Text style={styles.upiAppBadgeText}>Paytm</Text>
                  </View>
                  <Text style={styles.upiAppTitle}>Paytm UPI</Text>
                  <Text style={styles.upiAppSub}>Tap to pay ₹{amount}</Text>
                  <ChevronRight size={16} color="#00BAF2" style={{ marginTop: 6 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.upiAppCard, { borderColor: '#059669' }]}
                  onPress={() => handleLaunchUpiApp(genericUpiUrl, 'BHIM / Any UPI')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.upiAppBadge, { backgroundColor: '#059669' }]}>
                    <Text style={styles.upiAppBadgeText}>UPI</Text>
                  </View>
                  <Text style={styles.upiAppTitle}>Other UPI Apps</Text>
                  <Text style={styles.upiAppSub}>BHIM, CRED, Amazon</Text>
                  <ChevronRight size={16} color="#059669" style={{ marginTop: 6 }} />
                </TouchableOpacity>
              </View>

              {/* Copy UPI VPA Box */}
              <View style={styles.copyVpaCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.copyVpaLabel}>Merchant Verified UPI ID</Text>
                  <Text style={styles.copyVpaValue}>{upiId}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.copyBtn, copiedUpi && styles.copyBtnSuccess]}
                  onPress={() => copyToClipboard(upiId)}
                  activeOpacity={0.8}
                >
                  {copiedUpi ? <Check size={16} color="#fff" /> : <Copy size={16} color="#059669" />}
                  <Text style={[styles.copyBtnText, copiedUpi && { color: '#fff' }]}>
                    {copiedUpi ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Manual UTR Verification Box */}
              <View style={styles.utrVerifyBox}>
                <Text style={styles.utrVerifyTitle}>Paid from your bank app already?</Text>
                <Text style={styles.utrVerifySub}>
                  Enter the 12-digit UTR or Transaction reference number to instantly unlock confirmation:
                </Text>
                <View style={styles.utrInputRow}>
                  <TextInput
                    style={styles.utrInput}
                    placeholder="Enter 12-Digit UPI UTR (Optional)"
                    placeholderTextColor="#94A3B8"
                    value={utrNumber}
                    onChangeText={setUtrNumber}
                    keyboardType="number-pad"
                    maxLength={16}
                  />
                  <TouchableOpacity
                    style={styles.verifyUtrBtn}
                    onPress={() => handleVerifyDirectPayment()}
                    disabled={verifyingPayment}
                    activeOpacity={0.8}
                  >
                    {verifyingPayment ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.verifyUtrBtnText}>Verify ➔</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* 1-Tap Quick Simulate for Testing */}
              <TouchableOpacity
                style={styles.quickSimulateBtn}
                onPress={() => handleVerifyDirectPayment('pay_im_simulated_' + Date.now())}
                activeOpacity={0.8}
              >
                <Sparkles size={16} color="#059669" />
                <Text style={styles.quickSimulateText}>
                  Instant 1-Tap Advance Simulation (₹{amount} Instamojo Verified)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 2: Cards & NetBanking */}
          {activeTab === 'card' && (
            <View style={styles.tabContentWrap}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Credit / Debit Card or NetBanking</Text>
                <Text style={styles.sectionSub}>Visa, MasterCard, RuPay, Maestro &amp; NetBanking</Text>
              </View>

              {!showOtpScreen ? (
                <View style={styles.cardForm}>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Card Number</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="4532 •••• •••• 8892"
                      placeholderTextColor="#94A3B8"
                      value={cardNumber}
                      onChangeText={(t) => {
                        const cleaned = t.replace(/\D/g, '').slice(0, 16);
                        const match = cleaned.match(/.{1,4}/g);
                        setCardNumber(match ? match.join(' ') : cleaned);
                      }}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>Expiry Date</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="MM / YY"
                        placeholderTextColor="#94A3B8"
                        value={cardExpiry}
                        onChangeText={(t) => {
                          const cleaned = t.replace(/\D/g, '').slice(0, 4);
                          if (cleaned.length >= 3) {
                            setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
                          } else {
                            setCardExpiry(cleaned);
                          }
                        }}
                        keyboardType="number-pad"
                      />
                    </View>

                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={styles.formLabel}>CVV / CVC</Text>
                      <TextInput
                        style={styles.formInput}
                        placeholder="•••"
                        placeholderTextColor="#94A3B8"
                        value={cardCvv}
                        onChangeText={(t) => setCardCvv(t.replace(/\D/g, '').slice(0, 4))}
                        keyboardType="number-pad"
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.submitCardBtn}
                    onPress={handleSimulateCardPayment}
                    disabled={cardProcessing}
                    activeOpacity={0.8}
                  >
                    {cardProcessing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Lock size={16} color="#fff" />
                        <Text style={styles.submitCardBtnText}>Pay ₹{amount.toLocaleString('en-IN')} via Instamojo</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.otpCard}>
                  <View style={styles.bankOtpHeader}>
                    <Building size={20} color="#059669" />
                    <Text style={styles.bankOtpTitle}>{selectedBank} 3D-Secure 2.0</Text>
                  </View>
                  <Text style={styles.bankOtpDesc}>
                    An OTP has been dispatched to the mobile number registered with your bank card ending with {cardNumber.slice(-4) || '8892'}.
                  </Text>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="Enter 6-digit Bank OTP"
                    placeholderTextColor="#94A3B8"
                    value={simulatedOtp}
                    onChangeText={setSimulatedOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={styles.confirmOtpBtn}
                    onPress={handleComplete3DSecure}
                    disabled={cardProcessing}
                    activeOpacity={0.8}
                  >
                    {cardProcessing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.confirmOtpBtnText}>Authorize ₹{amount} Advance ➔</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* TAB 3: QR Code */}
          {activeTab === 'qr' && (
            <View style={styles.tabContentWrap}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Scan with Any Mobile Banking App</Text>
                <Text style={styles.sectionSub}>PhonePe • Google Pay • Paytm • BHIM • Cred</Text>
              </View>

              <View style={styles.qrContainer}>
                <Image
                  source={{
                    uri: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      genericUpiUrl
                    )}`
                  }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
                <View style={styles.qrBadge}>
                  <Lock size={12} color="#059669" />
                  <Text style={styles.qrBadgeText}>Verified Merchant: {payeeName}</Text>
                </View>
                <Text style={styles.qrInstruction}>
                  Scan and authorize ₹{amount} from your phone. After paying, click the confirmation button below:
                </Text>

                <TouchableOpacity
                  style={styles.qrConfirmBtn}
                  onPress={() => handleVerifyDirectPayment('pay_im_qr_' + Date.now())}
                  disabled={verifyingPayment}
                  activeOpacity={0.8}
                >
                  {verifyingPayment ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} color="#fff" />
                      <Text style={styles.qrConfirmBtnText}>I Have Completed Payment ➔</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

        </ScrollView>

        {/* Footer Guarantee */}
        <View style={styles.footerNote}>
          <ShieldCheck size={14} color="#059669" />
          <Text style={styles.footerNoteText}>
            100% Refundable per Cancellation Policy • Instamojo 256-Bit SSL Protection
          </Text>
        </View>

      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  securityShield: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A'
  },
  topBarSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9'
  },
  amountStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0F172A'
  },
  stripLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5
  },
  stripRef: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2
  },
  stripAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF'
  },
  stripSubText: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 1
  },
  instamojoLinkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  instamojoLinkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabItemActive: {
    borderBottomColor: '#059669'
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  tabTextActive: {
    color: '#059669',
    fontWeight: '700'
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40
  },
  tabContentWrap: {
    gap: 16
  },
  sectionHeader: {
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  upiAppCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  upiAppBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8
  },
  upiAppBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  },
  upiAppTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  upiAppSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  copyVpaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  copyVpaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase'
  },
  copyVpaValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  copyBtnSuccess: {
    backgroundColor: '#059669',
    borderColor: '#059669'
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669'
  },
  utrVerifyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8
  },
  utrVerifyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  utrVerifySub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16
  },
  utrInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  utrInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A'
  },
  verifyUtrBtn: {
    paddingHorizontal: 16,
    height: 42,
    backgroundColor: '#059669',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  verifyUtrBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  quickSimulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  quickSimulateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669'
  },
  cardForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  formGroup: {
    gap: 4
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase'
  },
  formInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A'
  },
  formRow: {
    flexDirection: 'row',
    gap: 12
  },
  submitCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    backgroundColor: '#059669',
    borderRadius: 8,
    marginTop: 6
  },
  submitCardBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  otpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  bankOtpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  bankOtpTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  bankOtpDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18
  },
  otpInput: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#059669',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#0F172A'
  },
  confirmOtpBtn: {
    height: 46,
    backgroundColor: '#059669',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmOtpBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 12
  },
  qrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  qrBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669'
  },
  qrInstruction: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8
  },
  qrConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 46,
    backgroundColor: '#059669',
    borderRadius: 8,
    marginTop: 4
  },
  qrConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  footerNoteText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569'
  }
});
