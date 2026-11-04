import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface BrandLogoProps {
  size?: 'sm' | 'header' | 'hero';
  showSubtitle?: boolean;
  subtitleText?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'header',
  showSubtitle = true,
  subtitleText = 'Bihar Intercity Cab Network',
  onPress,
  style
}) => {
  const { colors, isDark } = useTheme();

  const isHero = size === 'hero';
  const isSm = size === 'sm';

  const logoSize = isHero ? 60 : isSm ? 28 : 36;
  const brandFontSize = isHero ? 26 : isSm ? 15 : 19;
  const subtitleFontSize = isHero ? 11 : isSm ? 8 : 9.5;

  const content = (
    <View style={[styles.container, style]}>
      {/* Official Website Brand Badge Icon */}
      <View
        style={[
          styles.badgeIcon,
          {
            width: logoSize + 8,
            height: logoSize + 8,
            borderRadius: (logoSize + 8) / 2,
            backgroundColor: isDark ? 'rgba(5, 150, 105, 0.16)' : 'rgba(5, 150, 105, 0.1)',
            borderColor: isDark ? 'rgba(5, 150, 105, 0.35)' : 'rgba(5, 150, 105, 0.25)'
          }
        ]}
      >
        <Image
          source={require('../assets/logo-reframed.png')}
          style={{ width: logoSize, height: logoSize, borderRadius: logoSize / 2 }}
          resizeMode="contain"
        />
      </View>

      {/* Website Typography: OneWay + TaxiBihar */}
      <View style={styles.textGroup}>
        <View style={styles.textRow}>
          <Text
            style={[
              styles.textOneWay,
              {
                color: colors.text,
                fontSize: brandFontSize
              }
            ]}
          >
            OneWay
          </Text>
          <Text
            style={[
              styles.textTaxiBihar,
              {
                color: colors.gold,
                fontSize: brandFontSize
              }
            ]}
          >
            TaxiBihar
          </Text>
        </View>

        {showSubtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.primary,
                fontSize: subtitleFontSize
              }
            ]}
            numberOfLines={1}
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
    gap: 10
  },
  badgeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    overflow: 'hidden'
  },
  textGroup: {
    justifyContent: 'center'
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textOneWay: {
    fontWeight: '900',
    letterSpacing: -0.5
  },
  textTaxiBihar: {
    fontWeight: '900',
    letterSpacing: -0.5,
    marginLeft: 1
  },
  subtitle: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 1
  }
});
