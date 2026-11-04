import React, { useState } from 'react';
import { registerRootComponent } from 'expo';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';

import PassengerApp from './apps/passenger/src/App';
import DriverApp from './apps/driver/src/App';
import AdminApp from './apps/admin/src/App';

const envTarget = process.env.APP_TARGET || process.env.EXPO_PUBLIC_APP_TARGET || '';

function UniversalAppContainer() {
  const [activeApp, setActiveApp] = useState(envTarget || 'passenger');
  const [modalVisible, setModalVisible] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  const getAppName = (app) => {
    switch (app) {
      case 'passenger': return '🚖 Passenger';
      case 'driver': return '🧑‍✈️ Driver Partner';
      case 'admin': return '🛡️ Admin V2';
      default: return '🚖 Passenger';
    }
  };

  const getBadgeColor = (app) => {
    switch (app) {
      case 'passenger': return '#059669'; // Emerald
      case 'driver': return '#D97706'; // Amber
      case 'admin': return '#2563EB'; // Blue
      default: return '#059669';
    }
  };

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="light-content" />

      {/* Active Application Render */}
      <View style={styles.appViewport} key={activeApp}>
        {activeApp === 'driver' && <DriverApp />}
        {activeApp === 'admin' && <AdminApp />}
        {activeApp === 'passenger' && <PassengerApp />}
      </View>

      {/* Floating Universal App Switcher Pill */}
      {showBadge && (
        <TouchableOpacity
          style={[styles.floatingPill, { borderColor: getBadgeColor(activeApp) }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={[styles.statusDot, { backgroundColor: getBadgeColor(activeApp) }]} />
          <Text style={styles.pillText}>{getAppName(activeApp)}</Text>
          <Text style={styles.pillArrow}>⇅</Text>
        </TouchableOpacity>
      )}

      {/* App Switcher Modal Sheet */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.handleBar} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>OneWayTaxiBihar • Preview Hub</Text>
              <Text style={styles.modalSubtitle}>Switch between all 3 mobile apps live in Expo Go</Text>
            </View>

            {/* App Options */}
            <View style={styles.optionsList}>
              {/* Option 1: Passenger App */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  activeApp === 'passenger' && styles.optionCardActive,
                  { borderColor: activeApp === 'passenger' ? '#059669' : '#1e293b' }
                ]}
                onPress={() => {
                  setActiveApp('passenger');
                  setModalVisible(false);
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                  <Text style={styles.optionEmoji}>🚖</Text>
                </View>
                <View style={styles.optionDetails}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionName}>Passenger Mobile App</Text>
                    {activeApp === 'passenger' && (
                      <View style={[styles.activePill, { backgroundColor: '#059669' }]}>
                        <Text style={styles.activePillText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionDesc}>
                    Cab booking, dynamic route fare calculator, live trips, and DPDP account deletion.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: Driver Partner App */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  activeApp === 'driver' && styles.optionCardActive,
                  { borderColor: activeApp === 'driver' ? '#D97706' : '#1e293b' }
                ]}
                onPress={() => {
                  setActiveApp('driver');
                  setModalVisible(false);
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                  <Text style={styles.optionEmoji}>👨‍✈️</Text>
                </View>
                <View style={styles.optionDetails}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionName}>Driver Partner App</Text>
                    {activeApp === 'driver' && (
                      <View style={[styles.activePill, { backgroundColor: '#D97706' }]}>
                        <Text style={styles.activePillText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionDesc}>
                    Duty toggle, 30s booking offer radar, background GPS telemetry, and instant payouts.
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Option 3: Admin Operations Hub */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  activeApp === 'admin' && styles.optionCardActive,
                  { borderColor: activeApp === 'admin' ? '#2563EB' : '#1e293b' }
                ]}
                onPress={() => {
                  setActiveApp('admin');
                  setModalVisible(false);
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(37, 99, 235, 0.15)' }]}>
                  <Text style={styles.optionEmoji}>🛡️</Text>
                </View>
                <View style={styles.optionDetails}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionName}>Admin Operations Desk (V2)</Text>
                    {activeApp === 'admin' && (
                      <View style={[styles.activePill, { backgroundColor: '#2563EB' }]}>
                        <Text style={styles.activePillText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.optionDesc}>
                    Fleet live dispatch radar, Chauffeur KYC verification, automated dispatch override, and ledger.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Switcher Toggle / Dismiss Controls */}
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.hideBadgeBtn}
                onPress={() => {
                  setShowBadge(false);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.hideBadgeText}>Hide Switcher Pill</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  appViewport: {
    flex: 1,
  },
  floatingPill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    right: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  pillArrow: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0B1120',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#334155',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#111827',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionCardActive: {
    backgroundColor: '#1E293B',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  optionDesc: {
    color: '#94A3B8',
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  hideBadgeBtn: {
    paddingVertical: 8,
  },
  hideBadgeText: {
    color: '#64748B',
    fontSize: 12,
  },
  closeBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

registerRootComponent(UniversalAppContainer);
