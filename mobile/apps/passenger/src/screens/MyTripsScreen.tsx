import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';
import { usePassenger } from '../context/PassengerContext';
import { Booking } from '../../../../shared/types';
import { formatCurrency } from '../../../../shared/utils/formatters';
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Repeat,
  ArrowRight,
  Navigation,
  Download,
} from 'lucide-react-native';

export const MyTripsScreen = ({ navigation }: any) => {
  const { myTrips, refreshTrips, updateSearch, isLoggedIn } = usePassenger();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed' | 'cancelled' | 'all'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshTrips?.();
    setRefreshing(false);
  };

  const filteredTrips = myTrips.filter(t => {
    const s = (t.bookingStatus || t.status || '').toLowerCase();
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') {
      return s === 'new' || s === 'requested' || s === 'confirmed' || s === 'driver_assigned' || s === 'assigned';
    }
    if (activeTab === 'active') {
      return s === 'driver_en_route' || s === 'on the way' || s === 'arrived' || s === 'started' || s === 'in_progress';
    }
    if (activeTab === 'completed') {
      return s === 'completed';
    }
    if (activeTab === 'cancelled') {
      return s === 'cancelled' || s === 'rejected';
    }
    return true;
  });

  const handleDownloadInvoice = (item: Booking) => {
    const ref = item.referenceNumber || item.id;
    Alert.alert(
      'Tax Invoice',
      `GST Tax Invoice for ride ${ref} is available for download.`,
      [
        {
          text: 'View GST Invoice',
          onPress: () => Linking.openURL(`https://onewaytaxibihar.com/passenger.html?ref=${ref}`),
        },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleRebook = (item: Booking) => {
    updateSearch({
      origin: item.pickupCity,
      destination: item.dropCity,
      tripType: item.tripType || 'one-way',
    });
    navigation.navigate('CabSelect');
  };

  const renderTripCard = ({ item }: { item: Booking }) => {
    const s = (item.bookingStatus || item.status || '').toLowerCase();
    const isCompleted = s === 'completed';
    const isCancelled = s === 'cancelled' || s === 'rejected';
    const isActive = s === 'started' || s === 'in_progress' || s === 'on the way' || s === 'arrived' || s === 'driver_en_route';

    let statusLabel = 'Confirmed';
    let statusBg = '#FEF3C7';
    let statusTextColor = '#92400E';

    if (isCompleted) {
      statusLabel = 'Completed';
      statusBg = 'rgba(5, 150, 105, 0.12)';
      statusTextColor = '#059669';
    } else if (isCancelled) {
      statusLabel = 'Cancelled';
      statusBg = 'rgba(239, 68, 68, 0.12)';
      statusTextColor = '#DC2626';
    } else if (isActive) {
      statusLabel = 'Active Ride';
      statusBg = '#FDE68A';
      statusTextColor = '#B45309';
    }

    return (
      <View style={styles.tripCard}>
        {/* Card Header: PNR + Status */}
        <View style={styles.cardHeader}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.refCode}>{item.referenceNumber || item.id}</Text>
              <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                <Text style={[styles.statusText, { color: statusTextColor }]}>{statusLabel.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.tripType}>
              {item.tripType === 'one-way' ? 'One-Way Cab' : 'Round Trip'} • {item.cabName || 'Prime Sedan'}
            </Text>
          </View>
          <Text style={styles.fareText}>
            {formatCurrency(item.fareBreakdown?.totalFare || (item as any).totalFare || 2198)}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Route Details */}
        <View style={styles.routeRow}>
          <MapPin size={16} color="#059669" />
          <Text style={styles.routeText}>
            {item.pickupCity} → {item.dropCity}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Calendar size={13} color="#D97706" />
            <Text style={styles.detailText}>{item.pickupDate || 'Today'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={13} color="#D97706" />
            <Text style={styles.detailText}>{item.pickupTime || '10:00 AM'}</Text>
          </View>
          <View style={styles.otpPill}>
            <Text style={styles.otpPillText}>OTP: {item.startOtp || '1234'}</Text>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            onPress={() => navigation.navigate('BookingTimeline', { bookingId: item.id, booking: item })}
            activeOpacity={0.85}
          >
            <Navigation size={13} color="#0F172A" />
            <Text style={styles.actionBtnPrimaryText}>Track Timeline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => handleDownloadInvoice(item)}
            activeOpacity={0.8}
          >
            <Download size={13} color="#334155" />
            <Text style={styles.actionBtnSecondaryText}>Tax Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => handleRebook(item)}
            activeOpacity={0.8}
          >
            <Repeat size={13} color="#334155" />
            <Text style={styles.actionBtnSecondaryText}>Rebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>
          Live trip status, verified PNR vouchers & past travel history
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {([
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
          { key: 'all', label: 'All' },
        ] as const).map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredTrips}
        keyExtractor={item => item.id || item.referenceNumber}
        renderItem={renderTripCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <AlertCircle size={38} color="#D97706" />
            </View>
            <Text style={styles.emptyTitle}>No Rides Found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all'
                ? "You haven't booked any outstation cabs yet. Book verified cabs with zero return fare."
                : `You currently have no ${activeTab} trips in your booking ledger.`}
            </Text>
            <TouchableOpacity
              style={styles.bookNowBtn}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.88}
            >
              <Text style={styles.bookNowText}>Book an Outstation Cab</Text>
              <ArrowRight size={16} color="#0F172A" strokeWidth={2.5} />
            </TouchableOpacity>
            {!isLoggedIn && (
              <TouchableOpacity
                style={[styles.bookNowBtn, { backgroundColor: '#16a34a', marginTop: 10 }]}
                onPress={() => navigation.navigate('Auth')}
                activeOpacity={0.88}
              >
                <Text style={[styles.bookNowText, { color: '#FFFFFF' }]}>Sign In with Mobile OTP</Text>
                <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#F59E0B',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  tripCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  refCode: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tripType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '600',
  },
  fareText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  routeText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  otpPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  otpPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  actionBtnPrimary: {
    flex: 1.2,
    backgroundColor: '#F59E0B',
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    height: 38,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#64748B',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  bookNowBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  bookNowText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
});
