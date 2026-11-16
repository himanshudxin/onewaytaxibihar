import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { UberMapView } from '../../../../shared/components/UberMapView';
import { NotificationService } from '../../../../shared/services/notifications';
import { resolveApiBaseUrl } from '../../../../shared/services/api';
import { useDriver } from '../context/DriverContext';
import { formatCurrency } from '../../../../shared/utils/formatters';
import {
  Bell,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Check,
  X,
  Zap,
  Flag,
  Car,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BroadcastOffer } from '../hooks/useDispatchOffers';

// ─── Props ───────────────────────────────────────────────────────────────────
interface TripOfferModalProps {
  navigation: any;
  route?: {
    params?: {
      offer?: BroadcastOffer;
    };
  };
}

function showToast(msg: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }
}

// ─── Single Offer Card ────────────────────────────────────────────────────────
interface OfferCardProps {
  offer: BroadcastOffer;
  onClaim: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  colors: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer, onClaim, onReject, colors, isExpanded, onToggle }) => {
  const [claiming, setClaiming] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    await onClaim(offer.bookingId);
    setClaiming(false);
  };

  const handleReject = async () => {
    setRejecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await onReject(offer.bookingId);
    setRejecting(false);
  };

  const tripTypeLabel = offer.tripType === 'roundtrip' ? '↩ Round-Trip' : '→ One-Way';
  const tierLabel = String(offer.cabTier || 'Sedan').toUpperCase();

  return (
    <View style={[styles.offerCard, { backgroundColor: colors.surface, borderColor: '#F59E0B' }]}>
      {/* Header Row */}
      <TouchableOpacity onPress={onToggle} activeOpacity={0.85} style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          {/* Broadcast Badge */}
          <View style={[styles.broadcastBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Zap size={12} color="#F59E0B" />
            <Text style={[styles.broadcastBadgeText, { color: '#F59E0B' }]}>BROADCAST</Text>
          </View>
          <Text style={[styles.pnrText, { color: colors.textMuted }]}>{offer.pnr}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.tripTypePill, { backgroundColor: 'rgba(5,150,105,0.12)' }]}>
            <Text style={[styles.tripTypePillText, { color: colors.primary }]}>{tripTypeLabel}</Text>
          </View>
          {isExpanded ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
        </View>
      </TouchableOpacity>

      {/* ── PICKUP DATE / TIME — High Visibility ── */}
      <View style={[styles.pickupBanner, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444' }]}>
        <View style={styles.pickupBannerRow}>
          <Calendar size={18} color="#EF4444" />
          <Text style={styles.pickupBannerLabel}>PICKUP SCHEDULE</Text>
        </View>
        <Text style={styles.pickupDateTime}>{offer.pickupDateTimeFormatted || (offer.pickupDate + (offer.pickupTime ? ' | ' + offer.pickupTime : ''))}</Text>
      </View>

      {/* Route */}
      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.routeLabel, { color: colors.textMuted }]}>PICKUP</Text>
            <Text style={[styles.routeCity, { color: colors.text }]}>{offer.originCity}</Text>
            <Text style={[styles.routeAddr, { color: colors.textSecondary }]} numberOfLines={2}>{offer.pickupLocation}</Text>
          </View>
        </View>
        <View style={[styles.routeLine, { borderColor: colors.border }]} />
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: '#F59E0B' }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.routeLabel, { color: colors.textMuted }]}>DROP</Text>
            <Text style={[styles.routeCity, { color: colors.text }]}>{offer.destCity}</Text>
            <Text style={[styles.routeAddr, { color: colors.textSecondary }]} numberOfLines={2}>{offer.dropLocation}</Text>
          </View>
        </View>
      </View>

      {/* Highway Route Corridor Preview */}
      <View style={[styles.offerMapContainer, { borderColor: colors.border }]}>
        <UberMapView
          originCity={offer.originCity || 'Patna'}
          destinationCity={offer.destCity || 'Gaya'}
          height={140}
          interactive={false}
        />
      </View>

      {/* Fare Breakdown */}
      <View style={[styles.fareRow, { borderTopColor: colors.border }]}>
        <View style={styles.fareItem}>
          <Text style={[styles.fareLabel, { color: colors.textMuted }]}>TOTAL FARE</Text>
          <Text style={[styles.fareValue, { color: colors.text }]}>{formatCurrency(offer.totalFare)}</Text>
        </View>
        <View style={[styles.fareDivider, { backgroundColor: colors.border }]} />
        <View style={styles.fareItem}>
          <Text style={[styles.fareLabel, { color: colors.textMuted }]}>YOUR EARNINGS</Text>
          <Text style={[styles.fareValueGreen, { color: colors.primary }]}>{formatCurrency(offer.driverNetEarnings)}</Text>
        </View>
        <View style={[styles.fareDivider, { backgroundColor: colors.border }]} />
        <View style={styles.fareItem}>
          <Text style={[styles.fareLabel, { color: colors.textMuted }]}>CAB TIER</Text>
          <Text style={[styles.fareValue, { color: '#F59E0B' }]}>{tierLabel}</Text>
        </View>
      </View>

      {/* Expanded Details */}
      {isExpanded && (
        <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
          <View style={styles.expandedRow}>
            <Users size={14} color={colors.textMuted} />
            <Text style={[styles.expandedText, { color: colors.textSecondary }]}>
              Passenger: <Text style={{ color: colors.text, fontWeight: '700' }}>{offer.passengerName || 'Not specified'}</Text>
            </Text>
          </View>
          <View style={styles.expandedRow}>
            <Car size={14} color={colors.textMuted} />
            <Text style={[styles.expandedText, { color: colors.textSecondary }]}>
              Platform commission: <Text style={{ color: colors.text }}>{formatCurrency(offer.platformCommission)}</Text>
            </Text>
          </View>
          {offer.candidateCount > 0 && (
            <View style={[styles.candidateNote, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '700' }}>
                {offer.candidateCount} driver(s) notified — First to claim wins!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.rejectBtn, { borderColor: colors.danger }]}
          onPress={handleReject}
          disabled={rejecting || claiming}
          activeOpacity={0.8}
        >
          {rejecting ? (
            <ActivityIndicator size="small" color={colors.danger} />
          ) : (
            <>
              <X size={18} color={colors.danger} />
              <Text style={[styles.rejectText, { color: colors.danger }]}>Skip</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.claimBtn, { backgroundColor: claiming ? 'rgba(5,150,105,0.6)' : colors.primary }]}
          onPress={handleClaim}
          disabled={claiming || rejecting}
          activeOpacity={0.85}
        >
          {claiming ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.claimText}>CLAIM TRIP</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main TripOfferModal ──────────────────────────────────────────────────────
export const TripOfferModal = ({ navigation, route }: TripOfferModalProps) => {
  const { driver, activeOffer, setActiveOffer, setActiveTrip, isDutyOnline } = useDriver();
  const { colors, isDark } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Legacy single offer support (from DriverContext/FleetSync)
  const legacyOffer = activeOffer;
  const [legacyClaiming, setLegacyClaiming] = useState(false);
  const [legacyTimeLeft, setLegacyTimeLeft] = useState(legacyOffer?.expiresInSeconds || 30);

  // Start alert sound on mount if legacy offer
  useEffect(() => {
    if (legacyOffer) {
      NotificationService.startUrgentDispatchAlert();
    }
    return () => {
      NotificationService.stopUrgentDispatchAlert();
    };
  }, []);

  // Legacy countdown timer
  useEffect(() => {
    if (!legacyOffer) return;
    const timer = setInterval(() => {
      setLegacyTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          NotificationService.stopUrgentDispatchAlert();
          setActiveOffer(null);
          Alert.alert('Offer Expired', 'No driver claimed this trip in time. Re-broadcasting.');
          navigation.goBack();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [legacyOffer]);

  // ── Legacy offer claim ──
  const handleLegacyClaim = async () => {
    if (!legacyOffer) return;
    setLegacyClaiming(true);
    NotificationService.stopUrgentDispatchAlert();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    try {
      const storage = (await import('../../../../shared/services/storage')).StorageService;
      const token = (await storage.getItem('otb_auth_token')) || (await storage.getItem('driver_token'));
      const res = await fetch(`${resolveApiBaseUrl()}/dispatch/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingId: legacyOffer.bookingReference || legacyOffer.id }),
      });
      const data = await res.json();

      if (res.status === 409) {
        Alert.alert('Already Claimed', 'Trip accepted by another driver.');
        setActiveOffer(null);
        navigation.goBack();
        return;
      }

      if (res.ok && data.success) {
        setActiveTrip({
          id: legacyOffer.id,
          referenceNumber: legacyOffer.bookingReference,
          passengerName: legacyOffer.passengerName,
          passengerPhone: legacyOffer.passengerPhone,
          pickupCity: legacyOffer.pickupCity,
          pickupAddress: legacyOffer.pickupAddress,
          dropCity: legacyOffer.dropCity,
          dropAddress: legacyOffer.dropAddress,
          tripType: (legacyOffer.tripType || 'one-way') as any,
          pickupDate: legacyOffer.pickupDate,
          pickupTime: legacyOffer.pickupTime,
          passengerCount: 2,
          cabTier: legacyOffer.cabTier,
          cabName: legacyOffer.cabName,
          fareBreakdown: {
            baseFare: legacyOffer.totalFare,
            distanceKm: legacyOffer.distanceKm,
            durationHours: 3,
            perKmRate: 17,
            driverAllowance: 300,
            tollCharges: 180,
            stateTaxPermit: 0,
            gstAmount: 0,
            nightCharge: 0,
            waitingChargePerMin: 2,
            totalFare: legacyOffer.totalFare,
            advancePayable: 0,
            balancePayableToDriver: legacyOffer.collectFromPassenger,
            currency: 'INR',
          },
          paymentMethod: 'driver_cash',
          paymentStatus: 'pending',
          status: 'started',
          startOtp: '4921',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setActiveOffer(null);
        navigation.replace('TripExecution');
      } else {
        Alert.alert('Error', data.message || 'Failed to claim trip.');
      }
    } catch {
      Alert.alert('Network Error', 'Could not claim trip. Please try again.');
    } finally {
      setLegacyClaiming(false);
    }
  };

  const handleLegacyDecline = () => {
    NotificationService.stopUrgentDispatchAlert();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    fetch(`${resolveApiBaseUrl()}/dispatch/reject-broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: legacyOffer?.bookingReference || legacyOffer?.id, reason: 'DECLINED_BY_DRIVER' }),
    }).catch(() => {});
    setActiveOffer(null);
    navigation.goBack();
  };

  // ── Broadcast offer actions ──
  const handleClaimBroadcast = useCallback(async (bookingId: string) => {
    try {
      const storage = (await import('../../../../shared/services/storage')).StorageService;
      const token = (await storage.getItem('otb_auth_token')) || (await storage.getItem('driver_token'));
      const res = await fetch(`${resolveApiBaseUrl()}/dispatch/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();

      if (res.status === 409) {
        showToast('Trip accepted by another driver.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        return;
      }

      if (res.ok && data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        Alert.alert('Trip Claimed', 'You successfully claimed the trip. Check your Active Trip details.', [
          { text: 'View Trip', onPress: () => navigation.navigate('TripExecution') },
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to claim trip.');
      }
    } catch {
      Alert.alert('Network Error', 'Please try again.');
    }
  }, [navigation]);

  const handleRejectBroadcast = useCallback(async (bookingId: string) => {
    try {
      const storage = (await import('../../../../shared/services/storage')).StorageService;
      const token = (await storage.getItem('otb_auth_token')) || (await storage.getItem('driver_token'));
      await fetch(`${resolveApiBaseUrl()}/dispatch/reject-broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingId, reason: 'Driver skipped' }),
      });
      showToast('Skipped. Trip remains available for other drivers.');
    } catch {
      showToast('Could not skip. Try again.');
    }
  }, []);

  // ── Render: Legacy single offer ──
  if (legacyOffer) {
    const fareStr = formatCurrency(legacyOffer.estimatedEarnings || legacyOffer.totalFare);
    const formattedDate = legacyOffer.pickupDate || 'Today';
    const formattedTime = legacyOffer.pickupTime || '10:00 AM';

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Bell size={20} color="#F59E0B" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Incoming Dispatch</Text>
          <View style={[styles.timerPill, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.timerPillText}>{legacyTimeLeft}s</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Pickup DateTime Banner */}
          <View style={[styles.pickupBanner, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#EF4444' }]}>
            <View style={styles.pickupBannerRow}>
              <Calendar size={18} color="#EF4444" />
              <Text style={styles.pickupBannerLabel}>PICKUP SCHEDULE</Text>
            </View>
            <Text style={styles.pickupDateTime}>{formattedDate} | {formattedTime}</Text>
          </View>

          {/* Earnings */}
          <View style={[styles.earningsCard, { backgroundColor: 'rgba(5,150,105,0.12)', borderColor: colors.primary }]}>
            <Text style={[styles.earningsLabel, { color: colors.primary }]}>YOUR NET EARNINGS</Text>
            <Text style={[styles.earningsAmount, { color: colors.text }]}>{fareStr}</Text>
            <Text style={[styles.collectNote, { color: colors.textSecondary }]}>
              Collect {formatCurrency(legacyOffer.collectFromPassenger || legacyOffer.totalFare)} from passenger at dropoff
            </Text>
          </View>

          {/* Route */}
          <View style={[styles.routeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.routeLabel, { color: colors.textMuted }]}>PICKUP</Text>
                <Text style={[styles.routeCity, { color: colors.text }]}>{legacyOffer.pickupCity}</Text>
                <Text style={[styles.routeAddr, { color: colors.textSecondary }]}>{legacyOffer.pickupAddress}</Text>
              </View>
            </View>
            <View style={[styles.routeLine, { borderColor: colors.border }]} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: '#F59E0B' }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.routeLabel, { color: colors.textMuted }]}>DROP</Text>
                <Text style={[styles.routeCity, { color: colors.text }]}>{legacyOffer.dropCity}</Text>
                <Text style={[styles.routeAddr, { color: colors.textSecondary }]}>{legacyOffer.dropAddress}</Text>
              </View>
            </View>
          </View>

          {/* Highway Route Corridor Preview */}
          <View style={[styles.offerMapContainer, { borderColor: colors.border, marginHorizontal: 0, marginBottom: 14 }]}>
            <UberMapView
              originCity={legacyOffer.pickupCity || 'Patna'}
              destinationCity={legacyOffer.dropCity || 'Gaya'}
              height={160}
              interactive={false}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.rejectBtn, { borderColor: colors.danger }]} onPress={handleLegacyDecline}>
              <X size={18} color={colors.danger} />
              <Text style={[styles.rejectText, { color: colors.danger }]}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.claimBtn, { backgroundColor: legacyClaiming ? 'rgba(5,150,105,0.6)' : colors.primary }]}
              onPress={handleLegacyClaim}
              disabled={legacyClaiming}
            >
              {legacyClaiming ? <ActivityIndicator size="small" color="#fff" /> : (
                <>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.claimText}>CLAIM TRIP</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Render: No active offer ──
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Bell size={40} color={colors.textMuted} />
      <Text style={[styles.noOfferText, { color: colors.text }]}>No Active Dispatch Offers</Text>
      <Text style={[styles.noOfferSub, { color: colors.textSecondary }]}>
        Go online and stay on duty to receive broadcast trip offers.
      </Text>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>Back to Duty Console</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '800' },
  timerPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timerPillText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  scrollContent: { padding: 16, gap: 14 },

  // Broadcast offer card
  offerCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  broadcastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  broadcastBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  pnrText: { fontSize: 11, fontWeight: '700' },
  tripTypePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tripTypePillText: { fontSize: 10, fontWeight: '800' },

  // High-visibility pickup banner
  pickupBanner: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  pickupBannerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pickupBannerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pickupDateTime: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 0.5,
  },

  // Route
  routeContainer: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  routeCard: { padding: 14, borderRadius: 16, borderWidth: 1, gap: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  routeLine: { height: 1, borderWidth: StyleSheet.hairlineWidth, marginLeft: 6, marginVertical: 2 },
  routeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  routeCity: { fontSize: 16, fontWeight: '800', marginTop: 1 },
  routeAddr: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  offerMapContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 12,
    marginBottom: 8,
  },

  // Fare row
  fareRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    justifyContent: 'space-around',
  },
  fareItem: { alignItems: 'center', flex: 1 },
  fareLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  fareValue: { fontSize: 15, fontWeight: '800' },
  fareValueGreen: { fontSize: 15, fontWeight: '900' },
  fareDivider: { width: 1, marginVertical: 2 },

  // Expanded section
  expandedSection: { paddingHorizontal: 12, paddingBottom: 12, paddingTop: 10, borderTopWidth: 1, gap: 6 },
  expandedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expandedText: { fontSize: 12 },
  candidateNote: { padding: 8, borderRadius: 8, marginTop: 4 },

  // Action row
  actionRow: { flexDirection: 'row', gap: 12, padding: 12 },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  rejectText: { fontSize: 14, fontWeight: '800' },
  claimBtn: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  claimText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },

  // Legacy earnings
  earningsCard: { padding: 16, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', gap: 4 },
  earningsLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  earningsAmount: { fontSize: 34, fontWeight: '900' },
  collectNote: { fontSize: 12, textAlign: 'center' },

  // No offer
  noOfferText: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  noOfferSub: { fontSize: 13, textAlign: 'center', marginTop: 8, marginHorizontal: 32, lineHeight: 20 },
  backBtn: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
