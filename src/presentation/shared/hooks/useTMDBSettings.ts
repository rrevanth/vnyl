import { useCallback, useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useUserPreferences } from '@/src/presentation/shared/providers/user-preferences-provider'
import { useUpdateUserPreferencesUseCase } from '@/src/infrastructure/di'
import type { TMDBSettings } from '@/src/domain/entities'
import { DEFAULT_TMDB_SETTINGS } from '@/src/domain/entities'

/**
 * Hook for managing TMDB settings with user preference integration
 * 
 * Provides state management, validation, and persistence for TMDB API configuration.
 * Integrates with user preference service for persistent storage.
 */
export const useTMDBSettings = () => {
  const { t } = useTranslation()
  const userPreferencesContext = useUserPreferences()
  const updateUserPreferencesUseCase = useUpdateUserPreferencesUseCase()
  const [settings, setSettings] = useState<TMDBSettings>(DEFAULT_TMDB_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  /**
   * Update TMDB settings with validation
   */
  const updateSettings = useCallback((newSettings: Partial<TMDBSettings>) => {
    setSettings(current => ({ ...current, ...newSettings }))
  }, [])

  /**
   * Save settings to user preferences with persistent storage
   */
  const saveSettings = useCallback(async (settingsToSave?: TMDBSettings) => {
    const targetSettings = settingsToSave || settings
    setIsSaving(true)
    try {
      // Update local settings if different settings were passed
      if (settingsToSave) {
        setSettings(settingsToSave)
      }
      
      // Get current provider settings and update TMDB settings
      const currentProviderSettings = userPreferencesContext.preferences.providerSettings || {}
      const updatedProviderSettings = {
        ...currentProviderSettings,
        tmdb: targetSettings
      }
      
      // Save to persistent storage through user preferences use case
      await updateUserPreferencesUseCase.execute({
        providerSettings: updatedProviderSettings
      })
      
      // Refresh the provider to get updated state
      await userPreferencesContext.refresh()
      
      return true
    } catch (error) {
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [settings, userPreferencesContext, updateUserPreferencesUseCase])

  /**
   * Test TMDB API connection
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!settings.apiKey && !settings.bearerToken) {
      Alert.alert(
        t('common.error'),
        t('settings.providers.tmdb.validation.api_key_required'),
        [{ text: t('common.close') }]
      )
      return false
    }

    setIsTesting(true)
    
    try {
      // TODO: Implement actual TMDB API test
      // This would make a simple API call to validate credentials
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      // For now, we'll simulate success if credentials are provided
      const hasCredentials = !!(settings.apiKey || settings.bearerToken)
      return hasCredentials
    } catch {
      return false
    } finally {
      setIsTesting(false)
    }
  }, [settings, t])

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_TMDB_SETTINGS })
    
    Alert.alert(
      t('settings.providers.tmdb.reset_settings'),
      t('settings.providers.tmdb.validation.settings_reset'),
      [{ text: t('common.close') }]
    )
  }, [t])

  /**
   * Load settings from user preferences persistent storage
   */
  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      // Load TMDB settings from user preferences provider
      const tmdbSettings = userPreferencesContext.preferences.providerSettings?.tmdb
      
      if (tmdbSettings) {
        setSettings(tmdbSettings)
      } else {
        // Use defaults if no saved settings
        setSettings({ ...DEFAULT_TMDB_SETTINGS })
      }
    } catch {
      // Fallback to defaults on error
      setSettings({ ...DEFAULT_TMDB_SETTINGS })
    } finally {
      setIsLoading(false)
    }
  }, [userPreferencesContext.preferences.providerSettings])

  /**
   * Validate API key format
   */
  const validateApiKey = useCallback((apiKey: string): boolean => {
    // TMDB API keys are typically 32 characters of alphanumeric characters
    const apiKeyRegex = /^[a-zA-Z0-9]{32}$/
    return apiKeyRegex.test(apiKey)
  }, [])

  /**
   * Validate bearer token format
   */
  const validateBearerToken = useCallback((token: string): boolean => {
    // TMDB bearer tokens start with "eyJ" and are JWT format
    return token.startsWith('eyJ') && token.length > 100
  }, [])

  // Load settings on mount and when user preferences change
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    // State
    settings,
    isLoading,
    isTesting,
    isSaving,
    
    // Actions
    updateSettings,
    saveSettings,
    testConnection,
    resetSettings,
    loadSettings,
    
    // Validation
    validateApiKey,
    validateBearerToken,
    
    // Computed
    isConfigured: !!(settings.apiKey || settings.bearerToken),
    canTest: !!(settings.apiKey || settings.bearerToken) && !isTesting
  }
}