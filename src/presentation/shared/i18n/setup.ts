/**
 * i18n setup and configuration
 * Integrates with infrastructure i18n service and provides React context
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import * as Localization from 'expo-localization'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { 
  SupportedLanguage,
  II18nService 
} from '@/src/domain/services/i18n.service.interface'
import { getContainer } from '@/src/infrastructure/di/container'
import { TOKENS } from '@/src/infrastructure/di/tokens'
import { translations } from './locales'

// Global i18n state
const i18nState = observable({
  isInitialized: false,
  currentLanguage: 'en' as SupportedLanguage,
  isLoading: false,
  error: null as string | null,
})

/**
 * i18n Context type
 */
interface I18nContextType {
  isInitialized: boolean
  currentLanguage: SupportedLanguage
  isLoading: boolean
  error: string | null
  i18nService: II18nService
}

/**
 * i18n Context
 */
const I18nContext = createContext<I18nContextType | null>(null)

/**
 * Hook to access i18n context
 */
export const useI18nContext = (): I18nContextType => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider')
  }
  return context
}

/**
 * i18n Provider Props
 */
interface I18nProviderProps {
  children: ReactNode
  defaultLanguage?: SupportedLanguage
  fallbackLanguage?: SupportedLanguage
  autoDetect?: boolean
  preloadNamespaces?: string[]
}

/**
 * i18n Provider Component
 * Initializes the i18n system and provides context to child components
 */
export const I18nProvider: React.FC<I18nProviderProps> = observer(({
  children,
  defaultLanguage = 'en',
  fallbackLanguage = 'en',
  autoDetect = true,
  preloadNamespaces = ['common'],
}) => {
  const [i18nService] = useState(() => getContainer().resolve<II18nService>(TOKENS.I18nService))
  
  useEffect(() => {
    initializeI18n()
  }, [])

  const initializeI18n = async () => {
    try {
      i18nState.isLoading.set(true)
      i18nState.error.set(null)

      // Load translation files into the service
      await loadTranslationFiles()

      // Set up language detection and configuration
      let targetLanguage = defaultLanguage
      
      if (autoDetect) {
        const systemLanguage = i18nService.detectSystemLanguage()
        if (i18nService.isLanguageSupported(systemLanguage)) {
          targetLanguage = systemLanguage
        }
      }

      // Initialize the service with the target language
      await i18nService.setLanguage(targetLanguage)
      i18nState.currentLanguage.set(targetLanguage)

      // Preload default namespaces
      for (const namespace of preloadNamespaces) {
        await i18nService.loadNamespace(namespace)
      }

      i18nState.isInitialized.set(true)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'i18n initialization failed'
      i18nState.error.set(errorMessage)
      console.error('i18n initialization error:', error)
    } finally {
      i18nState.isLoading.set(false)
    }
  }

  const loadTranslationFiles = async () => {
    // Load all available translations into the service
    const languages = Object.keys(translations) as SupportedLanguage[]
    
    for (const language of languages) {
      const languageTranslations = translations[language as keyof typeof translations]
      
      // Load each namespace for this language
      for (const [namespace, namespaceTranslations] of Object.entries(languageTranslations)) {
        i18nService.addTranslations(language, namespaceTranslations, namespace)
      }
    }
  }

  const contextValue: I18nContextType = {
    isInitialized: i18nState.isInitialized.get(),
    currentLanguage: i18nState.currentLanguage.get(),
    isLoading: i18nState.isLoading.get(),
    error: i18nState.error.get(),
    i18nService,
  }

  return React.createElement(
    I18nContext.Provider,
    { value: contextValue },
    children
  )
})

/**
 * Setup function for i18n without React context
 * Useful for configuring i18n before app initialization
 */
export const setupI18n = async (options: {
  defaultLanguage?: SupportedLanguage
  fallbackLanguage?: SupportedLanguage
  autoDetect?: boolean
  preloadNamespaces?: string[]
} = {}): Promise<II18nService> => {
  const {
    defaultLanguage = 'en',
    fallbackLanguage = 'en',
    autoDetect = true,
    preloadNamespaces = ['common'],
  } = options

  const i18nService = getContainer().resolve<II18nService>(TOKENS.I18nService)

  try {
    // Load translation files
    const languages = Object.keys(translations) as SupportedLanguage[]
    
    for (const language of languages) {
      const languageTranslations = translations[language as keyof typeof translations]
      
      for (const [namespace, namespaceTranslations] of Object.entries(languageTranslations)) {
        i18nService.addTranslations(language, namespaceTranslations, namespace)
      }
    }

    // Configure language
    let targetLanguage = defaultLanguage
    
    if (autoDetect) {
      const systemLanguage = i18nService.detectSystemLanguage()
      if (i18nService.isLanguageSupported(systemLanguage)) {
        targetLanguage = systemLanguage
      }
    }

    await i18nService.setLanguage(targetLanguage)

    // Preload namespaces
    for (const namespace of preloadNamespaces) {
      await i18nService.loadNamespace(namespace)
    }

    return i18nService
  } catch (error) {
    console.error('i18n setup error:', error)
    throw error
  }
}

/**
 * Get current locale information from system
 */
export const getSystemLocaleInfo = () => {
  return {
    locale: Localization.getLocales()[0]?.languageTag || 'en',
    locales: Localization.getLocales(),
    timezone: Localization.getCalendars()[0]?.timeZone || 'UTC',
    region: Localization.getLocales()[0]?.regionCode || 'US',
  }
}

/**
 * Detect the best supported language from system locales
 */
export const detectBestSupportedLanguage = (): SupportedLanguage => {
  const systemLocales = Localization.getLocales()
  const supportedLanguages: SupportedLanguage[] = ['en', 'es', 'fr', 'de', 'ja', 'it', 'pt', 'ru', 'ko', 'zh']
  
  // Try to find exact match first
  for (const systemLocale of systemLocales) {
    const languageCode = systemLocale.languageCode as SupportedLanguage
    if (supportedLanguages.includes(languageCode)) {
      return languageCode
    }
  }
  
  // Try to find language family match
  for (const systemLocale of systemLocales) {
    const languageTag = systemLocale.languageTag?.split('-')[0] as SupportedLanguage
    if (languageTag && supportedLanguages.includes(languageTag)) {
      return languageTag
    }
  }
  
  // Default to English
  return 'en'
}

/**
 * Validate i18n configuration
 */
export const validateI18nConfig = (): {
  valid: boolean
  issues: string[]
  recommendations: string[]
} => {
  const issues: string[] = []
  const recommendations: string[] = []
  
  try {
    const i18nService = getContainer().resolve<II18nService>(TOKENS.I18nService)
    
    // Check if service is available
    if (!i18nService) {
      issues.push('i18n service not available in DI container')
    }
    
    // Check translation files
    const languages = Object.keys(translations)
    if (languages.length === 0) {
      issues.push('No translation files loaded')
    }
    
    // Check for English fallback
    if (!('en' in translations)) {
      issues.push('English fallback translations not available')
    }
    
    // Check namespace consistency
    const englishNamespaces = Object.keys(translations.en || {})
    for (const [lang, langTranslations] of Object.entries(translations)) {
      const langNamespaces = Object.keys(langTranslations)
      const missingNamespaces = englishNamespaces.filter(ns => !langNamespaces.includes(ns))
      
      if (missingNamespaces.length > 0) {
        recommendations.push(`Language ${lang} is missing namespaces: ${missingNamespaces.join(', ')}`)
      }
    }
    
    return {
      valid: issues.length === 0,
      issues,
      recommendations,
    }
  } catch (error) {
    issues.push(`Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    return {
      valid: false,
      issues,
      recommendations,
    }
  }
}

/**
 * Development helper to log missing translations
 */
export const enableTranslationLogging = (): void => {
  if (__DEV__) {
    const i18nService = getContainer().resolve<II18nService>(TOKENS.I18nService)
    
    i18nService.onLanguageChange((language) => {
      console.log(`[i18n] Language changed to: ${language}`)
    })
    
    // Log missing keys in development
    const originalT = i18nService.t.bind(i18nService)
    i18nService.t = (key: string, options?: any, namespace = 'common') => {
      const result = originalT(key, options, namespace)
      
      if (result === key) {
        console.warn(`[i18n] Missing translation: ${namespace}:${key}`)
      }
      
      return result
    }
  }
}

export default I18nProvider