import { useCallback } from 'react'
import { useTheme, useThemeActions as useBaseThemeActions } from '@/src/presentation/shared/theme'
import { useUpdateUserThemeUseCase } from '@/src/infrastructure/di'
import { useThemePreference, updateUserPreferencesState } from '@/src/presentation/shared/providers'
import type { ThemePreference } from '@/src/domain/entities'

export const useThemeActions = () => {
  const { setThemeMode, toggleTheme } = useBaseThemeActions()
  const updateUserThemeUseCase = useUpdateUserThemeUseCase()
  const currentThemePreference = useThemePreference()

  const setDarkMode = useCallback(async (enabled: boolean) => {
    try {
      await setThemeMode(enabled ? 'dark' : 'light')
    } catch (error) {
      console.warn('Failed to set dark mode:', error)
    }
  }, [setThemeMode])

  const setSystemMode = useCallback(async () => {
    try {
      await setThemeMode('light') // Default to light until system detection is implemented
    } catch (error) {
      console.warn('Failed to set system mode:', error)
    }
  }, [setThemeMode])

  const setAccentColor = useCallback(async (color: string) => {
    try {
      const updatedPreference: ThemePreference = {
        ...currentThemePreference,
        accentColor: color
      }

      // Update local state optimistically
      updateUserPreferencesState({
        theme: updatedPreference
      })

      // Persist to backend
      await updateUserThemeUseCase.execute(updatedPreference)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        theme: currentThemePreference
      })
      console.warn('Failed to set accent color:', error)
    }
  }, [currentThemePreference, updateUserThemeUseCase])

  const setHighContrast = useCallback(async (enabled: boolean) => {
    try {
      const updatedPreference: ThemePreference = {
        ...currentThemePreference,
        highContrast: enabled
      }

      // Update local state optimistically
      updateUserPreferencesState({
        theme: updatedPreference
      })

      // Persist to backend
      await updateUserThemeUseCase.execute(updatedPreference)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        theme: currentThemePreference
      })
      console.warn('Failed to set high contrast:', error)
    }
  }, [currentThemePreference, updateUserThemeUseCase])

  const setAdaptToContent = useCallback(async (enabled: boolean) => {
    try {
      const updatedPreference: ThemePreference = {
        ...currentThemePreference,
        adaptToContent: enabled
      }

      // Update local state optimistically
      updateUserPreferencesState({
        theme: updatedPreference
      })

      // Persist to backend
      await updateUserThemeUseCase.execute(updatedPreference)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        theme: currentThemePreference
      })
      console.warn('Failed to set adapt to content:', error)
    }
  }, [currentThemePreference, updateUserThemeUseCase])

  return {
    // Base actions
    setThemeMode,
    toggleTheme,
    setDarkMode,
    setSystemMode,

    // Extended actions
    setAccentColor,
    setHighContrast,
    setAdaptToContent
  }
}