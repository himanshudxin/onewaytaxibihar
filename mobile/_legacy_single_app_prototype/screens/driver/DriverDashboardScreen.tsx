import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Modal,
  Alert,
  Linking
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import {
  Navigation,
  Phone,
  Power,
  Bell,
  Clock,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react-native';

export const DriverDashboardScreen = () => {
  const { isOnlineDriver, setIsOnlineDriver, activeRole, setActiveRole } = useApp();
  const colors = Colors.dark;

  // Driver stats
  const [earnings, setEarnings] = useState(2450);
  const [completedTrips, setCompletedTrips] = useState(3);
  const [rating, setRating] = useState('4.92 ★');

  // Simulation: Incoming Trip Dispatch Modal
  const [incomingTrip, setIncomingTrip] = useState<any>(null);
  const [countdown, setCountdown] = useState(30);

  // Active Accepted Trip
  const [activeTrip, setActiveTrip] = useState<any>(null);

  // Trigger test incoming ride after turning online
  useEffect(() => {
    let timer: any = null;
    if (isOnlineDriver && !activeTrip && !incomingTrip) {
      timer = setTimeout(() => {
        setIncomingTrip({
          id: 'TRIP-7821',
          origin: 'Patna Junction Railway Station',
          destination: 'Gaya International Airport (GAY)',
          passengerName: 'Amitabh Sharma',
          passengerPhone: '9876543210',
          fare: 2198,
          distanceKm: 104,
          pickupDistance: '1.2 KM away (4 mins)'
        });
        setCountdown(30);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isOnlineDriver, activeTrip, incomingTrip]);

  // Countdown timer for incoming ride
  useEffect(() => {
    let interval: any = null;
    if (incomingTrip && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) {
            setIncomingTrip(null);
            return 30;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [incomingTrip, countdown]);

  const handleAcceptRide = () => {
    setActiveTrip(incomingTrip);
    setIncomingTrip(null);
  };

  const handleDeclineRide = () => {
    setIncomingTrip(null);
  };

  const handleOpenNavigation = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleCompleteTrip = () => {
    Alert.alert(
      'Complete Trip & Collect Payment',
      `Collect ₹${activeTrip.fare} from rider via Cash or Driver UPI QR.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Cash Collected',
          onPress: () => {
            setEarnings(e => e + activeTrip.fare);
            setCompletedTrips(c => c + 1);
            setActiveTrip(null);
            Alert.alert('Trip Completed', '₹' + activeTrip.fare + ' added to your daily earnings ledger!');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Driver Top Status Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.driverName, { color: colors.text }]}>Driver Partner Console</Text>
            <Text style={[styles.vehicleInfo, { color: colors.textSecondary }]}>
              Maruti Dzire • BR 01 PB 4412
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.switchRoleBtn, { borderColor: colors.border }]}
            onPress={() => setActiveRole('customer')}
          >
            <Text style={[styles.switchRoleText, { color: colors.primary }]}>Switch to Rider ➔</Text>
          </TouchableOpacity>
        </View>

        {/* Online / Offline Duty Switch Card */}
        <View style={[
          styles.dutyCard,
          { backgroundColor: colors.surface, borderColor: isOnlineDriver ? colors.primary : colors.border },
          isOnlineDriver && { borderWidth: 2 }
        ]}>
          <View style={styles.dutyLeft}>
            <View style={[styles.statusDot, { backgroundColor: isOnlineDriver ? colors.primary : colors.textMuted }]} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.dutyStatusText, { color: colors.text }]}>
                {isOnlineDriver ? 'ONLINE FOR DUTY' : 'OFFLINE (PAUSED)'}
              </Text>
              <Text style={[styles.dutySubtext, { color: colors.textSecondary }]}>
                {isOnlineDriver ? 'GPS broadcasting live to Patna central dispatch' : 'Go online to receive high-paying outstation rides'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnlineDriver}
            onValueChange={setIsOnlineDriver}
            trackColor={{ false: colors.surfaceSecondary, true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Today's Earnings Snapshot */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>TODAY'S EARNINGS</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>₹{earnings}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>RIDES DONE</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{completedTrips}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>DRIVER RATING</Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>{rating}</Text>
          </View>
        </View>

        {/* Active In-Progress Trip Card */}
        {activeTrip ? (
          <View style={[styles.activeTripCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <View style={styles.activeTripHeader}>
              <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.activeBadgeText}>ACTIVE OUTSTATION TRIP</Text>
              </View>
              <Text style={[styles.activeFare, { color: colors.primary }]}>₹{activeTrip.fare}</Text>
            </View>

            <View style={styles.tripPointRow}>
              <MapPin color={colors.primary} size={18} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={[styles.pointLabel, { color: colors.textMuted }]}>PICKUP</Text>
                <Text style={[styles.pointTitle, { color: colors.text }]}>{activeTrip.origin}</Text>
              </View>
            </View>

            <View style={[styles.tripDivider, { backgroundColor: colors.border }]} />

            <View style={styles.tripPointRow}>
              <MapPin color={colors.danger} size={18} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={[styles.pointLabel, { color: colors.textMuted }]}>DROP</Text>
                <Text style={[styles.pointTitle, { color: colors.text }]}>{activeTrip.destination}</Text>
              </View>
            </View>

            {/* Rider Info */}
            <View style={[styles.riderInfoBox, { backgroundColor: colors.surfaceSecondary }]}>
              <View>
                <Text style={[styles.riderName, { color: colors.text }]}>{activeTrip.passengerName}</Text>
                <Text style={[styles.riderPhone, { color: colors.textMuted }]}>+91 {activeTrip.passengerPhone}</Text>
              </View>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: colors.primary }]}
                onPress={() => Linking.openURL(`tel:${activeTrip.passengerPhone}`)}
              >
                <Phone color="#fff" size={16} />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
            </View>

            {/* Driver Actions */}
            <View style={styles.driverActionsRow}>
              <TouchableOpacity
                style={[styles.navActionBtn, { backgroundColor: '#0284c7' }]}
                onPress={() => handleOpenNavigation(activeTrip.origin)}
              >
                <Navigation color="#fff" size={18} />
                <Text style={styles.actionBtnText}>Open Google Maps</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.completeActionBtn, { backgroundColor: colors.primary }]}
                onPress={handleCompleteTrip}
              >
                <CheckCircle2 color="#fff" size={18} />
                <Text style={styles.actionBtnText}>Complete &amp; Collect Cash</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.idleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Bell color={isOnlineDriver ? colors.primary : colors.textMuted} size={32} />
            <Text style={[styles.idleTitle, { color: colors.text }]}>
              {isOnlineDriver ? 'Waiting for New Ride Dispatch...' : 'You are currently Offline'}
            </Text>
            <Text style={[styles.idleDesc, { color: colors.textMuted }]}>
              {isOnlineDriver
                ? 'High-priority ride requests within Bihar corridors will pop up here with a loud sound chime.'
                : 'Turn on duty toggle above to broadcast your GPS and start earning.'}
            </Text>
          </View>
        )}

      </ScrollView>

      {/* High-Priority Incoming Ride Modal (Uber Style) */}
      <Modal visible={!!incomingTrip} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            
            <View style={styles.modalTopRow}>
              <View style={[styles.timerBadge, { backgroundColor: colors.dangerLight }]}>
                <Clock color={colors.danger} size={14} />
                <Text style={[styles.timerText, { color: colors.danger }]}>{countdown}s to accept</Text>
              </View>
              <Text style={[styles.incomingFare, { color: colors.primary }]}>₹{incomingTrip?.fare}</Text>
            </View>

            <Text style={[styles.incomingHeading, { color: colors.text }]}>New Outstation Ride Request!</Text>
            <Text style={[styles.incomingSub, { color: colors.textSecondary }]}>
              {incomingTrip?.pickupDistance} • Fixed One-Way Fare
            </Text>

            <View style={[styles.routeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.tripPointRow}>
                <MapPin color={colors.primary} size={16} />
                <Text style={[styles.routeModalText, { color: colors.text }]}>{incomingTrip?.origin}</Text>
              </View>
              <View style={[styles.tripDivider, { backgroundColor: colors.border, marginVertical: 6 }]} />
              <View style={styles.tripPointRow}>
                <MapPin color={colors.danger} size={16} />
                <Text style={[styles.routeModalText, { color: colors.text }]}>{incomingTrip?.destination}</Text>
              </View>
            </View>

            {/* Accept / Decline Action Buttons */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.declineBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
                onPress={handleDeclineRide}
              >
                <XCircle color={colors.danger} size={18} />
                <Text style={[styles.declineText, { color: colors.danger }]}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
                onPress={handleAcceptRide}
              >
                <CheckCircle2 color="#fff" size={20} />
                <Text style={styles.acceptText}>ACCEPT RIDE (₹{incomingTrip?.fare})</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  driverName: {
    fontSize: 20,
    fontWeight: '900'
  },
  vehicleInfo: {
    fontSize: 12,
    marginTop: 2
  },
  switchRoleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1
  },
  switchRoleText: {
    fontSize: 12,
    fontWeight: '700'
  },
  dutyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16
  },
  dutyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7
  },
  dutyStatusText: {
    fontSize: 14,
    fontWeight: '800'
  },
  dutySubtext: {
    fontSize: 11,
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900'
  },
  idleCard: {
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  idleTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center'
  },
  idleDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6
  },
  activeTripCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    marginTop: 6
  },
  activeTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  activeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800'
  },
  activeFare: {
    fontSize: 22,
    fontWeight: '900'
  },
  tripPointRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pointLabel: {
    fontSize: 9.5,
    fontWeight: '800'
  },
  pointTitle: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  tripDivider: {
    height: 1,
    marginVertical: 10
  },
  riderInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 16
  },
  riderName: {
    fontSize: 14,
    fontWeight: '800'
  },
  riderPhone: {
    fontSize: 12,
    marginTop: 2
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  callBtnText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '800'
  },
  driverActionsRow: {
    flexDirection: 'column',
    gap: 8
  },
  navActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12
  },
  completeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
    padding: 16
  },
  modalCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 2
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20
  },
  timerText: {
    fontSize: 12,
    fontWeight: '800'
  },
  incomingFare: {
    fontSize: 26,
    fontWeight: '900'
  },
  incomingHeading: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4
  },
  incomingSub: {
    fontSize: 12.5,
    marginBottom: 14
  },
  routeBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18
  },
  routeModalText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6
  },
  declineText: {
    fontSize: 14,
    fontWeight: '800'
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    gap: 6
  },
  acceptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900'
  }
});
