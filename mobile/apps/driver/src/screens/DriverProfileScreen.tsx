import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { useDriver } from '../context/DriverContext';
import { MobileApiClient } from '../../../../shared/services/api';
import {
  User,
  Phone,
  Shield,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  ShieldAlert,
  Car,
  Star,
  CheckCircle2,
  Smartphone,
  Sun,
  Moon,
  Check
} from 'lucide-react-native';

export const DriverProfileScreen = ({ navigation }: any) => {
  const { driver, logout } = useDriver();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

  const handleCallFleetDesk = () => {
    Linking.openURL('tel:6206494214');
  };

  const handleCallSos = () => {
    Alert.alert('Emergency Dispatch SOS', 'Connect to Bihar Police & Emergency Helpline (112)?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call 112 SOS', style: 'destructive', onPress: () => Linking.openURL('tel:112') }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Close Driver Account & Erase Records',
      'Under DPDP Act 2023, your driver partner registration, documents, and banking details will be queued for statutory erasure.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed with Erasure',
          style: 'destructive',
          onPress: async () => {
            const res = await MobileApiClient.requestAccountDeletion(driver?.phone || '9876501234', 'Driver requested account closure');
            Alert.alert('Account Closed', res.message);
            await logout();
            navigation.replace('DriverAuth');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Driver Profile Header Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
            <User size={36} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.driverName, { color: colors.text }]}>
              {driver?.fullName || 'Ramesh Kumar Singh'}
            </Text>
            <Text style={[styles.driverPhone, { color: colors.textSecondary }]}>
              +91 {driver?.phone || '9876501234'}
            </Text>
            <View style={styles.ratingRow}>
              <Star size={14} color={colors.gold} fill={colors.gold} />
              <Text style={[styles.ratingVal, { color: colors.gold }]}>4.88 Rating</Text>
              <Text style={[styles.tripsCount, { color: colors.textMuted }]}>• 342 Trips Completed</Text>
            </View>
          </View>
        </View>

        {/* Display & Theme Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Display & Theme Appearance</Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
            Default is your phone's system mode. You can customize light or dark theme below.
          </Text>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* 1. System Default */}
            <TouchableOpacity
              style={[
                styles.themeOptionRow,
                { borderBottomWidth: 1, borderBottomColor: colors.border },
                themeMode === 'system' && { backgroundColor: isDark ? 'rgba(5, 150, 105, 0.12)' : 'rgba(5, 150, 105, 0.08)' }
              ]}
              onPress={() => setThemeMode('system')}
              activeOpacity={0.7}
            >
              <View style={[styles.themeIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                <Smartphone size={18} color={themeMode === 'system' ? colors.primary : colors.textMuted} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.themeOptionTitle, { color: colors.text }]}>System Default (Auto)</Text>
                <Text style={[styles.themeOptionSub, { color: colors.textSecondary }]}>
                  Automatically match your device's display setting ({isDark ? 'Currently Dark' : 'Currently Light'})
                </Text>
              </View>
              {themeMode === 'system' && <Check size={18} color={colors.primary} />}
            </TouchableOpacity>

            {/* 2. Light Theme */}
            <TouchableOpacity
              style={[
                styles.themeOptionRow,
                { borderBottomWidth: 1, borderBottomColor: colors.border },
                themeMode === 'light' && { backgroundColor: 'rgba(5, 150, 105, 0.08)' }
              ]}
              onPress={() => setThemeMode('light')}
              activeOpacity={0.7}
            >
              <View style={[styles.themeIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Sun size={18} color={colors.gold} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Light Mode</Text>
                <Text style={[styles.themeOptionSub, { color: colors.textSecondary }]}>
                  Crisp daylight console with high contrast readability
                </Text>
              </View>
              {themeMode === 'light' && <Check size={18} color={colors.primary} />}
            </TouchableOpacity>

            {/* 3. Dark Theme */}
            <TouchableOpacity
              style={[
                styles.themeOptionRow,
                themeMode === 'dark' && { backgroundColor: 'rgba(5, 150, 105, 0.12)' }
              ]}
              onPress={() => setThemeMode('dark')}
              activeOpacity={0.7}
            >
              <View style={[styles.themeIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Moon size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.themeOptionSub, { color: colors.textSecondary }]}>
                  High-contrast night palette optimized for highway driving
                </Text>
              </View>
              {themeMode === 'dark' && <Check size={18} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Commercial Vehicle & Documents Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Registered Commercial Vehicle & Documents</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.docRow}>
              <Car size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.docLabel, { color: colors.textMuted }]}>COMMERCIAL TAXI</Text>
                <Text style={[styles.docVal, { color: colors.text }]}>
                  {driver?.documents.vehicleMake || 'Maruti'} {driver?.documents.vehicleModel || 'Dzire Prime'}
                </Text>
                <Text style={[styles.docPlate, { color: colors.gold }]}>
                  {driver?.documents.vehiclePlateNumber || 'BR 01 PB 8291'}
                </Text>
              </View>
              <CheckCircle2 size={18} color={colors.primary} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.docRow}>
              <FileText size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.docLabel, { color: colors.textMuted }]}>DRIVING LICENCE (COMMERCIAL)</Text>
                <Text style={[styles.docVal, { color: colors.text }]}>
                  {driver?.documents.drivingLicenceNumber || 'BR-01-2018-0049281'}
                </Text>
                <Text style={[styles.docExpiry, { color: colors.textMuted }]}>
                  Valid till: {driver?.documents.drivingLicenceExpiry || '2032-11-15'}
                </Text>
              </View>
              <CheckCircle2 size={18} color={colors.primary} />
            </View>
          </View>
        </View>

        {/* Support & SOS */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Fleet Helplines</Text>
          <View style={styles.hotlineGrid}>
            <TouchableOpacity
              style={[styles.hotlineBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleCallFleetDesk}
            >
              <Phone size={20} color={colors.primary} />
              <View>
                <Text style={[styles.hotlineBtnTitle, { color: colors.text }]}>Driver Partner Helpline</Text>
                <Text style={[styles.hotlineBtnVal, { color: colors.primary }]}>6206494214</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hotlineBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
              onPress={handleCallSos}
            >
              <ShieldAlert size={20} color={colors.danger} />
              <View>
                <Text style={[styles.hotlineBtnTitle, { color: colors.danger }]}>Emergency Police SOS</Text>
                <Text style={[styles.hotlineBtnVal, { color: colors.danger }]}>Call 112</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statutory Legal & Partner Compliance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statutory Compliance &amp; Policies</Text>
          <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: 0, overflow: 'hidden' }]}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 }}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/privacy-policy')}
              activeOpacity={0.7}
            >
              <Shield size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Privacy Policy</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>DPDP Act 2023 &amp; Location Telemetry Rules</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 }}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/terms-of-service')}
              activeOpacity={0.7}
            >
              <FileText size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Partner Terms &amp; Intermediary Policy</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>MoRTH 2020 Guidelines &amp; Section 79 IT Act</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}
              onPress={() => Linking.openURL('https://onewaytaxibihar.com/contact')}
              activeOpacity={0.7}
            >
              <Phone size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Chauffeur Grievance Redressal</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>Officer: Himanshu Kumar Dubey (Patna, Bihar)</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionGroup}>
          <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.border }]} onPress={logout}>
            <LogOut size={16} color={colors.textSecondary} />
            <Text style={[styles.logoutText, { color: colors.textSecondary }]}>Sign Out of Chauffeur Console</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}
            onPress={handleDeleteAccount}
          >
            <Trash2 size={16} color={colors.danger} />
            <Text style={[styles.deleteText, { color: colors.danger }]}>
              Close Chauffeur Account & Erase Records (DPDP Act)
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    gap: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '800',
  },
  driverPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  tripsCount: {
    fontSize: 12,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  docVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  docPlate: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  docExpiry: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  hotlineGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  hotlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  hotlineBtnTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  hotlineBtnVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  actionGroup: {
    gap: 10,
    marginTop: 10,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: -4,
    marginBottom: 4,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  themeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  themeOptionSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
