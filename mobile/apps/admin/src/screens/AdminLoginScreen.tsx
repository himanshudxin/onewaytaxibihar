import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, Lock, User, Terminal, Server } from 'lucide-react-native';
import { Colors } from '../../../../shared/theme/colors';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { BrandLogo } from '../../../../shared/components/BrandLogo';
import { useAdmin } from '../context/AdminContext';

export const AdminLoginScreen: React.FC<{ navigation?: any }> = () => {
  const { login, isLoading } = useAdmin();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors, isDark } = useTheme();

  const handleLogin = async (overrideUser?: string, overridePass?: string) => {
    const u = (overrideUser || username).trim();
    const p = (overridePass || password).trim();

    if (!u || !p) {
      Alert.alert('Required Fields', 'Please enter your operator username and secure password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await login(u, p);
      if (!ok) {
        Alert.alert('Authentication Failed', 'Invalid operator credentials. Access has been logged.');
      }
    } catch (err: any) {
      Alert.alert('Login Error', err.message || 'Server authentication failure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = () => {
    if (!password.trim()) {
      Alert.alert('Operator Credentials Required', 'Please enter your operator password to authenticate.');
      return;
    }
    handleLogin(username.trim() || 'admin', password.trim());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.header}>
          <BrandLogo size="hero" showSubtitle subtitleText="Fleet Operations & Central Dispatch Desk" />
          <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 8 }]}>
            Centralized Dispatch, Driver Verification & Intercity Booking Controls
          </Text>
        </View>

        {/* Credentials Form */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.formLabel, { color: colors.textSecondary }]}>OPERATOR USERNAME</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <User size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Username (e.g. admin)"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={[styles.formLabel, { color: colors.textSecondary, marginTop: 16 }]}>MASTER SECURITY KEY</Text>
          <View style={[styles.inputBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Lock size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter master password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleLogin()}
            disabled={isSubmitting || isLoading}
            activeOpacity={0.8}
          >
            {isSubmitting || isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>AUTHENTICATE & ENTER DESK</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickDemoBtn, { borderColor: colors.primary }]}
            onPress={handleQuickDemoLogin}
            disabled={isSubmitting || isLoading}
            activeOpacity={0.8}
          >
            <Text style={[styles.quickDemoText, { color: colors.primary }]}>Operator Demo Login (admin)</Text>
          </TouchableOpacity>
        </View>

        {/* Security & System Status Banner */}
        <View style={[styles.statusCard, { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: colors.border }]}>
          <View style={styles.statusRow}>
            <Server size={14} color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textMuted }]}>
              Connected to MongoDB Atlas Cloud Cluster (onewaytaxibihar)
            </Text>
          </View>
          <View style={[styles.statusRow, { marginTop: 6 }]}>
            <Terminal size={14} color={colors.accent} />
            <Text style={[styles.statusText, { color: colors.textMuted }]}>
              RBAC Enabled: Dispatcher, Manager & Owner Privileges
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%'
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 8
  },
  opsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6
  },
  opsText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '600'
  },
  loginBtn: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1
  },
  quickDemoBtn: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.08)'
  },
  quickDemoText: {
    fontSize: 13,
    fontWeight: '800'
  },
  statusCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500'
  }
});
