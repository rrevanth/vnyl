import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from '@/src/presentation/shared/i18n'
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
  const [settings, setSettings] = useState<TMDBSettings>(DEFAULT_TMDB_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  /**
   * Update TMDB settings with validation
   */
  const updateSettings = useCallback((newSettings: Partial<TMDBSettings>) => {
    setSettings(current => ({ ...current, ...newSettings }))
  }, [])

  /**
   * Save settings to user preferences
   */
  const saveSettings = useCallback(async (settingsToSave?: TMDBSettings) => {
    const targetSettings = settingsToSave || settings
    setIsSaving(true)
    try {
      // Update local settings if different settings were passed
      if (settingsToSave) {
        setSettings(settingsToSave)
      }
      
      // TODO: Integrate with user preference service to save settings
      // await userPreferenceService.updateTMDBSettings(targetSettings)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [settings])

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
    } catch (error) {
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
   * Load settings from user preferences
   */
  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      // TODO: Load from user preference service
      // const userSettings = await userPreferenceService.getTMDBSettings()
      // setSettings(userSettings)
    } catch (error) {
      // Fallback to defaults on error
      setSettings({ ...DEFAULT_TMDB_SETTINGS })
    } finally {
      setIsLoading(false)
    }
  }, [])

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