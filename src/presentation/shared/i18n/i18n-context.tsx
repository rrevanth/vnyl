import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { observable } from '@legendapp/state'
import { observer } from '@legendapp/state/react'
import { getLocales } from 'expo-localization'
import { useGetOrCreateUserUseCase, useUpdateUserLocaleUseCase, useSafeLogging } from '@/src/infrastructure/di'
import type { Locale, I18nContextValue, TranslationKey } from './types'
import { en, es } from './locales'
import { I18nError } from '@/src/domain/errors'

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
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && current !== null && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return path
  }, obj) as string
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
  const logger = useSafeLogging()

  // Initialize locale from user preferences or device settings
  useEffect(() => {
    const initializeLocale = async () => {
      try {
        // Try to get user preferences first
        const user = await getOrCreateUserUseCase.execute()
        const userLocalePreferences = user.preferences.locale
        const userLocale = userLocalePreferences.language

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
        const newLocalePreferences = {
          language: localeToUse,
          region: deviceLocales[0]?.regionCode || 'US',
          dateFormat: 'iso' as const,
          timeFormat: '12h' as const,
          currency: 'USD'
        }
        await updateUserLocaleUseCase.execute(newLocalePreferences)
      } catch (error) {
        // Fallback to default if everything fails
        const errorInstance = error instanceof Error ? error : new Error(String(error))
        logger?.warn('Failed to initialize locale from user preferences, using fallback', errorInstance, {
          context: 'i18n_initialization',
          fallbackLocale,
          deviceLocale: getLocales()[0]?.languageCode
        })
        i18nState.locale.set(fallbackLocale)
        i18nState.translations.set(translations[fallbackLocale])
      }
    }

    initializeLocale()
  }, [getOrCreateUserUseCase, updateUserLocaleUseCase, fallbackLocale, logger])

  const setLocale = useCallback(async (locale: Locale) => {
    try {
      if (!translations[locale]) {
        throw new I18nError(
          `Locale ${locale} not supported`,
          locale,
          undefined,
          { supportedLocales: Object.keys(translations) }
        )
      }

      i18nState.locale.set(locale)
      i18nState.translations.set(translations[locale])

      // Create full locale preferences object
      const newLocalePreferences = {
        language: locale,
        region: 'US', // Default region - can be enhanced later
        dateFormat: 'iso' as const,
        timeFormat: '12h' as const,
        currency: 'USD'
      }
      await updateUserLocaleUseCase.execute(newLocalePreferences)
    } catch (error) {
      // Handle error gracefully - UI layer doesn't need detailed error handling
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      logger?.warn('Failed to update user locale preferences', errorInstance, {
        context: 'i18n_locale_update',
        requestedLocale: locale,
        currentLocale: i18nState.locale.peek()
      })
    }
  }, [updateUserLocaleUseCase, logger])

  const t = useCallback((key: string): string => {
    const currentTranslations = i18nState.translations.peek()
    return getNestedValue(currentTranslations as unknown as Record<string, unknown>, key)
  }, [])

  const formatMessage = useCallback((key: string, values?: Record<string, string | number>): string => {
    let message = t(key)

    if (values) {
      Object.entries(values).forEach(([placeholder, value]) => {
        message = message.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value))
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
    throw new I18nError('useTranslation must be used within an I18nProvider')
  }
  return {
    t: context.t,
    formatMessage: context.formatMessage
  }
}

export const useLocale = (): Locale => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new I18nError('useLocale must be used within an I18nProvider')
  }
  return context.locale
}

export const useLocaleActions = (): Pick<I18nContextValue, 'setLocale'> => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new I18nError('useLocaleActions must be used within an I18nProvider')
  }
  return {
    setLocale: context.setLocale
  }
}