import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Search,
  Phone,
  UserCheck,
  Calendar,
  X,
  AlertCircle,
  Car,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react-native';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { useAdmin } from '../context/AdminContext';

export const AdminBookingsScreen: React.FC<{ navigation?: any }> = () => {
  const { bookings, drivers, assignDriver, refreshData, isLoading } = useAdmin();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'assigned' | 'completed'>('all');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const { colors, isDark } = useTheme();

  // Counts for top filter badges
  const allCount = (bookings || []).length;
  const unassignedCount = (bookings || []).filter(b => {
    const hasDrv = Boolean(b.assignedDriverId || b.driverAssigned || b.driver || (b as any).assignedDriverName);
    const s = (b.status || b.bookingStatus || '').toLowerCase();
    return !hasDrv && !s.includes('cancel') && !s.includes('complete');
  }).length;
  const assignedCount = (bookings || []).filter(b => {
    const hasDrv = Boolean(b.assignedDriverId || b.driverAssigned || b.driver || (b as any).assignedDriverName);
    const s = (b.status || b.bookingStatus || '').toLowerCase();
    return hasDrv && !s.includes('complete') && !s.includes('cancel');
  }).length;
  const completedCount = (bookings || []).filter(b => {
    const s = (b.status || b.bookingStatus || '').toLowerCase();
    return s.includes('complete');
  }).length;

  // Filter & Search
  const filteredBookings = (bookings || []).filter(b => {
    const q = search.trim().toLowerCase();
    const refCode = (b.referenceNumber || b.bookingId || b.id || '').toLowerCase();
    const phone = (b.passengerPhone || b.customerPhone || '').toLowerCase();
    const name = (b.passengerName || b.customerName || '').toLowerCase();
    const origin = (b.pickupCity || b.originCity || '').toLowerCase();
    const dest = (b.dropCity || b.destCity || '').toLowerCase();

    const matchesSearch = !q || refCode.includes(q) || phone.includes(q) || name.includes(q) || origin.includes(q) || dest.includes(q);
    if (!matchesSearch) return false;

    const hasDrv = Boolean(b.assignedDriverId || b.driverAssigned || b.driver || (b as any).assignedDriverName);
    const s = (b.status || b.bookingStatus || '').toLowerCase();

    if (filter === 'unassigned') return !hasDrv && !s.includes('cancel') && !s.includes('complete');
    if (filter === 'assigned') return hasDrv && !s.includes('complete') && !s.includes('cancel');
    if (filter === 'completed') return s.includes('complete');
    return true;
  });

  const handleOpenAssignModal = (booking: any) => {
    setSelectedBooking(booking);
    setAssignModalVisible(true);
  };

  const handleAssignDriver = async (driver: any) => {
    if (!selectedBooking) return;
    try {
      const bTarget = selectedBooking.referenceNumber || selectedBooking.id || selectedBooking.bookingId;
      const drvId = driver.id || `drv_${driver.phone}`;
      const ok = await assignDriver(bTarget, drvId, true);
      if (ok) {
        Alert.alert(
          'Chauffeur Allotted!',
          `Trip ${bTarget} successfully allotted to ${driver.name || driver.fullName} (${driver.vehicleNumber || 'Taxi'}). The chauffeur's phone has received the 30s dispatch notification.`
        );
        setAssignModalVisible(false);
        setSelectedBooking(null);
      }
    } catch (e: any) {
      Alert.alert('Assignment Error', e.message || 'Failed to assign driver.');
    }
  };

  const renderBooking = ({ item }: { item: any }) => {
    const refCode = item.referenceNumber || item.bookingId || item.id || 'OTB-REF';
    const origin = item.pickupCity || item.originCity || 'Patna';
    const dest = item.dropCity || item.destCity || 'Bihar';
    const fare = Number(item.fareBreakdown?.totalFare || item.price || item.totalFare) || 2198;
    const phone = item.passengerPhone || item.customerPhone || '';
    const name = item.passengerName || item.customerName || 'Passenger';
    const startOtp = item.startOtp || item.tripOtp || '4921';
    const cabTier = item.cabName || item.fleetClass || item.cabTier || 'Prime Sedan';

    const hasDriver = Boolean(item.assignedDriverId || item.driverAssigned || item.driver || (item as any).assignedDriverName);
    const chauffeurName = item.driver?.driverName || (item as any).assignedDriverName || item.driverName || 'Ramesh Kumar Singh';
    const chauffeurPhone = item.driver?.driverPhone || (item as any).assignedDriverPhone || item.driverPhone || '9876501234';
    const chauffeurPlate = item.driver?.vehiclePlateNumber || (item as any).assignedDriverCarNo || item.vehicleNumber || 'BR 01 PB 8291';

    const rawStatus = (item.status || item.bookingStatus || 'CONFIRMED').toLowerCase();
    const isCompleted = rawStatus.includes('complete');
    const isTransit = rawStatus.includes('start') || rawStatus.includes('transit') || rawStatus === 'in_progress';

    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: !hasDriver && !isCompleted ? colors.warning : colors.border }]}>
        
        {/* Header: Reference + Status Pill */}
        <View style={styles.cardHeader}>
          <Text style={[styles.refCode, { color: colors.primary }]}>{refCode}</Text>
          
          <View style={[
            styles.statusBadge,
            isCompleted && { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
            isTransit && { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
            hasDriver && !isTransit && !isCompleted && { backgroundColor: 'rgba(5, 150, 105, 0.15)' },
            !hasDriver && !isCompleted && { backgroundColor: 'rgba(245, 158, 11, 0.15)' }
          ]}>
            <Text style={[
              styles.statusText,
              isCompleted && { color: colors.info },
              isTransit && { color: colors.primary },
              hasDriver && !isTransit && !isCompleted && { color: colors.primary },
              !hasDriver && !isCompleted && { color: colors.warning }
            ]}>
              {isCompleted ? '✅ COMPLETED' : isTransit ? '🛣️ IN TRANSIT' : hasDriver ? '🚖 CHAUFFEUR ALLOTTED' : '⚠️ NEEDS CHAUFFEUR'}
            </Text>
          </View>
        </View>

        {/* Route Line */}
        <Text style={[styles.routeText, { color: colors.text }]}>
          {origin} ➔ {dest}
        </Text>

        {/* Schedule & Tier */}
        <View style={[styles.scheduleRow, { backgroundColor: 'rgba(5, 150, 105, 0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(5, 150, 105, 0.25)' }]}>
          <Clock size={14} color={colors.primary} />
          <Text style={[styles.scheduleText, { color: colors.text, fontWeight: '700' }]}>
            Required: <Text style={{ color: colors.primary, fontWeight: '800' }}>📅 {item.pickupDate || 'Today'} • 🕒 {item.pickupTime || '10:00 AM'}</Text>
          </Text>
          <Text style={[styles.tierBadge, { backgroundColor: colors.surfaceElevated, color: colors.textSecondary }]}>
            {cabTier}
          </Text>
        </View>

        <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

        {/* Customer Row */}
        <View style={styles.customerRow}>
          <View>
            <Text style={[styles.customerName, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.customerPhone, { color: colors.textMuted }]}>+91 {phone}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.fareLabel, { color: colors.textMuted }]}>TOTAL FARE</Text>
            <Text style={[styles.fareVal, { color: colors.text }]}>{formatCurrency(fare)}</Text>
            {item.paymentMethod === 'advance_token' || (item as any).utr ? (
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '800', marginTop: 2 }}>
                ✓ ₹500 Token {(item as any).utr ? `(UTR: ${(item as any).utr})` : 'Paid'}
              </Text>
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600', marginTop: 2 }}>
                Cash / UPI to Chauffeur
              </Text>
            )}
          </View>
        </View>

        {/* Chauffeur Allotment Section */}
        <View style={[
          styles.chauffeurSection,
          {
            backgroundColor: hasDriver ? 'rgba(5, 150, 105, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            borderColor: hasDriver ? colors.primary : colors.warning
          }
        ]}>
          {hasDriver ? (
            <View style={{ flex: 1 }}>
              <Text style={[styles.chauffeurSectionLabel, { color: colors.primary }]}>
                ALLOTTED CHAUFFEUR
              </Text>
              <Text style={[styles.chauffeurName, { color: colors.text }]}>
                {chauffeurName} • {chauffeurPlate}
              </Text>
              <Text style={[styles.chauffeurSub, { color: colors.textMuted }]}>
                Phone: +91 {chauffeurPhone}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={[styles.chauffeurSectionLabel, { color: colors.warning }]}>
                ⚠️ UNASSIGNED TRIP
              </Text>
              <Text style={[styles.chauffeurName, { color: colors.text }]}>
                No driver allotted yet
              </Text>
              <Text style={[styles.chauffeurSub, { color: colors.textMuted }]}>
                Tap green button to assign available on-duty driver
              </Text>
            </View>
          )}

          {!isCompleted && (
            <TouchableOpacity
              style={[
                styles.dispatchBtn,
                { backgroundColor: hasDriver ? colors.surfaceElevated : colors.primary }
              ]}
              onPress={() => handleOpenAssignModal(item)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.dispatchBtnText,
                { color: hasDriver ? colors.text : '#FFFFFF' }
              ]}>
                {hasDriver ? 'Change' : 'Allot ➔'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Bar: Customer OTP + Call Passenger */}
        <View style={styles.cardActions}>
          <View style={[styles.otpPill, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[styles.otpPillLabel, { color: colors.textMuted }]}>OTP: </Text>
            <Text style={[styles.otpPillVal, { color: colors.gold }]}>{startOtp}</Text>
          </View>

          {phone ? (
            <TouchableOpacity
              style={[styles.callBtn, { borderColor: colors.border }]}
              onPress={() => Linking.openURL(`tel:${phone}`)}
            >
              <Phone size={13} color={colors.primary} />
              <Text style={[styles.callBtnText, { color: colors.primary }]}>Call Customer</Text>
            </TouchableOpacity>
          ) : null}
        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>TRIPS & DISPATCH DESK</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Live Outstation Cab Bookings & Chauffeur Allotments
        </Text>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by OTB reference, phone, city..."
            placeholderTextColor={colors.textMuted}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Badges with Counts */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterPill, filter === 'all' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, { color: filter === 'all' ? '#FFFFFF' : colors.textMuted }]}>
              ALL ({allCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              filter === 'unassigned' && { backgroundColor: colors.warning },
              unassignedCount > 0 && filter !== 'unassigned' && { borderColor: colors.warning, borderWidth: 1 }
            ]}
            onPress={() => setFilter('unassigned')}
          >
            <Text style={[
              styles.filterText,
              { color: filter === 'unassigned' ? '#000000' : unassignedCount > 0 ? colors.warning : colors.textMuted }
            ]}>
              ⚠️ NEEDS DRIVER ({unassignedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'assigned' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('assigned')}
          >
            <Text style={[styles.filterText, { color: filter === 'assigned' ? '#FFFFFF' : colors.textMuted }]}>
              🚖 ALLOTTED ({assignedCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, filter === 'completed' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, { color: filter === 'completed' ? '#FFFFFF' : colors.textMuted }]}>
              ✅ COMPLETED ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item, idx) => item.referenceNumber || item.bookingId || item.id || String(idx)}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={refreshData}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AlertCircle size={38} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No Matching Trips</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Bookings submitted via the Passenger App will automatically reflect here in real-time.
            </Text>
          </View>
        }
      />

      {/* Chauffeur Allotment Modal */}
      <Modal visible={assignModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Allot Dedicated Chauffeur</Text>
                <Text style={[styles.modalSub, { color: colors.primary }]}>
                  {selectedBooking?.referenceNumber || selectedBooking?.bookingId || 'Trip'} • {selectedBooking?.pickupCity || 'Patna'} ➔ {selectedBooking?.dropCity || 'Bihar'}
                </Text>
                <View style={{ backgroundColor: 'rgba(5, 150, 105, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6, alignSelf: 'flex-start' }}>
                  <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>
                    ⏰ REQUIRED PICKUP: 📅 {selectedBooking?.pickupDate || 'Today'} • 🕒 {selectedBooking?.pickupTime || '10:00 AM'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAssignModalVisible(false)} style={styles.closeModalBtn}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.driverListLabel, { color: colors.textMuted }]}>
              SELECT AVAILABLE ON-DUTY CHAUFFEUR ({drivers.length})
            </Text>

            {/* Drivers List */}
            <FlatList
              data={drivers}
              keyExtractor={(d) => d.id || d.phone}
              style={{ maxHeight: 340 }}
              renderItem={({ item: drv }) => (
                <TouchableOpacity
                  style={[styles.driverOption, { borderColor: colors.border, backgroundColor: colors.surfaceElevated }]}
                  onPress={() => handleAssignDriver(drv)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.driverIconBox, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                    <UserCheck size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.driverOptionName, { color: colors.text }]}>
                      {drv.name || drv.fullName || 'Driver Partner'}
                    </Text>
                    <Text style={[styles.driverOptionCar, { color: colors.textMuted }]}>
                      {drv.vehicleModel || 'AC Taxi'} • {drv.vehicleNumber || 'BR-01 Plate'}
                    </Text>
                    <Text style={[styles.driverOptionRating, { color: colors.gold }]}>
                      ★ {drv.rating || '4.88'} • {drv.dutyStatus === 'ON_DUTY' ? '● Live On-Duty' : '○ Available'}
                    </Text>
                  </View>
                  <View style={[styles.allotBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.allotBadgeText}>Allot ➔</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyDrivers, { color: colors.textMuted }]}>
                  No registered drivers found.
                </Text>
              }
            />

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topHeader: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '500'
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  filterText: {
    fontSize: 11,
    fontWeight: '800'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  refCode: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  routeText: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  scheduleText: {
    fontSize: 12
  },
  tierBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto'
  },
  cardDivider: {
    height: 1,
    marginVertical: 10
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700'
  },
  customerPhone: {
    fontSize: 12,
    marginTop: 2
  },
  fareLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  fareVal: {
    fontSize: 16,
    fontWeight: '900'
  },
  chauffeurSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10
  },
  chauffeurSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  chauffeurName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  chauffeurSub: {
    fontSize: 11,
    marginTop: 2
  },
  dispatchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8
  },
  dispatchBtnText: {
    fontSize: 12,
    fontWeight: '800'
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  otpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  otpPillLabel: {
    fontSize: 11,
    fontWeight: '700'
  },
  otpPillVal: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900'
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '700'
  },
  closeModalBtn: {
    padding: 6
  },
  driverListLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10
  },
  driverOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8
  },
  driverIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  driverOptionName: {
    fontSize: 14,
    fontWeight: '700'
  },
  driverOptionCar: {
    fontSize: 12,
    marginTop: 2
  },
  driverOptionRating: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  allotBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
  },
  allotBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  emptyDrivers: {
    fontSize: 12,
    textAlign: 'center',
    padding: 20
  }
});
