import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { MapPin, Calendar, Clock, ArrowRight, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react-native';

const POPULAR_DESTINATIONS = ['Gaya', 'Muzaffarpur', 'Darbhanga', 'Bhagalpur', 'Begusarai', 'Purnea', 'Siwan', 'Varanasi'];

export const HomeScreen = ({ navigation }: any) => {
  const { currentSearch, setCurrentSearch, activeRole, setActiveRole } = useApp();
  const [phone, setPhone] = useState('');
  const colors = Colors.dark;

  const handleSearch = () => {
    if (!phone || phone.replace(/\D/g, '').length !== 10) {
      Alert.alert('Mobile Number Required', 'Please enter a valid 10-digit mobile number to view guaranteed all-inclusive fares.');
      return;
    }
    navigation.navigate('CabSelect', { phone });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Header Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.brandTitle, { color: colors.text }]}>
              OneWayTaxi<Text style={{ color: colors.primary }}>Bihar</Text>
            </Text>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
              Bihar's #1 Fixed One-Way Cab Network
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.roleSwitchBtn, { borderColor: colors.borderLight, backgroundColor: colors.surface }]}
            onPress={() => setActiveRole(activeRole === 'customer' ? 'driver' : 'customer')}
          >
            <Text style={[styles.roleSwitchText, { color: colors.primary }]}>
              {activeRole === 'customer' ? 'Driver Partner ➔' : 'Rider View ➔'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Festival Offer Banner */}
        <View style={[styles.festivalBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <Sparkles color={colors.accent} size={18} />
          <Text style={[styles.festivalText, { color: colors.text }]}>
            Special Offer: Use code <Text style={{ color: colors.accent, fontWeight: '800' }}>CHHATH100</Text> for ₹100 off!
          </Text>
        </View>

        {/* Trip Type Tabs */}
        <View style={[styles.tripTypeTabs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tripTab, currentSearch.tripType === 'oneway' && { backgroundColor: colors.primary }]}
            onPress={() => setCurrentSearch(s => ({ ...s, tripType: 'oneway' }))}
          >
            <Text style={[styles.tripTabText, { color: currentSearch.tripType === 'oneway' ? '#fff' : colors.textSecondary }]}>
              One-Way (₹0 Return)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tripTab, currentSearch.tripType === 'roundtrip' && { backgroundColor: colors.primary }]}
            onPress={() => setCurrentSearch(s => ({ ...s, tripType: 'roundtrip' }))}
          >
            <Text style={[styles.tripTabText, { color: currentSearch.tripType === 'roundtrip' ? '#fff' : colors.textSecondary }]}>
              Round-Trip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Card Container */}
        <View style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          {/* Pickup Input */}
          <View style={styles.inputGroup}>
            <View style={[styles.iconBullet, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <MapPin color={colors.primary} size={18} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>PICKUP CITY</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={currentSearch.origin}
                onChangeText={t => setCurrentSearch(s => ({ ...s, origin: t }))}
                placeholder="Enter pickup city"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Drop Input */}
          <View style={styles.inputGroup}>
            <View style={[styles.iconBullet, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <MapPin color={colors.danger} size={18} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>DROP DESTINATION</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={currentSearch.destination}
                onChangeText={t => setCurrentSearch(s => ({ ...s, destination: t }))}
                placeholder="Enter destination"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Date & Time Row */}
          <View style={styles.rowInputs}>
            <View style={[styles.halfInputGroup, { flex: 1 }]}>
              <Calendar color={colors.textSecondary} size={16} />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>DATE</Text>
                <Text style={[styles.dateText, { color: colors.text }]}>{currentSearch.pickupDate}</Text>
              </View>
            </View>

            <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

            <View style={[styles.halfInputGroup, { flex: 1, paddingLeft: 12 }]}>
              <Clock color={colors.textSecondary} size={16} />
              <View style={{ marginLeft: 8 }}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>TIME</Text>
                <Text style={[styles.dateText, { color: colors.text }]}>{currentSearch.pickupTime}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Mandatory Phone Input for Instant Verification */}
          <View style={styles.inputGroup}>
            <View style={[styles.iconBullet, { backgroundColor: colors.accentLight }]}>
              <PhoneCall color={colors.accent} size={18} />
            </View>
            <View style={styles.inputWrap}>
              <Text style={[styles.inputLabel, { color: colors.textMuted }]}>10-DIGIT MOBILE NUMBER</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Search Button */}
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: colors.primary }]}
            onPress={handleSearch}
          >
            <Text style={styles.searchBtnText}>Check Guaranteed Fares</Text>
            <ArrowRight color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        {/* Popular Destination Chips */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Popular Outstation Corridors</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {POPULAR_DESTINATIONS.map(city => (
            <TouchableOpacity
              key={city}
              style={[styles.cityChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setCurrentSearch(s => ({ ...s, destination: city }))}
            >
              <Text style={[styles.cityChipText, { color: colors.text }]}>Patna ➔ {city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Ethical Assurance Strip */}
        <View style={[styles.assuranceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ShieldCheck color={colors.primary} size={24} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.assuranceTitle, { color: colors.text }]}>Zero Return Fare Guarantee</Text>
            <Text style={[styles.assuranceDesc, { color: colors.textMuted }]}>
              Pay only for the one-way distance traveled. All commercial toll taxes and driver allowances included.
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  roleSwitchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1
  },
  roleSwitchText: {
    fontSize: 12,
    fontWeight: '700'
  },
  festivalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8
  },
  festivalText: {
    fontSize: 12.5,
    flex: 1
  },
  tripTypeTabs: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16
  },
  tripTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  tripTabText: {
    fontSize: 13,
    fontWeight: '700'
  },
  searchCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6
  },
  iconBullet: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  inputWrap: {
    flex: 1
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  textInput: {
    fontSize: 16,
    fontWeight: '700',
    padding: 0
  },
  divider: {
    height: 1,
    marginVertical: 10
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  halfInputGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  verticalDivider: {
    width: 1,
    height: 32
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700'
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
    gap: 8
  },
  searchBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 20
  },
  cityChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8
  },
  cityChipText: {
    fontSize: 12.5,
    fontWeight: '700'
  },
  assuranceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1
  },
  assuranceTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 2
  },
  assuranceDesc: {
    fontSize: 11.5,
    lineHeight: 16
  }
});
