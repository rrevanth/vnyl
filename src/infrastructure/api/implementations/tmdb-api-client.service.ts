import { IApiClient, ApiConfig, ApiResponse, ILoggingService, IUserPreferenceService } from '@/src/domain/services'
import { AxiosApiClient } from './axios-api-client.service'

/**
 * TMDB-specific API client with automatic configuration from user preferences
 */
export class TMDBApiClient {
  private baseClient: IApiClient
  private tmdbBaseURL = 'https://api.themoviedb.org/3'

  constructor(
    private readonly logger: ILoggingService,
    private readonly userPreferenceService: IUserPreferenceService
  ) {
    // Initialize with TMDB-specific configuration
    const tmdbConfig = this.buildTMDBConfig()
    this.baseClient = new AxiosApiClient(tmdbConfig, logger)

    this.logger.info('TMDB API client initialized', {
      baseURL: this.tmdbBaseURL,
      isConfigured: this.isConfigured(),
      language: this.userPreferenceService.getTMDBLanguage(),
      region: this.userPreferenceService.getTMDBRegion()
    })
  }

  /**
   * Build TMDB-specific API configuration from user preferences
   * Prioritizes Bearer token over API key as per TMDB best practices
   */
  private buildTMDBConfig(): ApiConfig {
    const tmdbConfig = this.userPreferenceService.getTMDBConfig()

    const config: ApiConfig = {
      baseURL: this.tmdbBaseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    // Prioritize Bearer token (Read Access Token) over API key
    if (tmdbConfig.bearerToken) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${tmdbConfig.bearerToken}`
      }
      this.logger.debug('Using Bearer token for TMDB authentication')
    } else {
      // Use effective API key (user preference or environment default)
      const effectiveApiKey = this.userPreferenceService.getEffectiveTMDBApiKey()
      if (effectiveApiKey) {
        config.params = {
          api_key: effectiveApiKey
        }
        this.logger.debug('Using API key for TMDB authentication', undefined, {
          isDefaultKey: !tmdbConfig.apiKey,
          hasUserKey: !!tmdbConfig.apiKey
        })
      } else {
        this.logger.warn('No TMDB authentication method configured')
      }
    }

    // Add language preference
    if (tmdbConfig.language) {
      config.headers = {
        ...config.headers,
        'Accept-Language': tmdbConfig.language
      }
    }

    // Add default query parameters for all TMDB requests (merge with existing params)
    config.params = {
      ...config.params,
      language: tmdbConfig.language || 'en-US',
      region: tmdbConfig.region || 'US',
      include_adult: tmdbConfig.includeAdult || false
    }

    return config
  }

  /**
   * Check if TMDB is properly configured with required credentials
   */
  isConfigured(): boolean {
    return this.userPreferenceService.isTMDBConfigured()
  }

  /**
   * Get current TMDB configuration status
   */
  getConfigurationStatus(): {
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

  /**
   * Refresh the client configuration with latest user preferences
   */
  async refreshConfiguration(): Promise<void> {
    try {
      this.logger.debug('Refreshing TMDB client configuration from user preferences')

      // Rebuild configuration with latest preferences
      const refreshedConfig = this.buildTMDBConfig()

      // Update the base client's configuration
      this.baseClient.setDefaultConfig(refreshedConfig)

      this.logger.info('TMDB client configuration refreshed successfully', {
        isConfigured: this.isConfigured(),
        language: this.userPreferenceService.getTMDBLanguage(),
        region: this.userPreferenceService.getTMDBRegion()
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to refresh TMDB client configuration', errorInstance)
      throw new Error(`Failed to refresh TMDB configuration: ${errorInstance.message}`)
    }
  }

  /**
   * Test TMDB API connection with current configuration using real API validation
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      this.logger.debug('Testing TMDB API connection with real API validation')

      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'TMDB configuration incomplete - missing API key or Bearer token'
        }
      }

      // Test with a real API call to get TMDB configuration
      // This endpoint requires authentication and will validate our credentials
      const response = await this.baseClient.get<{
        images: {
          base_url: string
          secure_base_url: string
          backdrop_sizes: string[]
          logo_sizes: string[]
          poster_sizes: string[]
          profile_sizes: string[]
          still_sizes: string[]
        }
        change_keys: string[]
      }>('/configuration')

      if (response.status === 200 && response.data?.images?.base_url) {
        this.logger.info('TMDB API connection test successful - credentials validated', {
          baseUrl: response.data.images.base_url,
          secureBaseUrl: response.data.images.secure_base_url
        })
        return { success: true }
      } else {
        return {
          success: false,
          error: `Invalid API response - expected configuration data but received status ${response.status}`
        }
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('TMDB API connection test failed - credentials invalid or API unavailable', errorInstance)

      // Provide more specific error messages based on HTTP status codes
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any
        const status = axiosError.response?.status

        switch (status) {
          case 401:
            return {
              success: false,
              error: 'Authentication failed - Invalid API key or Bearer token'
            }
          case 403:
            return {
              success: false,
              error: 'Access forbidden - Check your API key permissions'
            }
          case 404:
            return {
              success: false,
              error: 'TMDB API endpoint not found - Check API configuration'
            }
          case 429:
            return {
              success: false,
              error: 'Rate limit exceeded - Too many API requests'
            }
          case 500:
          case 502:
          case 503:
            return {
              success: false,
              error: 'TMDB API server error - Please try again later'
            }
          default:
            return {
              success: false,
              error: `API request failed with status ${status}: ${axiosError.response?.statusText || 'Unknown error'}`
            }
        }
      }

      return {
        success: false,
        error: `Connection failed: ${errorInstance.message}`
      }
    }
  }

  // Delegate base API methods to the underlying client
  async get<T = unknown>(url: string, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.baseClient.get<T>(url, config)
  }

  async post<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.baseClient.post<T>(url, data, config)
  }

  async put<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.baseClient.put<T>(url, data, config)
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.baseClient.patch<T>(url, data, config)
  }

  async delete<T = unknown>(url: string, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.baseClient.delete<T>(url, config)
  }

  // TMDB-specific convenience methods

  /**
   * Get trending movies with user preferences applied
   */
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<ApiResponse<any>> {
    return this.get(`/trending/movie/${timeWindow}`)
  }

  /**
   * Search movies with user preferences applied
   */
  async searchMovies(query: string, page: number = 1): Promise<ApiResponse<any>> {
    return this.get('/search/movie', {
      params: {
        query,
        page
      }
    })
  }

  /**
   * Get movie details with user preferences applied
   */
  async getMovieDetails(movieId: number): Promise<ApiResponse<any>> {
    return this.get(`/movie/${movieId}`)
  }

  /**
   * Get TV show details with user preferences applied
   */
  async getTVShowDetails(tvId: number): Promise<ApiResponse<any>> {
    return this.get(`/tv/${tvId}`)
  }
}