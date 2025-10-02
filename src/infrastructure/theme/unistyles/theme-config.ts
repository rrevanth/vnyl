import { 
  brandColors, 
  semanticColors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  transitions, 
  zIndex, 
  opacity 
} from './theme-tokens'
import { breakpoints } from './breakpoints'

/**
 * VNYL App Theme Configuration
 * Light and dark themes optimized for media streaming
 */

// Light theme - Clean, bright interface for daytime viewing
export const lightTheme = {
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    
    // Media-specific backgrounds
    player: '#000000', // Always black for video player
    overlay: 'rgba(0, 0, 0, 0.6)',
    modal: 'rgba(255, 255, 255, 0.95)',
    blur: 'rgba(255, 255, 255, 0.8)'
  },
  
  // Text colors
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#64748B',
    inverse: '#FFFFFF',
    disabled: '#94A3B8',
    
    // Accent text colors
    brand: brandColors.primary[600],
    success: semanticColors.success[600],
    warning: semanticColors.warning[600],
    error: semanticColors.error[600],
    info: semanticColors.info[600]
  },
  
  // Border colors
  border: {
    primary: '#E2E8F0',
    secondary: '#CBD5E1',
    tertiary: '#F1F5F9',
    accent: brandColors.primary[200],
    success: semanticColors.success[200],
    warning: semanticColors.warning[200],
    error: semanticColors.error[200],
    info: semanticColors.info[200]
  },
  
  // Interactive elements
  interactive: {
    primary: brandColors.primary[500],
    primaryHover: brandColors.primary[600],
    primaryPressed: brandColors.primary[700],
    primaryDisabled: brandColors.primary[300],
    
    secondary: brandColors.accent[600],
    secondaryHover: brandColors.accent[700],
    secondaryPressed: brandColors.accent[800],
    secondaryDisabled: brandColors.accent[400],
    
    // Button variants
    outlined: 'transparent',
    outlinedHover: brandColors.primary[50],
    outlinedPressed: brandColors.primary[100],
    
    ghost: 'transparent',
    ghostHover: brandColors.accent[100],
    ghostPressed: brandColors.accent[200]
  },
  
  // Status colors
  status: {
    success: semanticColors.success[500],
    successBg: semanticColors.success[50],
    warning: semanticColors.warning[500],
    warningBg: semanticColors.warning[50],
    error: semanticColors.error[500],
    errorBg: semanticColors.error[50],
    info: semanticColors.info[500],
    infoBg: semanticColors.info[50]
  },
  
  // Media-specific colors
  media: {
    // Rating colors
    ratingHigh: semanticColors.success[500],
    ratingMedium: semanticColors.warning[500],
    ratingLow: semanticColors.error[500],
    
    // Player controls
    playerControls: 'rgba(255, 255, 255, 0.9)',
    playerProgress: brandColors.primary[500],
    playerProgressBg: 'rgba(255, 255, 255, 0.3)',
    playerBuffered: 'rgba(255, 255, 255, 0.5)',
    
    // Content states
    watchedIndicator: brandColors.primary[500],
    watchlistIndicator: semanticColors.warning[500],
    likedIndicator: semanticColors.success[500],
    
    // Genre colors (same as tokens)
    ...brandColors.media.genre
  },
  
  // Common theme tokens
  colors: brandColors,
  semantic: semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  opacity
} as const

// Dark theme - Optimized for low-light viewing and video consumption
export const darkTheme = {
  // Background colors - Deep blacks and grays for OLED optimization
  background: {
    primary: '#000000', // True black for OLED
    secondary: '#0A0A0A',
    tertiary: '#1A1A1A',
    surface: '#171717',
    elevated: '#262626',
    
    // Media-specific backgrounds
    player: '#000000',
    overlay: 'rgba(0, 0, 0, 0.8)',
    modal: 'rgba(23, 23, 23, 0.95)',
    blur: 'rgba(0, 0, 0, 0.8)'
  },
  
  // Text colors - High contrast for readability
  text: {
    primary: '#FFFFFF',
    secondary: '#E4E4E7',
    tertiary: '#A1A1AA',
    inverse: '#000000',
    disabled: '#52525B',
    
    // Accent text colors - Slightly brighter for dark mode
    brand: brandColors.primary[400],
    success: semanticColors.success[400],
    warning: semanticColors.warning[400],
    error: semanticColors.error[400],
    info: semanticColors.info[400]
  },
  
  // Border colors - Subtle separation in dark mode
  border: {
    primary: '#374151',
    secondary: '#4B5563',
    tertiary: '#374151',
    accent: brandColors.primary[700],
    success: semanticColors.success[700],
    warning: semanticColors.warning[700],
    error: semanticColors.error[700],
    info: semanticColors.info[700]
  },
  
  // Interactive elements - Vibrant colors for dark mode
  interactive: {
    primary: brandColors.primary[500],
    primaryHover: brandColors.primary[400],
    primaryPressed: brandColors.primary[600],
    primaryDisabled: brandColors.primary[800],
    
    secondary: brandColors.accent[400],
    secondaryHover: brandColors.accent[300],
    secondaryPressed: brandColors.accent[500],
    secondaryDisabled: brandColors.accent[700],
    
    // Button variants
    outlined: 'transparent',
    outlinedHover: brandColors.primary[900],
    outlinedPressed: brandColors.primary[800],
    
    ghost: 'transparent',
    ghostHover: brandColors.accent[900],
    ghostPressed: brandColors.accent[800]
  },
  
  // Status colors - Adjusted for dark mode visibility
  status: {
    success: semanticColors.success[400],
    successBg: 'rgba(34, 197, 94, 0.1)',
    warning: semanticColors.warning[400],
    warningBg: 'rgba(245, 158, 11, 0.1)',
    error: semanticColors.error[400],
    errorBg: 'rgba(239, 68, 68, 0.1)',
    info: semanticColors.info[400],
    infoBg: 'rgba(59, 130, 246, 0.1)'
  },
  
  // Media-specific colors
  media: {
    // Rating colors
    ratingHigh: semanticColors.success[400],
    ratingMedium: semanticColors.warning[400],
    ratingLow: semanticColors.error[400],
    
    // Player controls
    playerControls: 'rgba(255, 255, 255, 0.9)',
    playerProgress: brandColors.primary[400],
    playerProgressBg: 'rgba(255, 255, 255, 0.2)',
    playerBuffered: 'rgba(255, 255, 255, 0.4)',
    
    // Content states
    watchedIndicator: brandColors.primary[400],
    watchlistIndicator: semanticColors.warning[400],
    likedIndicator: semanticColors.success[400],
    
    // Genre colors (slightly adjusted for dark mode)
    action: '#EF4444',
    comedy: '#FBBF24',
    drama: '#A855F7',
    horror: '#DC2626',
    scifi: '#0EA5E9',
    romance: '#F472B6',
    documentary: '#10B981',
    thriller: '#6B7280'
  },
  
  // Common theme tokens
  colors: brandColors,
  semantic: semanticColors,
  typography,
  spacing,
  borderRadius,
  shadows: {
    // Adjusted shadows for dark mode
    none: shadows.none,
    sm: {
      ...shadows.sm,
      shadowColor: '#000',
      shadowOpacity: 0.3
    },
    base: {
      ...shadows.base,
      shadowColor: '#000',
      shadowOpacity: 0.4
    },
    md: {
      ...shadows.md,
      shadowColor: '#000',
      shadowOpacity: 0.5
    },
    lg: {
      ...shadows.lg,
      shadowColor: '#000',
      shadowOpacity: 0.6
    },
    xl: {
      ...shadows.xl,
      shadowColor: '#000',
      shadowOpacity: 0.7
    },
    '2xl': {
      ...shadows['2xl'],
      shadowColor: '#000',
      shadowOpacity: 0.8
    }
  },
  transitions,
  zIndex,
  opacity
} as const

// Theme configuration for Unistyles
export const themes = {
  light: lightTheme,
  dark: darkTheme
} as const

// Export breakpoints for Unistyles configuration
export { breakpoints }

// Type exports
export type LightTheme = typeof lightTheme
export type DarkTheme = typeof darkTheme
export type AppThemes = typeof themes
export type ThemeNames = keyof typeof themes