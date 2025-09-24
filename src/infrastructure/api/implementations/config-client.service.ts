import { ApiConfig, IConfigClient, ILoggingService, IUserPreferenceService } from '@/src/domain/services'

export class ConfigClient implements IConfigClient {
  private config: ApiConfig

  constructor(
    initialConfig: ApiConfig,
    private readonly logger: ILoggingService,
    private readonly userPreferenceService: IUserPreferenceService
  ) {
    this.config = { ...initialConfig }
    this.logger.info('Config client initialized', {
      baseURL: initialConfig.baseURL,
      hasPreferenceService: !!userPreferenceService
    })
  }

  getApiConfig(): ApiConfig {
    this.logger.debug('Retrieved base API config')
    return { ...this.config }
  }

  /**
   * Get TMDB-specific API configuration with full TMDB settings
   */
  getTMDBConfig(): ApiConfig {
    const tmdbConfig = this.userPreferenceService.getTMDBConfig()

    const tmdbSpecificConfig: ApiConfig = {
      baseURL: 'https://api.themoviedb.org/3',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    // Add Bearer token (Read Access Token) if available
    if (tmdbConfig.bearerToken) {
      tmdbSpecificConfig.headers = {
        ...tmdbSpecificConfig.headers,
        'Authorization': `Bearer ${tmdbConfig.bearerToken}`
      }
    }

    // Add language preference
    if (tmdbConfig.language) {
      tmdbSpecificConfig.headers = {
        ...tmdbSpecificConfig.headers,
        'Accept-Language': tmdbConfig.language
      }
    }

    // Add default query parameters for all TMDB requests
    tmdbSpecificConfig.params = {
      language: tmdbConfig.language,
      region: tmdbConfig.region,
      include_adult: tmdbConfig.includeAdult
    }

    this.logger.debug('Generated TMDB-specific configuration', undefined, {
      hasBearerToken: !!tmdbConfig.bearerToken,
      hasApiKey: !!tmdbConfig.apiKey,
      language: tmdbConfig.language,
      region: tmdbConfig.region,
      includeAdult: tmdbConfig.includeAdult
    })

    return tmdbSpecificConfig
  }

  /**
   * Check if TMDB is properly configured
   */
  isTMDBConfigured(): boolean {
    return this.userPreferenceService.isTMDBConfigured()
  }

  /**
   * Get TMDB configuration status for validation
   */
  getTMDBConfigurationStatus(): {
    hasApiKey: boolean
    hasBearerToken: boolean
    isComplete: boolean
    language: string
    region: string
    includeAdult: boolean
  } {
    const tmdbConfig = this.userPreferenceService.getTMDBConfig()

    return {
      hasApiKey: !!tmdbConfig.apiKey,
      hasBearerToken: !!tmdbConfig.bearerToken,
      isComplete: !!(tmdbConfig.apiKey && tmdbConfig.bearerToken),
      language: tmdbConfig.language,
      region: tmdbConfig.region,
      includeAdult: tmdbConfig.includeAdult
    }
  }

  updateApiConfig(config: Partial<ApiConfig>): void {
    this.logger.info('Updating base API config', config)
    this.config = {
      ...this.config,
      ...config,
      headers: {
        ...this.config.headers,
        ...config.headers
      }
    }
    this.logger.debug('Base API config updated successfully')
  }
}