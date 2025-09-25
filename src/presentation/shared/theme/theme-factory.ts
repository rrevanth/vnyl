import { scale, moderateScale } from 'react-native-size-matters'
import type { Theme, ThemeMode, ThemeColors, ThemeSpacing, ThemeTypography, ThemeRadius, ThemeShadows, ThemeTransition } from './types'
import type { DisplaySettings, FontSize, ThemePreference } from '@/src/domain/entities'
import { getFontFamilyName } from './font-utils'

// Custom color tokens for VNYL app
const createColors = (mode: ThemeMode, accentColor = '#007AFF'): ThemeColors => {
  const isLight = mode === 'light'

  // Generate pressed state for accent color (20% darker)
  const accentPressed = adjustColorBrightness(accentColor, -20)

  return {
    background: {
      primary: isLight ? '#FFFFFF' : '#000000',
      secondary: isLight ? '#F8F9FA' : '#111111',
      tertiary: isLight ? '#E9ECEF' : '#1C1C1E',
      elevated: isLight ? '#FFFFFF' : '#1C1C1E',
      inverse: isLight ? '#000000' : '#FFFFFF'
    },
    text: {
      primary: isLight ? '#1D1D1F' : '#F5F5F7',
      secondary: isLight ? '#6E6E73' : '#A1A1A6',
      tertiary: isLight ? '#8E8E93' : '#636366',
      inverse: isLight ? '#FFFFFF' : '#1D1D1F',
      disabled: isLight ? '#C7C7CC' : '#48484A'
    },
    border: {
      primary: isLight ? '#D2D2D7' : '#38383A',
      secondary: isLight ? '#E5E5EA' : '#48484A',
      focus: accentColor,
      error: '#FF453A'
    },
    interactive: {
      primary: accentColor,
      primaryPressed: accentPressed,
      secondary: '#5856D6',
      secondaryPressed: '#4B4ACF',
      tertiary: isLight ? '#F2F2F7' : '#2C2C2E',
      disabled: isLight ? '#C7C7CC' : '#48484A'
    },
    status: {
      success: '#34C759',
      warning: '#FF9F0A',
      error: '#FF453A',
      info: accentColor
    },
    overlay: {
      backdrop: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)',
      surface: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(28, 28, 30, 0.95)'
    }
  }
}

// Helper function to adjust color brightness
const adjustColorBrightness = (color: string, percent: number): string => {
  // Remove # if present
  const hex = color.replace('#', '')

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Adjust brightness
  const adjustedR = Math.max(0, Math.min(255, r + (r * percent) / 100))
  const adjustedG = Math.max(0, Math.min(255, g + (g * percent) / 100))
  const adjustedB = Math.max(0, Math.min(255, b + (b * percent) / 100))

  // Convert back to hex
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${toHex(adjustedR)}${toHex(adjustedG)}${toHex(adjustedB)}`
}

// Font size multipliers based on user preference
const getFontSizeMultiplier = (fontSize: FontSize): number => {
  switch (fontSize) {
    case 'xs': return 0.8
    case 'sm': return 0.9
    case 'md': return 1.0
    case 'lg': return 1.1
    case 'xl': return 1.2
    case 'xxl': return 1.3
    default: return 1.0
  }
}

// Create typography with display settings
const createTypography = (displaySettings?: DisplaySettings): ThemeTypography => {
  const fontMultiplier = displaySettings ? getFontSizeMultiplier(displaySettings.fontSize) : 1.0
  const baseLineHeight = displaySettings?.lineHeight || 1.3
  const fontFamily = getFontFamilyName(displaySettings?.fontFamily)

  return {
    display: {
      fontSize: moderateScale(34 * fontMultiplier),
      lineHeight: moderateScale(34 * fontMultiplier * baseLineHeight),
      fontWeight: '700' as const,
      fontFamily
    },
    heading1: {
      fontSize: moderateScale(28 * fontMultiplier),
      lineHeight: moderateScale(28 * fontMultiplier * baseLineHeight),
      fontWeight: '600' as const,
      fontFamily
    },
    heading2: {
      fontSize: moderateScale(24 * fontMultiplier),
      lineHeight: moderateScale(24 * fontMultiplier * baseLineHeight),
      fontWeight: '600' as const,
      fontFamily
    },
    heading3: {
      fontSize: moderateScale(20 * fontMultiplier),
      lineHeight: moderateScale(20 * fontMultiplier * baseLineHeight),
      fontWeight: '600' as const,
      fontFamily
    },
    body: {
      fontSize: moderateScale(17 * fontMultiplier),
      lineHeight: moderateScale(17 * fontMultiplier * baseLineHeight),
      fontWeight: '400' as const,
      fontFamily
    },
    bodySmall: {
      fontSize: moderateScale(15 * fontMultiplier),
      lineHeight: moderateScale(15 * fontMultiplier * baseLineHeight),
      fontWeight: '400' as const,
      fontFamily
    },
    caption: {
      fontSize: moderateScale(13 * fontMultiplier),
      lineHeight: moderateScale(13 * fontMultiplier * baseLineHeight),
      fontWeight: '400' as const,
      fontFamily
    },
    button: {
      fontSize: moderateScale(17 * fontMultiplier),
      lineHeight: moderateScale(17 * fontMultiplier * baseLineHeight),
      fontWeight: '600' as const,
      fontFamily
    }
  }
}

// Create spacing with display settings
const createSpacing = (displaySettings?: DisplaySettings): ThemeSpacing => {
  const compactMultiplier = displaySettings?.compactMode ? 0.8 : 1.0

  return {
    xs: scale(4 * compactMultiplier),
    sm: scale(8 * compactMultiplier),
    md: scale(16 * compactMultiplier),
    lg: scale(24 * compactMultiplier),
    xl: scale(32 * compactMultiplier),
    xxl: scale(48 * compactMultiplier),
    xxxl: scale(64 * compactMultiplier)
  }
}

const radius: ThemeRadius = {
  none: 0,
  xs: scale(2),
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  xl: scale(16),
  full: scale(9999)
}

const shadows: ThemeShadows = {
  none: {},
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  }
}

const transition: ThemeTransition = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
}

export const createTheme = (
  mode: ThemeMode,
  displaySettings?: DisplaySettings,
  themePreference?: ThemePreference
): Theme => ({
  mode,
  colors: createColors(mode, themePreference?.accentColor),
  spacing: createSpacing(displaySettings),
  typography: createTypography(displaySettings),
  radius,
  shadows,
  transition
})

// Backwards compatibility - keep the original function for simple theme creation
export const createSimpleTheme = (mode: ThemeMode): Theme => createTheme(mode)

// Pre-defined themes
export const lightTheme = createTheme('light')
export const darkTheme = createTheme('dark')