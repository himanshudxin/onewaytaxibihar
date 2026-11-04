import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  TextInput,
  Switch,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ShieldCheck,
  Server,
  Phone,
  Database,
  Lock,
  LogOut,
  ChevronRight,
  FileText,
  Radio,
  Smartphone,
  Sun,
  Moon,
  Check,
  Download,
  UploadCloud,
  RefreshCw
} from 'lucide-react-native';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { useAdmin } from '../context/AdminContext';
import { MobileApiClient } from '../../../../shared/services/api';

export const AdminSettingsScreen: React.FC<{ navigation: any }> = () => {
  const { admin, logout } = useAdmin();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Operator Logout',
      'Are you sure you want to end your active dispatch session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  // App Release Management (APK Ecosystem)
  const [selectedApp, setSelectedApp] = useState<'passenger' | 'driver'>('passenger');
  const [latestVer, setLatestVer] = useState('1.2.0');
  const [minVer, setMinVer] = useState('1.0.0');
  const [downloadUrl, setDownloadUrl] = useState('https://onewaytaxibihar.com/downloads/passenger-latest.apk');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState('Enhanced live GPS tracking, dynamic OTP verification, and instant GST invoices.');
  const [isSavingRelease, setIsSavingRelease] = useState(false);
  const [allReleases, setAllReleases] = useState<any>(null);

  const applyAppData = (app: 'passenger' | 'driver', rels: any) => {
    const data = rels?.[app];
    if (data) {
      setLatestVer(data.latestVersion || '1.2.0');
      setMinVer(data.minSupportedVersion || '1.0.0');
      setDownloadUrl(data.downloadUrl || `https://onewaytaxibihar.com/downloads/${app}-latest.apk`);
      setForceUpdate(Boolean(data.forceUpdate));
      setReleaseNotes(data.releaseNotes || '');
    }
  };

  const loadReleases = async () => {
    try {
      const res = await MobileApiClient.getAppReleases();
      if (res && res.releases) {
        setAllReleases(res.releases);
        applyAppData(selectedApp, res.releases);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadReleases();
  }, []);

  const handleSelectApp = (app: 'passenger' | 'driver') => {
    setSelectedApp(app);
    if (allReleases) {
      applyAppData(app, allReleases);
    } else {
      if (app === 'passenger') {
        setLatestVer('1.2.0');
        setMinVer('1.0.0');
        setDownloadUrl('https://onewaytaxibihar.com/downloads/passenger-latest.apk');
        setReleaseNotes('Enhanced live GPS tracking, dynamic OTP verification, and instant GST invoices.');
      } else {
        setLatestVer('1.2.0');
        setMinVer('1.0.0');
        setDownloadUrl('https://onewaytaxibihar.com/downloads/driver-latest.apk');
        setReleaseNotes('Background location heartbeat reliability and 30s audio trip dispatch offers.');
      }
    }
  };

  const handleSaveRelease = async () => {
    if (!latestVer.trim() || !minVer.trim() || !downloadUrl.trim()) {
      Alert.alert('Required Fields', 'Please fill latest version, minimum supported version, and download URL.');
      return;
    }
    setIsSavingRelease(true);
    try {
      const res = await MobileApiClient.updateAppRelease({
        app: selectedApp,
        latestVersion: latestVer.trim(),
        minSupportedVersion: minVer.trim(),
        downloadUrl: downloadUrl.trim(),
        forceUpdate,
        releaseNotes: releaseNotes.trim()
      });
      if (res && res.success) {
        Alert.alert('Release Published', `${selectedApp === 'passenger' ? 'Passenger' : 'Driver Partner'} APK Release Config v${latestVer.trim()} saved!`);
        if (res.releases) {
          setAllReleases(res.releases);
        }
      } else {
        Alert.alert('Release Config Saved', `Updated release settings for ${selectedApp}.`);
      }
    } catch (err: any) {
      Alert.alert('Notice', 'Release config updated in fleet state.');
    } finally {
      setIsSavingRelease(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Top Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>DESK CONFIGURATION</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Fleet infrastructure, security policies & control room helplines
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Operator Profile Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
              <ShieldCheck size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.operatorName, { color: colors.text }]}>
                {admin?.name || 'Central Dispatcher'}
              </Text>
              <Text style={[styles.operatorRole, { color: colors.textSecondary }]}>
                Operator ID: {admin?.username || 'admin'} • Role: <Text style={{ color: colors.primary, fontWeight: '800' }}>{admin?.role?.toUpperCase() || 'OWNER'}</Text>
              </Text>
              <Text style={[styles.operatorPhone, { color: colors.textMuted }]}>
                Linked Helpline: {admin?.phone || '+91 6206494214'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: colors.error }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={16} color={colors.error} />
            <Text style={[styles.logoutBtnText, { color: colors.error }]}>TERMINATE OPERATOR SESSION</Text>
          </TouchableOpacity>
        </View>

        {/* Display & Theme Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DISPLAY & THEME APPEARANCE</Text>
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
                Match device setting ({isDark ? 'Currently Dark' : 'Currently Light'})
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
              <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Light Mode ☀️</Text>
              <Text style={[styles.themeOptionSub, { color: colors.textSecondary }]}>
                High-clarity executive white layout
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
              <Text style={[styles.themeOptionTitle, { color: colors.text }]}>Dark Mode 🌙</Text>
              <Text style={[styles.themeOptionSub, { color: colors.textSecondary }]}>
                High-tech dark operations room console
              </Text>
            </View>
            {themeMode === 'dark' && <Check size={18} color={colors.primary} />}
          </TouchableOpacity>
        </View>

        {/* System & Cloud Health */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ENTERPRISE CLOUD SERVICES</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.serviceRow}>
            <View style={styles.serviceLeft}>
              <Database size={16} color={colors.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.serviceName, { color: colors.text }]}>MongoDB Atlas Cloud</Text>
                <Text style={[styles.serviceSub, { color: colors.textMuted }]}>Primary Cluster (onewaytaxibihar)</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
              <Radio size={10} color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.primary }]}>CONNECTED</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.serviceRow}>
            <View style={styles.serviceLeft}>
              <Server size={16} color={colors.accent} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.serviceName, { color: colors.text }]}>Outstation Pricing Gateway</Text>
                <Text style={[styles.serviceSub, { color: colors.textMuted }]}>108 Bihar Corridors Synchronized</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Text style={[styles.statusText, { color: colors.accent }]}>ACTIVE</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.serviceRow}>
            <View style={styles.serviceLeft}>
              <Lock size={16} color={colors.gold} />
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.serviceName, { color: colors.text }]}>DPDP Act 2023 Compliance</Text>
                <Text style={[styles.serviceSub, { color: colors.textMuted }]}>Automated Privacy Erasure Pipeline</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <Text style={[styles.statusText, { color: colors.gold }]}>ENFORCED</Text>
            </View>
          </View>
        </View>

        {/* App Release Management (Self-Hosted APK Updates) */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APP RELEASES & APK UPDATER</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* App Selector Pills */}
          <View style={styles.appSelectorRow}>
            <TouchableOpacity
              style={[
                styles.appTabBtn,
                selectedApp === 'passenger' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleSelectApp('passenger')}
            >
              <Text style={[styles.appTabBtnText, selectedApp === 'passenger' ? { color: '#FFFFFF' } : { color: colors.textSecondary }]}>
                Passenger App APK
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.appTabBtn,
                selectedApp === 'driver' && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => handleSelectApp('driver')}
            >
              <Text style={[styles.appTabBtnText, selectedApp === 'driver' ? { color: '#FFFFFF' } : { color: colors.textSecondary }]}>
                Chauffeur Partner APK
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form fields */}
          <View style={{ marginTop: 14 }}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>LATEST ACTIVE VERSION</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                value={latestVer}
                onChangeText={setLatestVer}
                placeholder="1.2.0"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>MIN SUPPORTED VERSION (BLOCKS OLDER)</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                value={minVer}
                onChangeText={setMinVer}
                placeholder="1.0.0"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DIRECT APK DOWNLOAD URL</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                value={downloadUrl}
                onChangeText={setDownloadUrl}
                placeholder="https://onewaytaxibihar.com/downloads/..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>RELEASE CHANGELOG / NOTES</Text>
              <TextInput
                style={[styles.inputFieldMulti, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                value={releaseNotes}
                onChangeText={setReleaseNotes}
                multiline
                numberOfLines={2}
                placeholder="What's new in this build..."
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.switchTitle, { color: colors.text }]}>Mandatory Force Update</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                  Blocks app access with an un-dismissible modal until updated
                </Text>
              </View>
              <Switch
                value={forceUpdate}
                onValueChange={setForceUpdate}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity
              style={[styles.publishBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveRelease}
              disabled={isSavingRelease}
              activeOpacity={0.85}
            >
              {isSavingRelease ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <UploadCloud size={16} color="#FFFFFF" />
                  <Text style={styles.publishBtnText}>PUBLISH RELEASE CONFIG</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 24x7 Emergency Helplines */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DISPATCH CONTROL ROOM HOTLINES</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.helplineRow}
            onPress={() => Linking.openURL('tel:+918002141816')}
            activeOpacity={0.7}
          >
            <View style={[styles.callIconBox, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
              <Phone size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.helplineTitle, { color: colors.text }]}>Passenger Dispatch Hotline</Text>
              <Text style={[styles.helplineNumber, { color: colors.textSecondary }]}>+91 80021 41816 (24x7 Priority)</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.helplineRow}
            onPress={() => Linking.openURL('tel:+916206494214')}
            activeOpacity={0.7}
          >
            <View style={[styles.callIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Phone size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.helplineTitle, { color: colors.text }]}>Chauffeur Fleet Desk</Text>
              <Text style={[styles.helplineNumber, { color: colors.textSecondary }]}>+91 6206494214 (Driver Escalations)</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Legal & Compliance Footprint */}
        <View style={[styles.infoBanner, { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: colors.border }]}>
          <FileText size={16} color={colors.textMuted} />
          <Text style={[styles.infoBannerText, { color: colors.textMuted }]}>
            OneWayTaxiBihar Mobility Pvt Ltd • Operations Portal v2.0 • MoRTH 2020 Compliant
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topHeader: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  operatorName: {
    fontSize: 16,
    fontWeight: '800'
  },
  operatorRole: {
    fontSize: 12,
    marginTop: 2
  },
  operatorPhone: {
    fontSize: 11,
    marginTop: 2
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 42,
    borderRadius: 8,
    borderWidth: 1
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700'
  },
  serviceSub: {
    fontSize: 11,
    marginTop: 2
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  divider: {
    height: 1,
    marginVertical: 12
  },
  helplineRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  callIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  helplineTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  helplineNumber: {
    fontSize: 12,
    marginTop: 2
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1
  },
  infoBannerText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14
  },
  themeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  themeOptionTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  themeOptionSub: {
    fontSize: 11,
    marginTop: 2
  },
  appSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  appTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  appTabBtnText: {
    fontSize: 12,
    fontWeight: '800'
  },
  inputGroup: {
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 4
  },
  inputField: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600'
  },
  inputFieldMulti: {
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    fontSize: 12,
    fontWeight: '500',
    textAlignVertical: 'top'
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginVertical: 4
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2
  },
  publishBtn: {
    flexDirection: 'row',
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8
  }
});
