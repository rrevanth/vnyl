/**
 * i18n service implementation using expo-localization
 * Provides comprehensive internationalization support with translation management
 */

import {
  II18nService,
  SupportedLanguage,
  InterpolationOptions,
  LanguageInfo,
  TranslationNamespace,
} from '@/src/domain/services/i18n.service.interface'
import { LocaleDetector } from './locale-detector'

interface TranslationCache {
  [language: string]: {
    [namespace: string]: TranslationNamespace
  }
}

interface I18nConfig {
  defaultLanguage: SupportedLanguage
  fallbackLanguage: SupportedLanguage
  enableDebugMode?: boolean
  autoDetectLanguage?: boolean
  enableCaching?: boolean
  maxCacheSize?: number
}

export class I18nService implements II18nService {
  private currentLanguage: SupportedLanguage
  private fallbackLanguage: SupportedLanguage
  private translationCache: TranslationCache = {}
  private loadedNamespaces = new Set<string>()
  private missingKeys = new Set<string>()
  private usedKeys = new Set<string>()
  private eventListeners: {
    languageChange: ((language: SupportedLanguage) => void)[]
    translationsLoad: ((language: SupportedLanguage, namespace: string) => void)[]
  } = {
    languageChange: [],
    translationsLoad: [],
  }
  
  private readonly config: Required<I18nConfig>
  private readonly debugMode: boolean

  constructor(config: I18nConfig) {
    this.config = {
      defaultLanguage: config.defaultLanguage,
      fallbackLanguage: config.fallbackLanguage,
      enableDebugMode: config.enableDebugMode ?? __DEV__,
      autoDetectLanguage: config.autoDetectLanguage ?? true,
      enableCaching: config.enableCaching ?? true,
      maxCacheSize: config.maxCacheSize ?? 50, // 50 namespaces max
    }

    this.debugMode = this.config.enableDebugMode
    this.fallbackLanguage = config.fallbackLanguage

    // Initialize current language
    if (this.config.autoDetectLanguage) {
      this.currentLanguage = LocaleDetector.detectSupportedLanguage()
    } else {
      this.currentLanguage = config.defaultLanguage
    }

    this.log(`I18n initialized with language: ${this.currentLanguage}`)
  }

  // Language management
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage
  }

  async setLanguage(language: SupportedLanguage): Promise<void> {
    if (!LocaleDetector.isSupportedLanguage(language)) {
      throw new Error(`Unsupported language: ${language}`)
    }

    const previousLanguage = this.currentLanguage
    this.currentLanguage = language

    this.log(`Language changed from ${previousLanguage} to ${language}`)

    // Notify listeners
    this.eventListeners.languageChange.forEach(callback => {
      try {
        callback(language)
      } catch (error) {
        console.error('Error in language change callback:', error)
      }
    })

    // Pre-load default namespace for new language
    try {
      await this.loadNamespace('common')
    } catch (error) {
      console.warn(`Failed to load common namespace for ${language}:`, error)
    }
  }

  getSupportedLanguages(): LanguageInfo[] {
    return LocaleDetector.getSupportedLanguages().map(code => ({
      code,
      name: LocaleDetector.getEnglishLanguageName(code),
      nativeName: LocaleDetector.getNativeLanguageName(code),
      direction: LocaleDetector.getLanguageDirection(code),
      region: LocaleDetector.getRegionFromLocale(
        LocaleDetector.getBestMatchingLocale(code)
      ),
      supported: true,
    }))
  }

  isLanguageSupported(language: string): boolean {
    return LocaleDetector.isSupportedLanguage(language)
  }

  // Translation functions
  t(key: string, options?: InterpolationOptions, namespace = 'common'): string {
    this.usedKeys.add(`${namespace}:${key}`)
    
    let translation = this.getTranslation(key, namespace, this.currentLanguage)
    
    // Fallback to fallback language
    if (!translation && this.currentLanguage !== this.fallbackLanguage) {
      translation = this.getTranslation(key, namespace, this.fallbackLanguage)
    }

    // Final fallback to key itself
    if (!translation) {
      this.missingKeys.add(`${namespace}:${key}`)
      translation = key
      
      if (this.debugMode) {
        console.warn(`Missing translation: ${namespace}:${key}`)
      }
    }

    return this.interpolate(translation, options)
  }

  translate(key: string, options?: InterpolationOptions, namespace = 'common'): string {
    return this.t(key, options, namespace)
  }

  // Pluralization
  plural(key: string, count: number, options?: InterpolationOptions, namespace = 'common'): string {
    const pluralKey = this.getPluralKey(key, count)
    const mergedOptions = { ...options, count }
    return this.t(pluralKey, mergedOptions, namespace)
  }

  // Namespace management
  async loadNamespace(namespace: string): Promise<void> {
    if (this.loadedNamespaces.has(namespace)) {
      return
    }

    try {
      await this.loadTranslationsForNamespace(namespace, this.currentLanguage)
      
      // Also load fallback language if different
      if (this.currentLanguage !== this.fallbackLanguage) {
        await this.loadTranslationsForNamespace(namespace, this.fallbackLanguage)
      }
      
      this.loadedNamespaces.add(namespace)
      
      // Notify listeners
      this.eventListeners.translationsLoad.forEach(callback => {
        try {
          callback(this.currentLanguage, namespace)
        } catch (error) {
          console.error('Error in translations load callback:', error)
        }
      })
      
      this.log(`Loaded namespace: ${namespace}`)
    } catch (error) {
      console.error(`Failed to load namespace ${namespace}:`, error)
      throw error
    }
  }

  hasNamespace(namespace: string): boolean {
    return this.loadedNamespaces.has(namespace)
  }

  getLoadedNamespaces(): string[] {
    return Array.from(this.loadedNamespaces)
  }

  // Key validation and debugging
  hasTranslation(key: string, namespace = 'common'): boolean {
    return !!this.getTranslation(key, namespace, this.currentLanguage) ||
           !!this.getTranslation(key, namespace, this.fallbackLanguage)
  }

  getMissingKeys(): string[] {
    return Array.from(this.missingKeys)
  }

  getUnusedKeys(): string[] {
    const allKeys = new Set<string>()
    
    // Collect all available keys
    Object.values(this.translationCache).forEach(languageCache => {
      Object.entries(languageCache).forEach(([namespace, translations]) => {
        this.collectKeysFromNamespace(translations, namespace, allKeys)
      })
    })

    return Array.from(allKeys).filter(key => !this.usedKeys.has(key))
  }

  // Dynamic loading
  async loadTranslations(language: SupportedLanguage, namespace = 'common'): Promise<void> {
    await this.loadTranslationsForNamespace(namespace, language)
  }

  addTranslations(language: SupportedLanguage, translations: TranslationNamespace, namespace = 'common'): void {
    if (!this.translationCache[language]) {
      this.translationCache[language] = {}
    }
    
    this.translationCache[language][namespace] = {
      ...this.translationCache[language][namespace],
      ...translations,
    }

    this.log(`Added translations for ${language}:${namespace}`)
  }

  // Formatting utilities
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    try {
      const locale = LocaleDetector.getBestMatchingLocale(this.currentLanguage)
      return new Intl.NumberFormat(locale, options).format(value)
    } catch (error) {
      console.warn('Number formatting failed:', error)
      return value.toString()
    }
  }

  formatCurrency(value: number, currency: string, options?: Intl.NumberFormatOptions): string {
    try {
      const locale = LocaleDetector.getBestMatchingLocale(this.currentLanguage)
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        ...options,
      }).format(value)
    } catch (error) {
      console.warn('Currency formatting failed:', error)
      return `${currency} ${value}`
    }
  }

  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      const locale = LocaleDetector.getBestMatchingLocale(this.currentLanguage)
      return new Intl.DateTimeFormat(locale, options).format(dateObj)
    } catch (error) {
      console.warn('Date formatting failed:', error)
      return date.toString()
    }
  }

  formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      const locale = LocaleDetector.getBestMatchingLocale(this.currentLanguage)
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        ...options,
      }).format(dateObj)
    } catch (error) {
      console.warn('Time formatting failed:', error)
      return date.toString()
    }
  }

  formatRelativeTime(date: Date | string, baseDate = new Date()): string {
    try {
      const targetDate = typeof date === 'string' ? new Date(date) : date
      const diffMs = targetDate.getTime() - baseDate.getTime()
      const diffMinutes = Math.round(diffMs / (1000 * 60))
      
      const locale = LocaleDetector.getBestMatchingLocale(this.currentLanguage)
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
      
      if (Math.abs(diffMinutes) < 60) {
        return rtf.format(diffMinutes, 'minute')
      } else if (Math.abs(diffMinutes) < 1440) {
        return rtf.format(Math.round(diffMinutes / 60), 'hour')
      } else {
        return rtf.format(Math.round(diffMinutes / 1440), 'day')
      }
    } catch (error) {
      console.warn('Relative time formatting failed:', error)
      return date.toString()
    }
  }

  // List formatting
  formatList(items: string[], type: 'conjunction' | 'disjunction' = 'conjunction'): string {
    try {
      const locale = LocaleDetector.getBestMatchingLocale(this.currentLanguage)
      return new Intl.ListFormat(locale, { 
        style: 'long', 
        type: type === 'conjunction' ? 'conjunction' : 'disjunction' 
      }).format(items)
    } catch (error) {
      console.warn('List formatting failed:', error)
      return items.join(type === 'conjunction' ? ', ' : ' or ')
    }
  }

  // Language detection
  detectLanguage(): SupportedLanguage {
    return LocaleDetector.detectSupportedLanguage()
  }

  detectSystemLanguage(): SupportedLanguage {
    return LocaleDetector.detectSupportedLanguage()
  }

  detectRegion(): string {
    return LocaleDetector.getDeviceRegion()
  }

  // Fallback management
  setFallbackLanguage(language: SupportedLanguage): void {
    this.fallbackLanguage = language
    this.log(`Fallback language set to: ${language}`)
  }

  getFallbackLanguage(): SupportedLanguage {
    return this.fallbackLanguage
  }

  // Context-aware translations
  tWithContext(key: string, context: string, options?: InterpolationOptions): string {
    const contextKey = `${key}.${context}`
    if (this.hasTranslation(contextKey)) {
      return this.t(contextKey, options)
    }
    return this.t(key, options)
  }

  // Gender and context handling
  tWithGender(key: string, gender: 'male' | 'female' | 'neutral', options?: InterpolationOptions): string {
    const genderKey = `${key}.${gender}`
    if (this.hasTranslation(genderKey)) {
      return this.t(genderKey, options)
    }
    return this.t(key, options)
  }

  // Rich text and markup (basic implementation)
  tWithMarkup(key: string, options?: InterpolationOptions): string {
    return this.t(key, options)
  }

  parseMarkup(text: string): { type: 'text' | 'markup'; content: string; tag?: string }[] {
    // Basic markup parsing - can be enhanced with more sophisticated parser
    const parts: { type: 'text' | 'markup'; content: string; tag?: string }[] = []
    const markupRegex = /<(\w+)>(.*?)<\/\1>/g
    let lastIndex = 0
    let match

    while ((match = markupRegex.exec(text)) !== null) {
      // Add text before markup
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        })
      }

      // Add markup
      parts.push({
        type: 'markup',
        content: match[2],
        tag: match[1],
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      })
    }

    return parts
  }

  // Validation and quality
  validateTranslations(namespace = 'common'): {
    missingKeys: string[]
    emptyTranslations: string[]
    inconsistentInterpolations: string[]
  } {
    const result = {
      missingKeys: [],
      emptyTranslations: [],
      inconsistentInterpolations: [],
    }

    // Implementation would analyze the translation namespace
    // This is a simplified version
    if (this.translationCache[this.currentLanguage]?.[namespace]) {
      // Add validation logic here
    }

    return result
  }

  // Performance and caching
  async preloadTranslations(languages: SupportedLanguage[], namespaces = ['common']): Promise<void> {
    const loadPromises: Promise<void>[] = []

    for (const language of languages) {
      for (const namespace of namespaces) {
        loadPromises.push(this.loadTranslationsForNamespace(namespace, language))
      }
    }

    await Promise.allSettled(loadPromises)
    this.log(`Preloaded translations for languages: ${languages.join(', ')}`)
  }

  clearCache(): void {
    this.translationCache = {}
    this.loadedNamespaces.clear()
    this.log('Translation cache cleared')
  }

  getStats(): {
    loadedLanguages: SupportedLanguage[]
    loadedNamespaces: string[]
    totalKeys: number
    cacheSize: number
  } {
    const loadedLanguages = Object.keys(this.translationCache) as SupportedLanguage[]
    let totalKeys = 0

    Object.values(this.translationCache).forEach(languageCache => {
      Object.values(languageCache).forEach(namespace => {
        totalKeys += this.countKeysInNamespace(namespace)
      })
    })

    return {
      loadedLanguages,
      loadedNamespaces: Array.from(this.loadedNamespaces),
      totalKeys,
      cacheSize: Object.keys(this.translationCache).length,
    }
  }

  // Event handling
  onLanguageChange(callback: (language: SupportedLanguage) => void): () => void {
    this.eventListeners.languageChange.push(callback)
    
    return () => {
      const index = this.eventListeners.languageChange.indexOf(callback)
      if (index > -1) {
        this.eventListeners.languageChange.splice(index, 1)
      }
    }
  }

  onTranslationsLoad(callback: (language: SupportedLanguage, namespace: string) => void): () => void {
    this.eventListeners.translationsLoad.push(callback)
    
    return () => {
      const index = this.eventListeners.translationsLoad.indexOf(callback)
      if (index > -1) {
        this.eventListeners.translationsLoad.splice(index, 1)
      }
    }
  }

  // Export and import
  async exportTranslations(language: SupportedLanguage, namespace = 'common'): Promise<string> {
    const translations = this.translationCache[language]?.[namespace]
    if (!translations) {
      throw new Error(`No translations found for ${language}:${namespace}`)
    }
    return JSON.stringify(translations, null, 2)
  }

  async importTranslations(data: string, language: SupportedLanguage, namespace = 'common'): Promise<void> {
    try {
      const translations = JSON.parse(data) as TranslationNamespace
      this.addTranslations(language, translations, namespace)
      this.log(`Imported translations for ${language}:${namespace}`)
    } catch (error) {
      throw new Error(`Failed to import translations: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Development utilities
  enableDebugging(): void {
    // Already handled in config
    this.log('Debug mode enabled')
  }

  disableDebugging(): void {
    // Already handled in config
    this.log('Debug mode disabled')
  }

  logMissingKey(key: string, namespace = 'common'): void {
    const fullKey = `${namespace}:${key}`
    this.missingKeys.add(fullKey)
    if (this.debugMode) {
      console.warn(`Missing translation logged: ${fullKey}`)
    }
  }

  // Accessibility
  getTextDirection(): 'ltr' | 'rtl' {
    return LocaleDetector.getLanguageDirection(this.currentLanguage)
  }

  formatAccessibilityLabel(key: string, options?: InterpolationOptions): string {
    // Remove any markup for accessibility
    const translation = this.t(key, options)
    return translation.replace(/<[^>]*>/g, '')
  }

  // Persistence (placeholder - would integrate with storage service)
  async saveLanguagePreference(): Promise<void> {
    // Would use storage service to persist language preference
    this.log(`Language preference saved: ${this.currentLanguage}`)
  }

  async loadLanguagePreference(): Promise<SupportedLanguage | null> {
    // Would use storage service to load language preference
    return null
  }

  // Private helper methods
  private getTranslation(key: string, namespace: string, language: SupportedLanguage): string | null {
    const translations = this.translationCache[language]?.[namespace]
    if (!translations) {
      return null
    }

    return this.getNestedValue(translations, key)
  }

  private getNestedValue(obj: TranslationNamespace, key: string): string | null {
    const keys = key.split('.')
    let current: any = obj

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return null
      }
    }

    return typeof current === 'string' ? current : null
  }

  private interpolate(text: string, options?: InterpolationOptions): string {
    if (!options) {
      return text
    }

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = options[key]
      return value !== undefined ? String(value) : match
    })
  }

  private getPluralKey(key: string, count: number): string {
    // Simple plural rules - can be enhanced for complex languages
    if (count === 0) return `${key}_zero`
    if (count === 1) return `${key}_one`
    return `${key}_other`
  }

  private async loadTranslationsForNamespace(namespace: string, language: SupportedLanguage): Promise<void> {
    // This would load translations from files, API, or other sources
    // For now, we'll create a placeholder implementation
    
    if (!this.translationCache[language]) {
      this.translationCache[language] = {}
    }

    // Placeholder - in real implementation, this would load from files
    this.translationCache[language][namespace] = {}
  }

  private collectKeysFromNamespace(namespace: TranslationNamespace, prefix: string, keys: Set<string>): void {
    Object.entries(namespace).forEach(([key, value]) => {
      const fullKey = `${prefix}:${key}`
      if (typeof value === 'string') {
        keys.add(fullKey)
      } else if (typeof value === 'object') {
        this.collectKeysFromNamespace(value, fullKey, keys)
      }
    })
  }

  private countKeysInNamespace(namespace: TranslationNamespace): number {
    let count = 0
    
    Object.values(namespace).forEach(value => {
      if (typeof value === 'string') {
        count++
      } else if (typeof value === 'object') {
        count += this.countKeysInNamespace(value)
      }
    })

    return count
  }

  private log(message: string): void {
    if (this.debugMode) {
      console.log(`[I18n] ${message}`)
    }
  }
}