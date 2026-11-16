import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export type BrandLogoVariant = 'website' | 'serif' | 'caps' | 'minimal';

export interface BrandLogoProps {
  size?: 'sm' | 'header' | 'hero';
  variant?: BrandLogoVariant;
  showSubtitle?: boolean;
  subtitleText?: string;
  showIcon?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  accentColor?: string;
  onLightBackground?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'header',
  variant = 'website',
  showSubtitle = false,
  subtitleText = 'Bihar Intercity Cab Network',
  showIcon = true,
  onPress,
  style,
  textColor,
  accentColor,
  onLightBackground = false,
}) => {
  const { colors, isDark } = useTheme();

  const isHero = size === 'hero';
  const isSm = size === 'sm';

  const badgeSize = isHero ? 40 : isSm ? 26 : 34;
  const fontSize = isHero ? 24 : isSm ? 15 : 19;
  const subtitleSize = isHero ? 9.5 : isSm ? 7.5 : 8.5;

  // Determine text color with 100% readability protection:
  // If explicitly passed, honor it.
  // If onLightBackground is true OR theme is light, ALWAYS use deep obsidian (#0F172A) + rich amber (#D97706) for crisp contrast on white.
  // Otherwise in dark mode, use pure white (#FFFFFF) + vibrant amber gold (#F59E0B).
  const isLightEffective = onLightBackground || !isDark;
  const primaryTextColor = textColor || (isLightEffective ? '#0F172A' : '#FFFFFF');
  const amberAccentColor = accentColor || (isLightEffective ? '#D97706' : '#F59E0B');

  const renderText = () => {
    switch (variant) {
      case 'serif':
        return (
          <View style={styles.textRow}>
            <Text
              style={[
                styles.brandTextSerif,
                {
                  fontSize,
                  color: primaryTextColor,
                  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                }
              ]}
            >
              OneWay
            </Text>
            <Text
              style={[
                styles.brandTextSerifBold,
                {
                  fontSize,
                  color: amberAccentColor,
                  fontFamily: Platform.select({ ios: 'Georgia-Bold', android: 'serif', default: 'serif' }),
                }
              ]}
            >
              TaxiBihar
            </Text>
          </View>
        );

      case 'caps':
        return (
          <View style={styles.textRow}>
            <Text
              style={[
                styles.brandTextCaps,
                {
                  fontSize: fontSize - 2,
                  color: primaryTextColor,
                }
              ]}
            >
              ONEWAY
            </Text>
            <Text
              style={[
                styles.brandTextCaps,
                {
                  fontSize: fontSize - 2,
                  color: amberAccentColor,
                  marginLeft: 3,
                }
              ]}
            >
              TAXI BIHAR
            </Text>
          </View>
        );

      case 'minimal':
        return (
          <View style={styles.textRow}>
            <Text
              style={[
                styles.brandTextMinimal,
                {
                  fontSize,
                  color: primaryTextColor,
                }
              ]}
            >
              OWT
            </Text>
            <View style={[styles.dotSep, { backgroundColor: amberAccentColor }]} />
            <Text
              style={[
                styles.brandTextMinimal,
                {
                  fontSize,
                  color: amberAccentColor,
                }
              ]}
            >
              Bihar
            </Text>
          </View>
        );

      case 'website':
      default:
        return (
          <View style={styles.textRow}>
            <Text
              style={[
                styles.brandTextMain,
                {
                  fontSize,
                  color: primaryTextColor,
                }
              ]}
            >
              OneWay
            </Text>
            <Text
              style={[
                styles.brandTextAccent,
                {
                  fontSize,
                  color: amberAccentColor,
                }
              ]}
            >
              TaxiBihar
            </Text>
          </View>
        );
    }
  };

  const content = (
    <View style={[styles.container, style]}>
      {/* Official Squircle Emblem Badge */}
      {showIcon && (
        <View
          style={[
            styles.badgeIcon,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: isHero ? 10 : isSm ? 7 : 9,
            }
          ]}
        >
          <Image
            source={require('../assets/logo-reframed.png')}
            style={{
              width: badgeSize,
              height: badgeSize,
              borderRadius: isHero ? 10 : isSm ? 7 : 9,
            }}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Dynamic Vector Brand Typography */}
      <View style={styles.textContainer}>
        {renderText()}
        {showSubtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                fontSize: subtitleSize,
                color: isLightEffective ? '#059669' : '#10B981',
              }
            ]}
          >
            {subtitleText.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  badgeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  textContainer: {
    justifyContent: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextMain: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  brandTextAccent: {
    fontWeight: '900',
    letterSpacing: -0.5,
    marginLeft: 1,
  },
  brandTextSerif: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandTextSerifBold: {
    fontWeight: '900',
    letterSpacing: -0.3,
    marginLeft: 2,
  },
  brandTextCaps: {
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  brandTextMinimal: {
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  dotSep: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 5,
  },
  subtitle: {
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 1,
    marginLeft: 1,
  },
});
