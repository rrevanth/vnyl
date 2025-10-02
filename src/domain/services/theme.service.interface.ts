/**
 * Theme service interface for managing application theming
 * Infrastructure layer will implement this interface
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeColors {
  background: {
    primary: string
    secondary: string
    tertiary: string
  }
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
  }
  border: {
    primary: string
    secondary: string
  }
  interactive: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    disabled: string
  }
  surface: {
    card: string
    modal: string
    overlay: string
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

export interface ThemeTypography {
  heading1: {
    fontSize: number
    lineHeight: number
    fontWeight: string
    letterSpacing?: number
  }
  heading2: {
    fontSize: number
    lineHeight: number
    fontWeight: string
    letterSpacing?: number
  }
  heading3: {
    fontSize: number
    lineHeight: number
    fontWeight: string
    letterSpacing?: number
  }
  body: {
    fontSize: number
    lineHeight: number
    fontWeight: string
    letterSpacing?: number
  }
  caption: {
    fontSize: number
    lineHeight: number
    fontWeight: string
    letterSpacing?: number
  }
  overline: {
    fontSize: number
    lineHeight: number
    fontWeight: string
    letterSpacing?: number
  }
}

export interface ThemeRadius {
  sm: number
  md: number
  lg: number
  full: number
}

export interface ThemeShadows {
  sm: {
    shadowColor: string
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
    elevation: number
  }
  md: {
    shadowColor: string
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
    elevation: number
  }
  lg: {
    shadowColor: string
    shadowOffset: { width: number; height: number }
    shadowOpacity: number
    shadowRadius: number
    elevation: number
  }
}

export interface ThemeTransition {
  duration: {
    fast: number
    normal: number
    slow: number
  }
  easing: {
    ease: string
    easeIn: string
    easeOut: string
    easeInOut: string
  }
}

export interface Theme {
  mode: ThemeMode
  colors: ThemeColors
  spacing: ThemeSpacing
  typography: ThemeTypography
  radius: ThemeRadius
  shadows: ThemeShadows
  transition: ThemeTransition
}

export interface ThemeCustomization {
  primaryColor?: string
  accentColor?: string
  fontScale?: number
  compactMode?: boolean
  highContrast?: boolean
  reducedMotion?: boolean
}

export interface IThemeService {
  // Theme management
  getCurrentTheme(): Theme
  setThemeMode(mode: ThemeMode): void
  getThemeMode(): ThemeMode
  
  // Theme customization
  applyCustomization(customization: ThemeCustomization): void
  resetCustomization(): void
  getCustomization(): ThemeCustomization
  
  // Color utilities
  lightenColor(color: string, amount: number): string
  darkenColor(color: string, amount: number): string
  adjustColorOpacity(color: string, opacity: number): string
  getContrastingColor(backgroundColor: string): string
  isColorLight(color: string): boolean
  
  // Responsive utilities
  getResponsiveValue<T>(values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T }): T
  scaleFont(baseSize: number): number
  scaleSpacing(baseSpacing: number): number
  
  // System integration
  detectSystemTheme(): ThemeMode
  watchSystemTheme(callback: (mode: ThemeMode) => void): () => void
  
  // Theme switching
  switchTheme(mode: ThemeMode, animated?: boolean): Promise<void>
  toggleTheme(animated?: boolean): Promise<void>
  
  // Accessibility
  applyAccessibilitySettings(settings: {
    highContrast?: boolean
    reducedMotion?: boolean
    fontScale?: number
  }): void
  
  getAccessibilityColors(): {
    focusColor: string
    errorColor: string
    warningColor: string
    successColor: string
  }
  
  // Theme persistence
  saveThemePreferences(): Promise<void>
  loadThemePreferences(): Promise<void>
  
  // Theme validation
  validateTheme(theme: Partial<Theme>): {
    valid: boolean
    errors: string[]
  }
  
  // Dynamic theming
  generateThemeFromColor(primaryColor: string): Theme
  generateComplementaryColors(baseColor: string): {
    primary: string
    secondary: string
    tertiary: string
  }
  
  // Theme events
  onThemeChange(callback: (theme: Theme) => void): () => void
  onModeChange(callback: (mode: ThemeMode) => void): () => void
  
  // Style generation
  createStyleSheet<T>(styles: (theme: Theme) => T): T
  createThemedStyles<T>(styleFunction: (theme: Theme) => T): () => T
  
  // Export and import
  exportTheme(): string
  importTheme(themeData: string): Promise<boolean>
}