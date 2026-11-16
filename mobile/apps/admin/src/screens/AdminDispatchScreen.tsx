import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Navigation,
  Car,
  CheckCircle2,
  Send,
  Calendar,
  AlertTriangle,
  RefreshCw
} from 'lucide-react-native';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { UberMapView } from '../../../../shared/components/UberMapView';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { useAdmin } from '../context/AdminContext';

export const AdminDispatchScreen: React.FC<{ navigation: any }> = () => {
  const { bookings, drivers, assignDriver, refreshData, isLoading } = useAdmin();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const { colors, isDark } = useTheme();

  // Pending bookings awaiting driver assignment
  const unassignedBookings = (bookings || []).filter(b => {
    const status = (b.bookingStatus || b.status || 'CONFIRMED').toUpperCase();
    return !b.assignedDriverId && !b.driverAssigned && !status.includes('CANCEL') && !status.includes('COMPLETE');
  });

  // On-duty drivers available for assignment
  const availableDrivers = (drivers || []).filter(d => {
    return d.isVerified || (d.status || '').toLowerCase() === 'approved';
  });

  // Selected booking for live highway route inspection
  const selectedBooking = unassignedBookings.find(x => (x.bookingId || x.id) === selectedBookingId);

  const handleExecuteDispatch = async () => {
    if (!selectedBookingId || !selectedDriverId) {
      Alert.alert('Selection Required', 'Please select one pending booking and one driver partner to dispatch.');
      return;
    }

    const b = unassignedBookings.find(x => (x.bookingId || x.id) === selectedBookingId);
    const d = availableDrivers.find(x => x.id === selectedDriverId);

    setIsDispatching(true);
    try {
      const ok = await assignDriver(selectedBookingId, selectedDriverId, true);
      if (ok) {
        Alert.alert(
          'Dispatch Dispatched!',
          `Booking ${selectedBookingId} (${b?.originCity || 'Patna'} → ${b?.destCity || 'Bihar'}) successfully allotted to Chauffeur ${d?.name || 'Driver'}. Push notification sent!`
        );
        setSelectedBookingId(null);
        setSelectedDriverId(null);
      }
    } catch (e: any) {
      Alert.alert('Dispatch Failure', e.message || 'Failed to dispatch driver.');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>CENTRAL DISPATCH HUB</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Match unassigned intercity rides with verified on-duty fleet
          </Text>
        </View>
        <TouchableOpacity style={[styles.refreshBtn, { borderColor: colors.border }]} onPress={refreshData}>
          <RefreshCw size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Select Booking */}
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.stepNumber, { backgroundColor: colors.primary }]}>1</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            SELECT UNASSIGNED BOOKING ({unassignedBookings.length})
          </Text>
        </View>

        {unassignedBookings.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <CheckCircle2 size={24} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>All Bookings Dispatched</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              There are currently zero pending trips waiting for driver allocation.
            </Text>
          </View>
        ) : (
          unassignedBookings.map(b => {
            const bId = b.bookingId || b.id;
            const isSelected = selectedBookingId === bId;
            const routeStr = `${b.originCity || b.pickupCity || 'Patna'} → ${b.destCity || b.dropCity || 'Bihar'}`;
            const fare = Number(b.totalFare || b.price || b.estimatedFare) || 0;

            return (
              <TouchableOpacity
                key={bId}
                style={[
                  styles.selectCard,
                  { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border },
                  isSelected && { borderWidth: 2, backgroundColor: 'rgba(5, 150, 105, 0.08)' }
                ]}
                onPress={() => setSelectedBookingId(isSelected ? null : bId)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.bIdText, { color: isSelected ? colors.primary : colors.textSecondary }]}>
                    {bId}
                  </Text>
                  <Text style={[styles.tierBadge, { backgroundColor: colors.surfaceElevated, color: colors.textSecondary }]}>
                    {b.fleetClass || b.cabTier || 'Prime Sedan'}
                  </Text>
                </View>

                <Text style={[styles.routeTitle, { color: colors.text }]}>{routeStr}</Text>

                <View style={styles.cardBottom}>
                  <View style={styles.dateRow}>
                    <Calendar size={12} color={colors.textMuted} />
                    <Text style={[styles.dateText, { color: colors.textMuted }]}>
                      {b.pickupDate || 'Today'} • {b.pickupTime || 'Flexible'}
                    </Text>
                  </View>
                  <Text style={[styles.fareText, { color: colors.primary }]}>{formatCurrency(fare)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Selected Ride Corridor Preview */}
        {selectedBooking && (
          <View style={[styles.routePreviewCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={styles.routePreviewHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Navigation size={14} color={colors.primary} />
                <Text style={[styles.routePreviewTitle, { color: colors.text }]} numberOfLines={1}>
                  ROUTE CORRIDOR: {selectedBooking.originCity || selectedBooking.pickupCity || 'Patna'} → {selectedBooking.destCity || selectedBooking.dropCity || 'Bihar'}
                </Text>
              </View>
              <View style={[styles.farePreviewBadge, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>
                  {formatCurrency(Number(selectedBooking.totalFare || selectedBooking.price || selectedBooking.estimatedFare) || 0)}
                </Text>
              </View>
            </View>
            <View style={styles.mapPreviewWrapper}>
              <UberMapView
                originCity={selectedBooking.originCity || selectedBooking.pickupCity || 'Patna'}
                destinationCity={selectedBooking.destCity || selectedBooking.dropCity || 'Gaya'}
                height={160}
                interactive={false}
              />
            </View>
          </View>
        )}

        {/* Step 2: Select Driver */}
        <View style={[styles.sectionHeadingRow, { marginTop: 24 }]}>
          <Text style={[styles.stepNumber, { backgroundColor: colors.accent }]}>2</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            SELECT CHAUFFEUR PARTNER ({availableDrivers.length})
          </Text>
        </View>

        {availableDrivers.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <AlertTriangle size={24} color={colors.warning} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Approved Fleet Available</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Verify registered driver applications in the Fleet tab to make them available for dispatch.
            </Text>
          </View>
        ) : (
          availableDrivers.map(d => {
            const isSelected = selectedDriverId === d.id;
            const isOnDuty = d.dutyStatus === 'ON_DUTY' || d.isAvailable;

            return (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.selectCard,
                  { backgroundColor: colors.surface, borderColor: isSelected ? colors.accent : colors.border },
                  isSelected && { borderWidth: 2, backgroundColor: 'rgba(56, 189, 248, 0.08)' }
                ]}
                onPress={() => setSelectedDriverId(isSelected ? null : d.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.bIdText, { color: isSelected ? colors.accent : colors.text }]}>
                    {d.name || 'Driver Partner'}
                  </Text>
                  <Text style={[styles.dutyTag, { color: isOnDuty ? colors.primary : colors.textMuted }]}>
                    {isOnDuty ? '● ON DUTY' : '○ AVAILABLE'}
                  </Text>
                </View>

                <Text style={[styles.carInfo, { color: colors.textSecondary }]}>
                  {d.vehicleModel || 'Commercial Cab'} • {d.vehicleNumber || 'BR-01 Plate'}
                </Text>

                <Text style={[styles.phoneInfo, { color: colors.textMuted }]}>
                  Phone: {d.phone || '+91 Chauffeur'}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        {/* Dispatch Action Button */}
        <TouchableOpacity
          style={[
            styles.dispatchActionBtn,
            { backgroundColor: selectedBookingId && selectedDriverId ? colors.primary : colors.surfaceElevated }
          ]}
          onPress={handleExecuteDispatch}
          disabled={!selectedBookingId || !selectedDriverId || isDispatching}
          activeOpacity={0.8}
        >
          {isDispatching ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.btnRow}>
              <Send size={18} color={selectedBookingId && selectedDriverId ? '#FFFFFF' : colors.textMuted} />
              <Text style={[
                styles.dispatchBtnText,
                { color: selectedBookingId && selectedDriverId ? '#FFFFFF' : colors.textMuted }
              ]}>
                TRANSMIT DISPATCH ORDER
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topHeader: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 22
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  emptyBox: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16
  },
  selectCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  bIdText: {
    fontSize: 12,
    fontWeight: '800'
  },
  tierBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  dutyTag: {
    fontSize: 10,
    fontWeight: '800'
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8
  },
  carInfo: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4
  },
  phoneInfo: {
    fontSize: 11
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dateText: {
    fontSize: 11
  },
  fareText: {
    fontSize: 14,
    fontWeight: '900'
  },
  dispatchActionBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  dispatchBtnText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  routePreviewCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 12
  },
  routePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  routePreviewTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  farePreviewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  mapPreviewWrapper: {
    width: '100%',
    height: 160,
    overflow: 'hidden'
  }
});
