import { scale, moderateScale, verticalScale } from 'react-native-size-matters'
import { Dimensions } from 'react-native'

/**
 * Spacing calculation utilities for VNYL app
 * Responsive spacing system with size-matters integration
 */

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

/**
 * Responsive spacing multipliers based on screen size
 */
const getSpacingMultiplier = (): number => {
  if (screenWidth < 375) return 0.9  // Small phones
  if (screenWidth < 414) return 1.0  // Standard phones
  if (screenWidth < 768) return 1.1  // Large phones
  if (screenWidth < 1024) return 1.2 // Tablets
  return 1.3 // Large tablets/TV
}

/**
 * Base spacing scale (in dp/pt)
 */
export const baseSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96
} as const

/**
 * Get responsive spacing value
 */
export const getSpacing = (size: keyof typeof baseSpacing | number): number => {
  const value = typeof size === 'number' ? size : baseSpacing[size]
  return scale(value * getSpacingMultiplier())
}

/**
 * Get responsive vertical spacing (for height-based measurements)
 */
export const getVerticalSpacing = (size: keyof typeof baseSpacing | number): number => {
  const value = typeof size === 'number' ? size : baseSpacing[size]
  return verticalScale(value * getSpacingMultiplier())
}

/**
 * Get responsive horizontal spacing (for width-based measurements)
 */
export const getHorizontalSpacing = (size: keyof typeof baseSpacing | number): number => {
  const value = typeof size === 'number' ? size : baseSpacing[size]
  return scale(value * getSpacingMultiplier())
}

/**
 * Container padding based on screen size
 */
export const getContainerPadding = (): number => {
  if (screenWidth < 375) return getSpacing('sm')   // 8dp scaled
  if (screenWidth < 768) return getSpacing('md')   // 16dp scaled
  if (screenWidth < 1024) return getSpacing('lg')  // 24dp scaled
  return getSpacing('xl') // 32dp scaled
}

/**
 * Section spacing (between major content sections)
 */
export const getSectionSpacing = (): number => {
  if (screenWidth < 375) return getSpacing('lg')   // 24dp scaled
  if (screenWidth < 768) return getSpacing('xl')   // 32dp scaled
  return getSpacing('2xl') // 48dp scaled
}

/**
 * Card spacing (between cards in grids/lists)
 */
export const getCardSpacing = (): number => {
  if (screenWidth < 375) return getSpacing('xs')   // 4dp scaled
  if (screenWidth < 768) return getSpacing('sm')   // 8dp scaled
  return getSpacing('md') // 16dp scaled
}

/**
 * Grid layout calculations
 */
export interface GridLayout {
  columns: number
  itemWidth: number
  spacing: number
  containerPadding: number
}

export const calculateGridLayout = (
  minItemWidth: number = 150,
  maxColumns: number = 6,
  aspectRatio: number = 2/3
): GridLayout => {
  const containerPadding = getContainerPadding()
  const itemSpacing = getCardSpacing()
  const availableWidth = screenWidth - (containerPadding * 2)
  
  // Calculate optimal number of columns
  let columns = Math.floor(availableWidth / minItemWidth)
  columns = Math.min(columns, maxColumns)
  columns = Math.max(columns, 1) // Minimum 1 column
  
  // Responsive column limits
  if (screenWidth < 375) columns = Math.min(columns, 2)
  else if (screenWidth < 768) columns = Math.min(columns, 3)
  else if (screenWidth < 1024) columns = Math.min(columns, 4)
  
  // Calculate item width
  const totalSpacing = itemSpacing * (columns - 1)
  const itemWidth = (availableWidth - totalSpacing) / columns
  
  return {
    columns,
    itemWidth,
    spacing: itemSpacing,
    containerPadding
  }
}

/**
 * Poster card dimensions for media grids
 */
export const getPosterCardDimensions = (columns?: number): { width: number; height: number } => {
  const layout = calculateGridLayout(120, 6, 2/3)
  const actualColumns = columns || layout.columns
  
  const containerPadding = getContainerPadding()
  const itemSpacing = getCardSpacing()
  const availableWidth = screenWidth - (containerPadding * 2)
  const totalSpacing = itemSpacing * (actualColumns - 1)
  const width = (availableWidth - totalSpacing) / actualColumns
  const height = width * 1.5 // 2:3 aspect ratio
  
  return { width, height }
}

/**
 * Backdrop card dimensions (16:9 aspect ratio)
 */
export const getBackdropCardDimensions = (columns?: number): { width: number; height: number } => {
  const layout = calculateGridLayout(200, 4, 16/9)
  const actualColumns = columns || layout.columns
  
  const containerPadding = getContainerPadding()
  const itemSpacing = getCardSpacing()
  const availableWidth = screenWidth - (containerPadding * 2)
  const totalSpacing = itemSpacing * (actualColumns - 1)
  const width = (availableWidth - totalSpacing) / actualColumns
  const height = width * (9/16) // 16:9 aspect ratio
  
  return { width, height }
}

/**
 * Modal and overlay spacing
 */
export const getModalSpacing = () => {
  const basePadding = getSpacing('md')
  const baseMargin = getSpacing('lg')
  
  return {
    padding: basePadding,
    margin: baseMargin,
    borderRadius: getSpacing('sm'),
    
    // Modal size constraints
    maxWidth: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    minWidth: Math.min(300, screenWidth * 0.8),
    minHeight: 200
  }
}

/**
 * Navigation spacing (tabs, headers, etc.)
 */
export const getNavigationSpacing = () => {
  const isCompact = screenWidth < 375
  
  return {
    // Tab bar
    tabBarHeight: isCompact ? 64 : 72,
    tabBarPadding: getSpacing('sm'),
    tabItemPadding: getSpacing('xs'),
    
    // Header
    headerHeight: isCompact ? 56 : 64,
    headerPadding: getSpacing('md'),
    headerTitlePadding: getSpacing('sm'),
    
    // Search bar
    searchBarHeight: 44,
    searchBarPadding: getSpacing('sm'),
    
    // Safe area adjustments
    safeAreaTop: 0, // Will be handled by react-native-safe-area-context
    safeAreaBottom: 0
  }
}

/**
 * Input and form spacing
 */
export const getFormSpacing = () => {
  return {
    // Input fields
    inputPadding: getSpacing('md'),
    inputMargin: getSpacing('sm'),
    inputBorderRadius: getSpacing('xs'),
    
    // Form sections
    sectionSpacing: getSpacing('xl'),
    fieldSpacing: getSpacing('md'),
    labelSpacing: getSpacing('xs'),
    
    // Buttons
    buttonPadding: getSpacing('md'),
    buttonMargin: getSpacing('sm'),
    buttonSpacing: getSpacing('sm')
  }
}

/**
 * List and content spacing
 */
export const getContentSpacing = () => {
  return {
    // Lists
    listItemPadding: getSpacing('md'),
    listItemSpacing: getSpacing('xs'),
    listSectionSpacing: getSpacing('lg'),
    
    // Content sections
    paragraphSpacing: getSpacing('md'),
    headingSpacing: getSpacing('lg'),
    captionSpacing: getSpacing('xs'),
    
    // Media content
    posterSpacing: getCardSpacing(),
    backdropSpacing: getSpacing('sm'),
    mediaInfoSpacing: getSpacing('md')
  }
}

/**
 * Animation and transition spacing
 */
export const getAnimationSpacing = () => {
  return {
    // Slide distances
    slideDistance: getSpacing('xl'),
    slideDistanceSmall: getSpacing('md'),
    
    // Fade and scale origins
    scaleOrigin: { x: 0.5, y: 0.5 },
    
    // Parallax offsets
    parallaxOffset: getSpacing('lg'),
    
    // Gesture thresholds
    swipeThreshold: getSpacing('xl'),
    tapThreshold: getSpacing('xs')
  }
}

/**
 * Utility functions for common spacing patterns
 */
export const spacingUtils = {
  /**
   * Create padding object for React Native styles
   */
  createPadding: (
    all?: number,
    vertical?: number,
    horizontal?: number,
    top?: number,
    right?: number,
    bottom?: number,
    left?: number
  ) => {
    if (all !== undefined) {
      return { padding: getSpacing(all) }
    }
    
    const padding: any = {}
    
    if (vertical !== undefined) {
      padding.paddingVertical = getVerticalSpacing(vertical)
    }
    if (horizontal !== undefined) {
      padding.paddingHorizontal = getHorizontalSpacing(horizontal)
    }
    if (top !== undefined) {
      padding.paddingTop = getVerticalSpacing(top)
    }
    if (right !== undefined) {
      padding.paddingRight = getHorizontalSpacing(right)
    }
    if (bottom !== undefined) {
      padding.paddingBottom = getVerticalSpacing(bottom)
    }
    if (left !== undefined) {
      padding.paddingLeft = getHorizontalSpacing(left)
    }
    
    return padding
  },
  
  /**
   * Create margin object for React Native styles
   */
  createMargin: (
    all?: number,
    vertical?: number,
    horizontal?: number,
    top?: number,
    right?: number,
    bottom?: number,
    left?: number
  ) => {
    if (all !== undefined) {
      return { margin: getSpacing(all) }
    }
    
    const margin: any = {}
    
    if (vertical !== undefined) {
      margin.marginVertical = getVerticalSpacing(vertical)
    }
    if (horizontal !== undefined) {
      margin.marginHorizontal = getHorizontalSpacing(horizontal)
    }
    if (top !== undefined) {
      margin.marginTop = getVerticalSpacing(top)
    }
    if (right !== undefined) {
      margin.marginRight = getHorizontalSpacing(right)
    }
    if (bottom !== undefined) {
      margin.marginBottom = getVerticalSpacing(bottom)
    }
    if (left !== undefined) {
      margin.marginLeft = getHorizontalSpacing(left)
    }
    
    return margin
  },
  
  /**
   * Get consistent border radius
   */
  getBorderRadius: (size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'): number => {
    const radii = {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999
    }
    
    return size === 'full' ? radii.full : scale(radii[size])
  }
}

/**
 * Device-specific spacing adjustments
 */
export const deviceSpacing = {
  // iPhone specific adjustments
  isSmallPhone: screenWidth < 375,
  isLargePhone: screenWidth >= 414,
  isTablet: screenWidth >= 768,
  isLargeTablet: screenWidth >= 1024,
  
  // Safe area considerations
  hasNotch: screenHeight >= 812 && screenWidth >= 375,
  isCompactHeight: screenHeight < 700,
  
  // Orientation
  isLandscape: screenWidth > screenHeight,
  isPortrait: screenHeight > screenWidth
}

export type SpacingSize = keyof typeof baseSpacing
export type GridLayoutResult = GridLayout