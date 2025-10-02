/**
 * useTranslation hook for React Native components
 * Provides type-safe translation functions and language management
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { 
  SupportedLanguage, 
  InterpolationOptions,
  II18nService 
} from '@/src/domain/services/i18n.service.interface'
import { 
  TranslationNamespace, 
  UseTranslationReturn,
  TranslationParams
} from '@/src/presentation/shared/i18n/types'
import { getContainer } from '@/src/infrastructure/di/container'
import { TOKENS } from '@/src/infrastructure/di/tokens'

// Global observable state for translations
const translationState = observable({
  currentLanguage: 'en' as SupportedLanguage,
  isLoading: false,
  error: null as string | null,
  loadedNamespaces: new Set<string>(),
})

/**
 * Custom hook for translations with full type safety
 * Integrates with the infrastructure i18n service
 */
export const useTranslation = (defaultNamespace: TranslationNamespace = 'common'): UseTranslationReturn => {
  const [i18nService] = useState(() => getContainer().resolve<II18nService>(TOKENS.I18nService))
  
  // Initialize current language from service
  useEffect(() => {
    translationState.currentLanguage.set(i18nService.getCurrentLanguage())
  }, [i18nService])

  // Translation function with interpolation support
  const t = useCallback((
    key: string,
    options?: InterpolationOptions | TranslationParams,
    namespace: TranslationNamespace = defaultNamespace
  ): string => {
    try {
      return i18nService.t(key, options, namespace)
    } catch (error) {
      if (__DEV__) {
        console.warn(`Translation error for key "${namespace}:${key}":`, error)
      }
      return key
    }
  }, [i18nService, defaultNamespace])

  // Plural translation function
  const plural = useCallback((
    key: string,
    count: number,
    options?: InterpolationOptions,
    namespace: TranslationNamespace = defaultNamespace
  ): string => {
    try {
      return i18nService.plural(key, count, options, namespace)
    } catch (error) {
      if (__DEV__) {
        console.warn(`Plural translation error for key "${namespace}:${key}":`, error)
      }
      return `${key} (${count})`
    }
  }, [i18nService, defaultNamespace])

  // Language change function
  const setLanguage = useCallback(async (language: SupportedLanguage): Promise<void> => {
    if (!i18nService.isLanguageSupported(language)) {
      throw new Error(`Unsupported language: ${language}`)
    }

    translationState.isLoading.set(true)
    translationState.error.set(null)

    try {
      await i18nService.setLanguage(language)
      translationState.currentLanguage.set(language)
      
      // Load default namespace for new language
      await i18nService.loadNamespace(defaultNamespace)
      translationState.loadedNamespaces.add(defaultNamespace)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Language change failed'
      translationState.error.set(errorMessage)
      throw error
    } finally {
      translationState.isLoading.set(false)
    }
  }, [i18nService, defaultNamespace])

  // Load namespace function
  const loadNamespace = useCallback(async (namespace: TranslationNamespace): Promise<void> => {
    if (translationState.loadedNamespaces.has(namespace)) {
      return
    }

    try {
      await i18nService.loadNamespace(namespace)
      translationState.loadedNamespaces.add(namespace)
    } catch (error) {
      if (__DEV__) {
        console.warn(`Failed to load namespace "${namespace}":`, error)
      }
    }
  }, [i18nService])

  // Context-aware translation function
  const tWithContext = useCallback((
    key: string,
    context: string,
    options?: InterpolationOptions,
    namespace: TranslationNamespace = defaultNamespace
  ): string => {
    try {
      return i18nService.tWithContext(key, context, options)
    } catch (error) {
      if (__DEV__) {
        console.warn(`Context translation error for key "${namespace}:${key}" with context "${context}":`, error)
      }
      return t(key, options, namespace)
    }
  }, [i18nService, t, defaultNamespace])

  // Gender-aware translation function
  const tWithGender = useCallback((
    key: string,
    gender: 'male' | 'female' | 'neutral',
    options?: InterpolationOptions,
    namespace: TranslationNamespace = defaultNamespace
  ): string => {
    try {
      return i18nService.tWithGender(key, gender, options)
    } catch (error) {
      if (__DEV__) {
        console.warn(`Gender translation error for key "${namespace}:${key}" with gender "${gender}":`, error)
      }
      return t(key, options, namespace)
    }
  }, [i18nService, t, defaultNamespace])

  // Check if translation exists
  const hasTranslation = useCallback((
    key: string,
    namespace: TranslationNamespace = defaultNamespace
  ): boolean => {
    return i18nService.hasTranslation(key, namespace)
  }, [i18nService, defaultNamespace])

  // Memoized return value
  const returnValue = useMemo(() => ({
    t,
    plural,
    tWithContext,
    tWithGender,
    hasTranslation,
    loadNamespace,
    language: translationState.currentLanguage.get(),
    setLanguage,
    isLoading: translationState.isLoading.get(),
    error: translationState.error.get(),
  }), [
    t,
    plural,
    tWithContext,
    tWithGender,
    hasTranslation,
    loadNamespace,
    setLanguage,
  ])

  return returnValue
}

/**
 * Namespaced translation hook for specific features
 * Pre-loads the namespace and provides scoped translation functions
 */
export const useNamespacedTranslation = (namespace: TranslationNamespace) => {
  const translation = useTranslation(namespace)
  
  // Auto-load namespace on mount
  useEffect(() => {
    translation.loadNamespace(namespace)
  }, [namespace, translation])

  // Scoped translation function
  const nt = useCallback((
    key: string,
    options?: InterpolationOptions
  ): string => {
    return translation.t(key, options, namespace)
  }, [translation, namespace])

  // Scoped plural function
  const nplural = useCallback((
    key: string,
    count: number,
    options?: InterpolationOptions
  ): string => {
    return translation.plural(key, count, options, namespace)
  }, [translation, namespace])

  return {
    ...translation,
    nt,
    nplural,
    namespace,
  }
}

/**
 * HOC for automatically providing translations to components
 */
export const withTranslation = <P extends object>(
  Component: React.ComponentType<P & { t: UseTranslationReturn['t'] }>,
  namespace?: TranslationNamespace
) => {
  return observer((props: P) => {
    const { t } = useTranslation(namespace)
    return React.createElement(Component, { ...props, t } as P & { t: UseTranslationReturn['t'] })
  })
}

export default useTranslation