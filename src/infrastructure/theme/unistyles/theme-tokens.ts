import { scale, moderateScale } from 'react-native-size-matters'

/**
 * VNYL App Theme Tokens
 * Media-focused color palette optimized for streaming and video content
 */

// VNYL Brand Colors - Deep purple/blue gradient themes
export const brandColors = {
  // Primary brand gradients
  primary: {
    50: '#F0F4FF',
    100: '#E0E8FF', 
    200: '#C7D4FF',
    300: '#A4B5FF',
    400: '#818DFF',
    500: '#5B5CFF', // Primary brand color
    600: '#4338CA',
    700: '#3730A3',
    800: '#312E81',
    900: '#1E1B4B',
    950: '#0F0C29' // Deep purple for dark mode
  },
  
  // Secondary accent colors
  accent: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A'
  },

  // Media streaming specific colors
  media: {
    // Video player colors
    player: {
      overlay: 'rgba(0, 0, 0, 0.7)',
      controls: 'rgba(0, 0, 0, 0.8)',
      progress: '#5B5CFF',
      progressBg: 'rgba(255, 255, 255, 0.3)',
      buffered: 'rgba(255, 255, 255, 0.5)'
    },
    
    // Content rating colors
    rating: {
      high: '#10B981', // Green for high ratings
      medium: '#F59E0B', // Amber for medium ratings
      low: '#EF4444' // Red for low ratings
    },
    
    // Genre colors
    genre: {
      action: '#DC2626',
      comedy: '#F59E0B',
      drama: '#7C3AED',
      horror: '#991B1B',
      scifi: '#0891B2',
      romance: '#EC4899',
      documentary: '#059669',
      thriller: '#374151'
    }
  }
} as const

// Semantic color system
export const semanticColors = {
  // Status colors
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D'
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F'
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D'
  },
  
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A'
  }
} as const

// Typography system with size-matters scaling
export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    black: 'Inter_900Black'
  },
  
  fontSize: {
    xs: moderateScale(12),
    sm: moderateScale(14),
    base: moderateScale(16),
    lg: moderateScale(18),
    xl: moderateScale(20),
    '2xl': moderateScale(24),
    '3xl': moderateScale(30),
    '4xl': moderateScale(36),
    '5xl': moderateScale(48),
    '6xl': moderateScale(60),
    '7xl': moderateScale(72),
    '8xl': moderateScale(96),
    '9xl': moderateScale(128)
  },
  
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },
  
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1
  }
} as const

// Spacing system with size-matters scaling
export const spacing = {
  0: 0,
  px: scale(1),
  0.5: scale(2),
  1: scale(4),
  1.5: scale(6),
  2: scale(8),
  2.5: scale(10),
  3: scale(12),
  3.5: scale(14),
  4: scale(16),
  5: scale(20),
  6: scale(24),
  7: scale(28),
  8: scale(32),
  9: scale(36),
  10: scale(40),
  11: scale(44),
  12: scale(48),
  14: scale(56),
  16: scale(64),
  20: scale(80),
  24: scale(96),
  28: scale(112),
  32: scale(128),
  36: scale(144),
  40: scale(160),
  44: scale(176),
  48: scale(192),
  52: scale(208),
  56: scale(224),
  60: scale(240),
  64: scale(256),
  72: scale(288),
  80: scale(320),
  96: scale(384)
} as const

// Border radius system
export const borderRadius = {
  none: 0,
  sm: scale(2),
  base: scale(4),
  md: scale(6),
  lg: scale(8),
  xl: scale(12),
  '2xl': scale(16),
  '3xl': scale(24),
  full: 9999
} as const

// Shadow system for iOS and Android
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.05,
    shadowRadius: scale(2),
    elevation: 2
  },
  
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 3
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(6),
    elevation: 6
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(10) },
    shadowOpacity: 0.15,
    shadowRadius: scale(15),
    elevation: 15
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(20) },
    shadowOpacity: 0.25,
    shadowRadius: scale(25),
    elevation: 25
  },
  
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(25) },
    shadowOpacity: 0.25,
    shadowRadius: scale(50),
    elevation: 50
  }
} as const

// Animation and transitions
export const transitions = {
  duration: {
    fastest: 150,
    faster: 200,
    fast: 250,
    normal: 300,
    slow: 500,
    slower: 700,
    slowest: 1000
  },
  
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
} as const

// Z-index system
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
} as const

// Opacity system
export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1
} as const