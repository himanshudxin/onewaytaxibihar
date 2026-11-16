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
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { usePassenger } from '../context/PassengerContext';
import { UberMapView } from '../components/UberMapView';
import { MobileApiClient } from '../../../../shared/services/api';
import { findMatchingFare } from '../../../../shared/data/patnaFares';
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

const VEHICLE_IMAGES = {
  hatchback: require('../../assets/vehicles/hatchback.jpg'),
  sedan: require('../../assets/vehicles/sedan.jpg'),
  suv: require('../../assets/vehicles/suv.jpg'),
  sedan_prime: require('../../assets/vehicles/sedan_prime.jpg'),
  innova_crysta: require('../../assets/vehicles/innova_crysta.jpg'),
};

export const CabSelectScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const { search, selectedTier, setSelectedTier, fares } = usePassenger();
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Match destination from live backend fares database or authoritative master dataset
  const matchedFare = findMatchingFare(search.origin || 'Patna', search.destination || 'Gaya', fares);

  const isRoundTrip = search.tripType === 'round-trip';
  const distanceKm = matchedFare ? matchedFare.distanceKm : 104;

  // Authoritative FLEET_RATES calculation matching backend api/index.js and patna_fares.json
  const rawHatch = matchedFare?.hatchback || Math.max(1698, (matchedFare?.sedan || 2198) - 200);
  const rawSedan = matchedFare?.sedan || Math.max(2198, Math.round(distanceKm * 21.0));
  const rawExecSedan = matchedFare?.execSedan || (rawSedan + 250);
  const rawXuv = matchedFare?.suv || (rawSedan + 400);
  const rawLuxuryXuv = matchedFare?.luxSuv || (rawSedan + 700);

  const baseHatch = isRoundTrip ? (matchedFare?.twoWay?.hatchback || Math.round(rawHatch * 1.8)) : rawHatch;
  const baseSedan = isRoundTrip ? (matchedFare?.twoWay?.sedan || Math.round(rawSedan * 1.8)) : rawSedan;
  const baseExecSedan = isRoundTrip ? (matchedFare?.twoWay?.execSedan || Math.round(rawExecSedan * 1.8)) : rawExecSedan;
  const baseXuv = isRoundTrip ? (matchedFare?.twoWay?.suv || Math.round(rawXuv * 1.8)) : rawXuv;
  const baseLuxuryXuv = isRoundTrip ? (matchedFare?.twoWay?.luxSuv || Math.round(rawLuxuryXuv * 1.8)) : rawLuxuryXuv;

  // The 5 Required Vehicle Categories
  const cabTiers = [
    {
      id: 'hatchback',
      title: 'Hatchback',
      subTitle: 'One-Way Drop • No Return Fare',
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
      subTitle: 'Prime Sedan • No Return Fare',
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
      id: 'sedan_prime',
      title: 'Executive Sedan',
      subTitle: 'Executive One-Way • No Return Fare',
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
      id: 'suv',
      title: 'XUV',
      subTitle: 'Family Carrier (6+1) • No Return Fare',
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
      id: 'innova_crysta',
      title: 'Luxury XUV',
      subTitle: 'VIP Outstation • No Return Fare',
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
      tierId: currentTierObj.id
    });
  };

  const estimatedDuration = Math.max(1, Math.round(distanceKm / 45));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: colors.cardSurface, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color={colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {search.origin || 'Patna'} <Text style={{ color: colors.accentGold }}>→</Text> {search.destination || 'Gaya'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {formatDistance(distanceKm)} • ~{estimatedDuration}h journey • {search.tripType === 'one-way' ? 'One-Way' : 'Round Trip'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowBreakdown(true)}
          style={[styles.infoBtn, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}
          activeOpacity={0.8}
        >
          <Info size={18} color={colors.accentGold} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Value Proposition Strip */}
        <View style={[styles.promoStrip, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5', borderColor: isDark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0' }]}>
          <ShieldCheck size={16} color={colors.brandGreen} strokeWidth={2.4} />
          <Text style={[styles.promoText, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
            All-Inclusive Guaranteed Fares: Fuel, driver allowance & doorstep pickup included. Zero return fee.
          </Text>
        </View>

        {/* Route Preview Map */}
        <View style={[styles.mapWrap, { borderColor: colors.cardBorder }]}>
          <UberMapView
            originCity={search.origin || 'Patna'}
            destinationCity={search.destination || 'Gaya'}
            height={160}
          />
        </View>

        {/* "Return Fare Is Not Fair — Pay Only For What You Travel" Advertising Strip */}
        <View style={[styles.fairnessBanner, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#ECFDF5', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0' }]}>
          <View style={styles.fairnessIconBadge}>
            <ShieldCheck size={20} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.fairnessTitle, { color: isDark ? '#34D399' : '#065F46' }]}>
              Return Fare Is Not Fair!
            </Text>
            <Text style={[styles.fairnessSub, { color: isDark ? '#94A3B8' : '#047857' }]}>
              Pay only for what you travel. Never pay double for an empty return trip.
            </Text>
          </View>
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
                  {
                    backgroundColor: colors.cardSurface,
                    borderColor: isSelected ? colors.accentGold : colors.cardBorder,
                  },
                  isSelected && styles.tierCardSelected
                ]}
                onPress={() => setSelectedTier(tier.id as any)}
                activeOpacity={0.88}
              >
                {/* Header Row: Title & Fare */}
                <View style={styles.tierHeader}>
                  <View style={styles.tierTitleCol}>
                    <View style={styles.tierBadgeRow}>
                      <Text style={[styles.tierTitle, { color: colors.textPrimary }]}>{tier.title}</Text>
                      <View style={[styles.badge, { backgroundColor: isSelected ? colors.accentGold : colors.inputBg }]}>
                        <Text style={[styles.badgeText, { color: isSelected ? '#0F172A' : colors.textMuted }]}>{tier.badge}</Text>
                      </View>
                    </View>
                    <Text style={[styles.tierSubTitle, { color: colors.textMuted }]}>{tier.subTitle}</Text>
                  </View>
                  <View style={styles.tierFareCol}>
                    <Text style={[styles.tierPrice, { color: colors.accentGold }]}>{formatCurrency(tier.price)}</Text>
                    <Text style={[styles.allIncText, { color: colors.brandGreen }]}>All-Inclusive</Text>
                  </View>
                </View>

                {/* Body Row: Real Studio Car Image + Specs */}
                <View style={styles.tierBodyRow}>
                  <Image source={tier.image} style={styles.carPhoto} />
                  <View style={styles.tierSpecsCol}>
                    <Text style={[styles.tierModels, { color: colors.textPrimary }]} numberOfLines={2}>
                      {tier.models}
                    </Text>
                    <View style={styles.specsPillsRow}>
                      <View style={[styles.specPill, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                        <Users size={11} color={colors.textMuted} />
                        <Text style={[styles.specPillText, { color: colors.textPrimary }]}>{tier.pax}</Text>
                      </View>
                      <View style={[styles.specPill, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                        <Briefcase size={11} color={colors.textMuted} />
                        <Text style={[styles.specPillText, { color: colors.textPrimary }]}>{tier.bags}</Text>
                      </View>
                      <View style={[styles.acPill, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7' }]}>
                        <Wind size={10} color={colors.brandGreen} />
                        <Text style={[styles.acPillText, { color: colors.brandGreen }]}>AC</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Selection Indicator */}
                <View style={[styles.tierFooterRow, { borderTopColor: colors.cardBorder }]}>
                  <Text style={[styles.tierDesc, { color: colors.textMuted }]} numberOfLines={1}>
                    {tier.desc}
                  </Text>
                  <View style={styles.radioWrapper}>
                    <View style={[styles.radioOuter, { borderColor: isSelected ? colors.accentGold : colors.cardBorder }]}>
                      {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.accentGold }]} />}
                    </View>
                    <Text style={[styles.selectLabel, { color: isSelected ? colors.accentGold : colors.textMuted }]}>
                      {isSelected ? 'Selected' : 'Select'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* Floating Bottom Bar (inDrive Outstation Style) */}
      <View style={[styles.bottomBar, { backgroundColor: colors.cardSurface, borderColor: colors.cardBorder }]}>
        <View style={styles.bottomFareSummary}>
          <Text style={[styles.bottomTotalLabel, { color: colors.textMuted }]}>TOTAL GUARANTEED FARE</Text>
          <View style={styles.bottomPriceRow}>
            <Text style={[styles.bottomPriceVal, { color: colors.textPrimary }]}>
              {formatCurrency(currentTierObj.price)}
            </Text>
            <TouchableOpacity onPress={() => setShowBreakdown(true)} style={styles.breakdownLink}>
              <Text style={[styles.breakdownLinkText, { color: colors.accentGold }]}>View Fare Details</Text>
              <ChevronRight size={13} color={colors.accentGold} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.bottomTierName, { color: colors.textMuted }]}>
            {currentTierObj.title} • Zero Return Fee
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.proceedBtn, { backgroundColor: colors.accentGold }]}
          onPress={handleProceed}
          activeOpacity={0.88}
        >
          <Text style={styles.proceedBtnText}>Confirm {currentTierObj.title}</Text>
          <ChevronRight size={18} color="#0F172A" strokeWidth={2.8} />
        </TouchableOpacity>
      </View>

      {/* Fare Breakdown Modal */}
      <Modal visible={showBreakdown} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismissArea} onPress={() => setShowBreakdown(false)} />
          <View style={[styles.breakdownModal, { backgroundColor: colors.cardSurface, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Fare Breakdown</Text>
                <Text style={[styles.modalSub, { color: colors.textMuted }]}>
                  {currentTierObj.title} • {search.tripType === 'one-way' ? 'One-Way Drop' : 'Round Trip'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowBreakdown(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.inputBg }]}
              >
                <X size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              <View style={[styles.breakdownRow, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.breakdownLabel, { color: colors.textPrimary }]}>Base Rate ({distanceKm} km)</Text>
                <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>{formatCurrency(fareBreakdown.baseFare)}</Text>
              </View>

              <View style={[styles.breakdownRow, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.breakdownLabel, { color: colors.textPrimary }]}>Driver Allowance</Text>
                <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>₹300 (Included)</Text>
              </View>

              <View style={[styles.breakdownRow, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.breakdownLabel, { color: colors.textPrimary }]}>GST & Tolls</Text>
                <Text style={[styles.breakdownValue, { color: colors.textPrimary }]}>Included</Text>
              </View>

              <View style={[styles.breakdownRow, { borderBottomColor: colors.cardBorder }]}>
                <Text style={[styles.breakdownLabel, { color: colors.textPrimary }]}>Return Fare</Text>
                <Text style={[styles.breakdownValue, { color: colors.brandGreen, fontWeight: '800' }]}>₹0 (Zero Return Fee)</Text>
              </View>

              <View style={[styles.breakdownTotalRow, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
                <Text style={[styles.breakdownTotalLabel, { color: colors.textPrimary }]}>Total Payable</Text>
                <Text style={[styles.breakdownTotalVal, { color: colors.accentGold }]}>{formatCurrency(currentTierObj.price)}</Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalConfirmBtn, { backgroundColor: colors.accentGold }]}
              onPress={() => {
                setShowBreakdown(false);
                handleProceed();
              }}
            >
              <Text style={styles.modalConfirmText}>Proceed with {currentTierObj.title}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  infoBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  promoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
  },
  promoText: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  mapWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 16,
  },
  tierList: {
    gap: 12,
  },
  tierCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
  },
  tierCardSelected: {
    borderWidth: 2,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tierTitleCol: {
    flex: 1,
  },
  tierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  tierSubTitle: {
    fontSize: 11.5,
    marginTop: 3,
  },
  tierFareCol: {
    alignItems: 'flex-end',
  },
  tierPrice: {
    fontSize: 18,
    fontWeight: '900',
  },
  allIncText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 1,
  },
  tierBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  carPhoto: {
    width: 76,
    height: 52,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  tierSpecsCol: {
    flex: 1,
  },
  tierModels: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  specsPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  specPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  acPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  acPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tierFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  tierDesc: {
    fontSize: 11,
    flex: 1,
    marginRight: 10,
  },
  radioWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectLabel: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomFareSummary: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  bottomPriceVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  breakdownLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  breakdownLinkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomTierName: {
    fontSize: 11,
    marginTop: 1,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  proceedBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  breakdownModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  breakdownLabel: {
    fontSize: 13,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  breakdownTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 16,
  },
  breakdownTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  breakdownTotalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalConfirmBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  fairnessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  fairnessIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fairnessTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  fairnessSub: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
});
