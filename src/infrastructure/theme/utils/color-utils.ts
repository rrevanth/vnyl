/**
 * Color manipulation utilities for VNYL app
 * Helper functions for working with colors and themes
 */

/**
 * Convert hex color to RGB values
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

/**
 * Convert RGB values to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Convert hex color to RGBA string
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

/**
 * Lighten a hex color by a percentage
 */
export const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const factor = 1 + percent / 100
  const newR = Math.min(255, Math.round(rgb.r * factor))
  const newG = Math.min(255, Math.round(rgb.g * factor))
  const newB = Math.min(255, Math.round(rgb.b * factor))
  
  return rgbToHex(newR, newG, newB)
}

/**
 * Darken a hex color by a percentage
 */
export const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const factor = 1 - percent / 100
  const newR = Math.max(0, Math.round(rgb.r * factor))
  const newG = Math.max(0, Math.round(rgb.g * factor))
  const newB = Math.max(0, Math.round(rgb.b * factor))
  
  return rgbToHex(newR, newG, newB)
}

/**
 * Calculate the contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex)
    if (!rgb) return 0
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Check if a color combination meets WCAG accessibility standards
 */
export const isAccessible = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(foreground, background)
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7
}

/**
 * Generate a color palette from a base color
 */
export const generateColorPalette = (baseColor: string): Record<number, string> => {
  const palette: Record<number, string> = {}
  
  // Generate lighter shades (50-400)
  palette[50] = lightenColor(baseColor, 95)
  palette[100] = lightenColor(baseColor, 80)
  palette[200] = lightenColor(baseColor, 60)
  palette[300] = lightenColor(baseColor, 40)
  palette[400] = lightenColor(baseColor, 20)
  
  // Base color (500)
  palette[500] = baseColor
  
  // Generate darker shades (600-950)
  palette[600] = darkenColor(baseColor, 15)
  palette[700] = darkenColor(baseColor, 30)
  palette[800] = darkenColor(baseColor, 45)
  palette[900] = darkenColor(baseColor, 60)
  palette[950] = darkenColor(baseColor, 75)
  
  return palette
}

/**
 * Get the appropriate text color (black or white) for a background color
 */
export const getTextColor = (backgroundColor: string): '#000000' | '#FFFFFF' => {
  const blackContrast = getContrastRatio('#000000', backgroundColor)
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor)
  
  return blackContrast > whiteContrast ? '#000000' : '#FFFFFF'
}

/**
 * Blend two colors together
 */
export const blendColors = (color1: string, color2: string, ratio: number = 0.5): string => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return color1
  
  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio)
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio)
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio)
  
  return rgbToHex(r, g, b)
}

/**
 * Create a gradient stop array for React Native gradients
 */
export const createGradientStops = (
  colors: string[],
  locations?: number[]
): { colors: string[]; locations: number[] } => {
  const defaultLocations = colors.map((_, index) => index / (colors.length - 1))
  
  return {
    colors,
    locations: locations || defaultLocations
  }
}

/**
 * Generate theme-aware colors for different states
 */
export const generateStateColors = (baseColor: string, isDark: boolean = false) => {
  const hoverShift = isDark ? 10 : -10
  const pressedShift = isDark ? 20 : -20
  const disabledShift = isDark ? -30 : 30
  
  return {
    base: baseColor,
    hover: isDark ? lightenColor(baseColor, Math.abs(hoverShift)) : darkenColor(baseColor, Math.abs(hoverShift)),
    pressed: isDark ? lightenColor(baseColor, Math.abs(pressedShift)) : darkenColor(baseColor, Math.abs(pressedShift)),
    disabled: isDark ? darkenColor(baseColor, Math.abs(disabledShift)) : lightenColor(baseColor, Math.abs(disabledShift))
  }
}

/**
 * Extract dominant color from an image URL (placeholder for now)
 * This would typically use a color extraction library
 */
export const extractDominantColor = async (imageUrl: string): Promise<string> => {
  // This is a placeholder implementation
  // In a real app, you would use a library like react-native-color-extractor
  // or implement native modules for color extraction
  
  // For now, return a default color
  return '#5B5CFF' // VNYL brand primary
}

/**
 * Create a color scale for data visualization
 */
export const createColorScale = (
  startColor: string,
  endColor: string,
  steps: number = 10
): string[] => {
  const colors: string[] = []
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    colors.push(blendColors(startColor, endColor, ratio))
  }
  
  return colors
}

/**
 * Media-specific color utilities for VNYL app
 */
export const mediaColorUtils = {
  /**
   * Get rating color based on score
   */
  getRatingColor: (rating: number, isDark: boolean = false): string => {
    if (rating >= 8) return isDark ? '#10B981' : '#059669' // High rating - Green
    if (rating >= 6) return isDark ? '#F59E0B' : '#D97706' // Medium rating - Amber
    return isDark ? '#EF4444' : '#DC2626' // Low rating - Red
  },
  
  /**
   * Get genre color
   */
  getGenreColor: (genre: string, isDark: boolean = false): string => {
    const genreColors = {
      action: isDark ? '#EF4444' : '#DC2626',
      comedy: isDark ? '#FBBF24' : '#F59E0B',
      drama: isDark ? '#A855F7' : '#7C3AED',
      horror: isDark ? '#DC2626' : '#991B1B',
      scifi: isDark ? '#0EA5E9' : '#0891B2',
      romance: isDark ? '#F472B6' : '#EC4899',
      documentary: isDark ? '#10B981' : '#059669',
      thriller: isDark ? '#6B7280' : '#374151'
    }
    
    return genreColors[genre.toLowerCase() as keyof typeof genreColors] || (isDark ? '#6B7280' : '#374151')
  },
  
  /**
   * Create overlay color for video player
   */
  createPlayerOverlay: (opacity: number = 0.7): string => {
    return `rgba(0, 0, 0, ${Math.max(0, Math.min(1, opacity))})`
  },
  
  /**
   * Get status color for content (watched, watchlist, etc.)
   */
  getStatusColor: (status: 'watched' | 'watchlist' | 'liked' | 'disliked', isDark: boolean = false): string => {
    const statusColors = {
      watched: '#5B5CFF', // Brand primary
      watchlist: isDark ? '#F59E0B' : '#D97706', // Warning
      liked: isDark ? '#10B981' : '#059669', // Success
      disliked: isDark ? '#EF4444' : '#DC2626' // Error
    }
    
    return statusColors[status]
  }
}