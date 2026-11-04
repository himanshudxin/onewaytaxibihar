import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlertTriangle, Home, Phone, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

export interface NotFoundScreenProps {
  navigation?: any;
  route?: any;
  homeRouteName?: string;
}

export const NotFoundScreen: React.FC<NotFoundScreenProps> = ({
  navigation,
  route,
  homeRouteName = 'MainTabs'
}) => {
  const { colors, isDark } = useTheme();

  const handleGoHome = () => {
    if (!navigation) return;
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate(homeRouteName);
      }
    } catch {
      try {
        navigation.navigate('Home');
      } catch {
        // Fallback
      }
    }
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+918002141816').catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: colors.danger }]}>
          <AlertTriangle size={48} color={colors.danger} />
        </View>

        <Text style={[styles.codeText, { color: colors.danger }]}>404</Text>
        <Text style={[styles.title, { color: colors.text }]}>Destination Route Not Found</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          The screen or navigation path you requested does not exist or has been relocated in the Bihar fleet network.
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleGoHome}
            activeOpacity={0.85}
          >
            <Home size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Return to Booking Desk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={handleCallSupport}
            activeOpacity={0.85}
          >
            <Phone size={18} color={colors.primary} />
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Call Dispatch Desk (+91 80021 41816)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default NotFoundScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    textAlign: 'center'
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  codeText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 12
  },
  actionsContainer: {
    width: '100%',
    gap: 12
  },
  primaryBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%'
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  secondaryBtn: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%'
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700'
  }
});
