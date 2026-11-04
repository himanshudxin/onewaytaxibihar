import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { AppUpdaterModal } from '../../../../shared/components/AppUpdaterModal';
import { useDriver } from '../context/DriverContext';
import { FleetSyncService } from '../../../../shared/services/fleetSync';
import { ForegroundTrackingService } from '../services/ForegroundTrackingService';
import { formatCurrency, formatDistance } from '../../../../shared/utils/formatters';
import {
  Power,
  Navigation,
  DollarSign,
  TrendingUp,
  MapPin,
  Clock,
  Car,
  Bell,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Radio
} from 'lucide-react-native';
import { useDispatchOffers } from '../hooks/useDispatchOffers';

export const DriverHomeScreen = ({ navigation }: any) => {
  const {
    driver,
    isDutyOnline,
    toggleDuty,
    activeOffer,
    setActiveOffer,
    activeTrip,
    earnings
  } = useDriver();
  const { colors, isDark } = useTheme();
  const [showBatteryModal, setShowBatteryModal] = useState(false);

  // Broadcast offers polling
  const { offers: broadcastOffers, claimOffer, rejectOffer } = useDispatchOffers(isDutyOnline);

  const handleToggleDuty = async (val: boolean) => {
    toggleDuty(val);
    if (val) {
      const reviewed = await ForegroundTrackingService.hasReviewedBatteryGuide();
      if (!reviewed) {
        setShowBatteryModal(true);
      }
    }
  };

  const handleDismissBatteryModal = async () => {
    await ForegroundTrackingService.setBatteryGuideDismissed();
    setShowBatteryModal(false);
  };

  const handleOpenOffer = () => {
    if (activeOffer) {
      navigation.navigate('TripOfferModal');
      return;
    }
    // Check for real unassigned bookings from FleetSyncService / MongoDB
    const allBookings = FleetSyncService.getBookings();
    const pendingBooking = allBookings.find((b: any) => 
      !b.assignedDriverId && 
      !['completed', 'cancelled'].includes((b.status || '').toLowerCase())
    );

    if (pendingBooking) {
      const fare = Number(pendingBooking.fareBreakdown?.totalFare || 2198);
      const estEarnings = Math.round(fare * 0.85);
      setActiveOffer({
        id: `offer_${pendingBooking.id || pendingBooking.referenceNumber}`,
        bookingReference: pendingBooking.referenceNumber,
        pickupCity: pendingBooking.pickupCity,
        pickupAddress: pendingBooking.pickupAddress || `${pendingBooking.pickupCity} Doorstep`,
        dropCity: pendingBooking.dropCity,
        dropAddress: pendingBooking.dropAddress || `${pendingBooking.dropCity} Main Chowk`,
        distanceKm: pendingBooking.fareBreakdown?.distanceKm || 104,
        pickupDate: pendingBooking.pickupDate || 'Today',
        pickupTime: pendingBooking.pickupTime || 'Immediate',
        cabTier: pendingBooking.cabTier || 'sedan',
        cabName: pendingBooking.cabName || 'Prime Sedan',
        passengerName: pendingBooking.passengerName || 'Passenger',
        passengerPhone: pendingBooking.passengerPhone || '6206494214',
        estimatedEarnings: estEarnings,
        totalFare: fare,
        collectFromPassenger: fare,
        expiresInSeconds: 30,
        receivedAt: new Date().toISOString()
      });
      navigation.navigate('TripOfferModal');
    } else {
      Alert.alert('No Pending Dispatches', 'There are no unassigned outstation trips right now. When a rider books on the Passenger app or website, your phone will chime immediately with the dispatch offer.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Console Bar with Website Brand Logo */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <BrandLogo size="header" showSubtitle subtitleText="Chauffeur Partner Fleet" />

        {/* Online / Offline Switch */}
        <View style={styles.dutySwitchContainer}>
          <Text style={[styles.dutyLabel, { color: isDutyOnline ? colors.primary : colors.textMuted }]}>
            {isDutyOnline ? 'ON DUTY' : 'OFF DUTY'}
          </Text>
          <Switch
            value={isDutyOnline}
            onValueChange={handleToggleDuty}
            trackColor={{ false: colors.surfaceHighlight, true: 'rgba(5, 150, 105, 0.5)' }}
            thumbColor={isDutyOnline ? colors.primary : '#9CA3AF'}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Broadcast Offers Live Feed */}
        {broadcastOffers.length > 0 && (
          <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Radio size={16} color={'#F59E0B'} />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#F59E0B' }}>
                LIVE BROADCAST — {broadcastOffers.length} TRIP{broadcastOffers.length > 1 ? 'S' : ''} AVAILABLE
              </Text>
            </View>
            {broadcastOffers.slice(0, 3).map((offer) => (
              <View
                key={offer.bookingId}
                style={[{ borderRadius: 14, borderWidth: 1.5, borderColor: '#F59E0B', backgroundColor: colors.surface, marginBottom: 10, overflow: 'hidden' }]}
              >
                {/* Pickup DateTime — HIGH VISIBILITY */}
                <View style={{ backgroundColor: 'rgba(239,68,68,0.12)', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#EF4444', letterSpacing: 0.8 }}>📅 PICKUP:</Text>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#EF4444', flex: 1 }}>{offer.pickupDateTimeFormatted}</Text>
                </View>
                <View style={{ padding: 12 }}>
                  {/* Route */}
                  <Text style={{ fontSize: 17, fontWeight: '900', color: colors.text, marginBottom: 4 }}>
                    {offer.originCity} → {offer.destCity}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }} numberOfLines={1}>
                    📍 {offer.pickupLocation}  🏁 {offer.dropLocation}
                  </Text>
                  {/* Fare Row */}
                  <View style={{ flexDirection: 'row', gap: 16, marginBottom: 10 }}>
                    <View>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 }}>TOTAL FARE</Text>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>₹{offer.totalFare}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 }}>YOUR EARNINGS</Text>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: colors.primary }}>₹{offer.driverNetEarnings}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 6, alignSelf: 'flex-end' }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#F59E0B' }}>{String(offer.cabTier).toUpperCase()}</Text>
                    </View>
                  </View>
                  {/* Action Row */}
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => rejectOffer(offer.bookingId)}
                      style={{ flex: 1, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: colors.danger, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}
                      activeOpacity={0.8}
                    >
                      <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '800' }}>Skip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        const res = await claimOffer(offer.bookingId);
                        if (res.alreadyClaimed) {
                          Alert.alert('Claimed!', 'Trip accepted by another driver.');
                        } else if (res.success) {
                          Alert.alert('🎉 Claimed!', 'You successfully claimed the trip!');
                        } else {
                          Alert.alert('Error', res.message || 'Try again.');
                        }
                      }}
                      style={{ flex: 2, paddingVertical: 11, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                      activeOpacity={0.85}
                    >
                      <Zap size={16} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>CLAIM TRIP</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

      {/* GPS & Dispatch Status Card */}
        <View
          style={[
            styles.gpsCard,
            {
              backgroundColor: isDutyOnline ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.08)',
              borderColor: isDutyOnline ? 'rgba(5, 150, 105, 0.3)' : 'rgba(239, 68, 68, 0.25)'
            }
          ]}
        >
          <Navigation size={20} color={isDutyOnline ? colors.primary : colors.danger} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={[styles.gpsTitle, { color: colors.text }]}>
                {isDutyOnline ? 'GPS Active • On-Duty' : 'You are currently Offline'}
              </Text>
              {isDutyOnline && (
                <View style={{ backgroundColor: 'rgba(5, 150, 105, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800' }}>FOREGROUND LIVE</Text>
                </View>
              )}
            </View>
            <Text style={[styles.gpsSubtitle, { color: colors.textSecondary }]}>
              {isDutyOnline
                ? 'Telemetry active • Highway Dead-Zone Offline Vault enabled'
                : 'Switch toggle ON above to receive guaranteed bookings'}
            </Text>
          </View>
        </View>

        {/* Today's Earnings KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>TODAY'S NET EARNINGS</Text>
            <Text style={[styles.kpiVal, { color: colors.primary }]}>
              {formatCurrency(earnings?.todayEarnings || 2198)}
            </Text>
            <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>85% Net Payout</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>TRIPS COMPLETED</Text>
            <Text style={[styles.kpiVal, { color: colors.gold }]}>
              {driver?.totalTrips || 38}
            </Text>
            <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>★ 4.88 Rating</Text>
          </View>
        </View>

        {/* Active Assigned Trip Banner */}
        {activeTrip ? (
          <TouchableOpacity
            style={[styles.activeTripCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
            onPress={() => navigation.navigate('TripExecution')}
          >
            <View style={styles.activeTripHeader}>
              <View style={[styles.livePill, { backgroundColor: colors.primary }]}>
                <Text style={styles.livePillText}>RIDE IN PROGRESS</Text>
              </View>
              <Text style={[styles.activeRef, { color: colors.primary }]}>{activeTrip.referenceNumber}</Text>
            </View>

            <Text style={[styles.activeRoute, { color: colors.text }]}>
              {activeTrip.pickupCity} ➔ {activeTrip.dropCity}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 4 }}>
              <Clock size={13} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '800' }}>
                Required: 📅 {activeTrip.pickupDate || 'Today'} • 🕒 {activeTrip.pickupTime || '10:00 AM'}
              </Text>
            </View>
            <Text style={[styles.activeAddress, { color: colors.textSecondary }]} numberOfLines={1}>
              Pickup: {activeTrip.pickupAddress}
            </Text>

            <View style={styles.activeActionRow}>
              <Text style={[styles.activeActionText, { color: colors.primary }]}>
                Open GPS Navigation & Status Console
              </Text>
              <ChevronRight size={18} color={colors.primary} />
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Live Incoming Dispatch Card */}
        {activeOffer ? (
          <View style={[styles.offerBanner, { backgroundColor: colors.surface, borderColor: colors.gold }]}>
            <View style={styles.offerHeader}>
              <View style={[styles.offerBadge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Bell size={16} color={colors.gold} />
                <Text style={[styles.offerBadgeText, { color: colors.gold }]}>NEW INCOMING RIDE OFFER</Text>
              </View>
              <Text style={[styles.offerTimer, { color: colors.danger }]}>Expires in 30s</Text>
            </View>

            <Text style={[styles.offerRoute, { color: colors.text }]}>
              {activeOffer.pickupCity} ➔ {activeOffer.dropCity}
            </Text>
            <View style={{ backgroundColor: 'rgba(5, 150, 105, 0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Clock size={13} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>
                Required: <Text style={{ color: colors.primary, fontWeight: '800' }}>📅 {activeOffer.pickupDate || 'Today'} • 🕒 {activeOffer.pickupTime || '10:00 AM'}</Text>
              </Text>
            </View>
            <Text style={[styles.offerDistance, { color: colors.textMuted }]}>
              {formatDistance(activeOffer.distanceKm)} • {activeOffer.cabName}
            </Text>

            <View style={styles.offerEarningsRow}>
              <View>
                <Text style={[styles.earningsLabel, { color: colors.textMuted }]}>YOUR ESTIMATED NET EARNINGS</Text>
                <Text style={[styles.earningsVal, { color: colors.primary }]}>
                  {formatCurrency(activeOffer.estimatedEarnings)}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.reviewBtn, { backgroundColor: colors.primary }]}
                onPress={handleOpenOffer}
              >
                <Text style={styles.reviewBtnText}>Review & Accept</Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.waitingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Clock size={32} color={colors.textMuted} />
            <Text style={[styles.waitingTitle, { color: colors.text }]}>Waiting for Next Dispatch</Text>
            <Text style={[styles.waitingSubtitle, { color: colors.textSecondary }]}>
              Keep app open and duty ON. When a passenger books a trip, your phone will chime with a 30-second offer.
            </Text>
            <TouchableOpacity
              style={[styles.simulateOfferBtn, { borderColor: colors.primary }]}
              onPress={handleOpenOffer}
              activeOpacity={0.8}
            >
              <Text style={[styles.simulateOfferText, { color: colors.primary }]}>
                ⚡ Check Active Outstation Dispatches
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Driving Safety Notice */}
        <View style={[styles.safetyCard, { backgroundColor: 'rgba(245, 158, 11, 0.08)' }]}>
          <AlertTriangle size={18} color={colors.gold} />
          <Text style={[styles.safetyText, { color: colors.textSecondary }]}>
            <Text style={{ fontWeight: '700', color: colors.text }}>Safety First:</Text> Do not operate this mobile app while steering. Pull over safely before accepting trip assignments.
          </Text>
        </View>

      </ScrollView>

      {/* Commercial Android Battery Optimization Whitelist Modal */}
      <Modal visible={showBatteryModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: 18, padding: 22, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(217, 119, 6, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 24 }}>🔋</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 }}>
              Keep Rides Ringing in Background
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 16 }}>
              Phones from Xiaomi (MIUI/HyperOS), Vivo, Realme, and Samsung kill background cab apps to save power. To ensure you never miss lucrative outstation trips when your phone is locked:
            </Text>
            <View style={{ width: '100%', backgroundColor: colors.surfaceHighlight, borderRadius: 10, padding: 12, marginBottom: 18, gap: 6 }}>
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: '700' }}>1. Open Android Settings ➔ Apps</Text>
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: '700' }}>2. Select "Oneway Taxi Driver"</Text>
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>3. Set Battery Saver to "No Restrictions"</Text>
            </View>
            <TouchableOpacity
              style={{ width: '100%', height: 46, backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
              onPress={handleDismissBatteryModal}
              activeOpacity={0.85}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>Understood & Enabled</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Self-Hosted APK In-App Updater (Play Store Independent) */}
      <AppUpdaterModal app="driver" currentVersion="1.0.0" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  driverTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  vehiclePlate: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  dutySwitchContainer: {
    alignItems: 'center',
    gap: 2,
  },
  dutyLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 14,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  gpsTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  gpsSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  kpiVal: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 11,
  },
  activeTripCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 6,
  },
  activeTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  livePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  livePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  activeRef: {
    fontSize: 13,
    fontWeight: '800',
  },
  activeRoute: {
    fontSize: 17,
    fontWeight: '800',
  },
  activeAddress: {
    fontSize: 12,
  },
  activeActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  offerBanner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  offerTimer: {
    fontSize: 12,
    fontWeight: '800',
  },
  offerRoute: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  offerDistance: {
    fontSize: 12,
  },
  offerEarningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  earningsLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  earningsVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  waitingCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  waitingTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  waitingSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  simulateOfferBtn: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
  },
  simulateOfferText: {
    fontSize: 12,
    fontWeight: '800',
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  safetyText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
