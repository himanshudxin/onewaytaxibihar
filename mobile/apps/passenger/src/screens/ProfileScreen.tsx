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
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { usePassenger } from '../context/PassengerContext';
import {
  User,
  Phone,
  MessageCircle,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Headphones,
  Sun,
  Moon,
  Check,
  Edit3,
  X,
  CreditCard,
  Sliders,
  RotateCcw,
  Trash2,
} from 'lucide-react-native';

const FAQS = [
  { q: 'Is return taxi fare charged for one-way rides in Bihar?', a: 'Never. You strictly pay for the one-way distance travelled with zero return fare guarantee.' },
  { q: 'Are highway tolls and expressway taxes included?', a: 'Yes. State highway tolls, FASTag plaza fees, and chauffeur allowances are 100% bundled into the guaranteed all-inclusive price.' },
  { q: 'What is the cancellation policy?', a: 'Zero cancellation fee up until your allocated driver departs the garage.' },
  { q: 'Can I pay cash directly to the chauffeur?', a: 'Yes! 100% of the fare can be settled in cash or UPI directly to your chauffeur upon reaching your destination.' }
];

export const ProfileScreen = ({ navigation }: any) => {
  const { userPhone, isLoggedIn, logout, search, updateSearch } = usePassenger();
  const { isDark, themeMode, setThemeMode, colors } = useTheme();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(search.passengerName || '');

  const handleCallHelpdesk = () => {
    Linking.openURL('tel:+918002141816');
  };

  const handleWhatsAppSupport = () => {
    Linking.openURL('https://wa.me/917739406400?text=Namaste%20OneWayTaxiBihar%2C%20I%20need%20assistance%20with%20my%20cab%20booking.');
  };

  const handleSaveName = () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    updateSearch({ passengerName: editName.trim() });
    setShowEditModal(false);
    Alert.alert('Profile Updated', 'Passenger name updated successfully.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out from your OneWayTaxiBihar session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Signed Out', 'You have been signed out successfully.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Executive Header */}
        <View style={styles.topHeader}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Account</Text>
          <Text style={[styles.screenSubtitle, { color: colors.textMuted }]}>Settings, preferences & support</Text>
        </View>

        {/* User Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.cardSurface,
              borderColor: colors.cardBorder,
            }
          ]}
        >
          <View style={styles.profileHeader}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: isDark ? '#1E293B' : '#0F172A',
                  borderColor: isDark ? colors.accentGold : '#0F172A',
                }
              ]}
            >
              <Text style={[styles.avatarInitial, { color: '#F59E0B' }]}>
                {search.passengerName ? search.passengerName[0].toUpperCase() : 'O'}
              </Text>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>
                  {search.passengerName || (isLoggedIn ? 'Verified Passenger' : 'Guest Traveler')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setEditName(search.passengerName || '');
                    setShowEditModal(true);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit3 size={15} color={colors.accentGold} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.userPhone, { color: colors.textMuted }]}>
                {isLoggedIn ? `+91 ${userPhone}` : 'No phone linked • Tap Sign In'}
              </Text>

              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.kycBadge,
                    {
                      backgroundColor: isLoggedIn ? colors.brandGreenBg : 'rgba(100, 116, 139, 0.12)',
                      borderColor: isLoggedIn ? colors.brandGreen : colors.textMuted,
                    }
                  ]}
                >
                  <ShieldCheck size={11} color={isLoggedIn ? colors.brandGreen : colors.textMuted} />
                  <Text
                    style={[
                      styles.kycBadgeText,
                      { color: isLoggedIn ? colors.brandGreen : colors.textMuted }
                    ]}
                  >
                    {isLoggedIn ? 'OTP Verified' : 'Guest'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.walletBadge,
                    {
                      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
                      borderColor: colors.accentGold,
                    }
                  ]}
                >
                  <CreditCard size={11} color={colors.accentGold} />
                  <Text style={[styles.walletBadgeText, { color: colors.accentGold }]}>
                    Zero Return Charge
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {!isLoggedIn ? (
            <TouchableOpacity
              style={[styles.signInCta, { backgroundColor: colors.accentGold }]}
              onPress={() => navigation.navigate('Auth')}
              activeOpacity={0.8}
            >
              <Text style={styles.signInCtaText}>Sign In with Mobile OTP</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 1. Theme Mode Switcher (Uber / Bolt Style) */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>APPEARANCE</Text>
          <View
            style={[
              styles.cardGroup,
              {
                backgroundColor: colors.cardSurface,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            <View style={styles.themeRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>Dark Mode</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  {themeMode === 'system'
                    ? `System Match (${isDark ? 'Dark' : 'Light'})`
                    : isDark ? 'Enabled (Obsidian Black)' : 'Disabled (Crisp White)'}
                </Text>
              </View>

              <View style={[styles.themePillsContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}>
                {/* Light Button */}
                <TouchableOpacity
                  style={[
                    styles.themePillBtn,
                    themeMode === 'light' && {
                      backgroundColor: isDark ? '#334155' : '#FFFFFF',
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }
                  ]}
                  onPress={() => setThemeMode('light')}
                  activeOpacity={0.8}
                >
                  <Sun size={15} color={themeMode === 'light' ? colors.accentGold : colors.textMuted} />
                  <Text
                    style={[
                      styles.themePillText,
                      { color: themeMode === 'light' ? colors.textPrimary : colors.textMuted }
                    ]}
                  >
                    Light
                  </Text>
                </TouchableOpacity>

                {/* Dark Button */}
                <TouchableOpacity
                  style={[
                    styles.themePillBtn,
                    themeMode === 'dark' && {
                      backgroundColor: isDark ? '#334155' : '#FFFFFF',
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }
                  ]}
                  onPress={() => setThemeMode('dark')}
                  activeOpacity={0.8}
                >
                  <Moon size={15} color={themeMode === 'dark' ? colors.accentGold : colors.textMuted} />
                  <Text
                    style={[
                      styles.themePillText,
                      { color: themeMode === 'dark' ? colors.textPrimary : colors.textMuted }
                    ]}
                  >
                    Dark
                  </Text>
                </TouchableOpacity>

                {/* System Auto Button */}
                <TouchableOpacity
                  style={[
                    styles.themePillBtn,
                    themeMode === 'system' && {
                      backgroundColor: isDark ? '#334155' : '#FFFFFF',
                      shadowColor: '#000',
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }
                  ]}
                  onPress={() => setThemeMode('system')}
                  activeOpacity={0.8}
                >
                  <Sliders size={14} color={themeMode === 'system' ? colors.accentGold : colors.textMuted} />
                  <Text
                    style={[
                      styles.themePillText,
                      { color: themeMode === 'system' ? colors.textPrimary : colors.textMuted }
                    ]}
                  >
                    Auto
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Quick Support Section */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>24×7 SUPPORT HELPDESK</Text>
          <View
            style={[
              styles.cardGroup,
              {
                backgroundColor: colors.cardSurface,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.cardBorder }]}
              onPress={handleCallHelpdesk}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.inputBg }]}>
                <Phone size={17} color={colors.accentGold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Call Patna Operations Desk</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>+91 80021 41816 • Instant Call</Text>
              </View>
              <ChevronRight size={17} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleWhatsAppSupport}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.inputBg }]}>
                <MessageCircle size={17} color={colors.brandGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>WhatsApp Dispatcher</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>+91 77394 06400 • Quick Support</Text>
              </View>
              <ChevronRight size={17} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Statutory Legal Pages */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>LEGAL & POLICIES</Text>
          <View
            style={[
              styles.cardGroup,
              {
                backgroundColor: colors.cardSurface,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.cardBorder }]}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/privacy-policy')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.inputBg }]}>
                <Shield size={17} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Privacy Policy</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>DPDP Act 2023 & IT Act 2000 compliant</Text>
              </View>
              <ChevronRight size={17} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.cardBorder }]}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/terms-of-service')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.inputBg }]}>
                <FileText size={17} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Terms of Service</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>Zero return fare booking rules</Text>
              </View>
              <ChevronRight size={17} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.cardBorder }]}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/refund-policy')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.inputBg }]}>
                <RotateCcw size={17} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Refund &amp; Cancellation Policy</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>Zero cancellation fees &amp; 24-48h refund</Text>
              </View>
              <ChevronRight size={17} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/data-deletion')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.inputBg }]}>
                <Trash2 size={17} color={colors.danger || '#EF4444'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Right to Erasure (Data Deletion)</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>Statutory DPDP Act 2023 Self-Service</Text>
              </View>
              <ChevronRight size={17} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Frequently Asked Questions */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>FREQUENTLY ASKED QUESTIONS</Text>
          <View
            style={[
              styles.cardGroup,
              {
                backgroundColor: colors.cardSurface,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            {FAQS.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.faqItem,
                    index !== FAQS.length - 1 && { borderBottomColor: colors.cardBorder, borderBottomWidth: 1 }
                  ]}
                  onPress={() => setExpandedFaq(isExpanded ? null : index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{faq.q}</Text>
                    <Text style={[styles.faqToggleIcon, { color: colors.accentGold }]}>{isExpanded ? '−' : '+'}</Text>
                  </View>
                  {isExpanded && (
                    <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.a}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 5. Sign Out Button */}
        {isLoggedIn ? (
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: colors.cardSurface,
                borderColor: isDark ? 'rgba(239, 68, 68, 0.4)' : '#FCA5A5',
              }
            ]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Sign Out from Account</Text>
          </TouchableOpacity>
        ) : null}

        {/* Footnote */}
        <View style={styles.footerInfo}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>OneWayTaxiBihar • Passenger App v2.4</Text>
          <Text style={[styles.footerSub, { color: colors.textMuted }]}>Patna • Gaya • Muzaffarpur • Darbhanga • All 38 Districts</Text>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              {
                backgroundColor: colors.cardSurface,
                borderColor: colors.cardBorder,
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Passenger Name</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                }
              ]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter full name"
              placeholderTextColor={colors.inputPlaceholder}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: colors.cardBorder }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.modalBtnCancelText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnSave, { backgroundColor: colors.accentGold }]}
                onPress={handleSaveName}
              >
                <Text style={styles.modalBtnSaveText}>Save Changes</Text>
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
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topHeader: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  userPhone: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  kycBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  walletBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  signInCta: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  signInCtaText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  rowSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  themePillsContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  themePillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  faqItem: {
    padding: 14,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  faqToggleIcon: {
    fontSize: 18,
    fontWeight: '900',
  },
  faqAnswer: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  footerInfo: {
    alignItems: 'center',
    gap: 3,
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnCancel: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalBtnCancelText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalBtnSave: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  modalBtnSaveText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
