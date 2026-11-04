import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FileText, ArrowLeft, CheckCircle2, ShieldCheck, Scale } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export const TermsOfServiceScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            Contract of Carriage &amp; Intercity Transit Terms
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Highlight Card */}
        <View style={[styles.highlightCard, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: colors.gold }]}>
          <Scale size={24} color={colors.gold} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.highlightTitle, { color: colors.gold }]}>
              Guaranteed One-Way Carriage Policy
            </Text>
            <Text style={[styles.highlightText, { color: colors.textSecondary }]}>
              OneWayTaxiBihar provides point-to-point intercity passenger transport with zero return fare charges. All confirmed bookings constitute a binding contract of carriage.
            </Text>
          </View>
        </View>

        {/* Section 1: Fare Structure */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. All-Inclusive Pricing &amp; Fare Engine</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Quoted outstation fares include:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Fuel charges for the total one-way transit distance</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Chauffeur allowance and nighttime driving surcharges</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• State entry permits and commercial taxi transport taxes</Text>
            <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Highway toll taxes along the standard recommended highway corridor</Text>
          </View>
        </View>

        {/* Section 2: Cancellation & Refund Policy */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Cancellation &amp; Refund Terms</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            • Free cancellation is guaranteed up until your chauffeur leaves the garage for pickup.{'\n'}
            • Advance tokens paid online will be credited back via the original payment source within 24 to 48 hours.{'\n'}
            • In the rare event of a mechanical breakdown, our dispatch desk dispatches a replacement cab immediately at platform cost.
          </Text>
        </View>

        {/* Section 3: Passenger Conduct */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Passenger Safety &amp; Legal Compliance</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            Passengers must adhere to the Motor Vehicles Act, 1988 and Bihar state transport regulations. Transportation of contraband or illegal substances is strictly forbidden and subject to instant statutory reporting.
          </Text>
        </View>

        {/* Section 4: Jurisdiction */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Governing Law &amp; Jurisdiction</Text>
          <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
            These terms and any disputes arising out of taxi carriage shall be governed exclusively by the laws of India and subject to the jurisdiction of the courts of Patna, Bihar.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfServiceScreen;

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

