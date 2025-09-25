import { useCallback } from 'react'
import { updateUserPreferencesState, useUserPreferences } from '@/src/presentation/shared/providers/user-preferences-provider'
import type { ThemePreference, DisplaySettings, FontSize } from '@/src/domain/entities'

export const useSettingsActions = () => {
  const userPreferences = useUserPreferences()

  // Theme actions
  const updateThemeMode = useCallback(async (mode: ThemePreference['mode']) => {
    const updatedTheme: ThemePreference = {
      ...userPreferences.themePreference,
      mode
    }

    // Update local state immediately for instant UI response
    await updateUserPreferencesState({ theme: updatedTheme })
  }, [userPreferences.themePreference])

  const updateAccentColor = useCallback(async (accentColor: string) => {
    const updatedTheme: ThemePreference = {
      ...userPreferences.themePreference,
      accentColor
    }

    // Update local state immediately for instant UI response
    await updateUserPreferencesState({ theme: updatedTheme })
  }, [userPreferences.themePreference])

  // Display settings actions
  const updateFontSize = useCallback(async (fontSize: FontSize) => {
    const updatedDisplaySettings: DisplaySettings = {
      ...userPreferences.displaySettings,
      fontSize
    }

    // Update local state immediately for instant UI response
    await updateUserPreferencesState({ displaySettings: updatedDisplaySettings })
  }, [userPreferences.displaySettings])

  const updateFontFamily = useCallback(async (fontFamily: string) => {
    const updatedDisplaySettings: DisplaySettings = {
      ...userPreferences.displaySettings,
      fontFamily
    }

    // Update local state immediately for instant UI response
    await updateUserPreferencesState({ displaySettings: updatedDisplaySettings })
  }, [userPreferences.displaySettings])

  const updateLineHeight = useCallback(async (lineHeight: number) => {
    const updatedDisplaySettings: DisplaySettings = {
      ...userPreferences.displaySettings,
      lineHeight
    }

    // Update local state immediately for instant UI response
    await updateUserPreferencesState({ displaySettings: updatedDisplaySettings })
  }, [userPreferences.displaySettings])

  const updateCompactMode = useCallback(async (compactMode: boolean) => {
    const updatedDisplaySettings: DisplaySettings = {
      ...userPreferences.displaySettings,
      compactMode
    }

    // Update local state immediately for instant UI response
    await updateUserPreferencesState({ displaySettings: updatedDisplaySettings })
  }, [userPreferences.displaySettings])

  return {
    // Theme actions
    updateThemeMode,
    updateAccentColor,

    // Display settings actions
    updateFontSize,
    updateFontFamily,
    updateLineHeight,
    updateCompactMode,

    // Current values (for convenience)
    themePreference: userPreferences.themePreference,
    displaySettings: userPreferences.displaySettings
  }
}