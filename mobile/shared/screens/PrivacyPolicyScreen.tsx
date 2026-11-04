import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export const PrivacyPolicyScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Digital Personal Data Protection (DPDP) Act 2023 Compliance
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Statutory DPDP Notice Card */}
        <View style={[styles.highlightCard, { backgroundColor: 'rgba(5, 150, 105, 0.1)', borderColor: colors.primary }]}>
          <Shield size={24} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.highlightTitle, { color: colors.primary }]}>
              Statutory DPDP Act 2023 Disclosure
            </Text>
            <Text style={[styles.highlightText, { color: colors.textSecondary }]}>
              OneWayTaxiBihar processes customer and chauffeur data strictly in compliance with the Digital Personal Data Protection Act (DPDP Act 2023), Government of India.
            </Text>
          </View>
        </View>

        {/* Section 1: Data We Collect */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Personal Data Collected</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            We collect personal information necessary to deliver outstation intercity taxi services across Bihar:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Mobile phone number for OTP verification and booking updates</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Passenger name, pickup doorstep address, and dropoff destination</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Real-time GPS location coordinates during active trip execution</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Payment transaction reference IDs (no raw card data is ever stored)</Text>
          </View>
        </View>

        {/* Section 2: Purpose of Processing */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Purpose of Data Processing</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Your personal information is used exclusively for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Matching your ride with verified commercial chauffeurs</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Providing real-time GPS telemetry and trip arrival estimates</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Generating GST-compliant tax invoices and receipts</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Safety monitoring and emergency SOS response assistance</Text>
          </View>
        </View>

        {/* Section 3: Right to Erasure */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Right to Erasure &amp; Account Deletion</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Under Section 12 of the DPDP Act 2023, you have the statutory right to request complete erasure of your personal data. You can exercise this right at any time using the "Delete Account & Data" button in your Profile screen or via onewaytaxibihar.com/data-deletion.
          </Text>
        </View>

        {/* Section 4: Contact Grievance Officer */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Data Protection Grievance Officer</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            OneWayTaxiBihar Data Privacy Officer (DPO){'\n'}
            Patna Central Operations Hub, Bihar, India{'\n'}
            Email: privacy@onewaytaxibihar.com{'\n'}
            Helpline: +91 80021 41816
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  backBtn: {
    padding: 6,
    marginRight: 10
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800'
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4
  },
  highlightText: {
    fontSize: 12,
    lineHeight: 18
  },
  card: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20
  },
  bulletList: {
    marginTop: 8,
    gap: 4
  },
  bullet: {
    fontSize: 13,
    lineHeight: 18
  }
});

