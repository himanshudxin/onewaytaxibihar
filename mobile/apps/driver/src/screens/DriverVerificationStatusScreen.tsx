import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { useDriver } from '../context/DriverContext';
import { StorageService } from '../../../../shared/services/storage';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  ShieldCheck,
  ArrowRight,
  FileText
} from 'lucide-react-native';

export const DriverVerificationStatusScreen = ({ route, navigation }: any) => {
  const { phone } = route.params || {};
  const { driver, setDriver } = useDriver();
  const { colors, isDark } = useTheme();

  const [status, setStatus] = useState<'pending' | 'approved' | 'needs_changes'>(
    driver?.verificationStatus === 'approved' ? 'approved' : 'pending'
  );

  const handleCallDesk = () => {
    Linking.openURL('tel:6206494214');
  };

  const handleSimulateApproval = async () => {
    setStatus('approved');
    await StorageService.setItem('otb_driver_status', 'approved');
    if (driver) {
      setDriver({ ...driver, verificationStatus: 'approved' });
    }
    Alert.alert('Simulated Verification', 'Chauffeur partner status verified. You can now accept live outstation dispatch trips!');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Status Graphic */}
        <View style={styles.topContainer}>
          {status === 'pending' && (
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Clock size={52} color={colors.gold} />
            </View>
          )}
          {status === 'approved' && (
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
              <CheckCircle size={52} color={colors.primary} />
            </View>
          )}
          {status === 'needs_changes' && (
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <AlertCircle size={52} color={colors.danger} />
            </View>
          )}

          <Text style={[styles.title, { color: colors.text }]}>
            {status === 'pending' && 'Application Under Review'}
            {status === 'approved' && 'Verified Chauffeur Partner'}
            {status === 'needs_changes' && 'Documents Need Revision'}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {status === 'pending' &&
              'Your Driving Licence and vehicle RC are currently being validated by our Patna central dispatch team.'}
            {status === 'approved' &&
              'Congratulations! Your vehicle and commercial credentials are authenticated. Dispatch queue unlocked.'}
            {status === 'needs_changes' &&
              'Please re-upload a clear photograph of your Driving Licence.'}
          </Text>
        </View>

        {/* Verification Checkpoint List */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardHeading, { color: colors.text }]}>Document Audit Checklist</Text>
          
          <View style={styles.checkRow}>
            <CheckCircle size={18} color={status === 'approved' ? colors.primary : colors.gold} />
            <Text style={[styles.checkText, { color: colors.text }]}>
              Government Driving Licence (DL): {status === 'approved' ? 'Verified' : 'Under Review'}
            </Text>
          </View>

          <View style={styles.checkRow}>
            <CheckCircle size={18} color={status === 'approved' ? colors.primary : colors.gold} />
            <Text style={[styles.checkText, { color: colors.text }]}>
              Commercial Vehicle RC & Fitness: {status === 'approved' ? 'Verified' : 'Under Review'}
            </Text>
          </View>

          <View style={styles.checkRow}>
            <CheckCircle size={18} color={status === 'approved' ? colors.primary : colors.gold} />
            <Text style={[styles.checkText, { color: colors.text }]}>
              Bank / UPI Daily Payout Account: {status === 'approved' ? 'Active' : 'Linked'}
            </Text>
          </View>
        </View>

        {/* Expedited Verification Hotline */}
        <TouchableOpacity
          style={[styles.hotlineCard, { backgroundColor: 'rgba(5, 150, 105, 0.1)', borderColor: 'rgba(5, 150, 105, 0.3)' }]}
          onPress={handleCallDesk}
        >
          <Phone size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.hotlineTitle, { color: colors.text }]}>Need Fast Approval?</Text>
            <Text style={[styles.hotlineDesc, { color: colors.textSecondary }]}>
              Call our fleet onboarding desk directly at 6206494214
            </Text>
          </View>
        </TouchableOpacity>

        {/* Developer Sandbox Testing Bypass */}
        <TouchableOpacity
          style={[styles.sandboxBtn, { borderColor: colors.border }]}
          onPress={handleSimulateApproval}
        >
          <Text style={[styles.sandboxText, { color: colors.textMuted }]}>
            [Testing Sandbox] Simulate Instant Admin Approval
          </Text>
        </TouchableOpacity>

        {/* Proceed Button */}
        <TouchableOpacity
          style={[
            styles.proceedBtn,
            { backgroundColor: status === 'approved' ? colors.primary : colors.surfaceElevated }
          ]}
          onPress={() => {
            if (status === 'approved') {
              navigation.replace('DriverTabs');
            } else {
              Alert.alert('Verification Pending', 'Your account is under verification. You can view the console, but trips cannot be accepted until approved.');
              navigation.replace('DriverTabs');
            }
          }}
        >
          <Text
            style={[
              styles.proceedBtnText,
              { color: status === 'approved' ? '#FFFFFF' : colors.textSecondary }
            ]}
          >
            {status === 'approved' ? 'Enter Driver Console' : 'View Driver Console (Restricted)'}
          </Text>
          <ArrowRight size={18} color={status === 'approved' ? '#FFFFFF' : colors.textSecondary} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 16,
  },
  topContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  hotlineTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  hotlineDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  sandboxBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  sandboxText: {
    fontSize: 11,
    fontWeight: '600',
  },
  proceedBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  proceedBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
