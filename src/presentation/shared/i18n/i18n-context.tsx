import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { getLocales } from 'expo-localization'
import { useGetOrCreateUserUseCase, useUpdateUserLocaleUseCase } from '@/src/infrastructure/di'
import type { Locale, I18nContextValue, TranslationKey } from './types'
import { en, es } from './locales'

const I18nContext = createContext<I18nContextValue | null>(null)

// Translation dictionaries
const translations: Record<Locale, TranslationKey> = {
  en,
  es
}

// Observable i18n state
const i18nState = observable<{
  locale: Locale
  translations: TranslationKey
}>({
  locale: 'en',
  translations: en
})

// Helper function to get nested object value by string path
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path
  }, obj)
}

interface I18nProviderProps {
  children: React.ReactNode
  fallbackLocale?: Locale
}

export const I18nProvider: React.FC<I18nProviderProps> = observer(({
  children,
  fallbackLocale = 'en'
}) => {
  const getOrCreateUserUseCase = useGetOrCreateUserUseCase()
  const updateUserLocaleUseCase = useUpdateUserLocaleUseCase()

  // Initialize locale from user preferences or device settings
  useEffect(() => {
    const initializeLocale = async () => {
      try {
        // Try to get user preferences first
        const user = await getOrCreateUserUseCase.execute()
        const userLocale = user.preferences.locale

        if (userLocale && translations[userLocale]) {
          i18nState.locale.set(userLocale)
          i18nState.translations.set(translations[userLocale])
          return
        }

        // Get device locale as fallback
        const deviceLocales = getLocales()
        const deviceLocale = deviceLocales[0]?.languageCode as Locale

        const localeToUse = (deviceLocale && translations[deviceLocale])
          ? deviceLocale
          : fallbackLocale

        i18nState.locale.set(localeToUse)
        i18nState.translations.set(translations[localeToUse])

        // Update user preferences with detected locale
        await updateUserLocaleUseCase.execute(localeToUse)
      } catch {
        // Fallback to default if everything fails
        i18nState.locale.set(fallbackLocale)
        i18nState.translations.set(translations[fallbackLocale])
      }
    }

    initializeLocale()
  }, [getOrCreateUserUseCase, updateUserLocaleUseCase, fallbackLocale])

  const setLocale = useCallback(async (locale: Locale) => {
    try {
      if (!translations[locale]) {
        throw new Error(`Locale ${locale} not supported`)
      }

      i18nState.locale.set(locale)
      i18nState.translations.set(translations[locale])
      await updateUserLocaleUseCase.execute(locale)
    } catch {
      // Handle error gracefully - UI layer doesn't need detailed error handling
    }
  }, [updateUserLocaleUseCase])

  const t = useCallback((key: string): string => {
    const currentTranslations = i18nState.translations.peek()
    return getNestedValue(currentTranslations, key)
  }, [])

  const formatMessage = useCallback((key: string, values?: Record<string, string | number>): string => {
    let message = t(key)

    if (values) {
      Object.entries(values).forEach(([placeholder, value]) => {
        message = message.replace(new RegExp(`{${placeholder}}`, 'g'), String(value))
      })
    }

    return message
  }, [t])

  const contextValue: I18nContextValue = {
    locale: i18nState.locale.get(),
    setLocale,
    t,
    formatMessage
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
})

export const useTranslation = (): Pick<I18nContextValue, 't' | 'formatMessage'> => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return {
    t: context.t,
    formatMessage: context.formatMessage
  }
}

export const useLocale = (): Locale => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useLocale must be used within an I18nProvider')
  }
  return context.locale
}

export const useLocaleActions = (): Pick<I18nContextValue, 'setLocale'> => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useLocaleActions must be used within an I18nProvider')
  }
  return {
    setLocale: context.setLocale
  }
}