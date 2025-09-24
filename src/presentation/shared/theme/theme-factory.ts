import { scale, moderateScale } from 'react-native-size-matters'
import type { Theme, ThemeMode, ThemeColors, ThemeSpacing, ThemeTypography, ThemeRadius, ThemeShadows, ThemeTransition } from './types'

// Custom color tokens for VNYL app
const createColors = (mode: ThemeMode): ThemeColors => {
  const isLight = mode === 'light'

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
      focus: '#007AFF',
      error: '#FF453A'
    },
    interactive: {
      primary: '#007AFF',
      primaryPressed: '#0056CC',
      secondary: '#5856D6',
      secondaryPressed: '#4B4ACF',
      tertiary: isLight ? '#F2F2F7' : '#2C2C2E',
      disabled: isLight ? '#C7C7CC' : '#48484A'
    },
    status: {
      success: '#34C759',
      warning: '#FF9F0A',
      error: '#FF453A',
      info: '#007AFF'
    },
    overlay: {
      backdrop: isLight ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)',
      surface: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(28, 28, 30, 0.95)'
    }
  }
}

const spacing: ThemeSpacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  xxxl: scale(64)
}

const typography: ThemeTypography = {
  display: {
    fontSize: moderateScale(34),
    lineHeight: moderateScale(41),
    fontWeight: '700' as const
  },
  heading1: {
    fontSize: moderateScale(28),
    lineHeight: moderateScale(34),
    fontWeight: '600' as const
  },
  heading2: {
    fontSize: moderateScale(24),
    lineHeight: moderateScale(30),
    fontWeight: '600' as const
  },
  heading3: {
    fontSize: moderateScale(20),
    lineHeight: moderateScale(25),
    fontWeight: '600' as const
  },
  body: {
    fontSize: moderateScale(17),
    lineHeight: moderateScale(22),
    fontWeight: '400' as const
  },
  bodySmall: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(20),
    fontWeight: '400' as const
  },
  caption: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    fontWeight: '400' as const
  },
  button: {
    fontSize: moderateScale(17),
    lineHeight: moderateScale(22),
    fontWeight: '600' as const
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

export const createTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors: createColors(mode),
  spacing,
  typography,
  radius,
  shadows,
  transition
})

// Pre-defined themes
export const lightTheme = createTheme('light')
export const darkTheme = createTheme('dark')