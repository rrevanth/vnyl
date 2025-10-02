/**
 * Theme configuration with size-matters scaling integration
 * Provides light and dark theme definitions with responsive scaling
 */

import { scale, moderateScale } from 'react-native-size-matters'
import {
  Theme,
  ThemeMode,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeRadius,
  ThemeShadows,
  ThemeTransition,
  ThemeCustomization,
} from '@/src/domain/services/theme.service.interface'

/**
 * Base spacing scale using size-matters for responsive design
 */
const createSpacing = (): ThemeSpacing => ({
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
})

/**
 * Typography scale with responsive font sizing
 */
const createTypography = (fontScale = 1): ThemeTypography => ({
  heading1: {
    fontSize: moderateScale(28 * fontScale),
    lineHeight: moderateScale(36 * fontScale),
    fontWeight: '700',
    letterSpacing: -0.02,
  },
  heading2: {
    fontSize: moderateScale(24 * fontScale),
    lineHeight: moderateScale(32 * fontScale),
    fontWeight: '600',
    letterSpacing: -0.01,
  },
  heading3: {
    fontSize: moderateScale(20 * fontScale),
    lineHeight: moderateScale(28 * fontScale),
    fontWeight: '600',
    letterSpacing: 0,
  },
  body: {
    fontSize: moderateScale(16 * fontScale),
    lineHeight: moderateScale(24 * fontScale),
    fontWeight: '400',
    letterSpacing: 0,
  },
  caption: {
    fontSize: moderateScale(12 * fontScale),
    lineHeight: moderateScale(16 * fontScale),
    fontWeight: '400',
    letterSpacing: 0.01,
  },
  overline: {
    fontSize: moderateScale(10 * fontScale),
    lineHeight: moderateScale(14 * fontScale),
    fontWeight: '500',
    letterSpacing: 0.05,
  },
})

/**
 * Border radius values with responsive scaling
 */
const createRadius = (): ThemeRadius => ({
  sm: scale(4),
  md: scale(8),
  lg: scale(12),
  full: scale(9999),
})

/**
 * Shadow definitions for iOS and Android
 */
const createShadows = (): ThemeShadows => ({
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: scale(1) },
    shadowOpacity: 0.05,
    shadowRadius: scale(2),
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(8),
    elevation: 8,
  },
})

/**
 * Animation transition values
 */
const createTransition = (): ThemeTransition => ({
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
})

/**
 * Light theme colors
 */
const lightColors: ThemeColors = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#E9ECEF',
  },
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    tertiary: '#ADB5BD',
    inverse: '#FFFFFF',
  },
  border: {
    primary: '#DEE2E6',
    secondary: '#E9ECEF',
  },
  interactive: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    disabled: '#ADB5BD',
  },
  surface: {
    card: '#FFFFFF',
    modal: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
}

/**
 * Dark theme colors
 */
const darkColors: ThemeColors = {
  background: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    tertiary: '#636366',
    inverse: '#000000',
  },
  border: {
    primary: '#38383A',
    secondary: '#48484A',
  },
  interactive: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    disabled: '#48484A',
  },
  surface: {
    card: '#1C1C1E',
    modal: '#2C2C2E',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
}

/**
 * High contrast colors for accessibility
 */
const highContrastLightColors: ThemeColors = {
  ...lightColors,
  text: {
    primary: '#000000',
    secondary: '#333333',
    tertiary: '#666666',
    inverse: '#FFFFFF',
  },
  border: {
    primary: '#000000',
    secondary: '#333333',
  },
  interactive: {
    primary: '#0051D0',
    secondary: '#4B3FD1',
    success: '#248A3D',
    warning: '#B25000',
    error: '#D70015',
    disabled: '#666666',
  },
}

const highContrastDarkColors: ThemeColors = {
  ...darkColors,
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    tertiary: '#999999',
    inverse: '#000000',
  },
  border: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
  },
  interactive: {
    primary: '#409CFF',
    secondary: '#7D74FF',
    success: '#64D2FF',
    warning: '#FFC532',
    error: '#FF6961',
    disabled: '#999999',
  },
}

/**
 * Create a complete theme
 */
export const createTheme = (
  mode: ThemeMode,
  customization?: ThemeCustomization
): Theme => {
  let colors: ThemeColors

  // Select base colors
  if (customization?.highContrast) {
    colors = mode === 'dark' ? highContrastDarkColors : highContrastLightColors
  } else {
    colors = mode === 'dark' ? darkColors : lightColors
  }

  // Apply color customization
  if (customization?.primaryColor) {
    colors = {
      ...colors,
      interactive: {
        ...colors.interactive,
        primary: customization.primaryColor,
      },
    }
  }

  if (customization?.accentColor) {
    colors = {
      ...colors,
      interactive: {
        ...colors.interactive,
        secondary: customization.accentColor,
      },
    }
  }

  const fontScale = customization?.fontScale ?? 1
  const spacing = createSpacing()
  const typography = createTypography(fontScale)
  const radius = createRadius()
  const shadows = createShadows()
  const transition = createTransition()

  // Apply compact mode spacing adjustment
  if (customization?.compactMode) {
    Object.keys(spacing).forEach(key => {
      ;(spacing as any)[key] = Math.round((spacing as any)[key] * 0.8)
    })
  }

  return {
    mode,
    colors,
    spacing,
    typography,
    radius,
    shadows,
    transition,
  }
}

/**
 * Default light theme
 */
export const lightTheme = createTheme('light')

/**
 * Default dark theme
 */
export const darkTheme = createTheme('dark')

/**
 * Color utility functions
 */
export const colorUtils = {
  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  },

  /**
   * Convert RGB to hex
   */
  rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  },

  /**
   * Lighten a color by a percentage
   */
  lighten(color: string, amount: number): string {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color

    const factor = 1 + amount
    return this.rgbToHex(
      Math.min(255, Math.round(rgb.r * factor)),
      Math.min(255, Math.round(rgb.g * factor)),
      Math.min(255, Math.round(rgb.b * factor))
    )
  },

  /**
   * Darken a color by a percentage
   */
  darken(color: string, amount: number): string {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color

    const factor = 1 - amount
    return this.rgbToHex(
      Math.max(0, Math.round(rgb.r * factor)),
      Math.max(0, Math.round(rgb.g * factor)),
      Math.max(0, Math.round(rgb.b * factor))
    )
  },

  /**
   * Adjust color opacity
   */
  withOpacity(color: string, opacity: number): string {
    const rgb = this.hexToRgb(color)
    if (!rgb) return color

    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
  },

  /**
   * Check if a color is light
   */
  isLight(color: string): boolean {
    const rgb = this.hexToRgb(color)
    if (!rgb) return true

    // Using relative luminance formula
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    return luminance > 0.5
  },

  /**
   * Get contrasting color (black or white)
   */
  getContrastingColor(backgroundColor: string): string {
    return this.isLight(backgroundColor) ? '#000000' : '#FFFFFF'
  },

  /**
   * Generate complementary colors
   */
  generateComplementaryColors(baseColor: string): {
    primary: string
    secondary: string
    tertiary: string
  } {
    return {
      primary: baseColor,
      secondary: this.lighten(baseColor, 0.2),
      tertiary: this.darken(baseColor, 0.2),
    }
  },
}

/**
 * Responsive breakpoints for different device sizes
 */
export const breakpoints = {
  small: 320,
  medium: 768,
  large: 1024,
  extraLarge: 1440,
}

/**
 * Device type detection for responsive design
 */
export const getDeviceType = (width: number): 'phone' | 'tablet' | 'desktop' => {
  if (width < breakpoints.medium) return 'phone'
  if (width < breakpoints.large) return 'tablet'
  return 'desktop'
}

/**
 * Get responsive value based on device width
 */
export const getResponsiveValue = <T>(
  values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T },
  deviceWidth: number
): T | undefined => {
  if (deviceWidth >= breakpoints.extraLarge && values.xl !== undefined) return values.xl
  if (deviceWidth >= breakpoints.large && values.lg !== undefined) return values.lg
  if (deviceWidth >= breakpoints.medium && values.md !== undefined) return values.md
  if (deviceWidth >= breakpoints.small && values.sm !== undefined) return values.sm
  return values.xs
}

/**
 * Default theme customization
 */
export const defaultCustomization: ThemeCustomization = {
  fontScale: 1,
  compactMode: false,
  highContrast: false,
  reducedMotion: false,
}