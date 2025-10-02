/**
 * VNYL App Theme System
 * Complete theme implementation with legacy StyleSheet and new Unistyles support
 */

// Legacy StyleSheet-based theme (for gradual migration)
// Simple Unistyles setup (initialize on import)
import './unistyles'

export { ThemeService, createThemeService, defaultThemeService } from './theme.service'
export {
  createTheme,
  lightTheme as legacyLightTheme,
  darkTheme as legacyDarkTheme,
  colorUtils,
  defaultCustomization,
  breakpoints as legacyBreakpoints,
  getDeviceType,
  getResponsiveValue,
} from './theme-config'

// Export basic Unistyles theme exports
export { themes, breakpoints } from './unistyles'

// Simple theme hooks
export { useVnylTheme, useVnylColors } from './hooks/useVnylTheme'

// Utility functions
export * from './utils'