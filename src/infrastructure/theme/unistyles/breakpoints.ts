import { Dimensions } from 'react-native'

/**
 * Responsive breakpoints for VNYL app
 * Optimized for mobile-first design with tablet and TV support
 */

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Breakpoint definitions based on common device sizes
export const breakpoints = {
  // Mobile devices (default)
  xs: 0,
  
  // Large mobile devices / small tablets (iPhone Pro Max, small tablets)
  sm: 414,
  
  // Tablets in portrait mode (iPad Mini, iPad)
  md: 768,
  
  // Tablets in landscape mode (iPad Pro, large tablets)
  lg: 1024,
  
  // Desktop / TV interfaces (Apple TV, large displays)
  xl: 1280,
  
  // Large displays / Apple TV 4K
  '2xl': 1920
} as const

// Helper functions for responsive design
export const deviceInfo = {
  width: screenWidth,
  height: screenHeight,
  
  // Device type detection
  isSmallDevice: screenWidth < breakpoints.sm,
  isMediumDevice: screenWidth >= breakpoints.sm && screenWidth < breakpoints.md,
  isTablet: screenWidth >= breakpoints.md && screenWidth < breakpoints.lg,
  isLargeTablet: screenWidth >= breakpoints.lg && screenWidth < breakpoints.xl,
  isTV: screenWidth >= breakpoints.xl,
  
  // Orientation detection
  isPortrait: screenHeight > screenWidth,
  isLandscape: screenWidth > screenHeight,
  
  // Aspect ratio
  aspectRatio: screenWidth / screenHeight,
  
  // Safe area considerations for different screen types
  hasNotch: screenHeight >= 812 && screenWidth >= 375, // iPhone X and newer
  isCompactHeight: screenHeight < 700,
  
  // Media consumption optimized breakpoints
  isOptimalForVideo: screenWidth >= breakpoints.md, // Tablets and up for video
  isCompactForMedia: screenWidth < breakpoints.sm, // Compact mobile for media cards
  
  // Content density levels
  shouldUseCompactLayout: screenWidth < breakpoints.sm,
  shouldUseRegularLayout: screenWidth >= breakpoints.sm && screenWidth < breakpoints.lg,
  shouldUseExpandedLayout: screenWidth >= breakpoints.lg
} as const

// Responsive utilities for styling
export const responsiveUtils = {
  // Get appropriate spacing for screen size
  getSpacing: (base: number) => {
    if (deviceInfo.isSmallDevice) return base * 0.8
    if (deviceInfo.isTablet) return base * 1.2
    if (deviceInfo.isTV) return base * 1.5
    return base
  },
  
  // Get appropriate font size for screen size
  getFontSize: (base: number) => {
    if (deviceInfo.isSmallDevice) return base * 0.9
    if (deviceInfo.isTablet) return base * 1.1
    if (deviceInfo.isTV) return base * 1.3
    return base
  },
  
  // Get appropriate border radius for screen size
  getBorderRadius: (base: number) => {
    if (deviceInfo.isSmallDevice) return base * 0.8
    if (deviceInfo.isTablet) return base * 1.2
    if (deviceInfo.isTV) return base * 1.5
    return base
  },
  
  // Get grid columns based on screen size
  getGridColumns: () => {
    if (deviceInfo.isSmallDevice) return 2
    if (deviceInfo.isMediumDevice) return 3
    if (deviceInfo.isTablet) return 4
    if (deviceInfo.isLargeTablet) return 5
    return 6 // TV/Desktop
  },
  
  // Get poster card size for media grids
  getPosterCardSize: () => {
    const baseWidth = deviceInfo.width - 40 // Account for padding
    const columns = responsiveUtils.getGridColumns()
    const spacing = 12 * (columns - 1) // Space between cards
    return (baseWidth - spacing) / columns
  },
  
  // Get appropriate modal width
  getModalWidth: () => {
    if (deviceInfo.isSmallDevice) return deviceInfo.width * 0.95
    if (deviceInfo.isTablet) return Math.min(deviceInfo.width * 0.8, 600)
    return Math.min(deviceInfo.width * 0.7, 800)
  },
  
  // Get sidebar width for tablet/desktop layouts
  getSidebarWidth: () => {
    if (deviceInfo.width < breakpoints.lg) return 0 // No sidebar on mobile
    if (deviceInfo.isLargeTablet) return 300
    return 350 // TV/Desktop
  }
} as const

// Media queries helper (for use with Unistyles)
export const mediaQueries = {
  // Target specific device types
  mobile: `@media (max-width: ${breakpoints.sm - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.xl}px)`,
  
  // Target orientation
  portrait: `@media (orientation: portrait)`,
  landscape: `@media (orientation: landscape)`,
  
  // Target specific ranges
  smallAndBelow: `@media (max-width: ${breakpoints.md - 1}px)`,
  mediumAndAbove: `@media (min-width: ${breakpoints.md}px)`,
  largeAndAbove: `@media (min-width: ${breakpoints.lg}px)`,
  
  // High DPI displays
  retina: `@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)`,
  
  // Apple TV specific
  tv: `@media (min-width: ${breakpoints.xl}px) and (min-height: 720px)`
} as const

// Layout constants for consistent spacing
const safeMarginHorizontal = deviceInfo.isSmallDevice ? 16 : deviceInfo.isTablet ? 24 : 32
const safeMarginVertical = deviceInfo.isSmallDevice ? 12 : deviceInfo.isTablet ? 16 : 20
const headerHeight = deviceInfo.hasNotch ? 88 : 64
const tabBarHeight = deviceInfo.hasNotch ? 83 : 64

export const layoutConstants = {
  // Container widths
  containerMaxWidth: {
    sm: breakpoints.sm,
    md: breakpoints.md,
    lg: breakpoints.lg,
    xl: breakpoints.xl,
    '2xl': breakpoints['2xl']
  },
  
  // Common component sizes
  headerHeight,
  tabBarHeight,
  searchBarHeight: 44,
  cardMinHeight: 120,
  posterAspectRatio: 2 / 3, // Standard movie poster ratio
  backdropAspectRatio: 16 / 9, // Standard backdrop ratio
  
  // Safe margins for different screen types
  safeMargin: {
    horizontal: safeMarginHorizontal,
    vertical: safeMarginVertical
  },
  
  // Content area calculations
  contentWidth: deviceInfo.width - (2 * safeMarginHorizontal),
  availableHeight: deviceInfo.height - (headerHeight + tabBarHeight)
} as const

export type Breakpoint = keyof typeof breakpoints
export type DeviceInfo = typeof deviceInfo
export type ResponsiveUtils = typeof responsiveUtils