/**
 * Internationalization service interface for multi-language support
 * Infrastructure layer will implement this interface
 */

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh'

export type InterpolationOptions = Record<string, string | number | boolean>

export interface LanguageInfo {
  code: SupportedLanguage
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  region?: string
  supported: boolean
}

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace
}

export interface II18nService {
  // Language management
  getCurrentLanguage(): SupportedLanguage
  setLanguage(language: SupportedLanguage): Promise<void>
  getSupportedLanguages(): LanguageInfo[]
  isLanguageSupported(language: string): boolean
  
  // Translation functions
  t(key: string, options?: InterpolationOptions, namespace?: string): string
  translate(key: string, options?: InterpolationOptions, namespace?: string): string
  
  // Pluralization
  plural(key: string, count: number, options?: InterpolationOptions, namespace?: string): string
  
  // Namespace management
  loadNamespace(namespace: string): Promise<void>
  hasNamespace(namespace: string): boolean
  getLoadedNamespaces(): string[]
  
  // Key validation and debugging
  hasTranslation(key: string, namespace?: string): boolean
  getMissingKeys(): string[]
  getUnusedKeys(): string[]
  
  // Dynamic loading
  loadTranslations(language: SupportedLanguage, namespace?: string): Promise<void>
  addTranslations(language: SupportedLanguage, translations: TranslationNamespace, namespace?: string): void
  
  // Formatting utilities
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string
  formatCurrency(value: number, currency: string, options?: Intl.NumberFormatOptions): string
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string
  formatTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string
  formatRelativeTime(date: Date | string, baseDate?: Date): string
  
  // List formatting
  formatList(items: string[], type?: 'conjunction' | 'disjunction'): string
  
  // Language detection
  detectLanguage(): SupportedLanguage
  detectSystemLanguage(): SupportedLanguage
  detectRegion(): string
  
  // Fallback management
  setFallbackLanguage(language: SupportedLanguage): void
  getFallbackLanguage(): SupportedLanguage
  
  // Context-aware translations
  tWithContext(key: string, context: string, options?: InterpolationOptions): string
  
  // Gender and context handling
  tWithGender(key: string, gender: 'male' | 'female' | 'neutral', options?: InterpolationOptions): string
  
  // Rich text and markup
  tWithMarkup(key: string, options?: InterpolationOptions): string
  parseMarkup(text: string): { type: 'text' | 'markup'; content: string; tag?: string }[]
  
  // Validation and quality
  validateTranslations(namespace?: string): {
    missingKeys: string[]
    emptyTranslations: string[]
    inconsistentInterpolations: string[]
  }
  
  // Performance and caching
  preloadTranslations(languages: SupportedLanguage[], namespaces?: string[]): Promise<void>
  clearCache(): void
  getStats(): {
    loadedLanguages: SupportedLanguage[]
    loadedNamespaces: string[]
    totalKeys: number
    cacheSize: number
  }
  
  // Event handling
  onLanguageChange(callback: (language: SupportedLanguage) => void): () => void
  onTranslationsLoad(callback: (language: SupportedLanguage, namespace: string) => void): () => void
  
  // Export and import
  exportTranslations(language: SupportedLanguage, namespace?: string): Promise<string>
  importTranslations(data: string, language: SupportedLanguage, namespace?: string): Promise<void>
  
  // Development utilities
  enableDebugging(): void
  disableDebugging(): void
  logMissingKey(key: string, namespace?: string): void
  
  // Accessibility
  getTextDirection(): 'ltr' | 'rtl'
  formatAccessibilityLabel(key: string, options?: InterpolationOptions): string
  
  // Persistence
  saveLanguagePreference(): Promise<void>
  loadLanguagePreference(): Promise<SupportedLanguage | null>
}