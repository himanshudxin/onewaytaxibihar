import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';
import { usePassenger } from '../context/PassengerContext';
import { MobileApiClient } from '../../../../shared/services/api';
import { formatCurrency, formatDistance, isValidIndianMobile, sanitizePhoneNumber } from '../../../../shared/utils/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Banknote,
  CreditCard,
  ChevronRight,
  FileText,
  Sparkles,
  X,
  Check,
  Car,
  Compass,
} from 'lucide-react-native';

export const CheckoutScreen = ({ route, navigation }: any) => {
  const { fareBreakdown, cabName, price, distanceKm, cabTier = 'sedan' } = route.params;
  const { search, updateSearch, setActiveBooking, refreshTrips } = usePassenger();

  const [name, setName] = useState(search.passengerName || '');
  const [phone, setPhone] = useState(search.phone || '');
  const [pickupAddr, setPickupAddr] = useState(search.pickupAddress || `${search.origin} Doorstep`);
  const [dropAddr, setDropAddr] = useState(search.dropAddress || `${search.destination} City Center`);
  const [paymentMethod, setPaymentMethod] = useState<'driver_cash' | 'advance_token'>('driver_cash');
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUtrModal, setShowUtrModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [submittingUtr, setSubmittingUtr] = useState(false);

  const getDynamicCheckoutDateOptions = () => {
    const options = [];
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 5; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const dayName = dayNames[d.getDay()];
      const monthName = monthNames[d.getMonth()];
      const dateNum = d.getDate();

      let tag = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${dayName}, ${dateNum} ${monthName}`;
      let desc = i === 0 ? 'Immediate / Today' : i === 1 ? 'Next morning departure' : 'Advance outstation';
      
      options.push({
        label: tag,
        value: tag,
        desc,
        dateNum: `${dateNum} ${monthName}`,
        iso: d.toISOString().split('T')[0]
      });
    }
    return options;
  };

  const TIME_OPTIONS = [
    'Immediate (Next 15-30m)',
    '05:00 AM (Early Dawn)',
    '06:30 AM (Morning Departure)',
    '08:00 AM (Express Morning)',
    '09:30 AM (Standard Business)',
    '11:00 AM (Mid-Morning)',
    '12:30 PM (Noon Transit)',
    '02:30 PM (Afternoon)',
    '04:30 PM (Late Afternoon)',
    '06:30 PM (Evening)',
    '08:30 PM (Prime Evening)',
    '10:30 PM (Night Express)',
    '11:45 PM (Late Night)'
  ];

  const handleQuickFill = () => {
    if (!name.trim()) setName(search.passengerName || 'Verified Passenger');
    if (!phone.trim()) setPhone(search.phone || '9876543210');
    setPickupAddr(`${search.origin} Railway Station Gate 1 / Airport`);
    setDropAddr(`${search.destination} City Center Landmark`);
  };

  const handleLaunchUpi = async (targetRef?: string) => {
    const ref = targetRef || `OTB${Date.now().toString().slice(-6)}`;
    const upiUri = `upi://pay?pa=8002141816@ybl&pn=OneWayTaxiBihar&am=500&cu=INR&tn=Advance%20Booking%20${ref}`;
    try {
      const canOpen = await Linking.canOpenURL(upiUri);
      if (canOpen) {
        await Linking.openURL(upiUri);
      } else {
        await Linking.openURL(`https://onewaytaxibihar.com/payment.html?amount=500&phone=${encodeURIComponent(phone)}`);
      }
    } catch (e) {
      Alert.alert('UPI Payment', 'Please send ₹500 advance via PhonePe/GooglePay to UPI ID: 8002141816@ybl');
    }
  };

  const createBookingRecord = async (initialPaymentStatus: 'pending' | 'partially_paid' = 'pending') => {
    setLoading(true);
    try {
      const cleanPhone = sanitizePhoneNumber(phone);
      updateSearch({ passengerName: name, phone: cleanPhone, pickupAddress: pickupAddr, dropAddress: dropAddr });

      const booking = await MobileApiClient.createBooking({
        passengerName: name.trim(),
        passengerPhone: cleanPhone,
        pickupCity: search.origin,
        pickupAddress: pickupAddr,
        dropCity: search.destination,
        dropAddress: dropAddr,
        tripType: search.tripType,
        pickupDate: search.pickupDate,
        pickupTime: search.pickupTime,
        passengerCount: search.passengerCount,
        cabTier: cabTier as any,
        cabName,
        fareBreakdown,
        paymentMethod,
        paymentStatus: initialPaymentStatus
      });

      setActiveBooking(booking);
      await refreshTrips();
      return booking;
    } catch (e: any) {
      Alert.alert('Booking Error', e.message || 'Could not place booking. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUtr = async () => {
    const cleanUtr = utrNumber.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      Alert.alert('Invalid UTR', 'Please enter a valid 12-digit UPI Reference / UTR Number found in your PhonePe/GPay receipt.');
      return;
    }

    setSubmittingUtr(true);
    try {
      if (createdBooking) {
        await MobileApiClient.submitAdvanceTokenUtr(createdBooking.referenceNumber || createdBooking.id, cleanUtr);
      }
      setShowUtrModal(false);
      Alert.alert('Advance Token Recorded', `UTR ${cleanUtr} submitted. Remaining balance payable to chauffeur at drop.`);
      navigation.replace('BookingConfirm', { booking: createdBooking });
    } catch (e) {
      setShowUtrModal(false);
      navigation.replace('BookingConfirm', { booking: createdBooking });
    } finally {
      setSubmittingUtr(false);
    }
  };

  const handleSkipUtr = () => {
    setShowUtrModal(false);
    if (createdBooking) {
      navigation.replace('BookingConfirm', { booking: createdBooking });
    }
  };

  const handleConfirmRide = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter passenger full name.');
      return;
    }

    const cleanPhone = sanitizePhoneNumber(phone);
    if (!isValidIndianMobile(cleanPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number for driver dispatch updates.');
      return;
    }

    if (paymentMethod === 'advance_token') {
      Alert.alert(
        'Pay ₹500 Token Advance',
        'Pay ₹500 token advance via PhonePe, GPay, or Paytm to lock in your cab. Remaining balance payable to chauffeur at destination.',
        [
          {
            text: 'Launch UPI App & Enter UTR',
            onPress: async () => {
              await handleLaunchUpi();
              const booking = await createBookingRecord('partially_paid');
              if (booking) {
                setCreatedBooking(booking);
                setShowUtrModal(true);
              }
            }
          },
          {
            text: 'Pay Cash to Driver (Zero Advance)',
            style: 'default',
            onPress: async () => {
              setPaymentMethod('driver_cash');
              const booking = await createBookingRecord('pending');
              if (booking) {
                navigation.replace('BookingConfirm', { booking });
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    const booking = await createBookingRecord('pending');
    if (booking) {
      navigation.replace('BookingConfirm', { booking });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <ArrowLeft size={20} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerOverline}>FINAL STEP: TRIP REVIEW</Text>
            <Text style={styles.headerTitle}>Booking Confirmation</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Trip Summary Card */}
          <View style={styles.card}>
            <View style={styles.tripHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.cabBadgeRow}>
                  <Text style={styles.cabTitle}>{cabName}</Text>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillBadgeText}>Confirmed Category</Text>
                  </View>
                </View>
                <Text style={styles.tripTypeLabel}>
                  {search.tripType === 'one-way' ? 'One-Way Outstation Taxi' : 'Round Trip Intercity'} • {formatDistance(distanceKm)}
                </Text>
              </View>
              <View style={styles.fareContainer}>
                <Text style={styles.fareAmount}>{formatCurrency(price)}</Text>
                <Text style={styles.allIncBadge}>All-Inclusive</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Route Pins */}
            <View style={styles.routeContainer}>
              <View style={styles.routePinRow}>
                <View style={styles.pickupPinCircle}>
                  <MapPin size={14} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeLabel}>PICKUP LOCATION</Text>
                  <Text style={styles.routeCity}>{search.origin || 'Patna'}</Text>
                  <TextInput
                    style={styles.addrInput}
                    placeholder="Enter doorstep pickup address / landmark"
                    placeholderTextColor="#94A3B8"
                    value={pickupAddr}
                    onChangeText={setPickupAddr}
                  />
                </View>
              </View>

              <View style={styles.routeLine} />

              <View style={styles.routePinRow}>
                <View style={styles.dropPinCircle}>
                  <Compass size={14} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeLabel}>DROP DESTINATION</Text>
                  <Text style={styles.routeCity}>{search.destination || 'Gaya'}</Text>
                  <TextInput
                    style={styles.addrInput}
                    placeholder="Enter destination hotel / address"
                    placeholderTextColor="#94A3B8"
                    value={dropAddr}
                    onChangeText={setDropAddr}
                  />
                </View>
              </View>
            </View>

            {/* Interactive Schedule Selector */}
            <TouchableOpacity
              style={styles.scheduleSelectBox}
              onPress={() => setShowScheduleModal(true)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleSelectLabel}>
                  SCHEDULED DEPARTURE
                </Text>
                <View style={styles.scheduleSelectRow}>
                  <View style={styles.scheduleItem}>
                    <Calendar size={14} color="#D97706" />
                    <Text style={styles.scheduleTextBold}>{search.pickupDate || 'Today'}</Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Clock size={14} color="#D97706" />
                    <Text style={styles.scheduleTextBold}>{search.pickupTime || '10:00 AM'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.changeScheduleBadge}>
                <Text style={styles.changeScheduleText}>Modify ✏️</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Passenger Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeaderWithAction}>
              <Text style={styles.sectionHeading}>Passenger Details</Text>
              <TouchableOpacity
                style={styles.quickFillBtn}
                onPress={handleQuickFill}
                activeOpacity={0.8}
              >
                <Sparkles size={12} color="#059669" />
                <Text style={styles.quickFillText}>Quick Fill</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>PASSENGER FULL NAME</Text>
              <View style={styles.fieldInputBox}>
                <User size={16} color="#64748B" />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Enter passenger name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>MOBILE NUMBER (FOR SMS & CHAUFFEUR COORDINATION)</Text>
              <View style={styles.fieldInputBox}>
                <Phone size={16} color="#64748B" />
                <Text style={styles.fieldPrefix}>+91</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="10-digit Mobile Number"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>
          </View>

          {/* Payment Method Selector Card */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Select Payment Method</Text>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'driver_cash' && styles.paymentOptionActive
              ]}
              onPress={() => setPaymentMethod('driver_cash')}
              activeOpacity={0.85}
            >
              <View style={styles.payIconCircleCash}>
                <Banknote size={20} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payTitle}>Zero Advance • Pay Cash / UPI to Driver</Text>
                <Text style={styles.paySubtitle}>
                  Pay {formatCurrency(price)} directly to chauffeur upon reaching destination.
                </Text>
              </View>
              {paymentMethod === 'driver_cash' && <CheckCircle2 size={20} color="#059669" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === 'advance_token' && styles.paymentOptionActive
              ]}
              onPress={() => setPaymentMethod('advance_token')}
              activeOpacity={0.85}
            >
              <View style={styles.payIconCircleOnline}>
                <CreditCard size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payTitle}>Pay ₹500 Token Advance</Text>
                <Text style={styles.paySubtitle}>
                  Lock in priority vehicle allocation. Balance {formatCurrency(price - 500)} payable at drop.
                </Text>
              </View>
              {paymentMethod === 'advance_token' && <CheckCircle2 size={20} color="#059669" />}
            </TouchableOpacity>
          </View>

          {/* Cancellation Terms */}
          <View style={styles.termsCard}>
            <ShieldCheck size={18} color="#059669" />
            <Text style={styles.termsText}>
              <Text style={{ fontWeight: '800', color: '#0F172A' }}>Zero Cancellation Fee:</Text> Free cancellation anytime prior to vehicle dispatch. All state tolls and taxes are covered.
            </Text>
          </View>

        </ScrollView>

        {/* Sticky Confirm Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomBarLabel}>NET PAYABLE TOTAL</Text>
            <Text style={styles.bottomBarPrice}>{formatCurrency(price)}</Text>
          </View>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirmRide}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <>
                <Text style={styles.confirmBtnText}>Confirm Taxi Booking</Text>
                <ChevronRight size={18} color="#0F172A" strokeWidth={2.5} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Schedule Date & Time Selection Modal */}
        <Modal
          visible={showScheduleModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowScheduleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>When Do You Need The Taxi?</Text>
                  <Text style={styles.modalSub}>
                    Select pickup departure date and exact departure time slot
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowScheduleModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                <Text style={styles.modalSectionLabel}>1. SELECT DEPARTURE DATE</Text>
                <View style={styles.dateOptionsRow}>
                  {getDynamicCheckoutDateOptions().map(opt => {
                    const isSelected = search.pickupDate === opt.value || search.pickupDate === opt.label || search.pickupDate === opt.iso || (search.pickupDate === 'Today' && opt.label === 'Today');
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.dateOptionCard,
                          isSelected && styles.dateOptionCardSelected
                        ]}
                        onPress={() => updateSearch({ pickupDate: opt.label })}
                        activeOpacity={0.8}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.dateOptionTitle, isSelected && { color: '#B45309', fontWeight: '800' }]}>
                            {opt.label}
                          </Text>
                          {isSelected && <Check size={16} color="#D97706" />}
                        </View>
                        <Text style={styles.dateOptionVal}>{opt.dateNum}</Text>
                        <Text style={styles.dateOptionDesc}>{opt.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.modalSectionLabel, { marginTop: 16 }]}>2. SELECT PICKUP TIME</Text>
                <View style={styles.timeGrid}>
                  {TIME_OPTIONS.map(timeStr => {
                    const isSelected = search.pickupTime === timeStr;
                    return (
                      <TouchableOpacity
                        key={timeStr}
                        style={[
                          styles.timeSlotPill,
                          isSelected && styles.timeSlotPillSelected
                        ]}
                        onPress={() => updateSearch({ pickupTime: timeStr })}
                        activeOpacity={0.8}
                      >
                        <Clock size={13} color={isSelected ? '#0F172A' : '#64748B'} />
                        <Text style={[styles.timeSlotText, isSelected && { color: '#0F172A', fontWeight: '800' }]}>
                          {timeStr}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.applyScheduleBtn}
                  onPress={() => {
                    setShowScheduleModal(false);
                    Alert.alert('Pickup Scheduled', `Your cab will be dispatched for ${search.pickupDate || 'Today'} at ${search.pickupTime || '10:00 AM'}.`);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.applyScheduleText}>
                    Set Departure: {search.pickupDate || 'Today'} at {search.pickupTime || '10:00 AM'} ✓
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* 12-Digit UPI UTR Submission Modal */}
        <Modal
          visible={showUtrModal}
          transparent
          animationType="fade"
          onRequestClose={handleSkipUtr}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: 420 }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Enter 12-Digit UPI UTR</Text>
                  <Text style={styles.modalSub}>
                    Lock in ₹500 advance token reservation
                  </Text>
                </View>
                <TouchableOpacity onPress={handleSkipUtr} style={styles.modalCloseBtn}>
                  <X size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>

              <View style={{ padding: 18, gap: 14 }}>
                <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18 }}>
                  After completing ₹500 payment in PhonePe / Google Pay / Paytm, copy the 12-digit UTR / UPI Reference Number from transaction details:
                </Text>

                <TextInput
                  style={styles.utrInput}
                  placeholder="e.g. 429812345678"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={12}
                  value={utrNumber}
                  onChangeText={setUtrNumber}
                />

                <TouchableOpacity
                  style={styles.verifyUtrBtn}
                  onPress={handleVerifyUtr}
                  disabled={submittingUtr}
                  activeOpacity={0.85}
                >
                  {submittingUtr ? (
                    <ActivityIndicator color="#0F172A" size="small" />
                  ) : (
                    <Text style={styles.verifyUtrBtnText}>
                      Verify & Confirm Advance Reservation
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ height: 38, justifyContent: 'center', alignItems: 'center' }}
                  onPress={handleSkipUtr}
                >
                  <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600' }}>
                    Pay Full Amount to Chauffeur on Arrival Instead
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cabBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cabTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  pillBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  tripTypeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 4,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  allIncBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  routeContainer: {
    gap: 12,
  },
  routePinRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pickupPinCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  dropPinCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  routeLine: {
    width: 2,
    height: 14,
    backgroundColor: '#E2E8F0',
    marginLeft: 12,
    marginVertical: -6,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  routeCity: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  addrInput: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginTop: 4,
  },
  scheduleSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    marginTop: 14,
  },
  scheduleSelectLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  scheduleSelectRow: {
    flexDirection: 'row',
    gap: 14,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scheduleTextBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  changeScheduleBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  changeScheduleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  quickFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quickFillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  fieldInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  fieldPrefix: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    marginBottom: 10,
  },
  paymentOptionActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  payIconCircleCash: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payIconCircleOnline: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  paySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  termsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  termsText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  bottomBarPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  confirmBtn: {
    backgroundColor: '#F59E0B', // Golden Yellow
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomWidth: 0,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingBottom: 24,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  dateOptionsRow: {
    gap: 8,
  },
  dateOptionCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateOptionCardSelected: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
  },
  dateOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dateOptionVal: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },
  dateOptionDesc: {
    fontSize: 10,
    color: '#94A3B8',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeSlotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeSlotPillSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  timeSlotText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  applyScheduleBtn: {
    backgroundColor: '#F59E0B',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applyScheduleText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  utrInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    backgroundColor: '#FFFBEB',
    letterSpacing: 2,
    textAlign: 'center',
  },
  verifyUtrBtn: {
    height: 48,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  verifyUtrBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
});
