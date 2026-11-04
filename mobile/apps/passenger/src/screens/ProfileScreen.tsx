import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PassengerColors, PassengerTheme } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { usePassenger } from '../context/PassengerContext';
import { MobileApiClient } from '../../../../shared/services/api';
import {
  User,
  Phone,
  MessageCircle,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Headphones,
  Smartphone,
  Sun,
  Moon,
  Check,
  Sparkles,
  Edit3,
  X,
  CheckCircle2,
} from 'lucide-react-native';

const FAQS = [
  { q: 'Is return taxi fare charged for one-way rides in Bihar?', a: 'Never. You strictly pay for the one-way distance travelled with zero return fare guarantee.' },
  { q: 'Are highway tolls and expressway taxes included?', a: 'Yes. State highway tolls, FASTag plaza fees, and chauffeur allowances are 100% bundled into the guaranteed all-inclusive price.' },
  { q: 'What is the cancellation policy?', a: 'Zero cancellation fee up until your allocated driver departs the garage.' },
  { q: 'Can I pay cash directly to the chauffeur?', a: 'Yes! 100% of the fare can be settled in cash or UPI directly to your chauffeur upon reaching your destination.' }
];

export const ProfileScreen = ({ navigation }: any) => {
  const { userPhone, isLoggedIn, logout, search, updateSearch } = usePassenger();
  const { isDark, themeMode, setThemeMode } = useTheme();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(search.passengerName || '');

  const handleCallHelpdesk = () => {
    Linking.openURL('tel:+918002141816');
  };

  const handleWhatsAppSupport = () => {
    Linking.openURL('https://wa.me/917739406400?text=Hello%20OneWayTaxiBihar%20Support,%20I%20need%20assistance%20with%20my%20booking.');
  };

  const handleSaveProfile = () => {
    if (editName.trim()) {
      updateSearch({ passengerName: editName.trim() });
      setShowEditModal(false);
      Alert.alert('Profile Updated', 'Passenger name updated successfully.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Personal Data',
      'Under DPDP Act 2023, your profile, ride history, and personal contact details will be permanently scheduled for erasure.',
      [
        { text: 'Keep Account', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await MobileApiClient.requestAccountDeletion(userPhone || search.phone || '9876543210', 'User requested via mobile app');
            Alert.alert('Account Deleted', res.message || 'Data erasure scheduled.');
            await logout();
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{isLoggedIn ? '👤' : '🚖'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.userName}>
                {search.passengerName || (isLoggedIn ? 'Verified Passenger' : 'Guest Rider')}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editBtn}>
                <Edit3 size={14} color="#D97706" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userPhone}>
              {userPhone || search.phone ? `+91 ${userPhone || search.phone}` : 'Sign in to access verified trips'}
            </Text>
            <View style={styles.verifiedRow}>
              <ShieldCheck size={13} color="#059669" />
              <Text style={styles.verifiedText}>
                {isLoggedIn ? 'DPDP Act Verified Passenger' : 'Guest Booking Mode'}
              </Text>
            </View>
          </View>
        </View>

        {/* 24x7 Support Hub Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>24x7 Outstation Support Hub</Text>
          <View style={styles.supportGrid}>
            <TouchableOpacity
              style={styles.supportBtn}
              onPress={handleCallHelpdesk}
              activeOpacity={0.85}
            >
              <View style={styles.supportIconPhone}>
                <Phone size={18} color="#0F172A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.supportBtnTitle}>24x7 Helpline</Text>
                <Text style={styles.supportBtnVal}>+91 80021 41816</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportBtn}
              onPress={handleWhatsAppSupport}
              activeOpacity={0.85}
            >
              <View style={styles.supportIconWhatsApp}>
                <MessageCircle size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.supportBtnTitle}>WhatsApp Desk</Text>
                <Text style={styles.supportBtnVal}>+91 77394 06400</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Display & Theme Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display & Theme Appearance</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[
                styles.themeOptionRow,
                themeMode === 'light' && styles.themeOptionRowActive,
              ]}
              onPress={() => setThemeMode('light')}
              activeOpacity={0.7}
            >
              <View style={styles.themeIconBox}>
                <Sun size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.themeOptionTitle}>Premium Light Mode (Recommended) ☀️</Text>
                <Text style={styles.themeOptionSub}>Golden yellow & pure white modern interface</Text>
              </View>
              {themeMode === 'light' && <Check size={18} color="#D97706" strokeWidth={2.5} />}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[
                styles.themeOptionRow,
                themeMode === 'system' && styles.themeOptionRowActive,
              ]}
              onPress={() => setThemeMode('system')}
              activeOpacity={0.7}
            >
              <View style={styles.themeIconBox}>
                <Smartphone size={18} color="#64748B" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.themeOptionTitle}>System Appearance (Auto)</Text>
                <Text style={styles.themeOptionSub}>Matches your phone's OS light/dark setting</Text>
              </View>
              {themeMode === 'system' && <Check size={18} color="#D97706" strokeWidth={2.5} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.card}>
            {FAQS.map((faq, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.faqRow, i < FAQS.length - 1 && styles.faqRowBorder]}
                onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <ChevronRight
                    size={16}
                    color="#94A3B8"
                    style={{ transform: [{ rotate: expandedFaq === i ? '90deg' : '0deg' }] }}
                  />
                </View>
                {expandedFaq === i && (
                  <Text style={styles.faqA}>{faq.a}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Legal & Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statutory Legal & Security</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.menuRow, styles.faqRowBorder]}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/privacy-policy.html')}
              activeOpacity={0.7}
            >
              <Shield size={18} color="#64748B" />
              <Text style={styles.menuText}>Privacy Policy (DPDP Act 2023)</Text>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuRow, styles.faqRowBorder]}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/terms-of-service.html')}
              activeOpacity={0.7}
            >
              <FileText size={18} color="#64748B" />
              <Text style={styles.menuText}>Terms & Conditions of Service</Text>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/refund-policy.html')}
              activeOpacity={0.7}
            >
              <FileText size={18} color="#64748B" />
              <Text style={styles.menuText}>Refund & Zero Cancellation Policy</Text>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.dangerSection}>
          {isLoggedIn ? (
            <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
              <LogOut size={16} color="#475569" />
              <Text style={styles.logoutText}>Sign Out from Device</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => navigation.navigate('Auth')}
              activeOpacity={0.88}
            >
              <Text style={styles.signInBtnText}>Sign In with Mobile OTP</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
            <Trash2 size={15} color="#DC2626" />
            <Text style={styles.deleteText}>Delete Account & Data (Right to Erasure)</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Passenger Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 18, gap: 14 }}>
              <Text style={styles.modalLabel}>PASSENGER FULL NAME</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
                value={editName}
                onChangeText={setEditName}
                autoFocus
              />
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveProfile} activeOpacity={0.88}>
                <CheckCircle2 size={16} color="#0F172A" />
                <Text style={styles.modalSaveBtnText}>Save Profile</Text>
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
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  userName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  editBtn: {
    padding: 4,
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginLeft: 4,
  },
  supportGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  supportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  supportIconPhone: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportIconWhatsApp: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportBtnTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  supportBtnVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  themeOptionRowActive: {
    backgroundColor: '#FFFBEB',
  },
  themeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  themeOptionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  faqRow: {
    padding: 14,
  },
  faqRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQ: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    paddingRight: 8,
  },
  faqA: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    marginTop: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  dangerSection: {
    gap: 10,
    marginTop: 4,
  },
  signInBtn: {
    backgroundColor: '#F59E0B',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  signInBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  deleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    gap: 8,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  modalSaveBtn: {
    backgroundColor: '#F59E0B',
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  modalSaveBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
});
