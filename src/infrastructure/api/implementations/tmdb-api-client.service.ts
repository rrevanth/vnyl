import type {
  IApiClient,
  ApiConfig,
  ApiResponse,
  ITMDBConfigService,
  ILoggingService
} from '@/src/domain/services'
import { AxiosApiClient, type AxiosClientOptions } from './axios-api-client.service'

/**
 * TMDB API Client Implementation
 * Specialized API client for TMDB with full dependency injection
 * Uses composition over inheritance for better testability
 */
export class TMDBApiClient implements IApiClient {
  private axiosClient: AxiosApiClient

  constructor(
    private readonly tmdbConfigService: ITMDBConfigService,
    private readonly logger: ILoggingService
  ) {
    this.logger.debug('Initializing TMDB API Client')

    // Get the effective TMDB configuration
    const tmdbConfig = this.tmdbConfigService.getEffectiveTMDBConfig()

    // Configure TMDB-specific options
    const options: AxiosClientOptions = {
      enableDefaultLogging: true,
      requestInterceptors: [
        {
          onFulfilled: (config) => {
            // Add TMDB-specific request handling if needed
            this.logger.debug('TMDB API request interceptor', undefined, {
              url: config.url,
              method: config.method?.toUpperCase()
            })

            // Ensure API key is in params if using API key authentication
            if (this.tmdbConfigService.getAuthenticationMethod() === 'apikey') {
              const apiKeyParam = config.params?.api_key
              if (!apiKeyParam) {
                this.logger.warn('API key missing from TMDB request params')
              }
            }

            return config
          },
          onRejected: (error) => {
            this.logger.error('TMDB request interceptor error', error instanceof Error ? error : new Error(String(error)))
            return Promise.reject(error)
          }
        }
      ],
      responseInterceptors: [
        {
          onFulfilled: (response) => {
            // Add TMDB-specific response handling if needed
            this.logger.debug('TMDB API response interceptor', undefined, {
              status: response.status,
              url: response.config.url
            })
            return response
          },
          onRejected: (error) => {
            // Handle TMDB-specific error codes
            this.handleTMDBError(error)
            return Promise.reject(error)
          }
        }
      ]
    }

    // Create the underlying Axios client with TMDB configuration
    this.axiosClient = new AxiosApiClient(tmdbConfig, this.logger, options)

    this.logger.info('TMDB API Client initialized', {
      baseURL: tmdbConfig.baseURL,
      authMethod: this.tmdbConfigService.getAuthenticationMethod(),
      hasValidCredentials: this.tmdbConfigService.hasValidCredentials()
    })
  }

  // Delegate all IApiClient methods to the internal AxiosApiClient
  async get<T = unknown>(url: string, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.axiosClient.get<T>(url, config)
  }

  async post<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.axiosClient.post<T>(url, data, config)
  }

  async put<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.axiosClient.put<T>(url, data, config)
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.axiosClient.patch<T>(url, data, config)
  }

  async delete<T = unknown>(url: string, config?: Partial<ApiConfig>): Promise<ApiResponse<T>> {
    return this.axiosClient.delete<T>(url, config)
  }

  setDefaultConfig(config: Partial<ApiConfig>): void {
    this.axiosClient.setDefaultConfig(config)
  }

  getDefaultConfig(): ApiConfig {
    return this.axiosClient.getDefaultConfig()
  }

  // TMDB-specific methods

  /**
   * Refresh the client configuration when TMDB settings change
   */
  refreshConfiguration(): void {
    try {
      this.logger.debug('Refreshing TMDB API client configuration')

      // Refresh the config service first
      this.tmdbConfigService.refreshConfiguration()

      // Get the updated configuration
      const updatedConfig = this.tmdbConfigService.getEffectiveTMDBConfig()

      // Update the underlying client
      this.axiosClient.setDefaultConfig(updatedConfig)

      this.logger.info('TMDB API client configuration refreshed', {
        baseURL: updatedConfig.baseURL,
        authMethod: this.tmdbConfigService.getAuthenticationMethod()
      })

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to refresh TMDB API client configuration', errorInstance)
      throw errorInstance
    }
  }

  /**
   * Check if the client has valid credentials
   */
  hasValidCredentials(): boolean {
    return this.tmdbConfigService.hasValidCredentials()
  }

  /**
   * Get the current authentication method
   */
  getAuthenticationMethod(): 'bearer' | 'apikey' | 'none' {
    return this.tmdbConfigService.getAuthenticationMethod()
  }

  // Private methods

  /**
   * Handle TMDB-specific error responses
   */
  private handleTMDBError(error: unknown): void {
    try {
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response

        if (response?.status === 401) {
          this.logger.error('TMDB authentication failed - invalid API credentials')
        } else if (response?.status === 429) {
          this.logger.warn('TMDB rate limit exceeded', undefined, {
            retryAfter: response.headers?.['retry-after']
          })
        } else if (response?.status === 404) {
          this.logger.debug('TMDB resource not found', undefined, {
            url: response.config?.url
          })
        }
      }
    } catch (handleError) {
      this.logger.error('Error in TMDB error handler', handleError instanceof Error ? handleError : new Error(String(handleError)))
    }
  }
}