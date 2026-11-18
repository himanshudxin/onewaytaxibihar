import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { MobileApiClient } from '../../../../shared/services/api';
import { StorageService } from '../../../../shared/services/storage';
import { useDriver } from '../context/DriverContext';
import { sanitizePhoneNumber, isValidIndianMobile } from '../../../../shared/utils/formatters';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  FileText,
  Car,
  CreditCard,
  User,
  CheckCircle2,
  Upload
} from 'lucide-react-native';

export const DriverApplicationScreen = ({ navigation }: any) => {
  const { refreshProfile } = useDriver();
  const { colors, isDark } = useTheme();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  // Form State - Clean initial state with zero fake autofill
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [dlExpiry, setDlExpiry] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [permitNumber, setPermitNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [dlPhotoAttached, setDlPhotoAttached] = useState(false);
  const [rcPhotoAttached, setRcPhotoAttached] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim()) {
        Alert.alert('Required', 'Please enter your full legal name as shown on your Driving Licence.');
        return;
      }
      const clean = sanitizePhoneNumber(phone);
      if (!isValidIndianMobile(clean)) {
        Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!city.trim()) {
        Alert.alert('Required', 'Please enter your primary operating city (e.g. Patna, Gaya, Muzaffarpur, Darbhanga).');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!dlNumber.trim() || dlNumber.trim().length < 8) {
        Alert.alert('Required', 'Please enter your Driving Licence number (e.g. BR-01-2022-0012345).');
        return;
      }
      if (!dlExpiry.trim()) {
        Alert.alert('Required', 'Please enter your Driving Licence validity date (e.g. 2030-12-31).');
        return;
      }
      if (!dlPhotoAttached) {
        Alert.alert('Photo Required', 'Please upload or attach a clear photo of your Driving Licence before proceeding to the next step.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!vehicleModel.trim()) {
        Alert.alert('Required', 'Please enter your commercial vehicle model (e.g. Maruti Dzire, Ertiga, Innova).');
        return;
      }
      if (!vehiclePlate.trim()) {
        Alert.alert('Required', 'Please enter your commercial vehicle registration plate number (e.g. BR 01 XX 0000).');
        return;
      }
      if (!rcPhotoAttached) {
        Alert.alert('Photo Required', 'Please upload or attach your Commercial Vehicle RC Certificate photo before proceeding to the next step.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!bankAccount.trim()) {
        Alert.alert('Required', 'Please enter your bank account number and IFSC for daily earnings payout.');
        return;
      }
      if (!upiId.trim() || !upiId.includes('@')) {
        Alert.alert('Required', 'Please enter a valid UPI ID (e.g. 9876543210@upi or yourname@okhdfcbank) for instant trip settlements.');
        return;
      }
      handleSubmitApplication();
    }
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    try {
      const clean = sanitizePhoneNumber(phone);
      await MobileApiClient.submitDriverApplication({
        fullName: fullName.trim(),
        phone: clean,
        city: city.trim(),
        drivingLicenceNumber: dlNumber.trim(),
        drivingLicenceExpiry: dlExpiry.trim(),
        dlPhotoUrl: dlPhotoAttached ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80' : undefined,
        vehicleMake: vehicleMake.trim() || 'Commercial',
        vehicleModel: vehicleModel.trim(),
        vehiclePlateNumber: vehiclePlate.trim().toUpperCase(),
        rcPhotoUrl: rcPhotoAttached ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80' : undefined,
        permitNumber: permitNumber.trim(),
        bankAccountNumber: bankAccount.trim(),
        upiId: upiId.trim()
      });

      await StorageService.setItem('otb_driver_phone', clean);
      await StorageService.setItem('otb_driver_status', 'pending');
      await StorageService.setJson('otb_driver_application', {
        fullName: fullName.trim(),
        phone: clean,
        city: city.trim(),
        drivingLicenceNumber: dlNumber.trim(),
        drivingLicenceExpiry: dlExpiry.trim(),
        vehicleModel: vehicleModel.trim(),
        vehiclePlateNumber: vehiclePlate.trim().toUpperCase(),
        bankAccountNumber: bankAccount.trim(),
        upiId: upiId.trim(),
        status: 'pending'
      });
      await refreshProfile();

      navigation.replace('VerificationStatus', { phone: clean });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Chauffeur Verification (Step {step}/4)
          </Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorRow}>
          {[1, 2, 3, 4].map(s => (
            <View
              key={s}
              style={[
                styles.stepBar,
                { backgroundColor: s <= step ? colors.primary : colors.surfaceElevated }
              ]}
            />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={[styles.stepIconBadge, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                <User size={30} color={colors.primary} />
              </View>
              <Text style={[styles.stepHeading, { color: colors.text }]}>Personal Information</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Enter your details to register as an authorized outstation driver partner.
              </Text>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>FULL LEGAL NAME (AS PER DL)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>WHATSAPP & CALLING NUMBER</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="10-digit Mobile Number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>PRIMARY OPERATING CITY</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Patna, Gaya, Muzaffarpur, etc."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={[styles.stepIconBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <FileText size={30} color={colors.gold} />
              </View>
              <Text style={[styles.stepHeading, { color: colors.text }]}>Driving Licence Verification</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Commercial driver verification requires an active Indian Driving Licence.
              </Text>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>DRIVING LICENCE (DL) NUMBER</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. BR-01-2022-0012345"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  value={dlNumber}
                  onChangeText={setDlNumber}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>LICENCE VALIDITY / EXPIRY DATE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={dlExpiry}
                  onChangeText={setDlExpiry}
                />
              </View>

              {/* Upload Driving Licence Photo Card */}
              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  {
                    backgroundColor: dlPhotoAttached ? 'rgba(5, 150, 105, 0.1)' : colors.surface,
                    borderColor: dlPhotoAttached ? colors.primary : colors.border
                  }
                ]}
                onPress={() => {
                  const nextState = !dlPhotoAttached;
                  setDlPhotoAttached(nextState);
                  Alert.alert(
                    nextState ? 'Driving Licence Attached' : 'Photo Removed',
                    nextState
                      ? 'Driving Licence photo attached successfully.'
                      : 'Driving Licence photo removed.'
                  );
                }}
              >
                {dlPhotoAttached ? (
                  <>
                    <CheckCircle2 size={24} color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.primary }]}>Driving Licence Photo Attached</Text>
                    <Text style={[styles.uploadSub, { color: colors.textSecondary }]}>driving_licence_front.jpg • Ready for upload (Tap to remove)</Text>
                  </>
                ) : (
                  <>
                    <Upload size={22} color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.text }]}>Upload Photo of Driving Licence *</Text>
                    <Text style={[styles.uploadSub, { color: colors.textMuted }]}>Front side clear photo (Required to proceed)</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={[styles.stepIconBadge, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Car size={30} color={colors.info} />
              </View>
              <Text style={[styles.stepHeading, { color: colors.text }]}>Commercial Vehicle Details</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Register your commercial yellow-plate taxi (Dzire, Etios, Ertiga, Innova).
              </Text>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>VEHICLE MODEL & CATEGORY</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={vehicleModel}
                  onChangeText={setVehicleModel}
                  placeholder="e.g. Maruti Dzire, Ertiga, Innova Crysta"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>REGISTRATION NUMBER (YELLOW PLATE)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. BR 01 XX 0000"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  value={vehiclePlate}
                  onChangeText={setVehiclePlate}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  {
                    backgroundColor: rcPhotoAttached ? 'rgba(59, 130, 246, 0.1)' : colors.surface,
                    borderColor: rcPhotoAttached ? colors.info : colors.border
                  }
                ]}
                onPress={() => {
                  const nextState = !rcPhotoAttached;
                  setRcPhotoAttached(nextState);
                  Alert.alert(
                    nextState ? 'Vehicle RC Attached' : 'RC Removed',
                    nextState
                      ? 'Commercial RC certificate attached successfully.'
                      : 'Vehicle RC certificate removed.'
                  );
                }}
              >
                {rcPhotoAttached ? (
                  <>
                    <CheckCircle2 size={24} color={colors.info} />
                    <Text style={[styles.uploadText, { color: colors.info }]}>Commercial RC Certificate Attached</Text>
                    <Text style={[styles.uploadSub, { color: colors.textSecondary }]}>vehicle_rc_certificate.jpg • Ready for upload (Tap to remove)</Text>
                  </>
                ) : (
                  <>
                    <Upload size={22} color={colors.info} />
                    <Text style={[styles.uploadText, { color: colors.text }]}>Upload Vehicle RC Certificate *</Text>
                    <Text style={[styles.uploadSub, { color: colors.textMuted }]}>Commercial permit / RC photo (Required to proceed)</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContainer}>
              <View style={[styles.stepIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <CreditCard size={30} color={colors.primary} />
              </View>
              <Text style={[styles.stepHeading, { color: colors.text }]}>Bank & Daily Payout Account</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                Your trip earnings are settled directly to this account every evening.
              </Text>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>BANK ACCOUNT NUMBER / IFSC</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. 501004829104 (HDFC Bank)"
                  placeholderTextColor={colors.textMuted}
                  value={bankAccount}
                  onChangeText={setBankAccount}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>UPI ID FOR INSTANT SETTLEMENT (RECOMMENDED)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. 9876501234@paytm / okicici"
                  placeholderTextColor={colors.textMuted}
                  value={upiId}
                  onChangeText={setUpiId}
                />
              </View>

              <View style={[styles.securityNotice, { backgroundColor: 'rgba(5, 150, 105, 0.08)' }]}>
                <ShieldCheck size={18} color={colors.primary} />
                <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                  Your banking data is stored encrypted and used solely for daily trip payouts.
                </Text>
              </View>
            </View>
          )}

        </ScrollView>

        {/* Bottom CTA Bar */}
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {step === 4 ? 'Submit Verification Application' : 'Continue to Next Step'}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  stepContainer: {
    paddingTop: 10,
  },
  stepIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepHeading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  autofillAppBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    marginBottom: 16,
  },
  autofillAppText: {
    fontSize: 13,
    fontWeight: '800',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  uploadBox: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 6,
    marginTop: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '700',
  },
  uploadSub: {
    fontSize: 11,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  securityText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  nextBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
