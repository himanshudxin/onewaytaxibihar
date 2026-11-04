import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';
import { usePassenger } from '../context/PassengerContext';
import { MobileApiClient } from '../../../../shared/services/api';
import { formatCurrency, formatDistance } from '../../../../shared/utils/formatters';
import {
  Car,
  Users,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Info,
  X,
  FileText,
  Sparkles,
  Wind,
} from 'lucide-react-native';

// Vehicle studio images
const VEHICLE_IMAGES = {
  hatchback: require('../../assets/vehicles/hatchback.jpg'),
  sedan: require('../../assets/vehicles/sedan.jpg'),
  suv: require('../../assets/vehicles/suv.jpg'),
  sedan_prime: require('../../assets/vehicles/sedan_prime.jpg'),
  innova_crysta: require('../../assets/vehicles/innova_crysta.jpg'),
};

export const CabSelectScreen = ({ navigation }: any) => {
  const { search, selectedTier, setSelectedTier, fares } = usePassenger();
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Match destination from live backend fares database
  const matchedFare = fares.find(
    f => (f.destination && f.destination.toLowerCase().includes(search.destination.toLowerCase())) ||
         (f.destCity && f.destCity.toLowerCase().includes(search.destination.toLowerCase()))
  );

  const tripMultiplier = search.tripType === 'round-trip' ? 1.8 : 1.0;
  const distanceKm = matchedFare ? matchedFare.distanceKm : 104;

  // Authoritative FLEET_RATES calculation matching backend api/index.js
  const rawHatch = matchedFare?.hatchback || Math.max(1698, Math.round(distanceKm * 20.0));
  const rawSedan = matchedFare?.sedan || Math.max(2198, Math.round(distanceKm * 22.0));
  const rawExecSedan = Math.max(2698, Math.round(distanceKm * 26.0));
  const rawXuv = matchedFare?.suv || Math.max(3398, Math.round(distanceKm * 27.0));
  const rawLuxuryXuv = Math.max(4598, Math.round(distanceKm * 34.0));

  const baseHatch = Math.round(rawHatch * tripMultiplier);
  const baseSedan = Math.round(rawSedan * tripMultiplier);
  const baseExecSedan = Math.round(rawExecSedan * tripMultiplier);
  const baseXuv = Math.round(rawXuv * tripMultiplier);
  const baseLuxuryXuv = Math.round(rawLuxuryXuv * tripMultiplier);

  // The 5 Required Vehicle Categories
  const cabTiers = [
    {
      id: 'hatchback',
      title: 'Hatchback',
      subTitle: 'Go Hatchback • ₹20/km',
      models: 'Maruti WagonR, Tata Tiago, Celerio',
      price: baseHatch,
      badge: 'BEST VALUE',
      pax: '4 Passengers',
      bags: '2 Medium Bags',
      ac: true,
      image: VEHICLE_IMAGES.hatchback,
      desc: 'Affordable compact hatchback for budget travelers.'
    },
    {
      id: 'sedan',
      title: 'Sedan',
      subTitle: 'Prime Sedan • ₹22/km',
      models: 'Maruti Dzire, Toyota Etios, Honda Amaze',
      price: baseSedan,
      badge: 'MOST POPULAR',
      pax: '4 Passengers',
      bags: '3-4 Large Bags',
      ac: true,
      image: VEHICLE_IMAGES.sedan,
      desc: 'High comfort sedan with spacious boot for outstation travel.'
    },
    {
      id: 'suv',
      title: 'XUV',
      subTitle: 'Family XUV (6+1) • ₹27/km',
      models: 'Maruti Ertiga, Kia Carens, Scorpio',
      price: baseXuv,
      badge: 'FAMILY & LUGGAGE',
      pax: '6 Passengers',
      bags: '4-5 Large Bags',
      ac: true,
      image: VEHICLE_IMAGES.suv,
      desc: 'Spacious 6-seater family carrier with roof carrier.'
    },
    {
      id: 'sedan_prime',
      title: 'Executive Sedan',
      subTitle: 'Executive Sedan • ₹26/km',
      models: 'Honda City, Maruti Ciaz, Hyundai Verna',
      price: baseExecSedan,
      badge: 'PREMIUM COMFORT',
      pax: '4 Passengers',
      bags: '4 Large Bags',
      ac: true,
      image: VEHICLE_IMAGES.sedan_prime,
      desc: 'Plush executive sedan with extra legroom & VIP amenities.'
    },
    {
      id: 'innova_crysta',
      title: 'Luxury XUV',
      subTitle: 'Luxury XUV (Innova Crysta) • ₹34/km',
      models: 'Toyota Innova Crysta (Captain Seats)',
      price: baseLuxuryXuv,
      badge: 'VIP LUXURY',
      pax: '7 Passengers',
      bags: '6 Large Bags',
      ac: true,
      image: VEHICLE_IMAGES.innova_crysta,
      desc: 'Top-tier luxury vehicle with captain recliners & rear AC vents.'
    }
  ];

  // Selected tier resolution
  const currentTierObj = cabTiers.find(c => c.id === selectedTier) || cabTiers[1]; // default to Sedan

  // Breakdown calculation
  const mappedTierKey = (currentTierObj.id === 'suv' || currentTierObj.id === 'innova_crysta')
    ? 'suv'
    : currentTierObj.id === 'hatchback'
    ? 'hatchback'
    : 'sedan';

  const fareBreakdown = MobileApiClient.calculateFareBreakdown(
    distanceKm,
    mappedTierKey,
    currentTierObj.price,
    search.tripType,
    search.origin,
    search.destination
  );

  const handleProceed = () => {
    navigation.navigate('Checkout', {
      fareBreakdown,
      cabName: `${currentTierObj.title} (${currentTierObj.subTitle})`,
      price: currentTierObj.price,
      distanceKm,
      cabTier: currentTierObj.id,
    });
  };

  const estimatedDuration = Math.ceil(distanceKm / 45);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {search.origin || 'Patna'} ➔ {search.destination || 'Gaya'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {formatDistance(distanceKm)} • ~{estimatedDuration}h journey • {search.tripType === 'one-way' ? 'One-Way' : 'Round Trip'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowBreakdown(true)} style={styles.infoBtn} activeOpacity={0.8}>
          <Info size={20} color="#D97706" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Value Proposition Strip */}
        <View style={styles.promoStrip}>
          <ShieldCheck size={18} color="#059669" />
          <Text style={styles.promoText}>
            All-Inclusive Guaranteed Fares: Fuel, driver allowance & doorstep pickup included. Zero return fee.
          </Text>
        </View>

        {/* 5 Vehicle Selection Cards */}
        <View style={styles.tierList}>
          {cabTiers.map(tier => {
            const isSelected = selectedTier === tier.id || (!selectedTier && tier.id === 'sedan');
            return (
              <TouchableOpacity
                key={tier.id}
                style={[
                  styles.tierCard,
                  isSelected && styles.tierCardSelected
                ]}
                onPress={() => setSelectedTier(tier.id as any)}
                activeOpacity={0.88}
              >
                {/* Header Row: Title & Fare */}
                <View style={styles.tierHeader}>
                  <View style={styles.tierTitleCol}>
                    <View style={styles.tierBadgeRow}>
                      <Text style={styles.tierTitle}>{tier.title}</Text>
                      <View style={[styles.badge, isSelected && { backgroundColor: '#FDE68A' }]}>
                        <Text style={styles.badgeText}>{tier.badge}</Text>
                      </View>
                    </View>
                    <Text style={styles.tierSubTitle}>{tier.subTitle}</Text>
                  </View>
                  <View style={styles.tierFareCol}>
                    <Text style={styles.tierPrice}>{formatCurrency(tier.price)}</Text>
                    <Text style={styles.allIncText}>All-Inclusive</Text>
                  </View>
                </View>

                {/* Body Row: Real Studio Car Image + Specs */}
                <View style={styles.tierBodyRow}>
                  <Image source={tier.image} style={styles.carPhoto} />
                  <View style={styles.tierSpecsCol}>
                    <Text style={styles.tierModels} numberOfLines={2}>
                      {tier.models}
                    </Text>
                    <View style={styles.specsPillsRow}>
                      <View style={styles.specPill}>
                        <Users size={12} color="#475569" />
                        <Text style={styles.specPillText}>{tier.pax}</Text>
                      </View>
                      <View style={styles.specPill}>
                        <Briefcase size={12} color="#475569" />
                        <Text style={styles.specPillText}>{tier.bags}</Text>
                      </View>
                      <View style={styles.acPill}>
                        <Wind size={11} color="#059669" />
                        <Text style={styles.acPillText}>AC</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Selection Footer Indicator */}
                {isSelected ? (
                  <View style={styles.selectedIndicatorRow}>
                    <CheckCircle2 size={16} color="#059669" />
                    <Text style={styles.selectedIndicatorText}>Selected Category • Guaranteed Commercial Taxi</Text>
                  </View>
                ) : (
                  <View style={styles.unselectedIndicatorRow}>
                    <Text style={styles.tapToSelectText}>Tap to select {tier.title}</Text>
                    <ChevronRight size={14} color="#94A3B8" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Fare Breakdown Button */}
        <TouchableOpacity
          style={styles.breakdownTrigger}
          onPress={() => setShowBreakdown(true)}
          activeOpacity={0.8}
        >
          <FileText size={16} color="#D97706" />
          <Text style={styles.breakdownTriggerText}>
            View Itemized Fare Breakdown, Tolls & Tax Policies
          </Text>
          <ChevronRight size={18} color="#94A3B8" />
        </TouchableOpacity>

      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarLabel}>ALL-INCLUSIVE TOTAL</Text>
          <Text style={styles.bottomBarPrice}>
            {formatCurrency(currentTierObj.price)}
          </Text>
          <Text style={styles.bottomBarTierName}>{currentTierObj.title} ({currentTierObj.subTitle})</Text>
        </View>
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={handleProceed}
          activeOpacity={0.88}
        >
          <Text style={styles.proceedBtnText}>Select & Book</Text>
          <ChevronRight size={18} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Fare Breakdown Modal */}
      <Modal visible={showBreakdown} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Itemized Fare Breakdown</Text>
                <Text style={styles.modalSubtitle}>{search.origin} ➔ {search.destination} ({formatDistance(distanceKm)})</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBreakdown(false)}>
                <X size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.breakdownTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Base Transit Charge ({distanceKm} km)</Text>
                <Text style={styles.tableVal}>{formatCurrency(fareBreakdown.baseFare)}</Text>
              </View>
              <View style={styles.tableRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tableLabel}>State Tolls & FASTag Toll Plazas</Text>
                  <Text style={styles.tollSubLabel}>✓ Highest Highway / Expressway Rate</Text>
                </View>
                <Text style={styles.tableVal}>{formatCurrency(fareBreakdown.tollCharges)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Commercial Driver Allowance</Text>
                <Text style={styles.tableVal}>{formatCurrency(fareBreakdown.driverAllowance)}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>GST (5% Transport Tax)</Text>
                <Text style={styles.tableVal}>{formatCurrency(fareBreakdown.gstAmount)}</Text>
              </View>
              {fareBreakdown.stateTaxPermit > 0 && (
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Interstate Border Permit</Text>
                  <Text style={styles.tableVal}>{formatCurrency(fareBreakdown.stateTaxPermit)}</Text>
                </View>
              )}
              <View style={styles.tableDivider} />
              <View style={styles.tableRowTotal}>
                <Text style={styles.totalLabel}>Total All-Inclusive Payable</Text>
                <Text style={styles.totalVal}>{formatCurrency(currentTierObj.price)}</Text>
              </View>
            </View>

            <View style={styles.inclusionCard}>
              <Text style={styles.inclusionTitle}>✓ Guaranteed Inclusions:</Text>
              <Text style={styles.inclusionItem}>• Doorstep pickup & doorstep drop-off</Text>
              <Text style={styles.inclusionItem}>• Dedicated AC running for complete journey duration</Text>
              <Text style={styles.inclusionItem}>• Zero return fare — pay only for actual travel distance</Text>
              <Text style={styles.inclusionItem}>• 45 mins complimentary doorstep wait time</Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowBreakdown(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  infoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  promoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
    marginVertical: 12,
  },
  promoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
    flex: 1,
    lineHeight: 16,
  },
  tierList: {
    gap: 12,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tierCardSelected: {
    borderColor: '#F59E0B', // Golden Yellow
    borderWidth: 2,
    backgroundColor: '#FFFDF5',
    shadowColor: '#EAB308',
    shadowOpacity: 0.15,
    elevation: 5,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tierTitleCol: {
    flex: 1,
  },
  tierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  tierTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.4,
  },
  tierSubTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  tierFareCol: {
    alignItems: 'flex-end',
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  allIncText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
  },
  tierBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginVertical: 6,
  },
  carPhoto: {
    width: 120,
    height: 72,
    resizeMode: 'contain',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  tierSpecsCol: {
    flex: 1,
  },
  tierModels: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  specsPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  acPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  acPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  selectedIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  selectedIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  unselectedIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  tapToSelectText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  breakdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
    marginTop: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  breakdownTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  bottomBarPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  bottomBarTierName: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
  },
  proceedBtn: {
    backgroundColor: '#F59E0B', // Golden Yellow
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  breakdownTable: {
    gap: 10,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  tollSubLabel: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    marginTop: 1,
  },
  tableVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  tableRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#B45309',
  },
  inclusionCard: {
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    padding: 14,
    borderRadius: 14,
    gap: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
  },
  inclusionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  inclusionItem: {
    fontSize: 11,
    lineHeight: 17,
    color: '#047857',
    fontWeight: '600',
  },
  modalCloseBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
});
