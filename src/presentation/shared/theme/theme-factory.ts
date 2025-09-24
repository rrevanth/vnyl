import { StyleSheet } from 'react-native'
import { scale, moderateScale } from 'react-native-size-matters'

export interface ThemeColors {
  background: {
    primary: string
    secondary: string
    tertiary: string
  }
  text: {
    primary: string
    secondary: string
    inverse: string
  }
  border: {
    primary: string
    secondary: string
  }
  interactive: {
    primary: string
    secondary: string
    disabled: string
    danger: string
    success: string
  }
  switch: {
    trackTrue: string
    trackFalse: string
    thumbActive: string
    thumbInactive: string
  }
  input: {
    background: string
    placeholder: string
    error: string
  }
}

export interface ThemeSpacing {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'

export interface ThemeTypography {
  heading1: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    letterSpacing?: number
  }
  heading2: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
    letterSpacing?: number
  }
  heading3: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
  }
  body: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
  }
  bodyBold: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
  }
  caption: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
  }
  small: {
    fontSize: number
    lineHeight: number
    fontWeight: FontWeight
  }
}

export interface Theme {
  colors: ThemeColors
  spacing: ThemeSpacing
  typography: ThemeTypography
  borderRadius: {
    sm: number
    md: number
    lg: number
    full: number
  }
  shadows: {
    sm: object
    md: object
    lg: object
  }
  hitSlop: {
    sm: { top: number; bottom: number; left: number; right: number }
    md: { top: number; bottom: number; left: number; right: number }
    lg: { top: number; bottom: number; left: number; right: number }
  }
}

const lightTheme: Theme = {
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#E9ECEF'
    },
    text: {
      primary: '#212529',
      secondary: '#6C757D',
      inverse: '#FFFFFF'
    },
    border: {
      primary: '#DEE2E6',
      secondary: '#E9ECEF'
    },
    interactive: {
      primary: '#007AFF',
      secondary: '#5856D6',
      disabled: '#ADB5BD',
      danger: '#FF3B30',
      success: '#34C759'
    },
    switch: {
      trackTrue: '#007AFF',
      trackFalse: '#E9ECEF',
      thumbActive: '#FFFFFF',
      thumbInactive: '#6C757D'
    },
    input: {
      background: '#F8F9FA',
      placeholder: '#6C757D',
      error: '#FF3B30'
    }
  },
  spacing: {
    xs: scale(4),
    sm: scale(8),
    md: scale(16),
    lg: scale(24),
    xl: scale(32),
    xxl: scale(48)
  },
  typography: {
    heading1: {
      fontSize: moderateScale(32),
      lineHeight: moderateScale(40),
      fontWeight: '700',
      letterSpacing: 1
    },
    heading2: {
      fontSize: moderateScale(24),
      lineHeight: moderateScale(32),
      fontWeight: '600'
    },
    heading3: {
      fontSize: moderateScale(18),
      lineHeight: moderateScale(24),
      fontWeight: '600'
    },
    body: {
      fontSize: moderateScale(16),
      lineHeight: moderateScale(24),
      fontWeight: '400'
    },
    bodyBold: {
      fontSize: moderateScale(16),
      lineHeight: moderateScale(24),
      fontWeight: '500'
    },
    caption: {
      fontSize: moderateScale(14),
      lineHeight: moderateScale(18),
      fontWeight: '400'
    },
    small: {
      fontSize: moderateScale(12),
      lineHeight: moderateScale(16),
      fontWeight: '400'
    }
  },
  borderRadius: {
    sm: scale(4),
    md: scale(12),
    lg: scale(16),
    full: scale(9999)
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8
    }
  },
  hitSlop: {
    sm: { top: 8, bottom: 8, left: 8, right: 8 },
    md: { top: 12, bottom: 12, left: 12, right: 12 },
    lg: { top: 16, bottom: 16, left: 16, right: 16 }
  }
}

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    background: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8E8E93',
      inverse: '#000000'
    },
    border: {
      primary: '#38383A',
      secondary: '#48484A'
    },
    interactive: {
      primary: '#007AFF',
      secondary: '#5856D6',
      disabled: '#48484A',
      danger: '#FF453A',
      success: '#30D158'
    },
    switch: {
      trackTrue: '#007AFF',
      trackFalse: '#38383A',
      thumbActive: '#FFFFFF',
      thumbInactive: '#8E8E93'
    },
    input: {
      background: '#1C1C1E',
      placeholder: '#8E8E93',
      error: '#FF453A'
    }
  }
}

export const createTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme
}

export const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary
  },
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.sm
  },
  primaryButton: {
    backgroundColor: theme.colors.interactive.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.bodyBold.fontWeight
  },
  heading1: {
    fontSize: theme.typography.heading1.fontSize,
    lineHeight: theme.typography.heading1.lineHeight,
    fontWeight: theme.typography.heading1.fontWeight,
    color: theme.colors.text.primary,
    letterSpacing: theme.typography.heading1.letterSpacing
  },
  bodyText: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.text.primary
  }
})