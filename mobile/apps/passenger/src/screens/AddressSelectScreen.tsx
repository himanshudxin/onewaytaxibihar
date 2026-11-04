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
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';
import { usePassenger } from '../context/PassengerContext';
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Check,
  Search,
  Compass,
  Building,
  Plane,
  Train,
  CheckCircle2,
  Sparkles,
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
  { name: 'Danapur Railway Station', city: 'Patna', type: 'train' },
  { name: 'AIIMS Patna Phulwari', city: 'Patna', type: 'hospital' },
  { name: 'Gaya International Airport', city: 'Gaya', type: 'airport' },
  { name: 'Bodh Gaya Mahabodhi Temple', city: 'Gaya', type: 'tourism' },
  { name: 'Darbhanga Airport (DIB)', city: 'Darbhanga', type: 'airport' },
  { name: 'Muzaffarpur Junction', city: 'Muzaffarpur', type: 'train' },
];

export const AddressSelectScreen = ({ route, navigation }: any) => {
  const { mode = 'pickup' } = route.params || {};
  const { search, updateSearch } = usePassenger();

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

  const handleConfirmLocation = () => {
    const finalCity = selectedCity || (mode === 'pickup' ? 'Patna' : 'Gaya');
    if (mode === 'pickup') {
      updateSearch({ origin: finalCity, pickupAddress: addressDetail || `${finalCity} Doorstep` });
    } else {
      updateSearch({ destination: finalCity, dropAddress: addressDetail || `${finalCity} Destination` });
    }
    navigation.goBack();
  };

  const handleDetectLocation = () => {
    setDetectingGps(true);
    setTimeout(() => {
      setDetectingGps(false);
      const detectedCity = 'Patna';
      const detectedAddress = 'Patna Airport Terminal, Sheikhpura, Patna, Bihar';
      setSelectedCity(detectedCity);
      setAddressDetail(detectedAddress);
      if (mode === 'pickup') {
        updateSearch({ origin: detectedCity, pickupAddress: detectedAddress });
      } else {
        updateSearch({ destination: detectedCity, dropAddress: detectedAddress });
      }
      navigation.goBack();
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerOverline}>STEP 1: LOCATION SELECTION</Text>
          <Text style={styles.headerTitle}>
            {mode === 'pickup' ? 'Select Pickup Point' : 'Select Outstation Destination'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        
        {/* Visual Map Interface Container */}
        <View style={styles.visualMapCanvas}>
          {/* Stylized Grid Lines representing Map Canvas */}
          <View style={styles.mapGridOverlay} />
          <View style={styles.mapRoad1} />
          <View style={styles.mapRoad2} />
          <View style={styles.mapRoad3} />

          {/* Interactive Map Pin Marker */}
          <View style={styles.mapPinContainer}>
            <View style={styles.mapPinPulse} />
            <View style={[styles.mapPinHead, { backgroundColor: mode === 'pickup' ? '#059669' : '#D97706' }]}>
              {mode === 'pickup' ? (
                <MapPin size={18} color="#FFFFFF" />
              ) : (
                <Compass size={18} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.mapPinStem} />
            <View style={styles.mapPinShadow} />
          </View>

          {/* Map Floating HUD */}
          <View style={styles.mapHudBadge}>
            <Sparkles size={12} color="#D97706" />
            <Text style={styles.mapHudText}>
              {selectedCity || 'Bihar Outstation Highway Network'}
            </Text>
          </View>

          {/* GPS Quick Locate Floating Button */}
          <TouchableOpacity
            style={styles.gpsFloatingBtn}
            onPress={handleDetectLocation}
            disabled={detectingGps}
            activeOpacity={0.85}
          >
            {detectingGps ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <>
                <Navigation size={16} color="#059669" />
                <Text style={styles.gpsFloatingText}>Auto GPS</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder={mode === 'pickup' ? "Search pickup district or city..." : "Search drop destination in Bihar..."}
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => {
              if (query.trim()) {
                handleSelectCity(query.trim());
              }
            }}
            returnKeyType="done"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: '#94A3B8', fontSize: 16, paddingHorizontal: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Doorstep Address / Landmark Input */}
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>
            {mode === 'pickup' ? 'EXACT PICKUP DOORSTEP ADDRESS' : 'EXACT DROP LOCATION / HOTEL / LANDMARK'}
          </Text>
          <TextInput
            style={styles.detailInput}
            placeholder="e.g. Near Big Bazaar, Boring Canal Road, Patna"
            placeholderTextColor="#94A3B8"
            value={addressDetail}
            onChangeText={setAddressDetail}
          />
        </View>

        {/* Quick Bihar Hub Suggestions Horizontal Chips */}
        <View style={styles.hubsSection}>
          <Text style={styles.listHeader}>Frequent Transit Hubs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubsScroll}>
            {QUICK_HUBS.map((hub, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.hubChip,
                  selectedCity === hub.city && styles.hubChipActive
                ]}
                onPress={() => {
                  setSelectedCity(hub.city);
                  setAddressDetail(hub.name);
                }}
                activeOpacity={0.8}
              >
                {hub.type === 'airport' ? (
                  <Plane size={13} color={selectedCity === hub.city ? '#0F172A' : '#D97706'} />
                ) : (
                  <Train size={13} color={selectedCity === hub.city ? '#0F172A' : '#059669'} />
                )}
                <Text style={[styles.hubChipText, selectedCity === hub.city && styles.hubChipTextActive]}>
                  {hub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* City Suggestions List */}
        <Text style={[styles.listHeader, { marginTop: 10 }]}>All Bihar Service Districts</Text>
        <FlatList
          data={displayCities}
          keyExtractor={item => item}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedCity === item;
            const isCustom = item === query.trim() && !isExactMatch;
            return (
              <TouchableOpacity
                style={[
                  styles.cityRow,
                  isSelected && styles.cityRowSelected,
                  isCustom && styles.cityRowCustom
                ]}
                onPress={() => handleSelectCity(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cityLeft}>
                  <View style={[styles.cityIconWrap, isSelected && { backgroundColor: '#FEF3C7' }]}>
                    <MapPin size={16} color={isSelected ? '#D97706' : '#64748B'} />
                  </View>
                  <Text style={[styles.cityName, isSelected && { color: '#0F172A', fontWeight: '800' }]}>
                    {isCustom ? `Use "${item}"` : item}
                  </Text>
                </View>
                {isSelected && <Check size={18} color="#D97706" strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          }}
        />

        {/* Location Confirmation CTA Button */}
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmLocation}
          activeOpacity={0.88}
        >
          <CheckCircle2 size={18} color="#0F172A" />
          <Text style={styles.confirmButtonText}>
            Confirm {mode === 'pickup' ? 'Pickup' : 'Destination'} ({selectedCity || 'Patna'})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  visualMapCanvas: {
    height: 140,
    backgroundColor: '#EEF2F6',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapGridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E2E8F0',
    opacity: 0.25,
  },
  mapRoad1: {
    position: 'absolute',
    width: '120%',
    height: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-18deg' }],
  },
  mapRoad2: {
    position: 'absolute',
    width: '120%',
    height: 8,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '42deg' }],
  },
  mapRoad3: {
    position: 'absolute',
    height: '140%',
    width: 14,
    backgroundColor: '#FEF3C7',
    left: '45%',
  },
  mapPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPinPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(234, 179, 8, 0.25)',
  },
  mapPinHead: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  mapPinStem: {
    width: 2,
    height: 8,
    backgroundColor: '#0F172A',
  },
  mapPinShadow: {
    width: 16,
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  mapHudBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapHudText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  gpsFloatingBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gpsFloatingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  detailInput: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  hubsSection: {
    marginBottom: 10,
  },
  hubsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  hubChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hubChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  hubChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  hubChipTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  listHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 8,
  },
  cityRowSelected: {
    backgroundColor: '#FFFBEB',
  },
  cityRowCustom: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  cityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cityIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  confirmButton: {
    backgroundColor: '#F59E0B', // Golden Yellow
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
});
