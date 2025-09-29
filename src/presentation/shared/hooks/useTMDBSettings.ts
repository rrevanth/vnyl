import { useCallback, useState, useEffect } from 'react'
import { useTranslation } from '@/src/presentation/shared/i18n'
import { useUserPreferences } from '@/src/presentation/shared/providers/user-preferences-provider'
import { useUpdateUserPreferencesUseCase, useSafeLogging } from '@/src/infrastructure/di'
import { createHttpClient } from '@/src/infrastructure/api/tmdb/base/http.client'
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
  const logger = useSafeLogging()
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
   * Test TMDB API connection with user's custom credentials
   * Only tests if user has provided custom credentials (API key or bearer token)
   */
  const testConnection = useCallback(async (testSettings?: Partial<TMDBSettings>): Promise<boolean> => {
    const credentialsToTest = testSettings || settings
    
    // Only test if user has provided API key (TMDB v3 only supports API key authentication)
    if (!credentialsToTest.apiKey) {
      throw new Error(t('settings.providers.tmdb.validation.no_custom_credentials'))
    }

    setIsTesting(true)
    
    try {
      // Create a temporary HTTP client with custom credentials for testing
      const testConfig: any = {
        baseURL: 'https://api.themoviedb.org/3',
        timeout: 10000,
        defaultHeaders: {} as Record<string, string>
      }
      
      // Only add logger if available
      if (logger) {
        testConfig.logger = logger
      }
      
      // TMDB v3 API does not support Bearer token authentication
      // All authentication is done via api_key query parameter
      
      const testClient = createHttpClient(testConfig)
      
      // Prepare test endpoint and parameters
      const endpoint = '/configuration'
      const params: Record<string, any> = {}
      
      // TMDB v3 API always uses api_key query parameter for authentication
      params.api_key = credentialsToTest.apiKey
      
      // Test the connection by calling the configuration endpoint
      await testClient.get(endpoint, { params })
      
      // If we get here without throwing, the API call was successful
      return true
    } catch (error) {
      // Handle specific API errors
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      const isAuthError = errorInstance.message.includes('401') || errorInstance.message.includes('Unauthorized') || errorInstance.message.includes('Invalid API key')
      
      if (isAuthError) {
        throw new Error(t('settings.providers.tmdb.validation.invalid_credentials'))
      } else {
        throw new Error(t('settings.providers.tmdb.validation.connection_failed'))
      }
    } finally {
      setIsTesting(false)
    }
  }, [settings, logger, t])

  /**
   * Test connection and save settings if successful
   */
  const testAndSaveSettings = useCallback(async (settingsToSave?: TMDBSettings): Promise<boolean> => {
    const targetSettings = settingsToSave || settings
    
    try {
      // First test the connection with the provided settings (if custom credentials exist)
      if (targetSettings.apiKey) {
        await testConnection(targetSettings)
      }
      
      // If test passes (or no custom credentials), save the settings
      await saveSettings(targetSettings)
      return true
    } catch (error) {
      // Re-throw the error to be handled by the UI
      throw error
    }
  }, [testConnection, saveSettings, settings])

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_TMDB_SETTINGS })
  }, [])

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
    } catch (error) {
      // Fallback to defaults on error
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      logger?.warn('Failed to load TMDB settings from user preferences, using defaults', errorInstance, {
        context: 'tmdb_settings_load',
        hasProviderSettings: !!userPreferencesContext.preferences.providerSettings
      })
      setSettings({ ...DEFAULT_TMDB_SETTINGS })
    } finally {
      setIsLoading(false)
    }
  }, [userPreferencesContext.preferences.providerSettings, logger])

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
    testAndSaveSettings,
    resetSettings,
    loadSettings,
    
    // Validation
    validateApiKey,
    validateBearerToken,
    
    // Computed
    isConfigured: !!settings.apiKey,
    canTest: !!settings.apiKey && !isTesting
  }
}