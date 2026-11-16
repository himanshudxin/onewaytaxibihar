import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { usePassenger } from '../context/PassengerContext';
import { getCurrentDeviceLocation } from '../services/locationService';
import {
  MapPin,
  Crosshair,
  ArrowLeft,
  Check,
  Search,
  Building,
  Plane,
  Train,
  Sparkles,
  X,
} from 'lucide-react-native';

const BIHAR_CITIES = [
  'Patna',
  'Gaya',
  'Muzaffarpur',
  'Darbhanga',
  'Bhagalpur',
  'Begusarai',
  'Purnea',
  'Siwan',
  'Chhapra (Saran)',
  'Motihari (East Champaran)',
  'Bettiah (West Champaran)',
  'Samastipur',
  'Katihar',
  'Saharsa',
  'Sasaram (Rohtas)',
  'Bodh Gaya',
  'Rajgir',
  'Nalanda (Bihar Sharif)',
  'Ara (Bhojpur)',
  'Buxar',
  'Hajipur (Vaishali)',
  'Sitamarhi',
  'Madhubani',
  'Gopalganj',
  'Aurangabad',
  'Nawada',
  'Jehanabad',
  'Arwal',
  'Jamui',
  'Banka',
  'Munger',
  'Khagaria',
  'Lakhisarai',
  'Sheikhpura',
  'Supaul',
  'Madhepura',
  'Kishanganj',
  'Araria',
  'Bhabua (Kaimur)',
  'Sheohar',
  'Deoghar (Jharkhand)',
  'Varanasi (UP)',
  'Ranchi (Jharkhand)',
  'Gorakhpur (UP)',
  'Siliguri (WB)'
];

const QUICK_HUBS = [
  { name: 'Patna Airport (PAT)', city: 'Patna', type: 'airport' },
  { name: 'Patna Junction Railway Station', city: 'Patna', type: 'train' },
  { name: 'Gaya International Airport', city: 'Gaya', type: 'airport' },
  { name: 'Bodh Gaya Mahabodhi Temple', city: 'Gaya', type: 'tourism' },
  { name: 'Darbhanga Airport (DIB)', city: 'Darbhanga', type: 'airport' },
  { name: 'Muzaffarpur Junction', city: 'Muzaffarpur', type: 'train' },
];

export const AddressSelectScreen = ({ route, navigation }: any) => {
  const { mode = 'pickup' } = route.params || {};
  const { search, updateSearch } = usePassenger();
  const { colors, isDark } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(mode === 'pickup' ? search.origin : search.destination);
  const [addressDetail, setAddressDetail] = useState(
    mode === 'pickup' ? search.pickupAddress : search.dropAddress
  );
  const [detectingGps, setDetectingGps] = useState(false);

  const isExactMatch = BIHAR_CITIES.some(c => c.toLowerCase() === query.trim().toLowerCase());
  const filteredCities = BIHAR_CITIES.filter(c =>
    c.toLowerCase().includes(query.toLowerCase())
  );
  const displayCities = [
    ...(query.trim() && !isExactMatch ? [query.trim()] : []),
    ...filteredCities
  ];

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    if (mode === 'pickup') {
      updateSearch({ origin: city, pickupAddress: addressDetail || `${city} City Center` });
    } else {
      updateSearch({ destination: city, dropAddress: addressDetail || `${city} City Center` });
    }
    navigation.goBack();
  };

  const handleLiveGpsDetect = async () => {
    setDetectingGps(true);
    try {
      const location = await getCurrentDeviceLocation();
      setSelectedCity(location.city);
      setAddressDetail(location.formattedAddress);
      if (mode === 'pickup') {
        updateSearch({
          origin: location.city,
          pickupAddress: location.formattedAddress,
        });
      } else {
        updateSearch({
          destination: location.city,
          dropAddress: location.formattedAddress,
        });
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        'GPS Location Notice',
        err.message || 'Could not fetch current GPS location. Please check device location permissions.'
      );
    } finally {
      setDetectingGps(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.cardSurface, borderColor: colors.cardBorder }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleGroup}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {mode === 'pickup' ? 'Pickup Location' : 'Destination'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {mode === 'pickup' ? 'Where should the driver pick you up?' : 'Where are you traveling in Bihar?'}
          </Text>
        </View>
      </View>

      {/* Search Bar Input */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
          <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.inputText }]}
            placeholder={mode === 'pickup' ? 'Search pickup city, town or district...' : 'Search destination city in Bihar...'}
            placeholderTextColor={colors.inputPlaceholder}
            value={query}
            onChangeText={setQuery}
            autoFocus={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Uber-Style Instant Current Location Button */}
        <TouchableOpacity
          style={[
            styles.gpsPill,
            {
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(2, 132, 199, 0.08)',
              borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(2, 132, 199, 0.2)',
            }
          ]}
          onPress={handleLiveGpsDetect}
          disabled={detectingGps}
          activeOpacity={0.8}
        >
          {detectingGps ? (
            <ActivityIndicator size="small" color={colors.accentBlue} style={{ marginRight: 8 }} />
          ) : (
            <Crosshair size={18} color={colors.accentBlue} strokeWidth={2.4} style={{ marginRight: 8 }} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.gpsPillTitle, { color: isDark ? '#38BDF8' : '#0284C7' }]}>
              {detectingGps ? 'Locating via GPS Satellite...' : 'Use Current Live GPS Location'}
            </Text>
            <Text style={[styles.gpsPillSub, { color: colors.textMuted }]}>
              Auto-detect doorstep address via device sensors
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* List of Verified Bihar Hubs & Districts */}
      <FlatList
        data={displayCities}
        keyExtractor={(item) => item}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContainer}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={
          !query ? (
            <View style={styles.quickHubsSection}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>POPULAR TRANSIT HUBS</Text>
              <View style={styles.quickHubsGrid}>
                {QUICK_HUBS.map((hub, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.hubCard,
                      {
                        backgroundColor: colors.cardSurface,
                        borderColor: colors.cardBorder,
                      }
                    ]}
                    onPress={() => {
                      setSelectedCity(hub.city);
                      setAddressDetail(hub.name);
                      if (mode === 'pickup') {
                        updateSearch({ origin: hub.city, pickupAddress: hub.name });
                      } else {
                        updateSearch({ destination: hub.city, dropAddress: hub.name });
                      }
                      navigation.goBack();
                    }}
                    activeOpacity={0.7}
                  >
                    {hub.type === 'airport' ? (
                      <Plane size={15} color={colors.accentGold} />
                    ) : (
                      <Train size={15} color={colors.brandGreen} />
                    )}
                    <Text style={[styles.hubCardText, { color: colors.textPrimary }]} numberOfLines={1}>
                      {hub.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: 20 }]}>
                ALL 38 BIHAR DISTRICT CORRIDORS
              </Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => {
          const isSelected = selectedCity?.toLowerCase() === item.toLowerCase();
          return (
            <TouchableOpacity
              style={[
                styles.cityRow,
                {
                  backgroundColor: isSelected
                    ? isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)'
                    : colors.cardSurface,
                  borderColor: isSelected ? colors.accentGold : colors.cardBorder,
                }
              ]}
              onPress={() => handleSelectCity(item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.cityIconBox,
                  {
                    backgroundColor: isSelected
                      ? isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(217, 119, 6, 0.15)'
                      : colors.inputBg,
                  }
                ]}
              >
                <MapPin size={17} color={isSelected ? colors.accentGold : colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cityName, { color: colors.textPrimary, fontWeight: isSelected ? '800' : '600' }]}>
                  {item}
                </Text>
                <Text style={[styles.cityState, { color: colors.textMuted }]}>
                  Outstation Taxi Corridor • Zero Return Toll
                </Text>
              </View>
              {isSelected && <Check size={18} color={colors.accentGold} strokeWidth={2.8} />}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  clearBtn: {
    fontSize: 16,
    fontWeight: '700',
    padding: 4,
  },
  gpsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  gpsPillTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  gpsPillSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  quickHubsSection: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  quickHubsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 7,
  },
  hubCardText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  cityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  cityState: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
});
