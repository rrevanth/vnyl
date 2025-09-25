import type {
  ITMDBConfigService,
  ApiConfig,
  IEnvironmentService,
  IUserPreferenceService,
  ILoggingService
} from '@/src/domain/services'
import type { TMDBSettings } from '@/src/domain/entities'
import { DEFAULT_USER_PREFERENCES } from '@/src/domain/entities'

/**
 * TMDB Configuration Service Implementation
 * Manages TMDB API configuration with full dependency injection
 * Merges user preferences, environment variables, and sensible defaults
 */
export class TMDBConfigService implements ITMDBConfigService {
  private currentConfig: ApiConfig | null = null

  constructor(
    private readonly environmentService: IEnvironmentService,
    private readonly userPreferenceService: IUserPreferenceService,
    private readonly logger: ILoggingService
  ) {
    this.logger.debug('TMDB Config Service initialized')
    this.refreshConfiguration()
  }

  getEffectiveTMDBConfig(): ApiConfig {
    if (!this.currentConfig) {
      this.refreshConfiguration()
    }

    if (!this.currentConfig) {
      throw new Error('Unable to create TMDB configuration - no valid credentials available')
    }

    return this.currentConfig
  }

  hasValidCredentials(): boolean {
    try {
      const userSettings = this.getUserTMDBSettings()
      const envBearerToken = this.environmentService.getTMDBBearerToken()
      const envApiKey = this.environmentService.getTMDBApiKey()

      return !!(
        userSettings.bearerToken ||
        userSettings.apiKey ||
        envBearerToken ||
        envApiKey
      )
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Error checking TMDB credentials', errorInstance)
      return false
    }
  }

  getAuthenticationMethod(): 'bearer' | 'apikey' | 'none' {
    try {
      const userSettings = this.getUserTMDBSettings()
      const envBearerToken = this.environmentService.getTMDBBearerToken()
      const envApiKey = this.environmentService.getTMDBApiKey()

      // Priority: User Bearer > User API Key > Env Bearer > Env API Key
      if (userSettings.bearerToken) return 'bearer'
      if (userSettings.apiKey) return 'apikey'
      if (envBearerToken) return 'bearer'
      if (envApiKey) return 'apikey'

      return 'none'
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Error determining authentication method', errorInstance)
      return 'none'
    }
  }

  getEffectiveLanguage(): string {
    try {
      const userSettings = this.getUserTMDBSettings()
      return userSettings.language || DEFAULT_USER_PREFERENCES.providerSettings.tmdbSettings.language
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Error getting effective language', errorInstance)
      return DEFAULT_USER_PREFERENCES.providerSettings.tmdbSettings.language
    }
  }

  shouldIncludeAdult(): boolean {
    try {
      const userSettings = this.getUserTMDBSettings()
      return userSettings.includeAdult ?? DEFAULT_USER_PREFERENCES.providerSettings.tmdbSettings.includeAdult
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Error getting adult content setting', errorInstance)
      return DEFAULT_USER_PREFERENCES.providerSettings.tmdbSettings.includeAdult
    }
  }

  refreshConfiguration(): void {
    try {
      this.logger.debug('Refreshing TMDB configuration')

      if (!this.hasValidCredentials()) {
        this.logger.warn('No valid TMDB credentials found')
        this.currentConfig = null
        return
      }

      const authMethod = this.getAuthenticationMethod()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Set authentication headers based on method
      if (authMethod === 'bearer') {
        const token = this.getBearerToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      } else if (authMethod === 'apikey') {
        // API key goes in query params, not headers
        // This will be handled by the API client when making requests
      }

      const config: ApiConfig = {
        baseURL: this.environmentService.getTMDBBaseUrl(),
        timeout: 10000,
        headers,
        params: {
          language: this.getEffectiveLanguage(),
          include_adult: this.shouldIncludeAdult()
        }
      }

      // Add API key to params if using API key authentication
      if (authMethod === 'apikey') {
        const apiKey = this.getApiKey()
        if (apiKey) {
          config.params!.api_key = apiKey
        }
      }

      this.currentConfig = config
      this.logger.info('TMDB configuration refreshed', {
        authMethod,
        language: this.getEffectiveLanguage(),
        includeAdult: this.shouldIncludeAdult(),
        baseURL: config.baseURL
      })

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to refresh TMDB configuration', errorInstance)
      this.currentConfig = null
    }
  }

  // IConfigClient interface methods
  getApiConfig(): ApiConfig {
    return this.getEffectiveTMDBConfig()
  }

  updateApiConfig(config: Partial<ApiConfig>): void {
    this.logger.debug('Updating TMDB API config', undefined, config)
    if (this.currentConfig) {
      this.currentConfig = {
        ...this.currentConfig,
        ...config,
        headers: {
          ...this.currentConfig.headers,
          ...config.headers
        },
        params: {
          ...this.currentConfig.params,
          ...config.params
        }
      }
    }
  }

  // Private helper methods
  private getUserTMDBSettings(): TMDBSettings {
    try {
      const preferences = this.userPreferenceService.getPreferences()
      return preferences?.providerSettings?.tmdbSettings || DEFAULT_USER_PREFERENCES.providerSettings.tmdbSettings
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Error getting user TMDB settings', errorInstance)
      return DEFAULT_USER_PREFERENCES.providerSettings.tmdbSettings
    }
  }

  private getBearerToken(): string | undefined {
    const userSettings = this.getUserTMDBSettings()
    return userSettings.bearerToken || this.environmentService.getTMDBBearerToken()
  }

  private getApiKey(): string | undefined {
    const userSettings = this.getUserTMDBSettings()
    return userSettings.apiKey || this.environmentService.getTMDBApiKey()
  }
}