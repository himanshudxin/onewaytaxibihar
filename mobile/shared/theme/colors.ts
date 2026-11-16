/**
 * OneWayTaxiBihar Shared Theme Tokens
 * Fully reactive to Light Mode & Dark Mode.
 * Preserves legacy token keys (surface, border, text, primary, etc.) for Driver & Admin screens
 * while providing precision Uber/Bolt styling for Passenger screens.
 */

export const UberDarkColors = {
  isDark: true,
  // Canvas & Surfaces
  background: '#0B0F19',         // Deep Obsidian Black
  surface: '#131B2E',            // Elevated Midnight Surface
  surfaceElevated: '#1F2937',
  surfaceHighlight: '#374151',
  cardSurface: '#131B2E',
  cardSurfaceAlt: '#1E293B',
  border: '#1E293B',             // Subtle Slate Border
  borderLight: '#374151',
  cardBorder: '#1E293B',
  cardBorderSelected: '#F59E0B', // Amber Gold Glow
  divider: '#1E293B',

  // High-Contrast Typography
  text: '#FFFFFF',               // Crisp Pure White
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',      // Cool Slate
  textMuted: '#64748B',          // Muted Charcoal

  // Luxury Accents
  primary: '#F59E0B',            // Amber Gold
  primaryHover: '#D97706',
  primaryGlow: 'rgba(245, 158, 11, 0.25)',
  gold: '#F59E0B',
  goldGlow: 'rgba(245, 158, 11, 0.2)',
  accentGold: '#F59E0B',
  accentGoldLight: '#FEF3C7',
  accentGoldDark: '#D97706',
  accentGlow: 'rgba(245, 158, 11, 0.15)',

  // Functional Status
  brandGreen: '#10B981',
  brandGreenBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerGlow: 'rgba(239, 68, 68, 0.2)',
  error: '#EF4444',
  success: '#10B981',
  info: '#38BDF8',
  accent: '#38BDF8',
  accentRed: '#EF4444',
  accentRedBg: 'rgba(239, 68, 68, 0.12)',
  accentBlue: '#38BDF8',
  accentBlueBg: 'rgba(56, 189, 248, 0.12)',
  white: '#FFFFFF',

  // Navigation & Headers
  headerBg: '#0B0F19',
  tabBarBg: '#0B0F19',
  tabBarBorder: '#1E293B',
  tabBarActive: '#F59E0B',
  tabBarInactive: '#64748B',

  // Inputs
  inputBg: '#131B2E',
  inputBorder: '#334155',
  inputText: '#FFFFFF',
  inputPlaceholder: '#64748B',
};

export const UberLightColors = {
  isDark: false,
  // Canvas & Surfaces
  background: '#F8FAFC',         // Crisp Off-White Canvas
  surface: '#FFFFFF',            // Pure White Surface
  surfaceElevated: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',
  cardSurface: '#FFFFFF',
  cardSurfaceAlt: '#F1F5F9',
  border: '#E2E8F0',             // Soft Grey Border
  borderLight: '#CBD5E1',
  cardBorder: '#E2E8F0',
  cardBorderSelected: '#0F172A',
  divider: '#E2E8F0',

  // High-Contrast Typography
  text: '#0F172A',               // Deep Charcoal / Obsidian
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Luxury Accents
  primary: '#D97706',            // Polished Amber
  primaryHover: '#B45309',
  primaryGlow: 'rgba(217, 119, 6, 0.2)',
  gold: '#D97706',
  goldGlow: 'rgba(217, 119, 6, 0.15)',
  accentGold: '#D97706',
  accentGoldLight: '#FFFBEB',
  accentGoldDark: '#B45309',
  accentGlow: 'rgba(217, 119, 6, 0.12)',

  // Functional Status
  brandGreen: '#059669',
  brandGreenBg: 'rgba(5, 150, 105, 0.1)',
  warning: '#D97706',
  danger: '#DC2626',
  dangerGlow: 'rgba(220, 38, 38, 0.15)',
  error: '#DC2626',
  success: '#059669',
  info: '#0284C7',
  accent: '#0284C7',
  accentRed: '#DC2626',
  accentRedBg: 'rgba(220, 38, 38, 0.08)',
  accentBlue: '#0284C7',
  accentBlueBg: 'rgba(2, 132, 199, 0.08)',
  white: '#FFFFFF',

  // Navigation & Headers
  headerBg: '#FFFFFF',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#0F172A',
  tabBarInactive: '#94A3B8',

  // Inputs
  inputBg: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputText: '#0F172A',
  inputPlaceholder: '#94A3B8',
};

export const PassengerColors = UberLightColors;

export const Colors = {
  dark: UberDarkColors,
  light: UberLightColors,
  passenger: UberLightColors,
};

export const PassengerTheme = {
  borderRadius: {
    xs: 6,
    sm: 10,
    card: 16,
    cardSm: 12,
    button: 12,
    input: 12,
    pill: 999,
  },
  shadows: {
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    hover: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 5,
    },
  },
};
