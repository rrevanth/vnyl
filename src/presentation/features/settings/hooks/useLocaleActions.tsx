import { useCallback } from 'react'
import { useLocaleActions as useBaseLocaleActions } from '@/src/presentation/shared/i18n'
import { useUpdateUserLocaleUseCase } from '@/src/infrastructure/di'
import { useLocalePreferences, updateUserPreferencesState } from '@/src/presentation/shared/providers'
import type { LocalePreferences } from '@/src/domain/entities'
import type { Locale } from '@/src/presentation/shared/i18n'

export const useLocaleActions = () => {
  const { setLocale } = useBaseLocaleActions()
  const updateUserLocaleUseCase = useUpdateUserLocaleUseCase()
  const currentLocalePreferences = useLocalePreferences()

  const setLanguage = useCallback(async (language: Locale) => {
    try {
      await setLocale(language)
    } catch (error) {
      console.warn('Failed to set language:', error)
    }
  }, [setLocale])

  const setRegion = useCallback(async (region: string) => {
    try {
      const updatedPreferences: LocalePreferences = {
        ...currentLocalePreferences,
        region
      }

      // Update local state optimistically
      updateUserPreferencesState({
        locale: updatedPreferences
      })

      // Persist to backend
      await updateUserLocaleUseCase.execute(updatedPreferences)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        locale: currentLocalePreferences
      })
      console.warn('Failed to update region:', error)
    }
  }, [updateUserLocaleUseCase, currentLocalePreferences])

  const setDateFormat = useCallback(async (dateFormat: 'iso' | 'us' | 'eu') => {
    try {
      const updatedPreferences: LocalePreferences = {
        ...currentLocalePreferences,
        dateFormat
      }

      // Update local state optimistically
      updateUserPreferencesState({
        locale: updatedPreferences
      })

      // Persist to backend
      await updateUserLocaleUseCase.execute(updatedPreferences)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        locale: currentLocalePreferences
      })
      console.warn('Failed to update date format:', error)
    }
  }, [updateUserLocaleUseCase, currentLocalePreferences])

  const setTimeFormat = useCallback(async (timeFormat: '12h' | '24h') => {
    try {
      const updatedPreferences: LocalePreferences = {
        ...currentLocalePreferences,
        timeFormat
      }

      // Update local state optimistically
      updateUserPreferencesState({
        locale: updatedPreferences
      })

      // Persist to backend
      await updateUserLocaleUseCase.execute(updatedPreferences)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        locale: currentLocalePreferences
      })
      console.warn('Failed to update time format:', error)
    }
  }, [updateUserLocaleUseCase, currentLocalePreferences])

  const setCurrency = useCallback(async (currency: string) => {
    try {
      const updatedPreferences: LocalePreferences = {
        ...currentLocalePreferences,
        currency
      }

      // Update local state optimistically
      updateUserPreferencesState({
        locale: updatedPreferences
      })

      // Persist to backend
      await updateUserLocaleUseCase.execute(updatedPreferences)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        locale: currentLocalePreferences
      })
      console.warn('Failed to update currency:', error)
    }
  }, [updateUserLocaleUseCase, currentLocalePreferences])

  return {
    // Base actions
    setLocale,
    setLanguage,

    // Extended actions
    setRegion,
    setDateFormat,
    setTimeFormat,
    setCurrency
  }
}