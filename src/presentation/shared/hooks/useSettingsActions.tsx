import { useCallback } from 'react'
import { useUserPreferences } from '@/src/presentation/shared/providers/user-preferences-provider'
import { useUpdateUserPreferencesUseCase } from '@/src/infrastructure/di'
import type { ThemePreference, DisplaySettings, FontSize } from '@/src/domain/entities'

export const useSettingsActions = () => {
  const userPreferencesContext = useUserPreferences()
  const updateUserPreferencesUseCase = useUpdateUserPreferencesUseCase()

  // Theme actions
  const updateThemeMode = useCallback(async (mode: ThemePreference['mode']) => {
    try {
      console.log('🎨 Settings: Updating theme mode to:', mode)

      const updatedTheme: ThemePreference = {
        ...userPreferencesContext.themePreference,
        mode
      }

      console.log('💾 Settings: Saving theme preferences through domain layer:', updatedTheme)
      await updateUserPreferencesUseCase.execute({ theme: updatedTheme })
      console.log('✅ Settings: Theme mode updated successfully')

      // Refresh the provider to get updated state
      await userPreferencesContext.refresh()
      console.log('🔄 Settings: Provider state refreshed after theme mode update')
    } catch (error) {
      console.error('❌ Settings: Failed to update theme mode', error)
      throw error
    }
  }, [userPreferencesContext, updateUserPreferencesUseCase])

  const updateAccentColor = useCallback(async (accentColor: string) => {
    try {
      console.log('🌈 Settings: Updating accent color to:', accentColor)

      const updatedTheme: ThemePreference = {
        ...userPreferencesContext.themePreference,
        accentColor
      }

      console.log('💾 Settings: Saving accent color through domain layer:', updatedTheme)
      await updateUserPreferencesUseCase.execute({ theme: updatedTheme })
      console.log('✅ Settings: Accent color updated successfully')

      // Refresh the provider to get updated state
      await userPreferencesContext.refresh()
      console.log('🔄 Settings: Provider state refreshed after accent color update')
    } catch (error) {
      console.error('❌ Settings: Failed to update accent color', error)
      throw error
    }
  }, [userPreferencesContext, updateUserPreferencesUseCase])

  // Display settings actions
  const updateFontSize = useCallback(async (fontSize: FontSize) => {
    try {
      console.log('📏 Settings: Updating font size to:', fontSize)

      const updatedDisplaySettings: DisplaySettings = {
        ...userPreferencesContext.displaySettings,
        fontSize
      }

      console.log('💾 Settings: Saving display settings through domain layer:', updatedDisplaySettings)
      await updateUserPreferencesUseCase.execute({ displaySettings: updatedDisplaySettings })
      console.log('✅ Settings: Font size updated successfully')

      // Refresh the provider to get updated state
      await userPreferencesContext.refresh()
      console.log('🔄 Settings: Provider state refreshed after font size update')
    } catch (error) {
      console.error('❌ Settings: Failed to update font size', error)
      throw error
    }
  }, [userPreferencesContext, updateUserPreferencesUseCase])

  const updateFontFamily = useCallback(async (fontFamily: string) => {
    try {
      console.log('🔤 Settings: Updating font family to:', fontFamily)

      const updatedDisplaySettings: DisplaySettings = {
        ...userPreferencesContext.displaySettings,
        fontFamily
      }

      console.log('💾 Settings: Saving display settings through domain layer:', updatedDisplaySettings)
      await updateUserPreferencesUseCase.execute({ displaySettings: updatedDisplaySettings })
      console.log('✅ Settings: Font family updated successfully')

      // Refresh the provider to get updated state
      await userPreferencesContext.refresh()
      console.log('🔄 Settings: Provider state refreshed after font family update')
    } catch (error) {
      console.error('❌ Settings: Failed to update font family', error)
      throw error
    }
  }, [userPreferencesContext, updateUserPreferencesUseCase])

  const updateLineHeight = useCallback(async (lineHeight: number) => {
    try {
      console.log('📐 Settings: Updating line height to:', lineHeight)

      const updatedDisplaySettings: DisplaySettings = {
        ...userPreferencesContext.displaySettings,
        lineHeight
      }

      console.log('💾 Settings: Saving display settings through domain layer:', updatedDisplaySettings)
      await updateUserPreferencesUseCase.execute({ displaySettings: updatedDisplaySettings })
      console.log('✅ Settings: Line height updated successfully')

      // Refresh the provider to get updated state
      await userPreferencesContext.refresh()
      console.log('🔄 Settings: Provider state refreshed after line height update')
    } catch (error) {
      console.error('❌ Settings: Failed to update line height', error)
      throw error
    }
  }, [userPreferencesContext, updateUserPreferencesUseCase])

  const updateCompactMode = useCallback(async (compactMode: boolean) => {
    try {
      console.log('📱 Settings: Updating compact mode to:', compactMode)

      const updatedDisplaySettings: DisplaySettings = {
        ...userPreferencesContext.displaySettings,
        compactMode
      }

      console.log('💾 Settings: Saving display settings through domain layer:', updatedDisplaySettings)
      await updateUserPreferencesUseCase.execute({ displaySettings: updatedDisplaySettings })
      console.log('✅ Settings: Compact mode updated successfully')

      // Refresh the provider to get updated state
      await userPreferencesContext.refresh()
      console.log('🔄 Settings: Provider state refreshed after compact mode update')
    } catch (error) {
      console.error('❌ Settings: Failed to update compact mode', error)
      throw error
    }
  }, [userPreferencesContext, updateUserPreferencesUseCase])

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
    themePreference: userPreferencesContext.themePreference,
    displaySettings: userPreferencesContext.displaySettings
  }
}