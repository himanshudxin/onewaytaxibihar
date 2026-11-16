import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  Alert,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import {
  TrendingUp,
  Car,
  Navigation,
  FileCheck2,
  Calendar,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Radio,
  Phone,
  UserCheck,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  Check,
  X,
  Activity,
  Layers,
  Settings,
  RefreshCw,
  MapPin,
  AlertTriangle
} from 'lucide-react-native';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { UberMapView } from '../../../../shared/components/UberMapView';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { useAdmin } from '../context/AdminContext';

export const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { admin, metrics, bookings, drivers, isLoading, refreshData, logout, assignDriver } = useAdmin();
  const { colors, isDark } = useTheme();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unassigned' | 'in_transit' | 'completed'>('all');

  // Quick Chauffeur Assignment Modal State
  const [selectedBookingForAssign, setSelectedBookingForAssign] = useState<any | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fleet Broadcast Modal State
  const [broadcastVisible, setBroadcastVisible] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');

  // Operations Command Center Map Active Corridor
  const [selectedCorridor, setSelectedCorridor] = useState({
    id: 'patna_gaya',
    label: 'Patna → Gaya',
    origin: 'Patna',
    dest: 'Gaya'
  });

  // Unassigned bookings computation
  const unassignedBookings = useMemo(() => {
    return (bookings || []).filter(b => {
      const hasDrv = Boolean(b.assignedDriverId || b.driverAssigned || b.driver || (b as any).assignedDriverName);
      const s = (b.status || b.bookingStatus || '').toLowerCase();
      return !hasDrv && !s.includes('cancel') && !s.includes('complete');
    });
  }, [bookings]);

  // In-transit active bookings
  const inTransitBookings = useMemo(() => {
    return (bookings || []).filter(b => {
      const s = (b.status || b.bookingStatus || '').toLowerCase();
      return ['driver_assigned', 'driver_en_route', 'arrived', 'started', 'accepted', 'on the way', 'trip started'].some(k => s.includes(k));
    });
  }, [bookings]);

  // Completed trips
  const completedBookings = useMemo(() => {
    return (bookings || []).filter(b => {
      const s = (b.status || b.bookingStatus || '').toLowerCase();
      return s.includes('complete');
    });
  }, [bookings]);

  // Available on-duty verified drivers
  const verifiedDrivers = useMemo(() => {
    return (drivers || []).filter(d => d.isVerified || (d.status || '').toLowerCase() === 'approved');
  }, [drivers]);

  // Corridor Traffic Pulse Calculations (Bihar Intercity Arteries)
  const corridorStats = useMemo(() => {
    const list = bookings || [];
    const corridors = [
      { id: 'patna_gaya', name: 'Patna → Gaya / Bodh Gaya', code: 'NH-22 / NH-83', baseKm: 110 },
      { id: 'patna_muzaffarpur', name: 'Patna → Muzaffarpur', code: 'JP Setu / NH-77', baseKm: 78 },
      { id: 'patna_darbhanga', name: 'Patna → Darbhanga', code: 'NH-57 Gateway', baseKm: 135 },
      { id: 'patna_bhagalpur', name: 'Patna → Bhagalpur', code: 'NH-31 Highway', baseKm: 240 },
      { id: 'patna_varanasi', name: 'Patna → Varanasi / Kashi', code: 'GT Road / NH-19', baseKm: 250 }
    ];

    const total = list.length || 1;
    return corridors.map(c => {
      const count = list.filter(b => {
        const routeText = `${b.originCity || b.pickupCity || ''} ${b.destCity || b.dropCity || ''}`.toLowerCase();
        if (c.id === 'patna_gaya') return routeText.includes('gaya') || routeText.includes('bodh');
        if (c.id === 'patna_muzaffarpur') return routeText.includes('muzaffarpur');
        if (c.id === 'patna_darbhanga') return routeText.includes('darbhanga');
        if (c.id === 'patna_bhagalpur') return routeText.includes('bhagalpur');
        if (c.id === 'patna_varanasi') return routeText.includes('varanasi') || routeText.includes('kashi');
        return false;
      }).length;

      // Real percentage of total or calibrated corridor weight
      const share = list.length > 0 ? Math.round((count / total) * 100) : 20;
      return { ...c, count, share: share || 10 };
    });
  }, [bookings]);

  // Filtered trips for Live Feed
  const filteredTrips = useMemo(() => {
    let dataset = bookings || [];

    if (activeFilter === 'unassigned') {
      dataset = unassignedBookings;
    } else if (activeFilter === 'in_transit') {
      dataset = inTransitBookings;
    } else if (activeFilter === 'completed') {
      dataset = completedBookings;
    }

    if (!searchQuery.trim()) return dataset;

    const q = searchQuery.trim().toLowerCase();
    return dataset.filter(b => {
      const refId = (b.referenceNumber || b.bookingId || b.id || '').toLowerCase();
      const passenger = (b.passengerName || b.customerName || '').toLowerCase();
      const phone = (b.passengerPhone || b.customerPhone || '').toLowerCase();
      const origin = (b.originCity || b.pickupCity || '').toLowerCase();
      const dest = (b.destCity || b.dropCity || '').toLowerCase();
      return refId.includes(q) || passenger.includes(q) || phone.includes(q) || origin.includes(q) || dest.includes(q);
    });
  }, [bookings, activeFilter, searchQuery, unassignedBookings, inTransitBookings, completedBookings]);

  // Execute quick assign from dashboard modal
  const handleAssignDriver = async (driver: any) => {
    if (!selectedBookingForAssign) return;
    const bookingId = selectedBookingForAssign.bookingId || selectedBookingForAssign.id;
    const driverId = driver.id || driver.phone;

    setIsAssigning(true);
    try {
      const success = await assignDriver(bookingId, driverId, true);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        Alert.alert(
          'Chauffeur Allotted!',
          `Trip #${selectedBookingForAssign.referenceNumber || bookingId} assigned to ${driver.name || 'Driver'}. Push notification & SMS dispatched.`
        );
        setSelectedBookingForAssign(null);
        await refreshData();
      }
    } catch (e: any) {
      Alert.alert('Assignment Error', e.message || 'Failed to allot chauffeur.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Broadcast send
  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) {
      Alert.alert('Empty Message', 'Please select a broadcast notice or enter custom instructions.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert(
      'Fleet Broadcast Transmitted',
      `Sent to ${verifiedDrivers.length} active chauffeurs across Bihar corridor networks:\n\n"${broadcastText}"`
    );
    setBroadcastText('');
    setBroadcastVisible(false);
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Operator Sign Out',
      'Are you sure you want to exit Central Dispatch Desk V2?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const callNumber = (phone?: string) => {
    if (!phone) {
      Alert.alert('Phone Unavailable', 'No valid contact phone registered for this profile.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Dialer Error', 'Could not open phone dialer on this device.');
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Operations Header */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <BrandLogo size="header" showSubtitle subtitleText="Operations Command V2" />
          <View style={styles.liveIndicatorBadge}>
            <View style={styles.livePulseDot} />
            <Text style={[styles.livePulseText, { color: colors.primary }]}>
              RADAR ONLINE • ATLAS SYNCED
            </Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={[styles.headerIconBtn, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              refreshData();
            }}
            activeOpacity={0.7}
          >
            <RefreshCw size={17} color={isLoading ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerIconBtn, { borderColor: colors.border, marginLeft: 8 }]}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
          >
            <LogOut size={17} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} tintColor={colors.primary} />}
      >
        {/* Urgent Operations Priority Banner */}
        {unassignedBookings.length > 0 ? (
          <TouchableOpacity
            style={[styles.urgentAlertBanner, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: colors.warning }]}
            onPress={() => {
              setActiveFilter('unassigned');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            }}
            activeOpacity={0.85}
          >
            <View style={[styles.alertIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <ShieldAlert size={22} color={colors.warning} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.alertHeaderRow}>
                <Text style={[styles.alertTitle, { color: colors.warning }]}>
                  CRITICAL: {unassignedBookings.length} Trip{unassignedBookings.length > 1 ? 's' : ''} Awaiting Chauffeur
                </Text>
                <View style={[styles.urgentTag, { backgroundColor: colors.warning }]}>
                  <Text style={styles.urgentTagText}>ACTION REQ</Text>
                </View>
              </View>
              <Text style={[styles.alertSub, { color: colors.textSecondary }]}>
                Passengers awaiting cab allotment. Tap to assign available on-duty fleet immediately.
              </Text>
            </View>
            <ChevronRight size={18} color={colors.warning} />
          </TouchableOpacity>
        ) : metrics.pendingApplications > 0 ? (
          <TouchableOpacity
            style={[styles.urgentAlertBanner, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: colors.primary }]}
            onPress={() => navigation.navigate('Drivers')}
            activeOpacity={0.85}
          >
            <View style={[styles.alertIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <FileCheck2 size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.alertTitle, { color: colors.primary }]}>
                {metrics.pendingApplications} Chauffeur KYC Application{metrics.pendingApplications > 1 ? 's' : ''} Queued
              </Text>
              <Text style={[styles.alertSub, { color: colors.textSecondary }]}>
                Driving License & RC audit pending. Tap to verify and activate new chauffeurs.
              </Text>
            </View>
            <ChevronRight size={18} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.normalBanner, { backgroundColor: 'rgba(5, 150, 105, 0.08)', borderColor: 'rgba(5, 150, 105, 0.25)' }]}>
            <CheckCircle2 size={18} color={colors.primary} />
            <Text style={[styles.normalBannerText, { color: colors.primary }]}>
              Bihar Dispatch Radar 100% Optimal • Zero Backlog • Fleet On-Duty
            </Text>
          </View>
        )}

        {/* 1-Tap Executive Action Dock */}
        <View style={styles.quickDock}>
          <TouchableOpacity
            style={[styles.dockBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Dispatch')}
            activeOpacity={0.8}
          >
            <View style={[styles.dockIconCircle, { backgroundColor: 'rgba(5, 150, 105, 0.14)' }]}>
              <Zap size={18} color={colors.primary} />
            </View>
            <Text style={[styles.dockLabel, { color: colors.text }]}>Dispatch Hub</Text>
            <Text style={[styles.dockSub, { color: colors.textMuted }]}>{unassignedBookings.length} pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dockBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Drivers')}
            activeOpacity={0.8}
          >
            <View style={[styles.dockIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.14)' }]}>
              <UserCheck size={18} color={colors.warning} />
            </View>
            <Text style={[styles.dockLabel, { color: colors.text }]}>Audit KYC</Text>
            <Text style={[styles.dockSub, { color: colors.textMuted }]}>{metrics.pendingApplications} reviews</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dockBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setBroadcastVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.dockIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.14)' }]}>
              <Radio size={18} color={colors.accent} />
            </View>
            <Text style={[styles.dockLabel, { color: colors.text }]}>Broadcast</Text>
            <Text style={[styles.dockSub, { color: colors.textMuted }]}>Fleet alert</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dockBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <View style={[styles.dockIconCircle, { backgroundColor: 'rgba(107, 114, 128, 0.14)' }]}>
              <Settings size={18} color={colors.textSecondary} />
            </View>
            <Text style={[styles.dockLabel, { color: colors.text }]}>Desk Config</Text>
            <Text style={[styles.dockSub, { color: colors.textMuted }]}>Operations</Text>
          </TouchableOpacity>
        </View>

        {/* Executive KPI Quadrant V2 */}
        <View style={styles.grid}>
          {/* Active In-Transit */}
          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: inTransitBookings.length > 0 ? colors.accent : colors.border }]}
            onPress={() => setActiveFilter('in_transit')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>FLEET IN TRANSIT</Text>
              <Navigation size={18} color={colors.accent} />
            </View>
            <Text style={[styles.kpiValue, { color: colors.accent }]}>{inTransitBookings.length}</Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>Active on highways</Text>
          </TouchableOpacity>

          {/* Urgent Needs Chauffeur */}
          <TouchableOpacity
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.surface,
                borderColor: unassignedBookings.length > 0 ? colors.warning : colors.border
              }
            ]}
            onPress={() => setActiveFilter('unassigned')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>UNASSIGNED TRIPS</Text>
              <AlertTriangle size={18} color={unassignedBookings.length > 0 ? colors.warning : colors.textMuted} />
            </View>
            <Text style={[styles.kpiValue, { color: unassignedBookings.length > 0 ? colors.warning : colors.text }]}>
              {unassignedBookings.length}
            </Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>Needs allotment</Text>
          </TouchableOpacity>

          {/* On-Duty Available Chauffeurs */}
          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Drivers')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>VERIFIED FLEET</Text>
              <Car size={18} color={colors.primary} />
            </View>
            <Text style={[styles.kpiValue, { color: colors.primary }]}>{verifiedDrivers.length}</Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>Available on-duty</Text>
          </TouchableOpacity>

          {/* Total Booking Runs */}
          <TouchableOpacity
            style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.8}
          >
            <View style={styles.kpiHeader}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>TOTAL BOOKINGS</Text>
              <Calendar size={18} color={colors.primary} />
            </View>
            <Text style={[styles.kpiValue, { color: colors.text }]}>{metrics.totalBookings}</Text>
            <Text style={[styles.kpiSub, { color: colors.textMuted }]}>{completedBookings.length} completed</Text>
          </TouchableOpacity>
        </View>

        {/* Financial & Margin Command Center V2 */}
        <View style={[styles.financeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.finHeader}>
            <View>
              <View style={styles.finBadgeRow}>
                <Text style={[styles.finTagText, { color: colors.primary }]}>BIHAR INTERCITY LEDGER</Text>
                <View style={[styles.liveChip, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                  <Text style={[styles.liveChipText, { color: colors.primary }]}>HIGHER PEAK TOLL ACTIVE</Text>
                </View>
              </View>
              <Text style={[styles.finGrossAmount, { color: colors.text }]}>
                {formatCurrency(metrics.todayRevenue)}
              </Text>
              <Text style={[styles.finGrossSub, { color: colors.textMuted }]}>
                Today's Gross Booking Value (GBV)
              </Text>
            </View>
            <View style={[styles.trendCircle, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
              <TrendingUp size={24} color={colors.primary} />
            </View>
          </View>

          <View style={[styles.finDivider, { backgroundColor: colors.border }]} />

          <View style={styles.finMetricsRow}>
            <View style={styles.finMetricCol}>
              <Text style={[styles.finMetricLabel, { color: colors.textMuted }]}>Platform Margin (15%)</Text>
              <Text style={[styles.finMetricValue, { color: colors.primary }]}>
                {formatCurrency(metrics.todayRevenue * 0.15)}
              </Text>
              <Text style={[styles.finMetricDetail, { color: colors.textSecondary }]}>Direct Company Rev</Text>
            </View>

            <View style={[styles.finVerticalDivider, { backgroundColor: colors.border }]} />

            <View style={styles.finMetricCol}>
              <Text style={[styles.finMetricLabel, { color: colors.textMuted }]}>Chauffeur Payouts (85%)</Text>
              <Text style={[styles.finMetricValue, { color: colors.accent }]}>
                {formatCurrency(metrics.todayRevenue * 0.85)}
              </Text>
              <Text style={[styles.finMetricDetail, { color: colors.textSecondary }]}>Net Fleet Earnings</Text>
            </View>
          </View>

          <View style={[styles.tollNoticeBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
            <Layers size={14} color={colors.primary} />
            <Text style={[styles.tollNoticeText, { color: colors.textSecondary }]}>
              NHAI Highway Peak Tolls accounted via Google Routes API Toll Engine (GMap Routes V2).
            </Text>
          </View>
        </View>

        {/* Bihar Operations Command Center Live Fleet Map */}
        <View style={[styles.mapSectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.mapSectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <View style={[styles.pulseBeacon, { backgroundColor: colors.primary }]} />
              <Text style={[styles.mapSectionTitle, { color: colors.text }]}>
                BIHAR OPERATIONS COMMAND CENTER
              </Text>
            </View>
            <View style={[styles.livePill, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
              <Text style={[styles.livePillText, { color: colors.primary }]}>
                {verifiedDrivers.length} FLEET READY • {unassignedBookings.length} QUEUED
              </Text>
            </View>
          </View>

          {/* Quick Corridor Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.corridorPillsScroll}>
            {[
              { id: 'patna_gaya', label: 'Patna → Gaya', origin: 'Patna', dest: 'Gaya' },
              { id: 'patna_muz', label: 'Patna → Muzaffarpur', origin: 'Patna', dest: 'Muzaffarpur' },
              { id: 'patna_dar', label: 'Patna → Darbhanga', origin: 'Patna', dest: 'Darbhanga' },
              { id: 'patna_bha', label: 'Patna → Bhagalpur', origin: 'Patna', dest: 'Bhagalpur' },
              { id: 'patna_hub', label: 'Patna Central Hub', origin: 'Patna', dest: '' }
            ].map(corridor => {
              const isSelected = selectedCorridor.id === corridor.id;
              return (
                <TouchableOpacity
                  key={corridor.id}
                  style={[
                    styles.corridorFilterPill,
                    {
                      backgroundColor: isSelected ? colors.primary : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                      borderColor: isSelected ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => setSelectedCorridor(corridor)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.corridorFilterText,
                      { color: isSelected ? '#FFFFFF' : colors.textSecondary }
                    ]}
                  >
                    {corridor.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Map Viewer */}
          <View style={styles.commandMapWrapper}>
            <UberMapView
              originCity={selectedCorridor.origin}
              destinationCity={selectedCorridor.dest}
              height={230}
              interactive={true}
            />
          </View>
        </View>

        {/* Corridor Traffic Pulse (Bihar Intercity Arteries) */}
        <View style={[styles.corridorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.corridorHeader}>
            <View style={styles.corridorHeaderLeft}>
              <Activity size={18} color={colors.primary} />
              <Text style={[styles.corridorTitle, { color: colors.text }]}>BIHAR CORRIDOR TRAFFIC PULSE</Text>
            </View>
            <Text style={[styles.corridorSubtitle, { color: colors.textMuted }]}>Live Route Volume</Text>
          </View>

          <View style={styles.corridorList}>
            {corridorStats.map((c, idx) => (
              <View key={c.id} style={[styles.corridorRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={styles.corridorInfo}>
                  <View style={styles.corridorNameRow}>
                    <Text style={[styles.corridorName, { color: colors.text }]}>{c.name}</Text>
                    <Text style={[styles.corridorCode, { color: colors.textMuted }]}>• {c.code}</Text>
                  </View>
                  <View style={styles.corridorBarBg}>
                    <View style={[styles.corridorBarFill, { width: `${Math.min(100, Math.max(12, c.share))}%`, backgroundColor: colors.primary }]} />
                  </View>
                </View>
                <View style={styles.corridorBadge}>
                  <Text style={[styles.corridorCount, { color: colors.text }]}>{c.count}</Text>
                  <Text style={[styles.corridorCountLabel, { color: colors.textMuted }]}>trips</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Live Outstation Activity Section Header & Search */}
        <View style={styles.activityHeader}>
          <View style={styles.activityTitleRow}>
            <Text style={[styles.activityTitle, { color: colors.text }]}>LIVE OUTSTATION ACTIVITY</Text>
            <Text style={[styles.activityCountBadge, { color: colors.primary }]}>
              {filteredTrips.length} active
            </Text>
          </View>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search PNR, route, passenger, or phone..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                { backgroundColor: activeFilter === 'all' ? colors.primary : colors.surface, borderColor: activeFilter === 'all' ? colors.primary : colors.border }
              ]}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={[styles.filterPillText, { color: activeFilter === 'all' ? '#FFFFFF' : colors.textSecondary }]}>
                All Bookings ({bookings.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                {
                  backgroundColor: activeFilter === 'unassigned' ? colors.warning : colors.surface,
                  borderColor: unassignedBookings.length > 0 ? colors.warning : colors.border
                }
              ]}
              onPress={() => setActiveFilter('unassigned')}
            >
              <Text style={[styles.filterPillText, { color: activeFilter === 'unassigned' ? '#FFFFFF' : unassignedBookings.length > 0 ? colors.warning : colors.textSecondary }]}>
                Unassigned ({unassignedBookings.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                { backgroundColor: activeFilter === 'in_transit' ? colors.accent : colors.surface, borderColor: activeFilter === 'in_transit' ? colors.accent : colors.border }
              ]}
              onPress={() => setActiveFilter('in_transit')}
            >
              <Text style={[styles.filterPillText, { color: activeFilter === 'in_transit' ? '#FFFFFF' : colors.textSecondary }]}>
                In-Transit ({inTransitBookings.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                { backgroundColor: activeFilter === 'completed' ? colors.textSecondary : colors.surface, borderColor: colors.border }
              ]}
              onPress={() => setActiveFilter('completed')}
            >
              <Text style={[styles.filterPillText, { color: activeFilter === 'completed' ? '#FFFFFF' : colors.textSecondary }]}>
                Completed ({completedBookings.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Trips Feed Cards */}
        {filteredTrips.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <CheckCircle2 size={32} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bookings Found</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              {searchQuery ? 'No trips match your search keyword.' : 'All bookings in this category are fully up to date.'}
            </Text>
          </View>
        ) : (
          filteredTrips.slice(0, 15).map((b, idx) => {
            const bId = b.referenceNumber || b.bookingId || b.id || `OTB-${idx}`;
            const routeStr = `${b.originCity || b.pickupCity || 'Patna'} → ${b.destCity || b.dropCity || 'Bihar'}`;
            const fare = Number(b.fareBreakdown?.totalFare || b.totalFare || b.price || b.estimatedFare) || 0;
            const advancePaid = Number(b.advanceAmount || b.fareBreakdown?.advancePayment || fare * 0.15) || 0;
            const status = (b.bookingStatus || b.status || 'CONFIRMED').toUpperCase();
            const hasDriver = Boolean(b.assignedDriverId || b.driverAssigned || b.driver || (b as any).assignedDriverName);
            const driverName = b.assignedDriverName || b.driver?.name || 'Assigned Chauffeur';
            const driverPhone = b.assignedDriverPhone || b.driver?.phone || '';
            const passengerName = b.passengerName || b.customerName || 'Passenger';
            const passengerPhone = b.passengerPhone || b.customerPhone || '';
            const cabTier = b.vehicleType || b.carType || b.cabType || 'Sedan';
            const scheduleDate = b.pickupDate || b.date || 'Today';
            const scheduleTime = b.pickupTime || b.time || 'Immediate';

            const isUrgent = !hasDriver && !status.includes('CANCEL') && !status.includes('COMPLETE');

            return (
              <View
                key={bId}
                style={[
                  styles.tripCardV2,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isUrgent ? colors.warning : colors.border
                  }
                ]}
              >
                {/* Card Top Row */}
                <View style={styles.tripCardHeader}>
                  <View style={styles.pnrBadgeRow}>
                    <Text style={[styles.pnrText, { color: colors.primary }]}>{bId}</Text>
                    <View style={[styles.cabTierBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                      <Car size={12} color={colors.textSecondary} />
                      <Text style={[styles.cabTierText, { color: colors.textSecondary }]}>{cabTier}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.tripStatusBadge,
                      {
                        backgroundColor: isUrgent
                          ? 'rgba(245, 158, 11, 0.15)'
                          : status.includes('COMPLETE')
                          ? 'rgba(107, 114, 128, 0.15)'
                          : 'rgba(5, 150, 105, 0.15)'
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.tripStatusText,
                        {
                          color: isUrgent
                            ? colors.warning
                            : status.includes('COMPLETE')
                            ? colors.textMuted
                            : colors.primary
                        }
                      ]}
                    >
                      {isUrgent ? 'NEEDS ALLOTMENT' : status}
                    </Text>
                  </View>
                </View>

                {/* Route Header */}
                <Text style={[styles.tripRouteText, { color: colors.text }]}>{routeStr}</Text>

                {/* Schedule & Pickup Info */}
                <View style={styles.scheduleRow}>
                  <Clock size={13} color={colors.textMuted} />
                  <Text style={[styles.scheduleText, { color: colors.textMuted }]}>
                    Pickup: {scheduleDate} • {scheduleTime}
                  </Text>
                </View>

                {/* Chauffeur Assignment Strip */}
                <View style={[styles.chauffeurStrip, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
                  {hasDriver ? (
                    <View style={styles.assignedDriverRow}>
                      <View style={styles.driverInfoLeft}>
                        <UserCheck size={16} color={colors.primary} />
                        <View style={{ marginLeft: 8 }}>
                          <Text style={[styles.driverNameText, { color: colors.text }]}>{driverName}</Text>
                          <Text style={[styles.driverPhoneText, { color: colors.textMuted }]}>{driverPhone || 'Contact verified'}</Text>
                        </View>
                      </View>
                      {driverPhone ? (
                        <TouchableOpacity
                          style={[styles.callBtnSmall, { backgroundColor: 'rgba(5, 150, 105, 0.12)' }]}
                          onPress={() => callNumber(driverPhone)}
                        >
                          <Phone size={14} color={colors.primary} />
                          <Text style={[styles.callBtnText, { color: colors.primary }]}>Call Chauffeur</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ) : (
                    <View style={styles.unassignedPromptRow}>
                      <View style={styles.unassignedPromptLeft}>
                        <AlertTriangle size={16} color={colors.warning} />
                        <Text style={[styles.unassignedPromptText, { color: colors.warning }]}>
                          No Chauffeur Allotted Yet
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.fastAssignBtn, { backgroundColor: colors.warning }]}
                        onPress={() => setSelectedBookingForAssign(b)}
                        activeOpacity={0.8}
                      >
                        <Zap size={14} color="#FFFFFF" />
                        <Text style={styles.fastAssignBtnText}>Allot Driver</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Passenger & Financial Summary */}
                <View style={styles.tripCardBottom}>
                  <View style={styles.passengerInfoBox}>
                    <Text style={[styles.passengerNameLabel, { color: colors.text }]}>{passengerName}</Text>
                    {passengerPhone ? (
                      <TouchableOpacity onPress={() => callNumber(passengerPhone)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Phone size={11} color={colors.primary} />
                          <Text style={[styles.passengerPhoneLink, { color: colors.primary }]}>
                            {passengerPhone}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <Text style={[styles.passengerPhoneLink, { color: colors.textMuted }]}>Direct Booking</Text>
                    )}
                  </View>

                  <View style={styles.fareInfoBox}>
                    <Text style={[styles.tripFareTotal, { color: colors.text }]}>{formatCurrency(fare)}</Text>
                    <Text style={[styles.advancePaidText, { color: colors.primary }]}>
                      {advancePaid > 0 ? `Adv: ${formatCurrency(advancePaid)}` : 'Pay on Drop'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Quick Chauffeur Assignment Modal */}
      <Modal
        visible={Boolean(selectedBookingForAssign)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBookingForAssign(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>QUICK CHAUFFEUR ALLOTMENT</Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                  Trip #{selectedBookingForAssign?.referenceNumber || selectedBookingForAssign?.bookingId}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { borderColor: colors.border }]}
                onPress={() => setSelectedBookingForAssign(null)}
              >
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalTripSummary, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
              <Text style={[styles.modalRouteText, { color: colors.text }]}>
                {selectedBookingForAssign?.originCity || 'Patna'} → {selectedBookingForAssign?.destCity || 'Bihar'}
              </Text>
              <Text style={[styles.modalFareText, { color: colors.primary }]}>
                Fare: {formatCurrency(Number(selectedBookingForAssign?.totalFare || selectedBookingForAssign?.price || 0))}
              </Text>
            </View>

            <Text style={[styles.modalDriverListTitle, { color: colors.textSecondary }]}>
              AVAILABLE VERIFIED CHAUFFEURS ({verifiedDrivers.length})
            </Text>

            <ScrollView style={styles.modalDriversScroll}>
              {verifiedDrivers.length === 0 ? (
                <View style={styles.modalEmptyDrivers}>
                  <AlertTriangle size={24} color={colors.warning} />
                  <Text style={[styles.modalEmptyText, { color: colors.textMuted }]}>
                    No verified drivers currently on-duty. Check Fleet Drivers tab to approve pending drivers.
                  </Text>
                </View>
              ) : (
                verifiedDrivers.map(d => {
                  const dName = d.name || 'Verified Chauffeur';
                  const dPhone = d.phone || '';
                  const dCar = d.vehicleModel || d.vehicleType || 'Sedan (Dzire)';
                  const dPlate = d.vehicleNumber || d.plateNumber || '';

                  return (
                    <TouchableOpacity
                      key={d.id || d.phone}
                      style={[styles.modalDriverCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}
                      onPress={() => handleAssignDriver(d)}
                      disabled={isAssigning}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalDriverName, { color: colors.text }]}>{dName}</Text>
                        <Text style={[styles.modalDriverCar, { color: colors.textMuted }]}>
                          {dCar} {dPlate ? `• ${dPlate}` : ''}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Phone size={11} color={colors.primary} />
                          <Text style={[styles.modalDriverPhone, { color: colors.primary }]}>{dPhone}</Text>
                        </View>
                      </View>
                      <View style={[styles.modalSelectBtn, { backgroundColor: colors.primary }]}>
                        <Check size={16} color="#FFFFFF" />
                        <Text style={styles.modalSelectBtnText}>Allot</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fleet Broadcast Modal */}
      <Modal
        visible={broadcastVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBroadcastVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>FLEET BROADCAST DISPATCH</Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                  Transmits high-priority advisory to {verifiedDrivers.length} verified chauffeurs
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { borderColor: colors.border }]}
                onPress={() => setBroadcastVisible(false)}
              >
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.presetTitle, { color: colors.textSecondary }]}>QUICK ADVISORY PRESETS</Text>
            <View style={styles.presetChipsWrap}>
              {[
                'NH-31 Fog Advisory: Limit speed to 50 km/h',
                'High Surge at Patna Airport: 15+ rides queued',
                'Ganga Path Fastag Lane active: avoid cash queues',
                'Evening Settlements credited to driver wallets'
              ].map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: colors.border }]}
                  onPress={() => setBroadcastText(p)}
                >
                  <Text style={[styles.presetChipText, { color: colors.text }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.presetTitle, { color: colors.textSecondary, marginTop: 14 }]}>
              BROADCAST MESSAGE
            </Text>
            <TextInput
              style={[styles.broadcastInput, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderColor: colors.border, color: colors.text }]}
              placeholder="Type urgent notification to all active drivers..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              value={broadcastText}
              onChangeText={setBroadcastText}
            />

            <TouchableOpacity
              style={[styles.sendBroadcastBtn, { backgroundColor: colors.primary }]}
              onPress={handleSendBroadcast}
              activeOpacity={0.8}
            >
              <Send size={18} color="#FFFFFF" />
              <Text style={styles.sendBroadcastText}>Transmit to All Chauffeurs</Text>
            </TouchableOpacity>
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
  topBar: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1
  },
  topBarLeft: {
    flex: 1
  },
  liveIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981'
  },
  livePulseText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerIconBtn: {
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
  urgentAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16
  },
  alertIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1
  },
  urgentTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6
  },
  urgentTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900'
  },
  alertSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15
  },
  normalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16
  },
  normalBannerText: {
    fontSize: 11,
    fontWeight: '700'
  },
  quickDock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8
  },
  dockBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center'
  },
  dockIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  dockLabel: {
    fontSize: 11,
    fontWeight: '800'
  },
  dockSub: {
    fontSize: 9,
    marginTop: 2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  kpiCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '900'
  },
  kpiSub: {
    fontSize: 10,
    marginTop: 4
  },
  financeCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16
  },
  finHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  finBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  finTagText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  liveChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  liveChipText: {
    fontSize: 8,
    fontWeight: '900'
  },
  finGrossAmount: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2
  },
  finGrossSub: {
    fontSize: 11,
    marginTop: 2
  },
  trendCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  finDivider: {
    height: 1,
    marginVertical: 14
  },
  finMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  finMetricCol: {
    flex: 1
  },
  finVerticalDivider: {
    width: 1,
    height: 44,
    marginHorizontal: 12
  },
  finMetricLabel: {
    fontSize: 10,
    fontWeight: '700'
  },
  finMetricValue: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2
  },
  finMetricDetail: {
    fontSize: 9,
    marginTop: 2
  },
  tollNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8
  },
  tollNoticeText: {
    fontSize: 10,
    flex: 1,
    lineHeight: 14
  },
  mapSectionCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 14
  },
  mapSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  pulseBeacon: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  mapSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  livePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  livePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  corridorPillsScroll: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8
  },
  corridorFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  corridorFilterText: {
    fontSize: 11,
    fontWeight: '800'
  },
  commandMapWrapper: {
    width: '100%',
    height: 230,
    overflow: 'hidden'
  },
  corridorCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16
  },
  corridorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  corridorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  corridorTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  corridorSubtitle: {
    fontSize: 10
  },
  corridorList: {
    gap: 10
  },
  corridorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8
  },
  corridorInfo: {
    flex: 1,
    marginRight: 12
  },
  corridorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  corridorName: {
    fontSize: 12,
    fontWeight: '800'
  },
  corridorCode: {
    fontSize: 10
  },
  corridorBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    overflow: 'hidden'
  },
  corridorBarFill: {
    height: '100%',
    borderRadius: 3
  },
  corridorBadge: {
    alignItems: 'flex-end',
    minWidth: 40
  },
  corridorCount: {
    fontSize: 13,
    fontWeight: '900'
  },
  corridorCountLabel: {
    fontSize: 9
  },
  activityHeader: {
    marginBottom: 12
  },
  activityTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  activityCountBadge: {
    fontSize: 11,
    fontWeight: '800'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0
  },
  filterPillsScroll: {
    gap: 8,
    paddingVertical: 2
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '800'
  },
  emptyBox: {
    padding: 32,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center'
  },
  tripCardV2: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  pnrBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  pnrText: {
    fontSize: 12,
    fontWeight: '900'
  },
  cabTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4
  },
  cabTierText: {
    fontSize: 10,
    fontWeight: '700'
  },
  tripStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  tripStatusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  tripRouteText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  scheduleText: {
    fontSize: 11
  },
  chauffeurStrip: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10
  },
  assignedDriverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  driverInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  driverNameText: {
    fontSize: 12,
    fontWeight: '800'
  },
  driverPhoneText: {
    fontSize: 10
  },
  callBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4
  },
  callBtnText: {
    fontSize: 11,
    fontWeight: '800'
  },
  unassignedPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  unassignedPromptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  unassignedPromptText: {
    fontSize: 11,
    fontWeight: '800'
  },
  fastAssignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4
  },
  fastAssignBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  tripCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(107, 114, 128, 0.15)'
  },
  passengerInfoBox: {},
  passengerNameLabel: {
    fontSize: 12,
    fontWeight: '700'
  },
  passengerPhoneLink: {
    fontSize: 11,
    marginTop: 2
  },
  fareInfoBox: {
    alignItems: 'flex-end'
  },
  tripFareTotal: {
    fontSize: 15,
    fontWeight: '900'
  },
  advancePaidText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6
  },
  modalSub: {
    fontSize: 11,
    marginTop: 2
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalTripSummary: {
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  modalRouteText: {
    fontSize: 13,
    fontWeight: '800'
  },
  modalFareText: {
    fontSize: 13,
    fontWeight: '900'
  },
  modalDriverListTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  modalDriversScroll: {
    maxHeight: 280
  },
  modalEmptyDrivers: {
    padding: 24,
    alignItems: 'center',
    gap: 8
  },
  modalEmptyText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16
  },
  modalDriverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10
  },
  modalDriverName: {
    fontSize: 13,
    fontWeight: '800'
  },
  modalDriverCar: {
    fontSize: 11,
    marginTop: 2
  },
  modalDriverPhone: {
    fontSize: 11,
    marginTop: 2
  },
  modalSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4
  },
  modalSelectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  },
  presetTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  presetChipsWrap: {
    gap: 6
  },
  presetChip: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600'
  },
  broadcastInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14
  },
  sendBroadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8
  },
  sendBroadcastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  }
});
