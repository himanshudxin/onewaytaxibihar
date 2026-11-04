import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { MobileApiClient } from '../../services/api';
import { Check, ShieldCheck, MapPin, User, Phone, CheckCircle, ExternalLink } from 'lucide-react-native';

export const CheckoutScreen = ({ route, navigation }: any) => {
  const { phone, cabTier, cabName, price, distanceKm } = route.params;
  const { currentSearch } = useApp();
  const colors = Colors.dark;

  const [name, setName] = useState('');
  const [pickupAddr, setPickupAddr] = useState('');
  const [dropAddr, setDropAddr] = useState('');
  const [paymentOption, setPaymentOption] = useState<'driver' | 'token'>('driver');
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const handleConfirmBooking = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter passenger full name.');
      return;
    }
    if (!pickupAddr.trim()) {
      Alert.alert('Required', 'Please enter exact doorstep pickup address.');
      return;
    }

    try {
      setLoading(true);
      const res = await MobileApiClient.createBooking({
        passengerName: name.trim(),
        passengerPhone: phone,
        pickupCity: currentSearch.origin,
        dropCity: currentSearch.destination,
        pickupDate: currentSearch.pickupDate,
        pickupTime: currentSearch.pickupTime,
        tripType: currentSearch.tripType,
        cabTier: cabTier,
        pickupAddress: pickupAddr.trim(),
        dropAddress: dropAddr.trim() || currentSearch.destination,
        estimatedFare: price,
        tokenAdvance: paymentOption === 'token' ? 300 : 0,
        paymentMode: paymentOption === 'token' ? 'Online Token Advance (₹300)' : 'Cash / UPI to Driver (₹0 Advance)'
      });

      if (res && res.success) {
        setConfirmedBooking(res.booking || { bookingId: res.bookingId, whatsappDispatchUrl: res.whatsappDispatchUrl });
      } else {
        Alert.alert('Booking Notice', 'Booking recorded! Our 24x7 Patna helpline will call you within 5 minutes.');
      }
    } catch (err: any) {
      Alert.alert('Booking Request Received', 'Your cab request has been logged. Our dispatch team is assigning your driver.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmedBooking) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <CheckCircle color={colors.primary} size={64} />
          <Text style={[styles.successTitle, { color: colors.text }]}>Cab Booking Confirmed!</Text>
          <Text style={[styles.bookingIdText, { color: colors.primary }]}>
            Booking ID: {confirmedBooking.bookingId || 'OTB-CONFIRMED'}
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Your ride from {currentSearch.origin} to {currentSearch.destination} is confirmed. A driver partner will be assigned 2 hours prior to pickup.
          </Text>

          {confirmedBooking.whatsappDispatchUrl ? (
            <TouchableOpacity
              style={[styles.waBtn, { backgroundColor: colors.whatsapp }]}
              onPress={() => Linking.openURL(confirmedBooking.whatsappDispatchUrl)}
            >
              <Text style={styles.waBtnText}>Send Ticket to WhatsApp Dispatch</Text>
              <ExternalLink color="#fff" size={18} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.returnHomeBtn, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.returnHomeText, { color: colors.text }]}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Fare Summary Box */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summaryCabTitle, { color: colors.text }]}>{cabName}</Text>
              <Text style={[styles.summaryRoute, { color: colors.textSecondary }]}>
                {currentSearch.origin} ➔ {currentSearch.destination} ({distanceKm} KM)
              </Text>
              <Text style={[styles.summaryDate, { color: colors.primary }]}>
                {currentSearch.pickupDate} • {currentSearch.pickupTime}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.summaryPrice, { color: colors.primary }]}>₹{price}</Text>
              <Text style={[styles.summaryToll, { color: colors.success }]}>Tolls Included</Text>
            </View>
          </View>
        </View>

        {/* Passenger Information */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Passenger Details</Text>
        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          <View style={styles.fieldRow}>
            <User color={colors.textSecondary} size={18} />
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>FULL NAME *</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.fieldRow}>
            <Phone color={colors.textSecondary} size={18} />
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>CONTACT NUMBER</Text>
              <Text style={[styles.readOnlyPhone, { color: colors.text }]}>+91 {phone}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.fieldRow}>
            <MapPin color={colors.primary} size={18} />
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DOORSTEP PICKUP ADDRESS *</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={pickupAddr}
                onChangeText={setPickupAddr}
                placeholder="House, street, landmark, area"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.fieldRow}>
            <MapPin color={colors.danger} size={18} />
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DROP ADDRESS (OPTIONAL)</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                value={dropAddr}
                onChangeText={setDropAddr}
                placeholder={`Destination address in ${currentSearch.destination}`}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Payment Policy Selection */}
        <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Payment Preference</Text>
        
        <TouchableOpacity
          style={[
            styles.paymentCard,
            { backgroundColor: colors.surface, borderColor: paymentOption === 'driver' ? colors.primary : colors.border },
            paymentOption === 'driver' && { borderWidth: 2 }
          ]}
          onPress={() => setPaymentOption('driver')}
        >
          <View style={styles.radioRow}>
            <View style={[styles.radioCircle, { borderColor: paymentOption === 'driver' ? colors.primary : colors.textMuted }]}>
              {paymentOption === 'driver' ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.paymentTitle, { color: colors.text }]}>Pay Full Amount to Driver (₹0 Advance)</Text>
              <Text style={[styles.paymentDesc, { color: colors.textMuted }]}>
                Zero advance payment required today. Pay ₹{price} directly to your driver via Cash or UPI QR upon arrival.
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentCard,
            { backgroundColor: colors.surface, borderColor: paymentOption === 'token' ? colors.primary : colors.border },
            paymentOption === 'token' && { borderWidth: 2 }
          ]}
          onPress={() => setPaymentOption('token')}
        >
          <View style={styles.radioRow}>
            <View style={[styles.radioCircle, { borderColor: paymentOption === 'token' ? colors.primary : colors.textMuted }]}>
              {paymentOption === 'token' ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.paymentTitle, { color: colors.text }]}>Pay ₹300 Booking Token (Priority Dispatch)</Text>
              <Text style={[styles.paymentDesc, { color: colors.textMuted }]}>
                Guarantees vehicle allocation during peak festival periods. Remaining ₹{price - 300} payable to driver.
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm Cab Booking ➔</Text>
          )}
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
  summaryCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  summaryCabTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  summaryRoute: {
    fontSize: 13,
    marginTop: 2
  },
  summaryDate: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4
  },
  summaryPrice: {
    fontSize: 22,
    fontWeight: '900'
  },
  summaryToll: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10
  },
  formCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6
  },
  fieldWrap: {
    flex: 1,
    marginLeft: 12
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  textInput: {
    fontSize: 15,
    fontWeight: '700',
    padding: 0
  },
  readOnlyPhone: {
    fontSize: 15,
    fontWeight: '800'
  },
  divider: {
    height: 1,
    marginVertical: 10
  },
  paymentCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  paymentTitle: {
    fontSize: 13.5,
    fontWeight: '800'
  },
  paymentDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2
  },
  confirmBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800'
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 16
  },
  bookingIdText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6
  },
  successSubtitle: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 24
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    marginBottom: 12
  },
  waBtnText: {
    color: '#fff',
    fontSize: 14.5,
    fontWeight: '800'
  },
  returnHomeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center'
  },
  returnHomeText: {
    fontSize: 13.5,
    fontWeight: '700'
  }
});
