/**
 * Theme service implementation with size-matters integration
 * Provides comprehensive theme management with responsive design support
 */

import { Appearance, Dimensions } from 'react-native'
import { scale, moderateScale } from 'react-native-size-matters'
import {
  IThemeService,
  Theme,
  ThemeMode,
  ThemeCustomization,
} from '@/src/domain/services/theme.service.interface'
import {
  createTheme,
  colorUtils,
  defaultCustomization,
  getResponsiveValue,
} from './theme-config'

export class ThemeService implements IThemeService {
  private currentTheme: Theme
  private currentMode: ThemeMode
  private customization: ThemeCustomization
  private systemThemeListener?: () => void
  private eventListeners: {
    themeChange: ((theme: Theme) => void)[]
    modeChange: ((mode: ThemeMode) => void)[]
  } = {
    themeChange: [],
    modeChange: [],
  }

  constructor(initialMode: ThemeMode = 'system', initialCustomization?: ThemeCustomization) {
    this.customization = { ...defaultCustomization, ...initialCustomization }
    
    // Initialize theme mode
    if (initialMode === 'system') {
      this.currentMode = this.detectSystemTheme()
    } else {
      this.currentMode = initialMode
    }

    // Create initial theme
    this.currentTheme = createTheme(this.currentMode, this.customization)

    // Set up system theme watching if in system mode
    if (initialMode === 'system') {
      this.setupSystemThemeWatcher()
    }
  }

  // Theme management
  getCurrentTheme(): Theme {
    return this.currentTheme
  }

  setThemeMode(mode: ThemeMode): void {
    const previousMode = this.currentMode
    
    // Clean up system watcher if switching away from system mode
    if (previousMode === 'system' && mode !== 'system') {
      this.cleanupSystemThemeWatcher()
    }

    if (mode === 'system') {
      this.currentMode = this.detectSystemTheme()
      this.setupSystemThemeWatcher()
    } else {
      this.currentMode = mode
    }

    if (this.currentMode !== previousMode) {
      this.updateTheme()
      this.notifyModeChange(this.currentMode)
    }
  }

  getThemeMode(): ThemeMode {
    return this.currentMode
  }

  // Theme customization
  applyCustomization(customization: ThemeCustomization): void {
    this.customization = { ...this.customization, ...customization }
    this.updateTheme()
  }

  resetCustomization(): void {
    this.customization = { ...defaultCustomization }
    this.updateTheme()
  }

  getCustomization(): ThemeCustomization {
    return { ...this.customization }
  }

  // Color utilities
  lightenColor(color: string, amount: number): string {
    return colorUtils.lighten(color, amount)
  }

  darkenColor(color: string, amount: number): string {
    return colorUtils.darken(color, amount)
  }

  adjustColorOpacity(color: string, opacity: number): string {
    return colorUtils.withOpacity(color, opacity)
  }

  getContrastingColor(backgroundColor: string): string {
    return colorUtils.getContrastingColor(backgroundColor)
  }

  isColorLight(color: string): boolean {
    return colorUtils.isLight(color)
  }

  // Responsive utilities
  getResponsiveValue<T>(values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T }): T {
    const { width } = Dimensions.get('window')
    const result = getResponsiveValue(values, width)
    
    // Fallback to first available value
    if (result === undefined) {
      return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.xs!
    }
    
    return result
  }

  scaleFont(baseSize: number): number {
    return moderateScale(baseSize * (this.customization.fontScale ?? 1))
  }

  scaleSpacing(baseSpacing: number): number {
    let scaledSpacing = scale(baseSpacing)
    
    if (this.customization.compactMode) {
      scaledSpacing = Math.round(scaledSpacing * 0.8)
    }
    
    return scaledSpacing
  }

  // System integration
  detectSystemTheme(): ThemeMode {
    try {
      const colorScheme = Appearance.getColorScheme()
      return colorScheme === 'dark' ? 'dark' : 'light'
    } catch (error) {
      console.warn('Failed to detect system theme:', error)
      return 'light'
    }
  }

  watchSystemTheme(callback: (mode: ThemeMode) => void): () => void {
    const listener = (preferences: any) => {
      const mode = preferences.colorScheme === 'dark' ? 'dark' : 'light'
      callback(mode)
    }

    const subscription = Appearance.addChangeListener(listener)
    
    return () => {
      subscription?.remove()
    }
  }

  // Theme switching
  async switchTheme(mode: ThemeMode, animated = true): Promise<void> {
    if (animated && !this.customization.reducedMotion) {
      // Add animation logic here if needed
      // For now, just switch immediately
    }
    
    this.setThemeMode(mode)
  }

  async toggleTheme(animated = true): Promise<void> {
    const newMode = this.currentMode === 'light' ? 'dark' : 'light'
    await this.switchTheme(newMode, animated)
  }

  // Accessibility
  applyAccessibilitySettings(settings: {
    highContrast?: boolean
    reducedMotion?: boolean
    fontScale?: number
  }): void {
    this.applyCustomization({
      ...this.customization,
      ...settings,
    })
  }

  getAccessibilityColors(): {
    focusColor: string
    errorColor: string
    warningColor: string
    successColor: string
  } {
    return {
      focusColor: this.currentTheme.colors.interactive.primary,
      errorColor: this.currentTheme.colors.interactive.error,
      warningColor: this.currentTheme.colors.interactive.warning,
      successColor: this.currentTheme.colors.interactive.success,
    }
  }

  // Theme persistence (placeholder - would integrate with storage service)
  async saveThemePreferences(): Promise<void> {
    // Would use storage service to persist theme preferences
    console.log('Theme preferences saved:', {
      mode: this.currentMode,
      customization: this.customization,
    })
  }

  async loadThemePreferences(): Promise<void> {
    // Would use storage service to load theme preferences
    console.log('Theme preferences loaded')
  }

  // Theme validation
  validateTheme(theme: Partial<Theme>): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (theme.colors) {
      // Validate color format
      const validateColorObject = (obj: any, path: string) => {
        Object.entries(obj).forEach(([key, value]) => {
          if (typeof value === 'string') {
            if (!value.match(/^#[0-9A-Fa-f]{6}$/) && !value.startsWith('rgba')) {
              errors.push(`Invalid color format at ${path}.${key}: ${value}`)
            }
          } else if (typeof value === 'object') {
            validateColorObject(value, `${path}.${key}`)
          }
        })
      }

      validateColorObject(theme.colors, 'colors')
    }

    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0) {
          errors.push(`Invalid spacing value at spacing.${key}: ${value}`)
        }
      })
    }

    if (theme.typography) {
      Object.entries(theme.typography).forEach(([key, value]) => {
        if (typeof value !== 'object') {
          errors.push(`Invalid typography value at typography.${key}`)
        } else {
          if (typeof value.fontSize !== 'number' || value.fontSize <= 0) {
            errors.push(`Invalid fontSize at typography.${key}.fontSize`)
          }
          if (typeof value.lineHeight !== 'number' || value.lineHeight <= 0) {
            errors.push(`Invalid lineHeight at typography.${key}.lineHeight`)
          }
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // Dynamic theming
  generateThemeFromColor(primaryColor: string): Theme {
    const isLight = colorUtils.isLight(primaryColor)
    const baseMode = isLight ? 'light' : 'dark'
    
    const customization: ThemeCustomization = {
      ...this.customization,
      primaryColor,
    }

    return createTheme(baseMode, customization)
  }

  generateComplementaryColors(baseColor: string): {
    primary: string
    secondary: string
    tertiary: string
  } {
    return colorUtils.generateComplementaryColors(baseColor)
  }

  // Theme events
  onThemeChange(callback: (theme: Theme) => void): () => void {
    this.eventListeners.themeChange.push(callback)
    
    return () => {
      const index = this.eventListeners.themeChange.indexOf(callback)
      if (index > -1) {
        this.eventListeners.themeChange.splice(index, 1)
      }
    }
  }

  onModeChange(callback: (mode: ThemeMode) => void): () => void {
    this.eventListeners.modeChange.push(callback)
    
    return () => {
      const index = this.eventListeners.modeChange.indexOf(callback)
      if (index > -1) {
        this.eventListeners.modeChange.splice(index, 1)
      }
    }
  }

  // Style generation
  createStyleSheet<T>(styles: (theme: Theme) => T): T {
    return styles(this.currentTheme)
  }

  createThemedStyles<T>(styleFunction: (theme: Theme) => T): () => T {
    return () => styleFunction(this.currentTheme)
  }

  // Export and import
  exportTheme(): string {
    return JSON.stringify({
      mode: this.currentMode,
      customization: this.customization,
      theme: this.currentTheme,
    }, null, 2)
  }

  async importTheme(themeData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(themeData)
      
      if (parsed.customization) {
        this.customization = { ...defaultCustomization, ...parsed.customization }
      }
      
      if (parsed.mode && ['light', 'dark', 'system'].includes(parsed.mode)) {
        this.setThemeMode(parsed.mode)
      }
      
      return true
    } catch (error) {
      console.error('Failed to import theme:', error)
      return false
    }
  }

  // Private methods
  private updateTheme(): void {
    const newTheme = createTheme(this.currentMode, this.customization)
    this.currentTheme = newTheme
    this.notifyThemeChange(newTheme)
  }

  private setupSystemThemeWatcher(): void {
    this.systemThemeListener = this.watchSystemTheme((mode) => {
      if (this.currentMode !== mode) {
        this.currentMode = mode
        this.updateTheme()
        this.notifyModeChange(mode)
      }
    })
  }

  private cleanupSystemThemeWatcher(): void {
    if (this.systemThemeListener) {
      this.systemThemeListener()
      this.systemThemeListener = undefined
    }
  }

  private notifyThemeChange(theme: Theme): void {
    this.eventListeners.themeChange.forEach(callback => {
      try {
        callback(theme)
      } catch (error) {
        console.error('Error in theme change callback:', error)
      }
    })
  }

  private notifyModeChange(mode: ThemeMode): void {
    this.eventListeners.modeChange.forEach(callback => {
      try {
        callback(mode)
      } catch (error) {
        console.error('Error in mode change callback:', error)
      }
    })
  }

  // Cleanup
  destroy(): void {
    this.cleanupSystemThemeWatcher()
    this.eventListeners.themeChange = []
    this.eventListeners.modeChange = []
  }
}

/**
 * Factory function for creating theme service instances
 */
export const createThemeService = (
  initialMode: ThemeMode = 'system',
  initialCustomization?: ThemeCustomization
): ThemeService => {
  return new ThemeService(initialMode, initialCustomization)
}

/**
 * Default theme service instance
 */
export const defaultThemeService = createThemeService()