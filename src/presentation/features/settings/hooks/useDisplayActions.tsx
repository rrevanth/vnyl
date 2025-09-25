import { useCallback } from 'react'
import { useUpdateUserDisplaySettingsUseCase } from '@/src/infrastructure/di'
import { useDisplaySettings, updateUserPreferencesState } from '@/src/presentation/shared/providers'
import type { DisplaySettings, FontSize } from '@/src/domain/entities'

export const useDisplayActions = () => {
  const updateUserDisplaySettingsUseCase = useUpdateUserDisplaySettingsUseCase()
  const currentDisplaySettings = useDisplaySettings()

  const setFontSize = useCallback(async (fontSize: FontSize) => {
    try {
      const updatedSettings: DisplaySettings = {
        ...currentDisplaySettings,
        fontSize
      }

      // Update local state optimistically
      updateUserPreferencesState({
        displaySettings: updatedSettings
      })

      // Persist to backend
      await updateUserDisplaySettingsUseCase.execute(updatedSettings)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        displaySettings: currentDisplaySettings
      })
      console.warn('Failed to update font size:', error)
    }
  }, [updateUserDisplaySettingsUseCase, currentDisplaySettings])

  const setFontFamily = useCallback(async (fontFamily: string) => {
    try {
      const updatedSettings: DisplaySettings = {
        ...currentDisplaySettings,
        fontFamily
      }

      // Update local state optimistically
      updateUserPreferencesState({
        displaySettings: updatedSettings
      })

      // Persist to backend
      await updateUserDisplaySettingsUseCase.execute(updatedSettings)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        displaySettings: currentDisplaySettings
      })
      console.warn('Failed to update font family:', error)
    }
  }, [updateUserDisplaySettingsUseCase, currentDisplaySettings])

  const setLineHeight = useCallback(async (lineHeight: number) => {
    try {
      const updatedSettings: DisplaySettings = {
        ...currentDisplaySettings,
        lineHeight
      }

      // Update local state optimistically
      updateUserPreferencesState({
        displaySettings: updatedSettings
      })

      // Persist to backend
      await updateUserDisplaySettingsUseCase.execute(updatedSettings)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        displaySettings: currentDisplaySettings
      })
      console.warn('Failed to update line height:', error)
    }
  }, [updateUserDisplaySettingsUseCase, currentDisplaySettings])

  const setCompactMode = useCallback(async (enabled: boolean) => {
    try {
      const updatedSettings: DisplaySettings = {
        ...currentDisplaySettings,
        compactMode: enabled
      }

      // Update local state optimistically
      updateUserPreferencesState({
        displaySettings: updatedSettings
      })

      // Persist to backend
      await updateUserDisplaySettingsUseCase.execute(updatedSettings)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        displaySettings: currentDisplaySettings
      })
      console.warn('Failed to update compact mode:', error)
    }
  }, [updateUserDisplaySettingsUseCase, currentDisplaySettings])

  const setAnimationScale = useCallback(async (scale: number) => {
    try {
      const updatedSettings: DisplaySettings = {
        ...currentDisplaySettings,
        animationScale: scale
      }

      // Update local state optimistically
      updateUserPreferencesState({
        displaySettings: updatedSettings
      })

      // Persist to backend
      await updateUserDisplaySettingsUseCase.execute(updatedSettings)
    } catch (error) {
      // Rollback optimistic update on error
      updateUserPreferencesState({
        displaySettings: currentDisplaySettings
      })
      console.warn('Failed to update animation scale:', error)
    }
  }, [updateUserDisplaySettingsUseCase, currentDisplaySettings])

  return {
    setFontSize,
    setFontFamily,
    setLineHeight,
    setCompactMode,
    setAnimationScale
  }
}