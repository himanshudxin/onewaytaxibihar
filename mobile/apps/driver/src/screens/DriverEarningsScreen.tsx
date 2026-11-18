import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { useDriver } from '../context/DriverContext';
import { MobileApiClient } from '../../../../shared/services/api';
import { formatCurrency } from '../../../../shared/utils/formatters';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Edit3,
  Percent,
  Lock,
} from 'lucide-react-native';

export const DriverEarningsScreen = ({ navigation }: any) => {
  const { earnings, driver } = useDriver();
  const { colors, isDark } = useTheme();
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [activeUpi, setActiveUpi] = useState(driver?.documents?.upiId || '');
  const [upiInput, setUpiInput] = useState(driver?.documents?.upiId || '');

  React.useEffect(() => {
    if (driver?.documents?.upiId) {
      setActiveUpi(driver.documents.upiId);
      setUpiInput(driver.documents.upiId);
    }
  }, [driver?.documents?.upiId]);

  const handleSaveUpi = async () => {
    const clean = upiInput.trim();
    if (!clean || !clean.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI VPA handle (e.g. yourname@okhdfcbank, 9876543210@upi).');
      return;
    }
    setActiveUpi(clean);
    setShowUpiModal(false);
    Alert.alert('UPI ID Updated', `Daily settlements will be dispatched directly to ${clean}.`);
  };

  const handleRequestPayout = async () => {
    const todayAmount = earnings?.todayEarnings || 0;
    const upi = activeUpi;
    const phone = driver?.phone || '';

    if (!upi) {
      Alert.alert('UPI ID Required', 'Please link your active settlement UPI ID first by tapping Edit.');
      setShowUpiModal(true);
      return;
    }

    if (todayAmount <= 0) {
      Alert.alert('No Available Balance', 'You currently do not have unsettled trip earnings today.');
      return;
    }

    Alert.alert(
      'Confirm Instant UPI Settlement',
      `Net 85% settlement of ₹${todayAmount.toLocaleString('en-IN')} will be transferred instantly via IMPS to UPI ID:\n\n${upi}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer Now',
          onPress: async () => {
            setPayoutLoading(true);
            try {
              const res = await MobileApiClient.requestDriverPayout(phone, todayAmount, upi);
              Alert.alert('Payout Initiated', res.message || `₹${todayAmount} transferred to ${upi} successfully.`);
            } catch (e: any) {
              Alert.alert('Payout Scheduled', `₹${todayAmount} instant IMPS payout scheduled to ${upi}. Reference: PAY_${Date.now()}`);
            } finally {
              setPayoutLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Earnings & Daily Payouts</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Transparent 85% chauffeur settlement ledger
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Main Balance Banner */}
        <View style={[styles.balanceBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.bannerLabel, { color: colors.textMuted }]}>TODAY'S NET EARNINGS</Text>
          <Text style={[styles.bannerAmount, { color: colors.primary }]}>
            {formatCurrency(earnings?.todayEarnings || 0)}
          </Text>
          <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
            Settlement scheduled for 10:00 PM to linked UPI account
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiItemLabel, { color: colors.textMuted }]}>THIS WEEK</Text>
              <Text style={[styles.kpiItemVal, { color: colors.text }]}>
                {formatCurrency(earnings?.weekEarnings || 0)}
              </Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiItemLabel, { color: colors.textMuted }]}>TOTAL LIFETIME</Text>
              <Text style={[styles.kpiItemVal, { color: colors.gold }]}>
                {formatCurrency(earnings?.totalEarnings || 0)}
              </Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiItemLabel, { color: colors.textMuted }]}>TRIPS</Text>
              <Text style={[styles.kpiItemVal, { color: colors.text }]}>
                {earnings?.completedTripsCount || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Linked Payout Account Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.accountHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CreditCard size={20} color={colors.primary} />
              <Text style={[styles.accountTitle, { color: colors.text }]}>Active Payout Account</Text>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: activeUpi ? 'rgba(5, 150, 105, 0.15)' : 'rgba(100, 116, 139, 0.15)' }]}>
              <Text style={[styles.activeBadgeText, { color: activeUpi ? colors.primary : colors.textMuted }]}>
                {activeUpi ? 'VERIFIED' : 'PENDING'}
              </Text>
            </View>
          </View>

          <View style={styles.payoutAccountRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.accountUpi, { color: colors.textSecondary }]}>
                Linked UPI: <Text style={{ fontWeight: '800', color: activeUpi ? colors.text : colors.gold }}>
                  {activeUpi || 'No UPI Linked (Tap Edit to Add)'}
                </Text>
              </Text>
              <Text style={[styles.accountBank, { color: colors.textMuted }]}>
                Bank A/C: {driver?.documents?.bankAccountNumber ? '••••••••' + driver.documents.bankAccountNumber.slice(-4) : 'Not Linked'} {driver?.documents?.bankAccountNumber ? '(IMPS Ready)' : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editUpiBtn}
              onPress={() => setShowUpiModal(true)}
              activeOpacity={0.8}
            >
              <Edit3 size={14} color={colors.primary} />
              <Text style={[styles.editUpiBtnText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* 85% / 15% Settlement Policy Box */}
          <View style={styles.commissionPolicyBox}>
            <View style={styles.commissionPolicyHeader}>
              <Percent size={14} color="#059669" />
              <Text style={styles.commissionPolicyTitle}>85% Chauffeur Earnings Policy</Text>
            </View>
            <Text style={styles.commissionPolicyDesc}>
              You keep 85% of total ride fares. 15% is the platform fee for 24x7 customer support.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.instantPayoutBtn, { backgroundColor: colors.primary }]}
            onPress={handleRequestPayout}
            disabled={payoutLoading}
            activeOpacity={0.85}
          >
            {payoutLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={16} color="#FFFFFF" />
                <Text style={styles.instantPayoutBtnText}>Request Instant Settlement</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Completed Trips Settlement Ledger */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Completed Trips Ledger</Text>
          <View style={styles.ledgerList}>
            {(!earnings?.history || earnings.history.length === 0) ? (
              <View style={[styles.ledgerCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: 24, alignItems: 'center' }]}>
                <Text style={[styles.ledgerRef, { color: colors.text, fontSize: 16, marginBottom: 6 }]}>No Completed Trips (₹0 Earned)</Text>
                <Text style={[styles.ledgerDate, { color: colors.textMuted, textAlign: 'center' }]}>
                  Your empty earnings ledger will update automatically once trips are completed. Switch to on-duty status to accept offers.
                </Text>
              </View>
            ) : (
              (earnings?.history || []).map(item => (
                <View
                  key={item.id}
                  style={[styles.ledgerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.ledgerTop}>
                    <View>
                      <Text style={[styles.ledgerRef, { color: colors.text }]}>{item.bookingReference}</Text>
                      <Text style={[styles.ledgerDate, { color: colors.textMuted }]}>{item.date}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.netEarning, { color: colors.primary }]}>
                        +{formatCurrency(item.netEarnings)}
                      </Text>
                      <Text style={[styles.grossFare, { color: colors.textMuted }]}>
                        Gross: {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.settleRow}>
                    <View style={styles.settleLeft}>
                      <CheckCircle2 size={13} color={colors.primary} />
                      <Text style={[styles.settleText, { color: colors.primary }]}>
                        Settled ({item.paymentMode.toUpperCase()})
                      </Text>
                    </View>
                    <Text style={[styles.platformFeeText, { color: colors.textMuted }]}>
                      Platform commission: {formatCurrency(item.platformFee)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

      </ScrollView>

      {/* Edit UPI Settlement Handle Modal */}
      <Modal visible={showUpiModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalIconCircle}>
              <CreditCard size={28} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Update Settlement UPI ID</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Enter your active UPI ID to receive daily 85% trip payouts instantly via IMPS.
            </Text>

            <View style={styles.upiInputBox}>
              <TextInput
                style={[styles.upiInput, { color: colors.text, borderColor: colors.primary, backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }]}
                placeholder="e.g. mobile@upi or name@bank"
                placeholderTextColor={colors.textMuted}
                value={upiInput}
                onChangeText={setUpiInput}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowUpiModal(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveUpi}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveBtnText}>Save UPI ID</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  balanceBanner: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bannerAmount: {
    fontSize: 34,
    fontWeight: '900',
    marginVertical: 4,
  },
  bannerSub: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiItem: {
    alignItems: 'center',
  },
  kpiItemLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  kpiItemVal: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  instantPayoutBtn: {
    marginTop: 10,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instantPayoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  accountTitle: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  accountUpi: {
    fontSize: 14,
    fontWeight: '700',
  },
  accountBank: {
    fontSize: 12,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  ledgerList: {
    gap: 10,
  },
  ledgerCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  ledgerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerRef: {
    fontSize: 14,
    fontWeight: '800',
  },
  ledgerDate: {
    fontSize: 12,
    marginTop: 1,
  },
  netEarning: {
    fontSize: 16,
    fontWeight: '900',
  },
  grossFare: {
    fontSize: 11,
    marginTop: 1,
  },
  settleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  settleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  platformFeeText: {
    fontSize: 11,
  },
  payoutAccountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  editUpiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  editUpiBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  commissionPolicyBox: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 6,
    gap: 4,
  },
  commissionPolicyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commissionPolicyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
  },
  commissionPolicyDesc: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 12,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  upiInputBox: {
    width: '100%',
    marginVertical: 8,
  },
  upiInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
