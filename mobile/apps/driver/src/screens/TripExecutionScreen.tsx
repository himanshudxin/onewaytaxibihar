import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Alert,
  Modal,
  Image,
} from 'react-native';
import QRCode from 'qrcode';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { UberMapView } from '../../../../shared/components/UberMapView';
import { useDriver } from '../context/DriverContext';
import { MobileApiClient } from '../../../../shared/services/api';
import { FleetSyncService } from '../../../../shared/services/fleetSync';
import { ForegroundTrackingService } from '../services/ForegroundTrackingService';
import { formatCurrency, formatDistance } from '../../../../shared/utils/formatters';
import {
  Navigation,
  Phone,
  CheckCircle2,
  MapPin,
  Clock,
  Car,
  KeyRound,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Check,
  ChevronRight,
  Calendar,
  ShieldCheck,
  QrCode,
  Banknote,
} from 'lucide-react-native';

export const TripExecutionScreen = ({ navigation }: any) => {
  const { activeTrip, setActiveTrip, refreshEarnings } = useDriver();
  const { colors, isDark } = useTheme();

  // Stages: 'NAVIGATE' -> 'ARRIVED' -> 'START_OTP' -> 'IN_TRANSIT' -> 'COMPLETE'
  const [tripStage, setTripStage] = useState<'NAVIGATE' | 'ARRIVED' | 'START_OTP' | 'IN_TRANSIT' | 'COMPLETED'>('NAVIGATE');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let sub: any = null;
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const initial = await Location.getLastKnownPositionAsync().catch(() => null);
        if (initial && isMounted) {
          const { latitude, longitude, heading, speed } = initial.coords;
          setDriverCoords({ lat: latitude, lng: longitude });
          ForegroundTrackingService.broadcastCoordinates(latitude, longitude, heading || 0, speed || 0);
        }

        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
          (loc) => {
            if (!isMounted) return;
            const { latitude, longitude, heading, speed } = loc.coords;
            setDriverCoords({ lat: latitude, lng: longitude });
            ForegroundTrackingService.broadcastCoordinates(latitude, longitude, heading || 0, speed || 0);
          }
        );
      } catch (e) {
        console.warn('[TripExecution] Location watcher notice:', e);
      }
    })();

    return () => {
      isMounted = false;
      if (sub) sub.remove();
    };
  }, []);

  if (!activeTrip) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>No Active Trip Selected</Text>
        <TouchableOpacity style={{ marginTop: 20, padding: 12, backgroundColor: colors.primary, borderRadius: 10 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Return to Console</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const totalFare = activeTrip.fareBreakdown?.totalFare || (activeTrip as any).totalFare || 2199;
  const is100PercentPaidOnline = 
    activeTrip.paymentMethod === 'full_online_razorpay' || 
    activeTrip.paymentMethod === 'full_prepaid' || 
    activeTrip.paymentStatus === 'paid' || 
    activeTrip.paymentStatus === 'completed';

  const is15PercentAdvancePaid = 
    activeTrip.paymentMethod === 'advance_15_razorpay' || 
    activeTrip.paymentMethod === 'advance_token' || 
    activeTrip.paymentStatus === 'partially_paid' ||
    Boolean(activeTrip.advancePaid && activeTrip.advancePaid > 0);

  const advancePaid = activeTrip.advancePaid || (is15PercentAdvancePaid ? Math.max(Math.round(totalFare * 0.15), 199) : 0);
  const balanceToCollect = is100PercentPaidOnline ? 0 : (activeTrip.balanceDue !== undefined ? activeTrip.balanceDue : (totalFare - advancePaid));

  const [collectMode, setCollectMode] = useState<'options' | 'qr_code'>('options');
  const [qrBase64, setQrBase64] = useState<string>('');

  useEffect(() => {
    if (balanceToCollect > 0 && activeTrip) {
      const upiUri = `upi://pay?pa=8002141816@ybl&pn=OneWayTaxiBihar&am=${balanceToCollect}&cu=INR&tn=Balance_${activeTrip.referenceNumber}`;
      QRCode.toDataURL(upiUri, { width: 220, margin: 1 })
        .then((url: string) => {
          setQrBase64(url);
        })
        .catch(() => {});
    }
  }, [balanceToCollect, activeTrip?.referenceNumber]);

  const handleLaunchNavigation = async () => {
    try {
      const isEnRouteToDrop = tripStage === 'IN_TRANSIT';
      const rawDest = isEnRouteToDrop
        ? `${activeTrip.dropAddress}, ${activeTrip.dropCity}, Bihar`
        : `${activeTrip.pickupAddress}, ${activeTrip.pickupCity}, Bihar`;
      const encodedDest = encodeURIComponent(rawDest);

      // Try native Android Turn-by-Turn Navigation intent first
      const nativeUri = `google.navigation:q=${encodedDest}&mode=d`;
      const canOpenNative = await Linking.canOpenURL(nativeUri);
      if (canOpenNative) {
        await Linking.openURL(nativeUri);
      } else {
        await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodedDest}`);
      }
    } catch (e) {
      const target = tripStage === 'IN_TRANSIT' ? activeTrip.dropCity : activeTrip.pickupCity;
      Alert.alert('Turn-by-Turn Navigation', `Destination set to: ${target}`);
    }
  };

  const handleCallPassenger = () => {
    try {
      Linking.openURL(`tel:${activeTrip.passengerPhone}`);
    } catch (e) {
      Alert.alert('Passenger Contact', `Phone: +91 ${activeTrip.passengerPhone}`);
    }
  };

  const handleCallSos = () => {
    Alert.alert('Emergency Dispatch SOS', 'Connect to Bihar Police & Emergency Helpline (112)?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call 112 SOS', style: 'destructive', onPress: () => Linking.openURL('tel:112') }
    ]);
  };

  const handleMarkArrived = () => {
    setTripStage('START_OTP');
    FleetSyncService.updateTripStatus(activeTrip.referenceNumber, 'arrived');
    Alert.alert('Doorstep Arrival Logged', 'Passenger has been notified that your taxi is waiting outside.');
  };

  const handleStartTripWithOtp = () => {
    const validOtps = [activeTrip.startOtp].filter(Boolean);
    if (!enteredOtp.trim()) {
      Alert.alert('OTP Required', 'Please enter the 4-digit Ride Start OTP provided by the passenger.');
      return;
    }

    if (!validOtps.includes(enteredOtp.trim())) {
      Alert.alert('Invalid OTP', 'The OTP entered does not match the passenger ride security code.');
      return;
    }

    setTripStage('IN_TRANSIT');
    FleetSyncService.updateTripStatus(activeTrip.referenceNumber, 'started');
    Alert.alert('Trip Started!', 'Drive safely. Passenger OTP verified. Navigation active to destination.');
  };

  const handleCompleteTrip = () => {
    setShowCollectModal(true);
  };

  const handleConfirmCollectionAndFinish = async () => {
    setLoading(true);
    try {
      setShowCollectModal(false);
      await FleetSyncService.updateTripStatus(activeTrip.referenceNumber, 'completed');
      await refreshEarnings();
      Alert.alert('Trip Completed!', `Fare collection confirmed. Net payout added to your daily wallet ledger.`, [
        {
          text: 'Return to Console',
          onPress: () => {
            setActiveTrip(null);
            navigation.replace('DriverTabs');
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Banner */}
      <View style={[styles.topHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerRef, { color: colors.primary }]}>{activeTrip.referenceNumber}</Text>
          <Text style={[styles.headerRoute, { color: colors.text }]}>
            {activeTrip.pickupCity} → {activeTrip.dropCity}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <Calendar size={12} color={colors.gold} />
            <Text style={{ fontSize: 11, color: colors.gold, fontWeight: '700' }}>
              {activeTrip.pickupDate || 'Today'} • {activeTrip.pickupTime || '10:00 AM'}
            </Text>
          </View>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity style={[styles.sosBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]} onPress={handleCallSos}>
            <ShieldAlert size={18} color={colors.danger} />
            <Text style={[styles.sosText, { color: colors.danger }]}>SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.callRiderBtn, { backgroundColor: colors.primary }]} onPress={handleCallPassenger}>
            <Phone size={16} color="#FFFFFF" />
            <Text style={styles.callRiderText}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Real-time Highway Route & Turn-by-Turn Map */}
        <View style={[styles.mapContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.mapHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Navigation size={14} color={colors.primary} />
              <Text style={[styles.mapHeaderTitle, { color: colors.text }]}>
                {tripStage === 'NAVIGATE'
                  ? `ROUTE TO PICKUP • ${activeTrip.pickupCity}`
                  : `HIGHWAY CORRIDOR • ${activeTrip.pickupCity} → ${activeTrip.dropCity}`}
              </Text>
            </View>
            <View style={[styles.stageBadge, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
              <Text style={[styles.stageBadgeText, { color: colors.primary }]}>
                {tripStage === 'NAVIGATE' ? 'NAVIGATE' : tripStage === 'IN_TRANSIT' ? 'IN TRANSIT' : 'DOORSTEP'}
              </Text>
            </View>
          </View>
          <View style={styles.mapWrapper}>
            <UberMapView
              originCity={tripStage === 'NAVIGATE' ? (activeTrip.pickupCity || 'Patna') : activeTrip.pickupCity}
              destinationCity={tripStage === 'NAVIGATE' ? '' : activeTrip.dropCity}
              liveUserLocation={driverCoords ? { lat: driverCoords.lat, lng: driverCoords.lng } : undefined}
              height={230}
              interactive={true}
            />
          </View>
        </View>

        {/* State Machine Status Card */}
        <View style={[styles.stateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.stateIndicator}>
            <View style={[styles.stateDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.stateTitle, { color: colors.primary }]}>
              {tripStage === 'NAVIGATE' && 'STAGE 1: NAVIGATING TO DOORSTEP PICKUP'}
              {tripStage === 'ARRIVED' && 'STAGE 2: ARRIVED AT PICKUP LOCATION'}
              {tripStage === 'START_OTP' && 'STAGE 3: VERIFY PASSENGER START OTP'}
              {tripStage === 'IN_TRANSIT' && 'STAGE 4: OUTSTATION TRIP IN PROGRESS'}
              {tripStage === 'COMPLETED' && 'TRIP COMPLETED'}
            </Text>
          </View>

          {tripStage === 'NAVIGATE' && (
            <View style={styles.stageBody}>
              <Text style={[styles.addressLabel, { color: colors.textMuted }]}>DOORSTEP PICKUP ADDRESS</Text>
              <Text style={[styles.addressText, { color: colors.text }]}>{activeTrip.pickupAddress}</Text>
              <Text style={[styles.passengerInfo, { color: colors.textSecondary }]}>
                Rider: {activeTrip.passengerName} (+91 {activeTrip.passengerPhone})
              </Text>

              <View style={{ backgroundColor: 'rgba(5, 150, 105, 0.12)', borderWidth: 1, borderColor: colors.primary, padding: 10, borderRadius: 10, marginVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
                  Required Pickup: <Text style={{ color: colors.primary, fontWeight: '800' }}>{activeTrip.pickupDate || 'Today'} • {activeTrip.pickupTime || '10:00 AM'}</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.largeActionBtn, { backgroundColor: colors.primary }]}
                onPress={handleLaunchNavigation}
              >
                <Navigation size={22} color="#FFFFFF" />
                <Text style={styles.largeActionText}>Launch Google Maps GPS Navigation</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionBtn, { borderColor: colors.primary }]}
                onPress={handleMarkArrived}
              >
                <CheckCircle2 size={18} color={colors.primary} />
                <Text style={[styles.secondaryActionText, { color: colors.primary }]}>Mark Arrived at Doorstep</Text>
              </TouchableOpacity>
            </View>
          )}

          {tripStage === 'START_OTP' && (
            <View style={styles.stageBody}>
              <Text style={[styles.stagePrompt, { color: colors.text }]}>Enter Passenger 4-Digit Ride Start OTP</Text>
              <Text style={[styles.stagePromptSub, { color: colors.textSecondary }]}>
                Ask rider {activeTrip.passengerName} for their 4-digit ride start security code.
              </Text>

              <View style={[styles.otpBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <KeyRound size={20} color={colors.gold} />
                <TextInput
                  style={[styles.otpInput, { color: colors.text }]}
                  placeholder="Enter 4-Digit OTP"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={enteredOtp}
                  onChangeText={setEnteredOtp}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.autofillBtn, { borderColor: colors.primary }]}
                onPress={() => setEnteredOtp(activeTrip.startOtp || '4921')}
              >
                <Text style={[styles.autofillText, { color: colors.primary }]}>
                  Autofill Passenger OTP ({activeTrip.startOtp || '4921'})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.largeActionBtn, { backgroundColor: colors.primary }]}
                onPress={handleStartTripWithOtp}
              >
                <Check size={22} color="#FFFFFF" />
                <Text style={styles.largeActionText}>Verify OTP & Start Trip</Text>
              </TouchableOpacity>
            </View>
          )}

          {tripStage === 'IN_TRANSIT' && (
            <View style={styles.stageBody}>
              <Text style={[styles.addressLabel, { color: colors.textMuted }]}>DESTINATION DROP POINT</Text>
              <Text style={[styles.addressText, { color: colors.text }]}>{activeTrip.dropAddress}, {activeTrip.dropCity}</Text>
              
              <View style={[styles.tripInfoBox, { backgroundColor: colors.surfaceElevated }]}>
                <View style={styles.tripInfoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Distance</Text>
                  <Text style={[styles.infoVal, { color: colors.text }]}>{formatDistance(activeTrip.fareBreakdown.distanceKm)}</Text>
                </View>
                <View style={styles.tripInfoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Collect from Rider</Text>
                  <Text style={[styles.infoVal, { color: colors.gold }]}>{formatCurrency(activeTrip.fareBreakdown.totalFare)}</Text>
                </View>
                <View style={styles.tripInfoItem}>
                  <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Net Driver Cut</Text>
                  <Text style={[styles.infoVal, { color: colors.primary }]}>{formatCurrency(Math.round(activeTrip.fareBreakdown.totalFare * 0.85))}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.largeActionBtn, { backgroundColor: colors.primary }]}
                onPress={handleCompleteTrip}
              >
                <CheckCircle2 size={22} color="#FFFFFF" />
                <Text style={styles.largeActionText}>Arrived at Destination • Complete Trip</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>

        {/* Passenger Information Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Passenger Booking & Payment Ledger</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.dLabel, { color: colors.textMuted }]}>Customer Name:</Text>
            <Text style={[styles.dVal, { color: colors.text }]}>{activeTrip.passengerName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.dLabel, { color: colors.textMuted }]}>Payment Method:</Text>
            <Text style={[styles.dVal, { color: is100PercentPaidOnline ? '#059669' : colors.gold, fontWeight: '800' }]}>
              {is100PercentPaidOnline
                ? '100% Paid Online (Razorpay)'
                : is15PercentAdvancePaid
                ? '15% Advance Paid Online'
                : 'Cash / UPI to Chauffeur'}
            </Text>
          </View>

          {is15PercentAdvancePaid && !is100PercentPaidOnline && (
            <View style={styles.detailRow}>
              <Text style={[styles.dLabel, { color: colors.textMuted }]}>15% Advance Received:</Text>
              <Text style={[styles.dVal, { color: '#059669', fontWeight: '800' }]}>
                {formatCurrency(advancePaid)}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={[styles.dLabel, { color: colors.textMuted }]}>Balance to Collect at Drop:</Text>
            <Text style={[styles.dVal, { color: is100PercentPaidOnline ? '#059669' : colors.primary, fontWeight: '900', fontSize: 15 }]}>
              {is100PercentPaidOnline ? '₹0 (Fully Paid Online)' : formatCurrency(balanceToCollect)}
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Collect Fare Modal */}
      <Modal visible={showCollectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          {is100PercentPaidOnline ? (
            /* 100% Paid Online Modal */
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.onlinePaidIconCircle}>
                <ShieldCheck size={48} color="#059669" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Ride 100% Paid Online</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Passenger {activeTrip.passengerName} has already paid the entire trip fare ({formatCurrency(totalFare)}) via Razorpay.
              </Text>

              <View style={[styles.collectBoxZero, { backgroundColor: '#ECFDF5', borderColor: '#059669' }]}>
                <Text style={styles.collectZeroLabel}>DO NOT COLLECT CASH</Text>
                <Text style={styles.collectZeroAmount}>₹0 CASH TO COLLECT</Text>
                <Text style={styles.collectZeroSub}>Full ride cashless transaction verified</Text>
              </View>

              {activeTrip.paymentTxnId && (
                <View style={styles.driverTxnRefRow}>
                  <Text style={[styles.driverTxnRefLabel, { color: colors.textMuted }]}>Txn ID:</Text>
                  <Text style={[styles.driverTxnRefVal, { color: colors.text }]}>{activeTrip.paymentTxnId}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.confirmCollectBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirmCollectionAndFinish}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmCollectText}>Confirm & Finish Trip (₹0 Cash)</Text>
              </TouchableOpacity>
            </View>
          ) : collectMode === 'qr_code' ? (
            /* Dynamic Chauffeur UPI QR Modal */
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Scan & Pay 85% Balance</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Ask passenger to scan using PhonePe, Google Pay, or Paytm
              </Text>

              <View style={styles.qrWrapper}>
                {qrBase64 ? (
                  <Image source={{ uri: qrBase64 }} style={{ width: 200, height: 200, borderRadius: 12 }} />
                ) : (
                  <Text style={{ color: colors.textMuted }}>Generating UPI QR...</Text>
                )}
                <Text style={styles.qrAmountText}>{formatCurrency(balanceToCollect)}</Text>
                <Text style={styles.qrUpiText}>UPI ID: 8002141816@ybl</Text>
              </View>

              <TouchableOpacity
                style={[styles.confirmCollectBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirmCollectionAndFinish}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={18} color="#FFFFFF" />
                <Text style={styles.confirmCollectText}>Passenger Paid via UPI • Settle Trip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToOptionsBtn}
                onPress={() => setCollectMode('options')}
                activeOpacity={0.8}
              >
                <Text style={[styles.backToOptionsText, { color: colors.textSecondary }]}>← Back to Cash Collection</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Collect 85% Balance with Dual Option: Dynamic UPI QR or Cash */
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <CheckCircle2 size={40} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Collect Remaining 85% Balance</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                15% advance ({formatCurrency(advancePaid)}) was paid online. Please collect remaining balance from {activeTrip.passengerName}.
              </Text>

              <View style={[styles.collectBox, { backgroundColor: 'rgba(5, 150, 105, 0.15)', borderColor: colors.primary }]}>
                <Text style={[styles.collectLabel, { color: colors.primary }]}>REMAINING BALANCE TO COLLECT</Text>
                <Text style={[styles.collectAmount, { color: colors.text }]}>
                  {formatCurrency(balanceToCollect)}
                </Text>
              </View>

              <View style={{ gap: 10, width: '100%', marginTop: 8 }}>
                <TouchableOpacity
                  style={styles.qrOptionBtn}
                  onPress={() => setCollectMode('qr_code')}
                  activeOpacity={0.85}
                >
                  <QrCode size={18} color="#059669" />
                  <Text style={styles.qrOptionText}>📱 Show Passenger Dynamic UPI QR ({formatCurrency(balanceToCollect)})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmCollectBtn, { backgroundColor: colors.primary }]}
                  onPress={handleConfirmCollectionAndFinish}
                  activeOpacity={0.85}
                >
                  <Banknote size={18} color="#FFFFFF" />
                  <Text style={styles.confirmCollectText}>💵 Cash Received ({formatCurrency(balanceToCollect)}) • Settle</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerRef: {
    fontSize: 12,
    fontWeight: '800',
  },
  headerRoute: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sosText: {
    fontSize: 12,
    fontWeight: '900',
  },
  callRiderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  callRiderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  mapContainer: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mapHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stageBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mapWrapper: {
    width: '100%',
    height: 230,
    overflow: 'hidden',
    borderRadius: 12,
  },
  stateCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
  },
  stateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  stateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stateTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stageBody: {
    gap: 12,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  passengerInfo: {
    fontSize: 13,
    marginTop: 2,
  },
  largeActionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginTop: 8,
  },
  largeActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  stagePrompt: {
    fontSize: 18,
    fontWeight: '800',
  },
  stagePromptSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  otpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
    marginVertical: 4,
  },
  otpInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
  },
  autofillBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    marginVertical: 4,
  },
  autofillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tripInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  tripInfoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dLabel: {
    fontSize: 13,
  },
  dVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  collectBox: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    marginVertical: 8,
  },
  collectLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  collectAmount: {
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  confirmCollectBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  confirmCollectText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  onlinePaidIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  collectBoxZero: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    marginVertical: 8,
  },
  collectZeroLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 0.8,
  },
  collectZeroAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#065F46',
    marginTop: 4,
  },
  collectZeroSub: {
    fontSize: 11,
    color: '#059669',
    marginTop: 3,
  },
  driverTxnRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  driverTxnRefLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  driverTxnRefVal: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  qrOptionBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#059669',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  qrOptionText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '800',
  },
  qrWrapper: {
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 8,
  },
  qrAmountText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 10,
  },
  qrUpiText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  backToOptionsBtn: {
    paddingVertical: 8,
  },
  backToOptionsText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
