/**
 * OneWayTaxiBihar Shared Theme Tokens
 * Upgraded Passenger Palette: Premium Golden Yellow & Clean White
 * Preserves Driver & Admin compatibility while delivering modern ride-hailing styling.
 */

export const PassengerColors = {
  // Primary Golden Yellow Accent Spectrum
  primaryYellow: '#EAB308',      // Vivid Golden Amber (Primary Accent)
  primaryGold: '#F59E0B',        // Warm Amber Gold (Badges & Highlights)
  primaryDarkGold: '#D97706',    // Deep Gold (Buttons, CTAs, Active States)
  primaryLightYellow: '#FEF3C7', // Soft Butter/Cream (Card fills & icon badges)
  primaryGlow: 'rgba(234, 179, 8, 0.18)',

  // Pure Clean Modern Base
  white: '#FFFFFF',
  background: '#F8FAFC',         // Soft Slate Gray-White for screen background
  backgroundLight: '#F8FAFC',
  cardSurface: '#FFFFFF',        // Pure white cards
  cardBorder: '#F1F5F9',         // Minimalist border separation
  cardBorderSelected: '#EAB308', // 2px Highlight border when selected
  cardBorderMuted: '#E2E8F0',

  // Modern High-Contrast Typography
  textPrimary: '#0F172A',        // Slate 900 (High contrast headers, fares)
  textSecondary: '#334155',      // Slate 700 (Labels, vehicle specs)
  textMuted: '#64748B',          // Slate 500 (Placeholders, inactive indicators)

  // Status & Brand Integrity
  brandGreen: '#059669',         // Preserved for authentic Logo Badge & AC Included badges
  accentRed: '#EF4444',          // Errors, cancellation, urgent notice
  accentBlue: '#2563EB',         // Live navigation & location indicators
  accentGreen: '#10B981',        // Success states
};

export const PassengerTheme = {
  colors: PassengerColors,
  borderRadius: {
    card: 18,
    cardSm: 14,
    button: 14,
    input: 12,
    pill: 999,
  },
  shadows: {
    soft: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    golden: {
      shadowColor: '#EAB308',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 5,
    },
  },
};

export const Colors = {
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669', // Brand Primary
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  passenger: PassengerColors,
  dark: {
    background: '#090D16',
    surface: '#111827',
    surfaceElevated: '#1F2937',
    surfaceHighlight: '#374151',
    border: '#1F2937',
    borderLight: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    primary: '#F59E0B',
    primaryHover: '#D97706',
    primaryGlow: 'rgba(245, 158, 11, 0.25)',
    gold: '#F59E0B',
    goldGlow: 'rgba(245, 158, 11, 0.2)',
    warning: '#F59E0B',
    danger: '#EF4444',
    dangerGlow: 'rgba(239, 68, 68, 0.2)',
    error: '#EF4444',
    success: '#10B981',
    info: '#3B82F6',
    accent: '#38BDF8',
    brandGreen: '#059669',
    white: '#FFFFFF',
    primaryYellow: '#EAB308',
    primaryGold: '#F59E0B',
    primaryDarkGold: '#D97706',
    primaryLightYellow: '#FEF3C7',
    cardSurface: '#111827',
    cardBorder: '#1F2937',
    cardBorderSelected: '#F59E0B',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceHighlight: '#FEF3C7',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    primary: '#EAB308',
    primaryHover: '#D97706',
    primaryGlow: 'rgba(234, 179, 8, 0.2)',
    gold: '#F59E0B',
    goldGlow: 'rgba(245, 158, 11, 0.2)',
    warning: '#D97706',
    danger: '#DC2626',
    dangerGlow: 'rgba(220, 38, 38, 0.15)',
    error: '#DC2626',
    success: '#059669',
    info: '#2563EB',
    accent: '#0284C7',
    brandGreen: '#059669',
    white: '#FFFFFF',
    primaryYellow: '#EAB308',
    primaryGold: '#F59E0B',
    primaryDarkGold: '#D97706',
    primaryLightYellow: '#FEF3C7',
    cardSurface: '#FFFFFF',
    cardBorder: '#F1F5F9',
    cardBorderSelected: '#EAB308',
  }
};
