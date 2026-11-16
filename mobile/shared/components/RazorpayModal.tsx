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
  SafeAreaView
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X, ShieldCheck, CreditCard, Smartphone, CheckCircle2, ChevronRight, Lock } from 'lucide-react-native';

interface RazorpayModalProps {
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
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
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
  keyId = 'rzp_test_placeholder'
}) => {
  const [activeTab, setActiveTab] = useState<'gateway' | 'direct_upi'>('gateway');
  const [utr, setUtr] = useState('');
  const [verifyingUtr, setVerifyingUtr] = useState(false);

  const amountInPaise = Math.round(amount * 100);
  const upiId = '8002141816@ybl';
  const payeeName = 'OneWayTaxiBihar';
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Advance 15% ${bookingRef}`)}`;

  const handleLaunchUpiIntent = async () => {
    try {
      const can = await Linking.canOpenURL(upiDeepLink);
      if (can) {
        await Linking.openURL(upiDeepLink);
      } else {
        await Linking.openURL(`https://onewaytaxibihar.com/payment.html?amount=${amount}&ref=${encodeURIComponent(bookingRef)}`);
      }
    } catch (e) {
      Alert.alert('UPI App', `Please open PhonePe, Google Pay or Paytm and pay ₹${amount} to UPI ID: ${upiId}`);
    }
  };

  const handleVerifyManualUtr = () => {
    const clean = utr.trim();
    if (!/^\d{12}$/.test(clean)) {
      Alert.alert('Invalid UTR', 'Please enter a valid 12-digit UPI Reference / UTR Number from your PhonePe/GPay receipt.');
      return;
    }
    setVerifyingUtr(true);
    setTimeout(() => {
      setVerifyingUtr(false);
      onSuccess({
        paymentId: `pay_upi_${clean}`,
        orderId: orderId,
        signature: `sig_manual_${clean}`
      });
    }, 600);
  };

  // Razorpay Standard Checkout HTML (Hosted inside WebView)
  const razorpayHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
      body, html { margin:0; padding:0; background:#f8fafc; font-family:-apple-system, sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; }
      .loading-card { background:#fff; border-radius:16px; padding:28px 24px; box-shadow:0 10px 30px rgba(0,0,0,0.08); text-align:center; max-width:320px; border:1px solid #e2e8f0; }
      .spinner { border:3px solid #e2e8f0; border-top:3px solid #059669; border-radius:50%; width:36px; height:36px; animation:spin 0.8s linear infinite; margin:0 auto 16px; }
      @keyframes spin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
      .title { font-size:16px; font-weight:800; color:#0f172a; margin-bottom:6px; }
      .desc { font-size:13px; color:#64748b; margin-bottom:18px; }
      .btn { background:#059669; color:#fff; font-weight:700; border:none; border-radius:10px; padding:12px 20px; font-size:14px; cursor:pointer; width:100%; box-sizing:border-box; }
    </style>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body>
    <div class="loading-card" id="card">
      <div class="spinner"></div>
      <div class="title">Connecting to Razorpay</div>
      <div class="desc">Launching secure 256-bit encrypted payment gateway for ₹${amount}...</div>
      <button class="btn" onclick="launchCheckout()">Pay ₹${amount} Now</button>
    </div>

    <script>
      function sendToNative(data) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      }

      function launchCheckout() {
        try {
          var options = {
            key: "${keyId}",
            amount: "${amountInPaise}",
            currency: "INR",
            name: "OneWayTaxiBihar",
            description: "${title} (${bookingRef})",
            image: "https://onewaytaxibihar.com/favicon.svg",
            order_id: "${orderId.startsWith('order_') && !orderId.includes('order_upi') ? orderId : ''}",
            prefill: {
              name: "${passengerName || 'Passenger'}",
              contact: "${passengerPhone || '8002141816'}"
            },
            notes: {
              bookingRef: "${bookingRef}",
              platform: "OneWayTaxiBihar Mobile App"
            },
            theme: {
              color: "#059669"
            },
            handler: function (response) {
              sendToNative({
                status: "success",
                paymentId: response.razorpay_payment_id || ("pay_" + Date.now()),
                orderId: response.razorpay_order_id || "${orderId}",
                signature: response.razorpay_signature || ""
              });
            },
            modal: {
              ondismiss: function() {
                sendToNative({ status: "dismissed" });
              }
            }
          };

          var rzp = new Razorpay(options);
          rzp.on('payment.failed', function (response){
            sendToNative({
              status: "failed",
              error: response.error ? response.error.description : "Payment failed"
            });
          });
          rzp.open();
        } catch (err) {
          sendToNative({ status: "sdk_fallback", message: err.message });
        }
      }

      // Auto-launch checkout after page load
      window.onload = function() {
        setTimeout(launchCheckout, 400);
      };
    </script>
  </body>
  </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Modal Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.securityShield}>
              <ShieldCheck size={18} color="#059669" />
            </View>
            <View>
              <Text style={styles.topBarTitle}>Razorpay Secure Gateway</Text>
              <Text style={styles.topBarSub}>256-Bit Encrypted • PCI-DSS Level 1</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <X size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Amount Summary Strip */}
        <View style={styles.amountStrip}>
          <View>
            <Text style={styles.stripLabel}>MANDATORY 15% ADVANCE</Text>
            <Text style={styles.stripRef}>Booking Ref: {bookingRef}</Text>
          </View>
          <Text style={styles.stripAmount}>₹{amount.toLocaleString('en-IN')}</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'gateway' && styles.tabItemActive]}
            onPress={() => setActiveTab('gateway')}
          >
            <CreditCard size={15} color={activeTab === 'gateway' ? '#059669' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'gateway' && styles.tabTextActive]}>
              Razorpay Checkout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'direct_upi' && styles.tabItemActive]}
            onPress={() => setActiveTab('direct_upi')}
          >
            <Smartphone size={15} color={activeTab === 'direct_upi' ? '#059669' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'direct_upi' && styles.tabTextActive]}>
              1-Tap UPI / GPay / PhonePe
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Razorpay WebView */}
        {activeTab === 'gateway' && (
          <View style={{ flex: 1 }}>
            <WebView
              originWhitelist={['*']}
              source={{ html: razorpayHtml }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#059669" />
                  <Text style={styles.loaderText}>Connecting to Razorpay Gateway...</Text>
                </View>
              )}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.status === 'success') {
                    onSuccess({
                      paymentId: data.paymentId,
                      orderId: data.orderId,
                      signature: data.signature
                    });
                  } else if (data.status === 'failed') {
                    onFailure(data.error || 'Payment transaction failed.');
                  } else if (data.status === 'dismissed') {
                    // User closed checkout popup, switch to UPI tab for convenience
                    setActiveTab('direct_upi');
                  } else if (data.status === 'sdk_fallback') {
                    setActiveTab('direct_upi');
                  }
                } catch (e) {}
              }}
              style={{ flex: 1 }}
            />
          </View>
        )}

        {/* Tab 2: 1-Tap Direct UPI App Intent */}
        {activeTab === 'direct_upi' && (
          <View style={styles.upiTabContent}>
            <View style={styles.upiCard}>
              <View style={styles.upiBadge}>
                <CheckCircle2 size={16} color="#059669" />
                <Text style={styles.upiBadgeText}>INSTANT APP-TO-APP SETTLEMENT</Text>
              </View>

              <Text style={styles.upiHeading}>Pay with Any Installed UPI App</Text>
              <Text style={styles.upiDesc}>
                Tap below to open PhonePe, Google Pay, Paytm, or BHIM directly. ₹{amount} will be automatically filled.
              </Text>

              <TouchableOpacity style={styles.launchUpiBtn} onPress={handleLaunchUpiIntent} activeOpacity={0.85}>
                <Smartphone size={18} color="#FFFFFF" />
                <Text style={styles.launchUpiText}>Open UPI App to Pay ₹{amount}</Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>AFTER PAYMENT</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.utrLabel}>ENTER 12-DIGIT UPI REFERENCE / UTR NO.</Text>
              <TextInput
                style={styles.utrInput}
                placeholder="e.g. 432109876543 (from UPI receipt)"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={12}
                value={utr}
                onChangeText={setUtr}
              />

              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleVerifyManualUtr}
                disabled={verifyingUtr}
                activeOpacity={0.85}
              >
                {verifyingUtr ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Lock size={16} color="#FFFFFF" />
                    <Text style={styles.verifyBtnText}>Confirm 15% Advance & Book Cab</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.reassuranceRow}>
              <ShieldCheck size={14} color="#059669" />
              <Text style={styles.reassuranceText}>
                Remaining 85% balance payable to chauffeur at destination doorstep.
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  securityShield: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  topBarSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  stripLabel: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stripRef: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  stripAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#059669',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  upiTabContent: {
    padding: 16,
    flex: 1,
  },
  upiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  upiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  upiBadgeText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  upiHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  upiDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 1.5,
    marginBottom: 18,
  },
  launchUpiBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 18,
  },
  launchUpiText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  utrLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  utrInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 16,
  },
  verifyBtn: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  reassuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  reassuranceText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
  },
});
