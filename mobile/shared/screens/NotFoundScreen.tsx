import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export const NotFoundScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
          <AlertCircle size={48} color={colors.error || '#EF4444'} />
        </View>

        <Text style={[styles.errorCode, { color: colors.gold || '#F59E0B' }]}>404</Text>
        <Text style={[styles.title, { color: colors.text }]}>Page / Screen Not Found</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          The screen you are attempting to access does not exist or has been relocated in our dispatch network.
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => (navigation ? navigation.navigate('Home') : null)}
          activeOpacity={0.85}
        >
          <Home size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NotFoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  errorCode: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
    marginBottom: 28
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  }
});

