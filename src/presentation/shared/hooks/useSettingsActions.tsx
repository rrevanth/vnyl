import { useCallback } from 'react'
import { useUserPreferences } from '@/src/presentation/shared/providers/user-preferences-provider'
import { useUpdateUserPreferencesUseCase } from '@/src/infrastructure/di'
import { SettingsLogger } from '@/src/presentation/shared/utils/settings-logger'
import type { ThemePreference, DisplaySettings, FontSize, UserPreferences } from '@/src/domain/entities'
import { DEFAULT_USER_PREFERENCES } from '@/src/domain/entities'

export const useSettingsActions = () => {
  const userPreferencesContext = useUserPreferences()
  const updateUserPreferencesUseCase = useUpdateUserPreferencesUseCase()

  // Generic update function to reduce repetition
  const updatePreferences = useCallback(async (
    preferences: Partial<UserPreferences>,
    actionName: string,
    logData?: Record<string, any>
  ) => {
    try {
      SettingsLogger.start(actionName, logData)
      SettingsLogger.saving(preferences)

      await updateUserPreferencesUseCase.execute(preferences)
      SettingsLogger.success(actionName)

      // Refresh the provider to get updated state
      await userPreferencesContext.refresh()
      SettingsLogger.refresh(actionName)
    } catch (error) {
      SettingsLogger.error(actionName, error)
      throw error
    }
  }, [updateUserPreferencesUseCase, userPreferencesContext])

  // Theme actions using typed logging
  const updateThemeMode = useCallback(async (mode: ThemePreference['mode']) => {
    const updatedTheme: ThemePreference = {
      ...userPreferencesContext.themePreference,
      mode
    }
    await updatePreferences(
      { theme: updatedTheme },
      'theme mode update',
      { mode }
    )
  }, [userPreferencesContext.themePreference, updatePreferences])

  const updateAccentColor = useCallback(async (accentColor: string) => {
    const updatedTheme: ThemePreference = {
      ...userPreferencesContext.themePreference,
      accentColor
    }
    await updatePreferences(
      { theme: updatedTheme },
      'accent color update',
      { accentColor }
    )
  }, [userPreferencesContext.themePreference, updatePreferences])

  // Display settings actions
  const updateFontSize = useCallback(async (fontSize: FontSize) => {
    const updatedDisplaySettings: DisplaySettings = {
      ...userPreferencesContext.displaySettings,
      fontSize
    }
    await updatePreferences(
      { displaySettings: updatedDisplaySettings },
      'font size update',
      { fontSize }
    )
  }, [userPreferencesContext.displaySettings, updatePreferences])

  const updateFontFamily = useCallback(async (fontFamily: string) => {
    const updatedDisplaySettings: DisplaySettings = {
      ...userPreferencesContext.displaySettings,
      fontFamily
    }
    await updatePreferences(
      { displaySettings: updatedDisplaySettings },
      'font family update',
      { fontFamily }
    )
  }, [userPreferencesContext.displaySettings, updatePreferences])

  const updateLineHeight = useCallback(async (lineHeight: number) => {
    const updatedDisplaySettings: DisplaySettings = {
      ...userPreferencesContext.displaySettings,
      lineHeight
    }
    await updatePreferences(
      { displaySettings: updatedDisplaySettings },
      'line height update',
      { lineHeight }
    )
  }, [userPreferencesContext.displaySettings, updatePreferences])

  const updateCompactMode = useCallback(async (compactMode: boolean) => {
    const updatedDisplaySettings: DisplaySettings = {
      ...userPreferencesContext.displaySettings,
      compactMode
    }
    await updatePreferences(
      { displaySettings: updatedDisplaySettings },
      'compact mode update',
      { compactMode }
    )
  }, [userPreferencesContext.displaySettings, updatePreferences])

  // Provider settings actions
  const updateProviderSettings = useCallback(async (providerUpdate: Partial<UserPreferences['providerSettings']>) => {
    const currentProviderSettings = userPreferencesContext.preferences.providerSettings || DEFAULT_USER_PREFERENCES.providerSettings
    const updatedProviderSettings = {
      ...currentProviderSettings,
      ...providerUpdate
    }
    await updatePreferences(
      { providerSettings: updatedProviderSettings },
      'provider settings update',
      providerUpdate
    )
  }, [userPreferencesContext.preferences.providerSettings, updatePreferences])

  const updateTMDBSettings = useCallback(async (tmdbUpdate: Partial<UserPreferences['providerSettings']['tmdbSettings']>) => {
    const currentTMDBSettings = userPreferencesContext.preferences.providerSettings?.tmdbSettings || DEFAULT_USER_PREFERENCES.providerSettings.tmdbSettings
    const updatedTMDBSettings = {
      ...currentTMDBSettings,
      ...tmdbUpdate
    }
    await updateProviderSettings({
      tmdbSettings: updatedTMDBSettings
    })
  }, [userPreferencesContext.preferences.providerSettings?.tmdbSettings, updateProviderSettings])

  // Generic update functions for reusability
  const updateThemePreference = useCallback(async (themeUpdate: Partial<ThemePreference>) => {
    const updatedTheme: ThemePreference = {
      ...userPreferencesContext.themePreference,
      ...themeUpdate
    }
    await updatePreferences(
      { theme: updatedTheme },
      'theme preference update',
      themeUpdate
    )
  }, [userPreferencesContext.themePreference, updatePreferences])

  const updateDisplaySettings = useCallback(async (displayUpdate: Partial<DisplaySettings>) => {
    const updatedDisplaySettings: DisplaySettings = {
      ...userPreferencesContext.displaySettings,
      ...displayUpdate
    }
    await updatePreferences(
      { displaySettings: updatedDisplaySettings },
      'display settings update',
      displayUpdate
    )
  }, [userPreferencesContext.displaySettings, updatePreferences])

  return {
    // Specific actions
    updateThemeMode,
    updateAccentColor,
    updateFontSize,
    updateFontFamily,
    updateLineHeight,
    updateCompactMode,

    // Provider settings actions
    updateProviderSettings,
    updateTMDBSettings,

    // Generic update functions for advanced usage
    updateThemePreference,
    updateDisplaySettings,
    updatePreferences,

    // Current values (for convenience)
    themePreference: userPreferencesContext.themePreference,
    displaySettings: userPreferencesContext.displaySettings,
    preferences: userPreferencesContext.preferences
  }
}