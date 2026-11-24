import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Linking,
  ActivityIndicator,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { UberMapView } from '../components/UberMapView';
import { usePassenger } from '../context/PassengerContext';
import { getCurrentDeviceLocation, watchLiveLocation, LiveGpsUpdate } from '../services/locationService';
import { parseNaturalLanguageTrip } from '../../../../shared/utils/fareEngine';
import {
  Menu,
  ArrowUpDown,
  User,
  LogOut,
  ChevronRight,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Crosshair,
  Repeat,
  Check,
  X,
  MessageCircle,
  Sun,
  Moon,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const POPULAR_CORRIDORS = [
  { dest: 'Gaya', dist: '104 km', fare: '₹1,999' },
  { dest: 'Muzaffarpur', dist: '78 km', fare: '₹1,600' },
  { dest: 'Darbhanga', dist: '145 km', fare: '₹2,399' },
  { dest: 'Bhagalpur', dist: '235 km', fare: '₹3,299' },
  { dest: 'Begusarai', dist: '125 km', fare: '₹2,399' },
  { dest: 'Varanasi', dist: '246 km', fare: '₹3,299' },
  { dest: 'Purnea', dist: '290 km', fare: '₹3,299' },
  { dest: 'Siwan', dist: '135 km', fare: '₹2,299' }
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

const AI_QUICK_CHIPS = [
  { label: 'Patna to Gaya tomorrow 8am sedan', display: 'Patna → Gaya (Tmrw 8 AM)' },
  { label: 'Muzaffarpur to Patna Airport today', display: 'Muzaffarpur → Patna (Today)' },
  { label: 'Darbhanga to Patna evening prime sedan', display: 'Darbhanga → Patna (Evening)' },
  { label: 'Round trip to Rajgir weekend', display: 'Round Trip Rajgir (Weekend)' },
  { label: 'Bhagalpur to Patna Innova Crysta', display: 'Bhagalpur → Patna (Innova)' },
];

export const HomeScreen = ({ navigation }: any) => {
  const { search, updateSearch, isLoggedIn, userPhone } = usePassenger();
  const { colors, isDark, setThemeMode } = useTheme();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [showAccountDrawer, setShowAccountDrawer] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [liveGps, setLiveGps] = useState<LiveGpsUpdate | null>(null);

  // Optional Enclosed AI Smart Trip Assistant state (Down Screen)
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFeedback, setAiFeedback] = useState<{
    origin: string;
    destination: string;
    tripType: string;
    date: string;
    time: string;
    tier: string;
  } | null>(null);

  const handleApplyAiTrip = (promptText: string) => {
    if (!promptText || !promptText.trim()) return;
    const parsed = parseNaturalLanguageTrip(promptText, search.origin || 'Patna');
    if (parsed && parsed.destination) {
      updateSearch({
        origin: parsed.origin,
        destination: parsed.destination,
        tripType: parsed.tripType,
        departureDate: parsed.pickupDate,
        departureTime: parsed.pickupTime,
      });
      setAiFeedback({
        origin: parsed.origin,
        destination: parsed.destination,
        tripType: parsed.tripType === 'round-trip' ? 'Round Trip' : 'One-Way',
        date: parsed.pickupDate,
        time: parsed.pickupTime,
        tier: parsed.recommendedTier
      });
      setAiPrompt('');
    }
  };

  const dateOptions = getDynamicDateOptions();

  // Automatically fetch user's current GPS location on app open and continuously watch live GPS motion
  useEffect(() => {
    let isMounted = true;
    let watcherSub: any = null;

    (async () => {
      try {
        setDetectingGps(true);
        const location = await getCurrentDeviceLocation();
        if (isMounted && location) {
          updateSearch({
            origin: location.city,
            pickupAddress: location.formattedAddress,
            originCoords: { lat: location.latitude, lng: location.longitude },
          });
        }
      } catch (err) {
        // Silently default to Patna hub if permission not granted
        if (isMounted && !search.origin) {
          updateSearch({
            origin: 'Patna',
            pickupAddress: 'Patna, Bihar (Default Pickup Hub)',
            originCoords: { lat: 25.5941, lng: 85.1376 },
          });
        }
      } finally {
        if (isMounted) setDetectingGps(false);
      }

      // Continuous Live GPS Watcher (tracks location smoothly as user walks or drives)
      watcherSub = await watchLiveLocation((update) => {
        if (!isMounted) return;
        setLiveGps(update);
      });
    })();

    return () => {
      isMounted = false;
      if (watcherSub && typeof watcherSub.remove === 'function') {
        watcherSub.remove();
      }
    };
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

  const handleGpsInstantPickup = async (showNoticeOnError = false) => {
    setDetectingGps(true);
    try {
      const location = await getCurrentDeviceLocation();
      updateSearch({
        origin: location.city,
        pickupAddress: location.formattedAddress,
        originCoords: { lat: location.latitude, lng: location.longitude },
      });
    } catch (err: any) {
      if (showNoticeOnError) {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access in your device settings to detect your pickup location.'
        );
      }
    } finally {
      setDetectingGps(false);
    }
  };

  const toggleTheme = async () => {
    await setThemeMode(isDark ? 'light' : 'dark');
  };

  // Dynamic Uber Map & Bottom Sheet split
  const mapHeight = isMapExpanded
    ? Math.round(SCREEN_HEIGHT * 0.72)
    : Math.max(200, Math.round(SCREEN_HEIGHT * 0.44));

  const sheetHeight = isMapExpanded ? '30%' : '58%';

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Layer 1: True Full-Bleed 3D Map View (Uber Top Half) */}
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <UberMapView
          originCity={search.origin || 'Patna'}
          destinationCity={search.destination || ''}
          originCoords={search.originCoords}
          destinationCoords={search.destinationCoords}
          liveUserLocation={liveGps ? { lat: liveGps.latitude, lng: liveGps.longitude, heading: liveGps.heading, speed: liveGps.speed } : undefined}
          height={mapHeight}
          isExpanded={isMapExpanded}
          onToggleExpand={setIsMapExpanded}
          onRecenterPress={() => handleGpsInstantPickup(true)}
          onLocationSelected={(coords) => {
            updateSearch({
              pickupAddress: `Pinned at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} (Live Map)`,
              originCoords: { lat: coords.lat, lng: coords.lng }
            });
          }}
        />
      </View>

      {/* Layer 2: Clean Floating Header with Menu and Login Button */}
      <SafeAreaView edges={['top']} pointerEvents="box-none" style={styles.floatingTopBar}>
        <TouchableOpacity
          style={[
            styles.floatingMenuBtn,
            {
              backgroundColor: isDark ? 'rgba(11, 15, 25, 0.94)' : 'rgba(255, 255, 255, 0.96)',
              borderColor: colors.cardBorder,
            }
          ]}
          onPress={() => setShowAccountDrawer(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Menu size={22} color={colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        {isLoggedIn ? (
          <TouchableOpacity
            style={[
              styles.floatingAccountBtn,
              {
                backgroundColor: isDark ? 'rgba(11, 15, 25, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                borderColor: colors.cardBorder,
              }
            ]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 }} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textPrimary }}>
              +91 {userPhone?.slice(-4) || 'Account'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.floatingLoginBtn,
              {
                backgroundColor: '#16a34a',
                borderColor: '#15803d',
              }
            ]}
            onPress={() => navigation.navigate('Auth')}
            activeOpacity={0.85}
          >
            <User size={14} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 5 }} />
            <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.2 }}>
              Sign In / Login
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Layer 3: Uber Sliding Bottom Sheet Drawer */}
      <View
        style={[
          styles.uberBottomSheet,
          {
            height: sheetHeight as any,
            backgroundColor: colors.cardSurface,
            borderColor: colors.cardBorder,
            shadowColor: '#000',
            shadowOpacity: isDark ? 0.4 : 0.12,
          }
        ]}
      >
        {/* Handle Pill */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, { backgroundColor: isDark ? '#334155' : '#CBD5E1' }]} />
        </View>

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Segmented Trip Control (One-Way vs Round Trip) */}
          <View
            style={[
              styles.segmentContainer,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                search.tripType === 'one-way' && {
                  backgroundColor: colors.cardSurface,
                  shadowColor: '#000',
                  shadowOpacity: isDark ? 0.3 : 0.08,
                  shadowRadius: 6,
                  elevation: 2,
                }
              ]}
              onPress={() => updateSearch({ tripType: 'one-way' })}
              activeOpacity={0.8}
            >
              <ArrowRight size={14} color={search.tripType === 'one-way' ? colors.accentGold : colors.textMuted} strokeWidth={2.6} />
              <Text
                style={[
                  styles.segmentText,
                  { color: search.tripType === 'one-way' ? colors.textPrimary : colors.textMuted }
                ]}
              >
                One-Way Drop
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                search.tripType === 'round-trip' && {
                  backgroundColor: colors.cardSurface,
                  shadowColor: '#000',
                  shadowOpacity: isDark ? 0.3 : 0.08,
                  shadowRadius: 6,
                  elevation: 2,
                }
              ]}
              onPress={() => updateSearch({ tripType: 'round-trip' })}
              activeOpacity={0.8}
            >
              <Repeat size={14} color={search.tripType === 'round-trip' ? colors.accentGold : colors.textMuted} strokeWidth={2.6} />
              <Text
                style={[
                  styles.segmentText,
                  { color: search.tripType === 'round-trip' ? colors.textPrimary : colors.textMuted }
                ]}
              >
                Round Trip
              </Text>
            </TouchableOpacity>
          </View>

          {/* Uber Route Input Card */}
          <View
            style={[
              styles.routeCard,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.cardBorder,
                position: 'relative',
              }
            ]}
          >
            {/* Pickup Row */}
            <View style={styles.locationInputGroup}>
              <TouchableOpacity
                style={styles.locationInputMain}
                onPress={() => navigation.navigate('AddressSelect', { mode: 'pickup' })}
                activeOpacity={0.7}
              >
                <View style={[styles.bulletIcon, { backgroundColor: colors.brandGreen }]}>
                  <View style={styles.bulletInner} />
                </View>
                <View style={{ flex: 1, paddingRight: 42 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PICKUP LOCATION</Text>
                  <Text style={[styles.fieldValue, { color: colors.textPrimary }]} numberOfLines={1}>
                    {search.origin || 'Select Pickup City'}
                  </Text>
                  {search.pickupAddress ? (
                    <Text style={[styles.fieldAddressDetail, { color: colors.textMuted }]} numberOfLines={1}>
                      {search.pickupAddress}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>

              {/* GPS Instant Trigger */}
              <TouchableOpacity
                style={[
                  styles.gpsIconBtn,
                  {
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(2, 132, 199, 0.2)',
                    marginRight: 40,
                  }
                ]}
                onPress={() => handleGpsInstantPickup(true)}
                disabled={detectingGps}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {detectingGps ? (
                  <ActivityIndicator size="small" color={colors.accentBlue} />
                ) : (
                  <Crosshair size={18} color={colors.accentBlue} strokeWidth={2.4} />
                )}
              </TouchableOpacity>
            </View>

            {/* Connecting Vertical Route Line */}
            <View style={styles.routeDividerRow}>
              <View style={[styles.verticalRouteLine, { backgroundColor: colors.divider }]} />
              <View style={[styles.horizontalDivider, { backgroundColor: colors.divider }]} />
            </View>

            {/* Destination Drop Row */}
            <TouchableOpacity
              style={styles.locationInputGroup}
              onPress={() => navigation.navigate('AddressSelect', { mode: 'destination' })}
              activeOpacity={0.7}
            >
              <View style={[styles.squareIcon, { backgroundColor: colors.accentGold }]}>
                <View style={styles.squareInner} />
              </View>
              <View style={{ flex: 1, paddingRight: 42 }}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DROP DESTINATION</Text>
                <Text style={[styles.fieldValue, { color: colors.textPrimary }]} numberOfLines={1}>
                  {search.destination || 'Select Drop City'}
                </Text>
                <Text style={[styles.fieldAddressDetail, { color: colors.textMuted }]} numberOfLines={1}>
                  {search.dropAddress || 'Doorstep drop in Bihar district'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Professional Right-Side Swap Button */}
            <TouchableOpacity
              style={[
                styles.rightSwapBtn,
                {
                  backgroundColor: colors.cardSurface,
                  borderColor: colors.cardBorder,
                }
              ]}
              onPress={swapCities}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowUpDown size={15} color={colors.accentGold} strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Date & Time Row */}
            <View style={[styles.scheduleBar, { borderTopColor: colors.cardBorder }]}>
              <TouchableOpacity
                style={styles.scheduleItem}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Calendar size={15} color={colors.accentGold} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scheduleLabel, { color: colors.textMuted }]}>DATE</Text>
                  <Text style={[styles.scheduleValue, { color: colors.textPrimary }]} numberOfLines={1}>
                    {search.departureDate ? search.departureDate.split(' • ')[0] : 'Today'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={[styles.scheduleDivider, { backgroundColor: colors.cardBorder }]} />

              <TouchableOpacity
                style={styles.scheduleItem}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <Clock size={15} color={colors.accentGold} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scheduleLabel, { color: colors.textMuted }]}>TIME</Text>
                  <Text style={[styles.scheduleValue, { color: colors.textPrimary }]} numberOfLines={1}>
                    {search.departureTime ? search.departureTime.split(' ')[0] : 'Immediate'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Action Button: Choose Vehicle (Uber Style) */}
          <TouchableOpacity
            style={[styles.searchCtaBtn, { backgroundColor: colors.textPrimary }]}
            onPress={handleSearchCabs}
            activeOpacity={0.85}
          >
            <Text style={[styles.searchCtaText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
              Choose Vehicle & Fares
            </Text>
            <ArrowRight size={17} color={isDark ? '#000000' : '#FFFFFF'} strokeWidth={2.8} />
          </TouchableOpacity>

          {/* Zero Return Toll Guarantee Strip */}
          <View
            style={[
              styles.assuranceStrip,
              {
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(217, 119, 6, 0.06)',
                borderColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.15)',
              }
            ]}
          >
            <ShieldCheck size={17} color={colors.accentGold} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.assuranceTitle, { color: colors.accentGold }]}>
                Zero Return Toll & Fare Guarantee
              </Text>
              <Text style={[styles.assuranceSub, { color: colors.textSecondary }]}>
                Guaranteed one-way billing across all 38 Bihar districts.
              </Text>
            </View>
          </View>

          {/* Popular Corridors Horizontal Carousel */}
          <View style={styles.corridorsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Popular Bihar Corridors</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.corridorScroll}>
            {POPULAR_CORRIDORS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.corridorCard,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.cardBorder,
                  }
                ]}
                onPress={() => {
                  updateSearch({ origin: 'Patna', destination: item.dest });
                  navigation.navigate('CabSelect');
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.corridorRoute, { color: colors.textPrimary }]}>
                  Patna → {item.dest}
                </Text>
                <Text style={[styles.corridorDist, { color: colors.textMuted }]}>{item.dist}</Text>
                <Text style={[styles.corridorFare, { color: colors.accentGold }]}>{item.fare}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 24x7 Helpdesk Strip */}
          <View
            style={[
              styles.helpStrip,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.helpTitle, { color: colors.textPrimary }]}>Need Immediate Help?</Text>
              <Text style={[styles.helpSub, { color: colors.textMuted }]}>Direct phone & WhatsApp dispatch</Text>
            </View>

            <View style={styles.helpActions}>
              <TouchableOpacity
                style={[styles.helpBtn, { backgroundColor: colors.cardSurface, borderColor: colors.cardBorder }]}
                onPress={() => Linking.openURL('tel:+918002141816')}
              >
                <PhoneCall size={15} color={colors.accentGold} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.helpBtn, { backgroundColor: colors.cardSurface, borderColor: colors.cardBorder }]}
                onPress={() => Linking.openURL('https://wa.me/917739406400')}
              >
                <MessageCircle size={15} color={colors.brandGreen} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Optional Enclosed AI Smart Trip Assistant (Down Screen) */}
          <View style={[styles.aiEnclosedCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={styles.aiAccordionHeader}
              onPress={() => setShowAiAssistant(!showAiAssistant)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                <Sparkles size={16} color={colors.accentGold} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.aiAccordionTitle, { color: colors.textPrimary }]}>
                    AI Smart Trip Assistant (Optional)
                  </Text>
                  <Text style={[styles.aiAccordionSub, { color: colors.textMuted }]}>
                    Tap to quick-fill by typing in plain words
                  </Text>
                </View>
              </View>
              <View style={[styles.aiTogglePill, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                <Text style={[styles.aiToggleText, { color: colors.accentGold }]}>
                  {showAiAssistant ? 'Close ▲' : 'Open ▾'}
                </Text>
              </View>
            </TouchableOpacity>

            {showAiAssistant && (
              <View style={styles.aiExpandedContent}>
                {/* AI Text Input Bar */}
                <View
                  style={[
                    styles.aiInputRow,
                    {
                      backgroundColor: colors.cardSurface,
                      borderColor: colors.cardBorder,
                    }
                  ]}
                >
                  <Wand2 size={15} color={colors.accentGold} style={{ marginLeft: 10, marginRight: 6 }} />
                  <TextInput
                    style={[styles.aiTextInput, { color: colors.textPrimary }]}
                    value={aiPrompt}
                    onChangeText={setAiPrompt}
                    placeholder="e.g. 'Patna to Gaya tomorrow 8am sedan'"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="go"
                    onSubmitEditing={() => handleApplyAiTrip(aiPrompt)}
                  />
                  {aiPrompt.length > 0 ? (
                    <TouchableOpacity
                      style={styles.aiClearBtn}
                      onPress={() => setAiPrompt('')}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X size={14} color={colors.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={[
                      styles.aiFillBtn,
                      {
                        backgroundColor: aiPrompt.trim().length > 0 ? colors.accentGold : (isDark ? '#334155' : '#E2E8F0'),
                      }
                    ]}
                    onPress={() => handleApplyAiTrip(aiPrompt)}
                    activeOpacity={0.8}
                  >
                    <Zap size={12} color={aiPrompt.trim().length > 0 ? '#000000' : colors.textMuted} strokeWidth={2.8} />
                    <Text
                      style={[
                        styles.aiFillBtnText,
                        { color: aiPrompt.trim().length > 0 ? '#000000' : colors.textMuted }
                      ]}
                    >
                      Fill
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* AI 1-Tap Quick Chips Carousel */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.aiChipsScroll}
                >
                  {AI_QUICK_CHIPS.map((chip, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.aiChipItem,
                        {
                          backgroundColor: colors.cardSurface,
                          borderColor: colors.cardBorder,
                        }
                      ]}
                      onPress={() => handleApplyAiTrip(chip.label)}
                      activeOpacity={0.7}
                    >
                      <Zap size={10} color={colors.accentGold} />
                      <Text style={[styles.aiChipText, { color: colors.textPrimary }]}>
                        {chip.display}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Active AI Confirmation Banner */}
                {aiFeedback && (
                  <View
                    style={[
                      styles.aiFeedbackPill,
                      {
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(5, 150, 105, 0.08)',
                        borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(5, 150, 105, 0.25)',
                      }
                    ]}
                  >
                    <Check size={14} color={colors.brandGreen} strokeWidth={2.6} />
                    <View style={{ flex: 1, marginLeft: 6 }}>
                      <Text style={[styles.aiFeedbackTitle, { color: colors.brandGreen }]}>
                        Filled: {aiFeedback.origin} ➔ {aiFeedback.destination} ({aiFeedback.tripType})
                      </Text>
                      <Text style={[styles.aiFeedbackSub, { color: colors.textSecondary }]}>
                        {aiFeedback.date} • {aiFeedback.time} • {aiFeedback.tier.toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.aiFeedbackActionBtn, { backgroundColor: colors.brandGreen }]}
                      onPress={() => navigation.navigate('CabSelect')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.aiFeedbackActionText}>View Cabs</Text>
                      <ArrowRight size={12} color="#FFFFFF" strokeWidth={2.8} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.drawerBackdrop}>
          <View style={[styles.pickerModal, { backgroundColor: colors.cardSurface, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitleText, { color: colors.textPrimary }]}>Select Departure Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              {dateOptions.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.pickerOption,
                    {
                      borderBottomColor: colors.cardBorder,
                      backgroundColor: search.departureDate === opt.value
                        ? isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)'
                        : 'transparent'
                    }
                  ]}
                  onPress={() => {
                    updateSearch({ departureDate: opt.value });
                    setShowDatePicker(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickerOptionLabel, { color: colors.textPrimary, fontWeight: search.departureDate === opt.value ? '800' : '600' }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.pickerOptionSub, { color: colors.textMuted }]}>{opt.sub}</Text>
                  </View>
                  {search.departureDate === opt.value && (
                    <Check size={18} color={colors.accentGold} strokeWidth={2.8} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.pickerModal, { backgroundColor: colors.cardSurface, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitleText, { color: colors.textPrimary }]}>Select Pickup Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              {TIME_OPTIONS.map((time, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.pickerOption,
                    {
                      borderBottomColor: colors.cardBorder,
                      backgroundColor: search.departureTime === time
                        ? isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)'
                        : 'transparent'
                    }
                  ]}
                  onPress={() => {
                    updateSearch({ departureTime: time });
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={[styles.pickerOptionLabel, { color: colors.textPrimary, fontWeight: search.departureTime === time ? '800' : '600' }]}>
                    {time}
                  </Text>
                  {search.departureTime === time && (
                    <Check size={18} color={colors.accentGold} strokeWidth={2.8} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    
      {/* Account & Login Drawer Segment (Left Vertical Sidebar) */}
      <Modal
        visible={showAccountDrawer}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAccountDrawer(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.drawerSheet,
              {
                backgroundColor: colors.cardSurface,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            {/* Drawer Header: Brand Logo & Name Open At Top */}
            <View style={[styles.drawerTopRow, { borderBottomColor: colors.cardBorder, borderBottomWidth: 1, paddingBottom: 14, marginBottom: 12 }]}>
              <BrandLogo size="header" showSubtitle={false} />
              <TouchableOpacity
                style={[styles.closeDrawerBtn, { backgroundColor: colors.inputBg }]}
                onPress={() => setShowAccountDrawer(false)}
              >
                <X size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Drawer Body: Login & Account Details */}
            <ScrollView style={styles.drawerScroll} showsVerticalScrollIndicator={false}>
              {isLoggedIn ? (
                /* Logged In Account Details Segment */
                <View style={[styles.accountCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                  <View style={[styles.avatarCircle, { backgroundColor: colors.accentGold }]}>
                    <Text style={styles.avatarText}>{userPhone?.slice(-2) || 'OK'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.accountName, { color: colors.textPrimary }]}>Verified Passenger</Text>
                    <Text style={[styles.accountPhone, { color: colors.textMuted }]}>
                      +91 {userPhone || '98765 43210'}
                    </Text>
                  </View>
                  <View style={[styles.verifiedPill, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                    <Check size={12} color={colors.brandGreen} />
                    <Text style={[styles.verifiedText, { color: colors.brandGreen }]}>Active</Text>
                  </View>
                </View>
              ) : (
                /* Login / Sign In Prompt Segment */
                <View style={[styles.loginPromptCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.loginPromptHeader}>
                    <User size={22} color={colors.accentGold} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.loginPromptTitle, { color: colors.textPrimary }]}>Sign In to Account</Text>
                      <Text style={[styles.loginPromptSub, { color: colors.textMuted }]}>
                        Manage bookings, view invoices & track driver live
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.loginCtaBtn, { backgroundColor: colors.accentGold }]}
                    onPress={() => {
                      setShowAccountDrawer(false);
                      navigation.navigate('Auth');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.loginCtaText}>Sign In / Register (+91 OTP)</Text>
                    <ChevronRight size={16} color="#0F172A" strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Theme Selection Row (Inside Account Drawer) */}
              <View style={[styles.themeRowCard, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {isDark ? <Moon size={18} color={colors.accentGold} /> : <Sun size={18} color={colors.accentGold} />}
                  <View>
                    <Text style={[styles.themeRowTitle, { color: colors.textPrimary }]}>App Appearance</Text>
                    <Text style={[styles.themeRowSub, { color: colors.textMuted }]}>
                      {isDark ? 'Dark Theme (Executive)' : 'Light Theme (Daylight)'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.themeSwitchPill,
                    {
                      backgroundColor: colors.cardSurface,
                      borderColor: colors.accentGold,
                    }
                  ]}
                  onPress={toggleTheme}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.themeSwitchText, { color: colors.accentGold }]}>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Drawer Links */}
              <View style={[styles.drawerLinksList, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                <TouchableOpacity
                  style={styles.drawerLinkItem}
                  onPress={() => {
                    setShowAccountDrawer(false);
                    navigation.navigate('MyBookings');
                  }}
                >
                  <Text style={[styles.drawerLinkText, { color: colors.textPrimary }]}>My Rides & Invoices</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>

                <View style={[styles.drawerLinkDivider, { backgroundColor: colors.divider }]} />

                <TouchableOpacity
                  style={styles.drawerLinkItem}
                  onPress={() => Linking.openURL('tel:+919123456789')}
                >
                  <Text style={[styles.drawerLinkText, { color: colors.textPrimary }]}>24x7 Driver Helpline (+91 91234 56789)</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </TouchableOpacity>

                {isLoggedIn && (
                  <>
                    <View style={[styles.drawerLinkDivider, { backgroundColor: colors.divider }]} />
                    <TouchableOpacity
                      style={styles.drawerLinkItem}
                      onPress={() => {
                        setShowAccountDrawer(false);
                        Alert.alert('Sign Out', 'You have been signed out.');
                      }}
                    >
                      <Text style={[styles.drawerLinkText, { color: colors.accentRed }]}>Sign Out</Text>
                      <LogOut size={16} color={colors.accentRed} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </ScrollView>
          </View>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setShowAccountDrawer(false)}
          />
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  liveStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#10B981',
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  navMenuBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rightSwapBtn: {
    position: 'absolute',
    right: 12,
    top: 50,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  drawerBackdrop: {
    flex: 1,
  },
  drawerSheet: {
    width: '82%',
    maxWidth: 320,
    height: '100%',
    borderRightWidth: 1,
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 44 : 54,
    paddingBottom: 28,
  },
  drawerHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  drawerHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#64748B',
    marginBottom: 12,
    opacity: 0.5,
  },
  drawerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeDrawerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    marginTop: 8,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  accountName: {
    fontSize: 15,
    fontWeight: '800',
  },
  accountPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '800',
  },
  loginPromptCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  loginPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  loginPromptTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  loginPromptSub: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
  loginCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  loginCtaText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
  },
  themeRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  themeRowTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  themeRowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  themeSwitchPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeSwitchText: {
    fontSize: 11,
    fontWeight: '800',
  },
  drawerLinksList: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  drawerLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  drawerLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
  drawerLinkDivider: {
    height: 1,
    width: '100%',
  },

  mainWrapper: {
    flex: 1,
    position: 'relative',
  },
  mapContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  floatingTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingMenuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  islandNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  accountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  accountPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  uberBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 16,
    elevation: 12,
    zIndex: 20,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  aiEnclosedCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  aiAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  aiAccordionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  aiAccordionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  aiTogglePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  aiToggleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  aiExpandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    paddingRight: 4,
    marginBottom: 8,
  },
  aiTextInput: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  aiClearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  aiFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aiFillBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  aiChipsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  aiChipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 20,
    borderWidth: 1,
  },
  aiChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aiFeedbackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  aiFeedbackTitle: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  aiFeedbackSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  aiFeedbackActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  aiFeedbackActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  routeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  locationInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationInputMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  squareIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareInner: {
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#0F172A',
  },
  fieldLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  fieldAddressDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  gpsIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    paddingLeft: 9,
  },
  verticalRouteLine: {
    width: 2,
    height: 20,
    borderRadius: 1,
  },
  swapCityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
    marginRight: 10,
  },
  horizontalDivider: {
    flex: 1,
    height: 1,
  },
  scheduleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  scheduleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
  },
  scheduleLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  scheduleValue: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  searchCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchCtaText: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  assuranceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  assuranceTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  assuranceSub: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  corridorsHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  corridorScroll: {
    gap: 10,
    paddingBottom: 16,
  },
  corridorCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 130,
  },
  corridorRoute: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  corridorDist: {
    fontSize: 10,
    fontWeight: '500',
    marginVertical: 2,
  },
  corridorFare: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  helpStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  helpTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  helpSub: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  helpActions: {
    flexDirection: 'row',
    gap: 8,
  },
  helpBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  pickerModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 10,
  },
  pickerOptionLabel: {
    fontSize: 14,
  },
  pickerOptionSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
