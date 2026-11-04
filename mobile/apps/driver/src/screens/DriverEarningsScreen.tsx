import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
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
  ShieldCheck
} from 'lucide-react-native';

export const DriverEarningsScreen = ({ navigation }: any) => {
  const { earnings, driver } = useDriver();
  const { colors, isDark } = useTheme();
  const [payoutLoading, setPayoutLoading] = useState(false);

  const handleRequestPayout = async () => {
    const todayAmount = earnings?.todayEarnings || 2198;
    const upi = driver?.documents.upiId || '9876501234@upi';
    const phone = driver?.phone || '9876508888';

    if (todayAmount <= 0) {
      Alert.alert('No Available Balance', 'You currently do not have unsettled trip earnings today.');
      return;
    }

    Alert.alert(
      'Confirm Instant Payout',
      `Transfer ₹${todayAmount.toLocaleString('en-IN')} via IMPS/UPI to ${upi}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer Now',
          onPress: async () => {
            setPayoutLoading(true);
            try {
              const res = await MobileApiClient.requestDriverPayout(phone, todayAmount, upi);
              Alert.alert('Payout Initiated', res.message || 'Settlement transfer initiated.');
            } catch (e: any) {
              Alert.alert('Error', 'Unable to initiate payout right now. Please try again.');
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
            {formatCurrency(earnings?.todayEarnings || 2198)}
          </Text>
          <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
            Settlement scheduled for 10:00 PM to linked UPI account
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiItemLabel, { color: colors.textMuted }]}>THIS WEEK</Text>
              <Text style={[styles.kpiItemVal, { color: colors.text }]}>
                {formatCurrency(earnings?.weekEarnings || 14650)}
              </Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiItemLabel, { color: colors.textMuted }]}>TOTAL LIFETIME</Text>
              <Text style={[styles.kpiItemVal, { color: colors.gold }]}>
                {formatCurrency(earnings?.totalEarnings || 82400)}
              </Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiItemLabel, { color: colors.textMuted }]}>TRIPS</Text>
              <Text style={[styles.kpiItemVal, { color: colors.text }]}>
                {earnings?.completedTripsCount || 38}
              </Text>
            </View>
          </View>
        </View>

        {/* Linked Payout Account Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.accountHeader}>
            <CreditCard size={20} color={colors.primary} />
            <Text style={[styles.accountTitle, { color: colors.text }]}>Active Payout Account</Text>
            <View style={[styles.activeBadge, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
              <Text style={[styles.activeBadgeText, { color: colors.primary }]}>VERIFIED</Text>
            </View>
          </View>
          <Text style={[styles.accountUpi, { color: colors.textSecondary }]}>
            UPI ID: {driver?.documents.upiId || '9876501234@upi'}
          </Text>
          <Text style={[styles.accountBank, { color: colors.textMuted }]}>
            Bank A/C: {driver?.documents.bankAccountNumber || '••••••••4912'} (Instant IMPS Transfer)
          </Text>

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
});
