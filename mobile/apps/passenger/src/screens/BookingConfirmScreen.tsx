import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';
import { Booking } from '../../../../shared/types';
import { formatCurrency } from '../../../../shared/utils/formatters';
import {
  CheckCircle,
  KeyRound,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  PhoneCall,
  Home,
  MapPin,
  Car,
  Sparkles,
} from 'lucide-react-native';

export const BookingConfirmScreen = ({ route, navigation }: any) => {
  const { booking } = route.params as { booking: Booking };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Success Icon Badge Header */}
        <View style={styles.topContainer}>
          <View style={styles.successBadge}>
            <CheckCircle size={44} color="#059669" />
          </View>
          <Text style={styles.title}>Outstation Ride Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your booking request has been locked with priority chauffeur assignment.
          </Text>

          {/* Booking Reference PNR Pill */}
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>BOOKING REFERENCE NUMBER</Text>
            <Text style={styles.refCode}>{booking.referenceNumber || booking.id}</Text>
          </View>
        </View>

        {/* 4-Digit Ride Start Security OTP Card */}
        <View style={styles.otpCard}>
          <View style={styles.otpHeader}>
            <KeyRound size={18} color="#D97706" />
            <Text style={styles.otpCardTitle}>Ride Start Security OTP</Text>
          </View>
          <Text style={styles.otpValue}>
            {booking.startOtp || '4921'}
          </Text>
          <Text style={styles.otpNotice}>
            Share this 4-digit verification code with your commercial driver only when you board the cab.
          </Text>
        </View>

        {/* Route Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Trip Summary</Text>
          
          <View style={styles.itineraryRow}>
            <Text style={styles.itineraryLabel}>Vehicle:</Text>
            <Text style={styles.itineraryVal}>{booking.cabName || 'Prime Sedan'}</Text>
          </View>

          <View style={styles.itineraryRow}>
            <Text style={styles.itineraryLabel}>Route:</Text>
            <Text style={styles.itineraryVal}>
              {booking.pickupCity} → {booking.dropCity}
            </Text>
          </View>

          <View style={styles.itineraryRow}>
            <Text style={styles.itineraryLabel}>Pickup Doorstep:</Text>
            <Text style={styles.itineraryValSecondary} numberOfLines={2}>
              {booking.pickupAddress || 'Doorstep Pickup'}
            </Text>
          </View>

          <View style={styles.scheduleHighlightRow}>
            <Text style={styles.scheduleHighlightLabel}>Pickup Time:</Text>
            <Text style={styles.scheduleHighlightVal}>
              {booking.pickupDate || 'Today'} • {booking.pickupTime || '10:00 AM'}
            </Text>
          </View>

          <View style={styles.itineraryRow}>
            <Text style={styles.itineraryLabel}>Total Fare:</Text>
            <Text style={styles.itineraryFare}>
              {formatCurrency(booking.fareBreakdown?.totalFare || (booking as any).totalFare || 2198)}
            </Text>
          </View>

          <View style={styles.itineraryRow}>
            <Text style={styles.itineraryLabel}>Payment Mode:</Text>
            <Text style={styles.itineraryPayment}>
              {booking.paymentMethod === 'full_online_razorpay'
                ? `100% Paid Online • Cashless Ride (₹0 to driver)`
                : booking.paymentMethod === 'advance_15_razorpay'
                ? `15% Online Advance Paid (${formatCurrency(booking.advancePaid || Math.round((booking.fareBreakdown?.totalFare || 2199) * 0.15))})`
                : 'Token Advance Paid'}
            </Text>
          </View>

          {booking.paymentMethod === 'advance_15_razorpay' && (
            <View style={styles.itineraryRow}>
              <Text style={styles.itineraryLabel}>Balance at Drop:</Text>
              <Text style={[styles.itineraryVal, { color: '#D97706', fontWeight: '800' }]}>
                {formatCurrency(booking.balanceDue || Math.round((booking.fareBreakdown?.totalFare || 2199) * 0.85))}
              </Text>
            </View>
          )}

          {booking.paymentTxnId && (
            <View style={styles.itineraryRow}>
              <Text style={styles.itineraryLabel}>Razorpay Ref:</Text>
              <Text style={[styles.itineraryValSecondary, { fontFamily: 'monospace' }]}>
                {booking.paymentTxnId}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('BookingTimeline', { bookingId: booking.id, booking })}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Track Live Booking Timeline</Text>
            <ArrowRight size={18} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.8}
          >
            <Home size={18} color="#0F172A" />
            <Text style={styles.secondaryBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 14,
  },
  topContainer: {
    alignItems: 'center',
  },
  successBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  refBox: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  refLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  refCode: {
    fontSize: 18,
    fontWeight: '900',
    color: '#D97706',
    marginTop: 2,
    letterSpacing: 1.5,
  },
  otpCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    alignItems: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  otpCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  otpValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 8,
    marginVertical: 4,
  },
  otpNotice: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  itineraryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  itineraryLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  itineraryVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'right',
    flex: 1,
  },
  itineraryValSecondary: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  scheduleHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
  },
  scheduleHighlightLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  scheduleHighlightVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  itineraryFare: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B45309',
  },
  itineraryPayment: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  actionContainer: {
    gap: 10,
    marginTop: 6,
  },
  primaryBtn: {
    backgroundColor: '#F59E0B', // Golden Yellow
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  secondaryBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});
