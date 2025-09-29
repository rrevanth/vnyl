/**
 * Locale entity for internationalization support
 * Pure domain entity with no external dependencies
 */

/**
 * Supported locales in the application
 */
export type Locale = 'en' | 'es'

/**
 * Locale utility functions
 */
export class LocaleUtils {
  /**
   * Validates if a given string is a supported locale
   */
  static isValidLocale(value: string): value is Locale {
    return value === 'en' || value === 'es'
  }

  /**
   * Gets the default locale
   */
  static getDefaultLocale(): Locale {
    return 'en'
  }

  /**
   * Gets all supported locales
   */
  static getSupportedLocales(): Locale[] {
    return ['en', 'es']
  }
}