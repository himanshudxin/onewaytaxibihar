import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { OnboardingModal } from '../../../../shared/components/OnboardingModal';
import { AppUpdaterModal } from '../../../../shared/components/AppUpdaterModal';
import { StorageService } from '../../../../shared/services/storage';
import { usePassenger } from '../context/PassengerContext';
import {
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  Users,
  Repeat,
  Compass,
  Bookmark,
  ChevronDown,
  Check,
  X,
  MessageCircle,
  ArrowUpDown,
  Navigation,
  Car,
} from 'lucide-react-native';

const POPULAR_CORRIDORS = [
  { dest: 'Gaya', dist: '104 km', fare: '₹2,198' },
  { dest: 'Muzaffarpur', dist: '75 km', fare: '₹1,898' },
  { dest: 'Darbhanga', dist: '140 km', fare: '₹2,698' },
  { dest: 'Bhagalpur', dist: '235 km', fare: '₹4,198' },
  { dest: 'Begusarai', dist: '125 km', fare: '₹2,498' },
  { dest: 'Varanasi', dist: '255 km', fare: '₹4,898' },
  { dest: 'Purnea', dist: '310 km', fare: '₹5,498' },
  { dest: 'Siwan', dist: '145 km', fare: '₹2,898' }
];

const SAVED_HUBS = [
  { name: 'Patna Airport (PAT)', city: 'Patna' },
  { name: 'Patna Junction Railway Station', city: 'Patna' },
  { name: 'Gaya Airport / Bodh Gaya', city: 'Gaya' },
  { name: 'AIIMS Patna Phulwari Sharif', city: 'Patna' }
];

const getDynamicDateOptions = () => {
  const options = [];
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dayName = dayNames[d.getDay()];
    const monthName = monthNames[d.getMonth()];
    const dateNum = d.getDate();

    let tag = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${dayName}, ${dateNum} ${monthName}`;
    let sub = i === 0 ? `Today • ${dateNum} ${monthName} (Immediate or anytime)` : i === 1 ? `Tomorrow • ${dateNum} ${monthName} (Early morning or scheduled)` : `Scheduled Outstation Departure`;
    
    options.push({
      label: tag,
      value: tag,
      sub,
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

export const HomeScreen = ({ navigation }: any) => {
  const { search, updateSearch, isLoggedIn, userPhone, myTrips } = usePassenger();
  const { colors, isDark } = useTheme();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const seen = await StorageService.getItem('otb_has_seen_onboarding');
        if (!seen) {
          setShowOnboarding(true);
        }
      } catch (e) {}
    })();
  }, []);

  const handleSearchCabs = () => {
    if (!search.origin.trim() || !search.destination.trim()) {
      Alert.alert('Required Fields', 'Please select both Pickup City and Drop Destination.');
      return;
    }

    if (search.origin.trim().toLowerCase() === search.destination.trim().toLowerCase()) {
      Alert.alert('Invalid Route', 'Pickup and Destination cannot be the same city for outstation trips.');
      return;
    }

    navigation.navigate('CabSelect');
  };

  const swapCities = () => {
    const currentOrigin = search.origin;
    const currentDest = search.destination;
    updateSearch({
      origin: currentDest || 'Gaya',
      destination: currentOrigin || 'Patna',
    });
  };

  const selectCorridor = (dest: string) => {
    updateSearch({ destination: dest, origin: 'Patna' });
  };

  const latestTrip = myTrips && myTrips.length > 0 ? myTrips[0] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Header Row with Customer Greeting & Official Brand Logo */}
        <View style={styles.topHeader}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingOverline}>NAMASTE & WELCOME</Text>
            <Text style={styles.greetingTitle}>
              {isLoggedIn ? `Traveler (${userPhone?.slice(-4) || 'Member'})` : 'Explore Bihar Taxis'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => navigation.navigate(isLoggedIn ? 'Profile' : 'Auth')}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{isLoggedIn ? '👤' : '🔑'}</Text>
            </View>
            <Text style={styles.profileBadgeText}>
              {isLoggedIn ? 'My Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Brand Banner Card */}
        <View style={styles.brandCard}>
          <BrandLogo size="header" showSubtitle subtitleText="BIHAR INTERCITY CAB NETWORK" />
          <View style={styles.zeroReturnPill}>
            <Sparkles size={13} color="#92400E" />
            <Text style={styles.zeroReturnPillText}>Zero Return Fare</Text>
          </View>
        </View>

        {/* Trip Type Selector (One-Way vs Round Trip) */}
        <View style={styles.tripTypeCard}>
          <TouchableOpacity
            style={[
              styles.tripTypeBtn,
              search.tripType === 'one-way' && styles.tripTypeBtnActive
            ]}
            onPress={() => updateSearch({ tripType: 'one-way' })}
            activeOpacity={0.8}
          >
            <ArrowRight size={16} color={search.tripType === 'one-way' ? '#0F172A' : '#64748B'} strokeWidth={2.5} />
            <Text
              style={[
                styles.tripTypeText,
                search.tripType === 'one-way' && styles.tripTypeTextActive
              ]}
            >
              One-Way Drop
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tripTypeBtn,
              search.tripType === 'round-trip' && styles.tripTypeBtnActive
            ]}
            onPress={() => updateSearch({ tripType: 'round-trip' })}
            activeOpacity={0.8}
          >
            <Repeat size={16} color={search.tripType === 'round-trip' ? '#0F172A' : '#64748B'} strokeWidth={2.5} />
            <Text
              style={[
                styles.tripTypeText,
                search.tripType === 'round-trip' && styles.tripTypeTextActive
              ]}
            >
              Round Trip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Route Booking Card */}
        <View style={styles.bookingCard}>
          
          {/* Pickup City Input */}
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => navigation.navigate('AddressSelect', { mode: 'pickup' })}
            activeOpacity={0.7}
          >
            <View style={styles.iconCirclePickup}>
              <MapPin size={18} color="#059669" />
            </View>
            <View style={styles.inputBody}>
              <Text style={styles.inputLabel}>PICKUP LOCATION / AIRPORT</Text>
              <Text style={styles.inputValue} numberOfLines={1}>
                {search.origin || 'Select Pickup Location'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Swap Cities Floating Action */}
          <View style={styles.swapDividerRow}>
            <View style={styles.swapDividerLine} />
            <TouchableOpacity style={styles.swapButton} onPress={swapCities} activeOpacity={0.8}>
              <ArrowUpDown size={14} color="#D97706" />
            </TouchableOpacity>
            <View style={styles.swapDividerLine} />
          </View>

          {/* Drop Destination Input */}
          <TouchableOpacity
            style={styles.inputRow}
            onPress={() => navigation.navigate('AddressSelect', { mode: 'drop' })}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircleDrop}>
              <Compass size={18} color="#D97706" />
            </View>
            <View style={styles.inputBody}>
              <Text style={styles.inputLabel}>DROP DESTINATION (OUTSTATION)</Text>
              <Text style={styles.inputValue} numberOfLines={1}>
                {search.destination || 'Select Drop City'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Schedule Date & Time Row */}
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateTimeItem}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Calendar size={16} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>TRAVEL DATE</Text>
                <Text style={styles.dateText}>{search.pickupDate || 'Today'}</Text>
              </View>
              <ChevronDown size={14} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeItem}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.8}
            >
              <Clock size={16} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>PICKUP TIME</Text>
                <Text style={styles.dateText}>{search.pickupTime || '10:00 AM'}</Text>
              </View>
              <ChevronDown size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Passenger Count Picker */}
          <View style={styles.passengerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Users size={16} color="#475569" />
              <Text style={styles.passengerLabel}>Passengers:</Text>
            </View>
            <View style={styles.countSelector}>
              {[1, 2, 4, 6].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.countPill,
                    search.passengerCount === num && styles.countPillActive
                  ]}
                  onPress={() => updateSearch({ passengerCount: num })}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.countText,
                      search.passengerCount === num && styles.countTextActive
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Golden Search Taxis CTA Button */}
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchCabs}
            activeOpacity={0.88}
          >
            <Car size={20} color="#0F172A" />
            <Text style={styles.searchButtonText}>Search Taxis • Guaranteed Fares</Text>
            <ArrowRight size={18} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Recent Booking Quick Card */}
        {latestTrip && (
          <View style={styles.recentBookingCard}>
            <View style={styles.recentHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Navigation size={14} color="#D97706" />
                <Text style={styles.recentTitle}>Recent Outstation Ride</Text>
              </View>
              <View style={styles.recentStatusBadge}>
                <Text style={styles.recentStatusText}>{latestTrip.bookingStatus || latestTrip.status || 'Active'}</Text>
              </View>
            </View>
            <Text style={styles.recentRoute}>
              {latestTrip.pickupCity} ➔ {latestTrip.dropCity}
            </Text>
            <View style={styles.recentFooter}>
              <Text style={styles.recentMeta}>
                PNR: {latestTrip.referenceNumber || latestTrip.id} • ₹{latestTrip.fareBreakdown?.totalFare || (latestTrip as any).totalFare || '2,198'}
              </Text>
              <TouchableOpacity
                style={styles.trackShortcutBtn}
                onPress={() => navigation.navigate('BookingTimeline', { booking: latestTrip, bookingId: latestTrip.id })}
              >
                <Text style={styles.trackShortcutText}>Track Trip</Text>
                <ArrowRight size={12} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Popular Bihar Outstation Corridors */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Popular Bihar Destinations</Text>
              <Text style={styles.sectionSubtitle}>Verified fixed fares from Patna doorstep</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.corridorScroll}>
            {POPULAR_CORRIDORS.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.corridorCard,
                  search.destination === c.dest && styles.corridorCardActive
                ]}
                onPress={() => selectCorridor(c.dest)}
                activeOpacity={0.8}
              >
                <View style={styles.corridorBadge}>
                  <Text style={styles.corridorBadgeText}>Fixed Route</Text>
                </View>
                <Text style={styles.corridorDest}>Patna ➔ {c.dest}</Text>
                <Text style={styles.corridorDist}>{c.dist} • Highway AC</Text>
                <View style={styles.corridorFareRow}>
                  <Text style={styles.corridorFare}>From {c.fare}</Text>
                  <ArrowRight size={14} color="#D97706" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 24x7 Customer Support & WhatsApp Shortcut */}
        <View style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <View style={styles.supportIconBadge}>
              <MessageCircle size={20} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>24x7 Chauffeur & Booking Desk</Text>
              <Text style={styles.supportSubtitle}>Direct WhatsApp booking & urgent assistance</Text>
            </View>
          </View>
          <View style={styles.supportActionsRow}>
            <TouchableOpacity
              style={styles.supportBtnWhatsApp}
              onPress={() => Linking.openURL('https://wa.me/917739406400?text=Hello%20OneWayTaxiBihar,%20I%20want%20to%20inquire%20about%20a%20taxi%20booking.')}
              activeOpacity={0.8}
            >
              <MessageCircle size={16} color="#FFFFFF" />
              <Text style={styles.supportBtnWhatsAppText}>WhatsApp Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportBtnCall}
              onPress={() => Linking.openURL('tel:+918002141816')}
              activeOpacity={0.8}
            >
              <PhoneCall size={16} color="#0F172A" />
              <Text style={styles.supportBtnCallText}>Call Helpline</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Saved Transit Hubs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Major Bihar Transit Hubs</Text>
          <View style={styles.hubsGrid}>
            {SAVED_HUBS.map((h, i) => (
              <TouchableOpacity
                key={i}
                style={styles.hubCard}
                onPress={() => {
                  updateSearch({ pickupAddress: h.name, origin: h.city });
                  Alert.alert('Departure Set', `${h.name} set as your pickup.`);
                }}
                activeOpacity={0.8}
              >
                <Bookmark size={14} color="#D97706" />
                <Text style={styles.hubName} numberOfLines={1}>
                  {h.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Value Guarantee */}
        <View style={styles.guaranteeCard}>
          <ShieldCheck size={28} color="#059669" />
          <View style={styles.guaranteeText}>
            <Text style={styles.guaranteeTitle}>Transparent One-Way Billing</Text>
            <Text style={styles.guaranteeDesc}>
              Never pay for return taxi kilometers. Every fare is guaranteed all-inclusive with fuel and commercial driver allowance.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Travel Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalOptionsContainer}>
                {getDynamicDateOptions().map((opt, idx) => {
                  const isSelected = search.pickupDate === opt.label || search.pickupDate === opt.iso || (search.pickupDate === 'Today' && idx === 0);
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.modalOptionItem,
                        isSelected && styles.modalOptionItemSelected
                      ]}
                      onPress={() => {
                        updateSearch({ pickupDate: opt.label });
                        setShowDatePicker(false);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalOptionTitle, isSelected && { color: '#B45309', fontWeight: '800' }]}>{opt.label}</Text>
                        <Text style={styles.modalOptionSub}>{opt.sub}</Text>
                      </View>
                      {isSelected && <Check size={18} color="#D97706" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Pickup Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalOptionsContainer}>
                {TIME_OPTIONS.map((timeStr, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.modalOptionItem,
                      search.pickupTime === timeStr && styles.modalOptionItemSelected
                    ]}
                    onPress={() => {
                      updateSearch({ pickupTime: timeStr });
                      setShowTimePicker(false);
                    }}
                  >
                    <Text style={[styles.modalOptionTitle, search.pickupTime === timeStr && { color: '#B45309', fontWeight: '800' }]}>{timeStr}</Text>
                    {search.pickupTime === timeStr && <Check size={18} color="#D97706" />}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Self-Hosted APK In-App Updater */}
      <AppUpdaterModal app="passenger" currentVersion="1.0.0" />

      {/* First-Launch Onboarding Walkthrough */}
      <OnboardingModal visible={showOnboarding} onClose={() => setShowOnboarding(false)} />

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
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
    marginBottom: 2,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  brandCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  zeroReturnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  zeroReturnPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  tripTypeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tripTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tripTypeBtnActive: {
    backgroundColor: '#F59E0B', // Golden Yellow
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tripTypeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tripTypeTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  iconCirclePickup: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleDrop: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBody: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  inputValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  swapDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: -4,
  },
  swapDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  swapButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTimeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passengerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  countSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  countPill: {
    width: 34,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countPillActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  countTextActive: {
    color: '#0F172A',
    fontWeight: '900',
  },
  searchButton: {
    backgroundColor: '#F59E0B', // Golden Yellow
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  searchButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  recentBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recentStatusBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  recentStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
  },
  recentRoute: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  recentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  recentMeta: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  trackShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trackShortcutText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  corridorScroll: {
    paddingVertical: 4,
    gap: 12,
  },
  corridorCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  corridorCardActive: {
    borderColor: '#F59E0B',
    borderWidth: 2,
    backgroundColor: '#FFFBEB',
  },
  corridorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  corridorBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  corridorDest: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  corridorDist: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  corridorFareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  corridorFare: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B45309',
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  supportIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  supportSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  supportActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  supportBtnWhatsApp: {
    flex: 1,
    height: 42,
    backgroundColor: '#059669',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  supportBtnWhatsAppText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  supportBtnCall: {
    flex: 1,
    height: 42,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  supportBtnCallText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '800',
  },
  hubsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '48%',
  },
  hubName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  guaranteeText: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  guaranteeDesc: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalOptionsContainer: {
    gap: 8,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalOptionItemSelected: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalOptionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
