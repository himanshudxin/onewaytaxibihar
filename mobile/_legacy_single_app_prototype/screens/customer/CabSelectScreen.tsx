import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { Car, Users, Briefcase, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react-native';

export const CabSelectScreen = ({ route, navigation }: any) => {
  const { phone } = route.params || { phone: '' };
  const { currentSearch, fares } = useApp();
  const colors = Colors.dark;

  const [selectedTier, setSelectedTier] = useState<'hatchback' | 'sedan' | 'suv'>('sedan');

  // Match destination from live MongoDB fares database
  const matchedFare = fares.find(
    f => f.destination.toLowerCase().includes(currentSearch.destination.toLowerCase()) ||
         f.destCity.toLowerCase().includes(currentSearch.destination.toLowerCase())
  );

  const baseSedan = matchedFare ? matchedFare.sedan : 2198;
  const baseHatch = matchedFare ? matchedFare.hatchback : 1698;
  const baseSuv = matchedFare ? matchedFare.suv : 3398;
  const distanceKm = matchedFare ? matchedFare.distanceKm : 104;

  const cabTiers = [
    {
      id: 'sedan',
      title: 'Prime Sedan',
      models: 'Maruti Dzire, Toyota Etios, Hyundai Aura',
      price: baseSedan,
      badge: 'MOST POPULAR',
      pax: '4 Passengers',
      bags: '3-4 Large Bags',
      ac: true
    },
    {
      id: 'hatchback',
      title: 'Go Hatchback',
      models: 'Maruti WagonR, Tata Tiago, Celerio',
      price: baseHatch,
      badge: 'BEST VALUE',
      pax: '4 Passengers',
      bags: '2 Medium Bags',
      ac: true
    },
    {
      id: 'suv',
      title: 'Family SUV (6+1)',
      models: 'Maruti Ertiga, Kia Carens, Triber',
      price: baseSuv,
      badge: 'FAMILY & LUGGAGE',
      pax: '6 Passengers',
      bags: '5-6 Large Bags',
      ac: true
    }
  ];

  const handleProceed = () => {
    const selected = cabTiers.find(c => c.id === selectedTier)!;
    navigation.navigate('Checkout', {
      phone,
      cabTier: selectedTier,
      cabName: selected.title,
      price: selected.price,
      distanceKm
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Route Summary Pill */}
        <View style={[styles.routeHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.routeText, { color: colors.text }]}>
              {currentSearch.origin} ➔ {currentSearch.destination}
            </Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {distanceKm} KM • {currentSearch.tripType === 'oneway' ? 'One-Way Trip' : 'Round-Trip'} • {currentSearch.pickupDate}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Available Cab Categories</Text>

        {/* Cab Cards */}
        {cabTiers.map(tier => {
          const isSelected = selectedTier === tier.id;
          return (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.cabCard,
                { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.border },
                isSelected && { borderWidth: 2 }
              ]}
              onPress={() => setSelectedTier(tier.id as any)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.badge, { backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary }]}>
                    <Text style={[styles.badgeText, { color: isSelected ? '#fff' : colors.textSecondary }]}>{tier.badge}</Text>
                  </View>
                  <Text style={[styles.cabTitle, { color: colors.text }]}>{tier.title}</Text>
                  <Text style={[styles.cabModels, { color: colors.textMuted }]}>{tier.models}</Text>
                </View>

                <View style={styles.priceCol}>
                  <Text style={[styles.priceText, { color: colors.primary }]}>₹{tier.price}</Text>
                  <Text style={[styles.tollText, { color: colors.success }]}>Tolls &amp; GST Included</Text>
                </View>
              </View>

              <View style={[styles.specsRow, { borderTopColor: colors.border }]}>
                <View style={styles.specItem}>
                  <Users color={colors.textSecondary} size={15} />
                  <Text style={[styles.specText, { color: colors.textSecondary }]}>{tier.pax}</Text>
                </View>
                <View style={styles.specItem}>
                  <Briefcase color={colors.textSecondary} size={15} />
                  <Text style={[styles.specText, { color: colors.textSecondary }]}>{tier.bags}</Text>
                </View>
                <View style={styles.specItem}>
                  <CheckCircle2 color={colors.primary} size={15} />
                  <Text style={[styles.specText, { color: colors.textSecondary }]}>AC On</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Ethical Outstation Assurance */}
        <View style={[styles.trustBox, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
          <ShieldCheck color={colors.primary} size={22} />
          <Text style={[styles.trustText, { color: colors.text }]}>
            Guaranteed All-Inclusive Fare: Zero extra charges for fuel, toll taxes, or driver allowances.
          </Text>
        </View>

        {/* Proceed CTA */}
        <TouchableOpacity
          style={[styles.proceedBtn, { backgroundColor: colors.primary }]}
          onPress={handleProceed}
        >
          <Text style={styles.proceedBtnText}>Continue to Passenger Details</Text>
          <ChevronRight color="#fff" size={20} />
        </TouchableOpacity>

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
  routeHeader: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18
  },
  routeText: {
    fontSize: 18,
    fontWeight: '800'
  },
  metaText: {
    fontSize: 12.5,
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12
  },
  cabCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardHeaderLeft: {
    flex: 1
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  cabTitle: {
    fontSize: 17,
    fontWeight: '800'
  },
  cabModels: {
    fontSize: 12,
    marginTop: 2
  },
  priceCol: {
    alignItems: 'flex-end'
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900'
  },
  tollText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2
  },
  specsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 10,
    gap: 16
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  specText: {
    fontSize: 12,
    fontWeight: '600'
  },
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 14,
    gap: 10
  },
  trustText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 6,
    gap: 8
  },
  proceedBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800'
  }
});
