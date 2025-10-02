/**
 * Locale detection utilities using expo-localization
 * Provides device locale detection and language preference management
 */

import * as Localization from 'expo-localization'
import { SupportedLanguage } from '@/src/domain/services/i18n.service.interface'

export class LocaleDetector {
  private static readonly SUPPORTED_LANGUAGES: SupportedLanguage[] = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'
  ]

  private static readonly LANGUAGE_FALLBACK_MAP: Record<string, SupportedLanguage> = {
    // English variants
    'en-US': 'en',
    'en-GB': 'en',
    'en-CA': 'en',
    'en-AU': 'en',
    
    // Spanish variants
    'es-ES': 'es',
    'es-MX': 'es',
    'es-AR': 'es',
    'es-CL': 'es',
    'es-CO': 'es',
    
    // French variants
    'fr-FR': 'fr',
    'fr-CA': 'fr',
    'fr-CH': 'fr',
    
    // German variants
    'de-DE': 'de',
    'de-AT': 'de',
    'de-CH': 'de',
    
    // Italian variants
    'it-IT': 'it',
    'it-CH': 'it',
    
    // Portuguese variants
    'pt-BR': 'pt',
    'pt-PT': 'pt',
    
    // Russian variants
    'ru-RU': 'ru',
    
    // Japanese variants
    'ja-JP': 'ja',
    
    // Korean variants
    'ko-KR': 'ko',
    
    // Chinese variants
    'zh-CN': 'zh',
    'zh-TW': 'zh',
    'zh-HK': 'zh',
  }

  /**
   * Get the device's current locale
   */
  static getDeviceLocale(): string {
    try {
      return (Localization as any).locale || 'en-US'
    } catch (error) {
      console.warn('Failed to get device locale:', error)
      return 'en-US'
    }
  }

  /**
   * Get all device locales in order of preference
   */
  static getDeviceLocales(): string[] {
    try {
      return (Localization as any).locales?.map((locale: any) => locale.languageTag) || ['en-US']
    } catch (error) {
      console.warn('Failed to get device locales:', error)
      return ['en-US']
    }
  }

  /**
   * Get the device's calendar identifier
   */
  static getDeviceCalendar(): string {
    try {
      return (Localization as any).calendar || 'gregorian'
    } catch (error) {
      console.warn('Failed to get device calendar:', error)
      return 'gregorian'
    }
  }

  /**
   * Get the device's timezone
   */
  static getDeviceTimezone(): string {
    try {
      return (Localization as any).timezone || 'UTC'
    } catch (error) {
      console.warn('Failed to get device timezone:', error)
      return 'UTC'
    }
  }

  /**
   * Get the device's region
   */
  static getDeviceRegion(): string {
    try {
      return (Localization as any).region || 'US'
    } catch (error) {
      console.warn('Failed to get device region:', error)
      return 'US'
    }
  }

  /**
   * Detect the best supported language for the device
   */
  static detectSupportedLanguage(): SupportedLanguage {
    const deviceLocales = this.getDeviceLocales()
    
    // First, try to find exact matches
    for (const locale of deviceLocales) {
      const language = this.extractLanguageCode(locale)
      if (this.SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
        return language as SupportedLanguage
      }
    }

    // Then, try fallback mappings
    for (const locale of deviceLocales) {
      const mappedLanguage = this.LANGUAGE_FALLBACK_MAP[locale]
      if (mappedLanguage) {
        return mappedLanguage
      }
    }

    // Finally, try partial matches (e.g., 'es-XY' -> 'es')
    for (const locale of deviceLocales) {
      const languageCode = locale.split('-')[0]
      if (this.SUPPORTED_LANGUAGES.includes(languageCode as SupportedLanguage)) {
        return languageCode as SupportedLanguage
      }
    }

    // Default to English
    return 'en'
  }

  /**
   * Check if a language is supported
   */
  static isSupportedLanguage(language: string): language is SupportedLanguage {
    return this.SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
  }

  /**
   * Get all supported languages
   */
  static getSupportedLanguages(): SupportedLanguage[] {
    return [...this.SUPPORTED_LANGUAGES]
  }

  /**
   * Get language direction (LTR/RTL)
   */
  static getLanguageDirection(language: SupportedLanguage): 'ltr' | 'rtl' {
    // Add RTL languages as needed
    const rtlLanguages: SupportedLanguage[] = ['ar' as SupportedLanguage] // Arabic not in current list
    return rtlLanguages.includes(language) ? 'rtl' : 'ltr'
  }

  /**
   * Get native language name
   */
  static getNativeLanguageName(language: SupportedLanguage): string {
    const nativeNames: Record<SupportedLanguage, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
      it: 'Italiano',
      pt: 'Português',
      ru: 'Русский',
      ja: '日本語',
      ko: '한국어',
      zh: '中文',
    }

    return nativeNames[language] || language
  }

  /**
   * Get English language name
   */
  static getEnglishLanguageName(language: SupportedLanguage): string {
    const englishNames: Record<SupportedLanguage, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
    }

    return englishNames[language] || language
  }

  /**
   * Get region code from locale
   */
  static getRegionFromLocale(locale: string): string {
    const parts = locale.split('-')
    return parts.length > 1 ? parts[1] : this.getDeviceRegion()
  }

  /**
   * Extract language code from locale
   */
  static extractLanguageCode(locale: string): string {
    return locale.split('-')[0].toLowerCase()
  }

  /**
   * Format locale string
   */
  static formatLocale(language: SupportedLanguage, region?: string): string {
    if (region) {
      return `${language}-${region.toUpperCase()}`
    }
    return language
  }

  /**
   * Get device locale information
   */
  static getDeviceLocaleInfo(): {
    locale: string
    language: string
    region: string
    timezone: string
    calendar: string
    currency?: string
    temperatureUnit?: string
  } {
    try {
      const locales = (Localization as any).locales || []
      const primaryLocale = locales[0] || { languageTag: 'en-US' }

      return {
        locale: this.getDeviceLocale(),
        language: this.extractLanguageCode(primaryLocale.languageTag),
        region: this.getDeviceRegion(),
        timezone: this.getDeviceTimezone(),
        calendar: this.getDeviceCalendar(),
        currency: primaryLocale.currencyCode || undefined,
        temperatureUnit: primaryLocale.temperatureUnit || undefined,
      }
    } catch (error) {
      console.warn('Failed to get device locale info:', error)
      return {
        locale: 'en-US',
        language: 'en',
        region: 'US',
        timezone: 'UTC',
        calendar: 'gregorian',
      }
    }
  }

  /**
   * Check if device supports a specific locale
   */
  static isDeviceLocaleSupported(targetLocale: string): boolean {
    const deviceLocales = this.getDeviceLocales()
    return deviceLocales.some(locale => 
      locale.toLowerCase() === targetLocale.toLowerCase() ||
      this.extractLanguageCode(locale) === this.extractLanguageCode(targetLocale)
    )
  }

  /**
   * Get the best matching locale for a language
   */
  static getBestMatchingLocale(language: SupportedLanguage): string {
    const deviceLocales = this.getDeviceLocales()
    
    // Try to find exact match with region
    const exactMatch = deviceLocales.find(locale => 
      this.extractLanguageCode(locale) === language
    )
    
    if (exactMatch) {
      return exactMatch
    }

    // Fallback to language code only
    return language
  }

  /**
   * Validate locale format
   */
  static validateLocale(locale: string): boolean {
    const localeRegex = /^[a-z]{2}(-[A-Z]{2})?$/
    return localeRegex.test(locale)
  }
}