import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Phone,
  MessageCircle,
  ShieldAlert,
  Clock,
  HelpCircle,
  FileText,
  ChevronRight,
  Headphones,
  Sparkles,
  MapPin,
  Car,
} from 'lucide-react-native';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';

export const SupportScreen = ({ navigation }: any) => {
  const openPhone = (num: string) => {
    Linking.openURL(`tel:${num}`).catch(err => console.warn('Could not open phone dialer:', err));
  };

  const openWhatsApp = (num: string) => {
    Linking.openURL(`https://wa.me/${num}?text=Hello%20OneWayTaxiBihar%20Support,%20I%20need%20assistance.`).catch(err =>
      console.warn('Could not open WhatsApp:', err)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerOverline}>24x7 PASSENGER ASSISTANCE</Text>
        <Text style={styles.title}>Outstation Support Desk</Text>
        <Text style={styles.subtitle}>
          Patna Central Dispatch Desk • Real-time Highway Chauffeur Assistance
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Priority 24x7 Helpline Card */}
        <View style={styles.primaryCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircleYellow}>
              <Phone size={22} color="#0F172A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>24×7 Central Dispatch Hotline</Text>
              <Text style={styles.cardSub}>
                Direct connection to central booking coordinators for active trip assistance, driver arrival delays, or midnight transit queries.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => openPhone('+918002141816')}
            activeOpacity={0.88}
          >
            <Phone size={18} color="#0F172A" />
            <Text style={styles.callBtnText}>CALL +91 80021 41816</Text>
          </TouchableOpacity>
        </View>

        {/* WhatsApp Support Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircleGreen}>
              <MessageCircle size={22} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>WhatsApp Care & Booking Desk</Text>
              <Text style={styles.cardSub}>
                Instant booking receipts, driver details, invoice PDFs & live location sharing via WhatsApp.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.whatsAppBtn}
            onPress={() => openWhatsApp('917739406400')}
            activeOpacity={0.88}
          >
            <MessageCircle size={18} color="#FFFFFF" />
            <Text style={styles.whatsAppBtnText}>CHAT ON WHATSAPP (+91 77394 06400)</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Police SOS Button */}
        <TouchableOpacity
          style={styles.sosCard}
          onPress={() => openPhone('112')}
          activeOpacity={0.85}
        >
          <View style={styles.sosIconCircle}>
            <ShieldAlert size={22} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosTitle}>NATIONAL EMERGENCY POLICE SOS (112)</Text>
            <Text style={styles.sosSub}>
              Immediate National Emergency Response Support System (ERSS) across India
            </Text>
          </View>
          <ChevronRight size={18} color="#DC2626" />
        </TouchableOpacity>

        {/* Helpful Shortcuts Card */}
        <Text style={styles.sectionTitle}>QUICK RESOLUTION SHORTCUTS</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <HelpCircle size={18} color="#D97706" />
            <Text style={styles.menuText}>Frequently Asked Questions (FAQs)</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('MyTrips')}
            activeOpacity={0.7}
          >
            <Clock size={18} color="#059669" />
            <Text style={styles.menuText}>Report Issue with a Past or Active Ride</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <FileText size={18} color="#2563EB" />
            <Text style={styles.menuText}>Cancellation, Refund & Zero-Return Rules</Text>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
    gap: 12,
  },
  primaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    padding: 16,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  iconCircleYellow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
    color: '#64748B',
  },
  callBtn: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  callBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  whatsAppBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  whatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    gap: 12,
  },
  sosIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  sosSub: {
    fontSize: 10,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#64748B',
    marginTop: 6,
    marginLeft: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
