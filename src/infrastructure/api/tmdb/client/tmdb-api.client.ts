/**
 * TMDB API Client
 * 
 * Comprehensive client for The Movie Database (TMDB) API v3
 * Supports all endpoint groups with bearer token authentication
 */

import type { HttpClient } from '@/src/infrastructure/api/tmdb/base/http.client'
import type { ITMDBConfigService } from '@/src/infrastructure/api/tmdb/config/tmdb-config.service'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import { TMDBError, TMDBErrorHandler } from '@/src/infrastructure/api/tmdb/errors/tmdb.errors'

// Import endpoint group types
import type { 
  TMDBMovieEndpoints,
  TMDBTVEndpoints,
  TMDBPersonEndpoints,
  TMDBSearchEndpoints,
  TMDBDiscoverEndpoints,
  TMDBCollectionEndpoints,
  TMDBCompanyEndpoints,
  TMDBKeywordEndpoints,
  TMDBNetworkEndpoints,
  TMDBGenreEndpoints,
  TMDBConfigurationEndpoints,
  TMDBAccountEndpoints,
  TMDBAuthenticationEndpoints,
  TMDBCertificationEndpoints,
  TMDBCreditEndpoints,
  TMDBListEndpoints,
  TMDBReviewEndpoints,
  TMDBTrendingEndpoints,
  TMDBWatchProviderEndpoints
} from '@/src/infrastructure/api/tmdb/endpoints/types'

// Import endpoint implementations
import { createConfigurationEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/configuration.endpoints.impl'
import { createMovieEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/movie.endpoints.impl'
import { createTVEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/tv.endpoints.impl'
import { createPersonEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/person.endpoints.impl'
import { createSearchEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/search.endpoints.impl'
import { createDiscoverEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/discover.endpoints.impl'
import { createTrendingEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/trending.endpoints.impl'
import { createCollectionEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/collection.endpoints.impl'
import { createCompanyEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/company.endpoints.impl'
import { createNetworkEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/network.endpoints.impl'
import { createGenreEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/genre.endpoints.impl'
import { createKeywordEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/keyword.endpoints.impl'
import { createWatchProviderEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/watch-provider.endpoints.impl'
import { createCertificationEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/certification.endpoints.impl'
import { createCreditEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/credit.endpoints.impl'
import { createReviewEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/review.endpoints.impl'
import { createListEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/list.endpoints.impl'
import { createAuthenticationEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/authentication.endpoints.impl'
import { createAccountEndpoints } from '@/src/infrastructure/api/tmdb/endpoints/implementations/account.endpoints.impl'

/**
 * Comprehensive TMDB API client interface
 */
export interface ITMDBApiClient {
  // Movie endpoints
  movies: TMDBMovieEndpoints
  
  // TV endpoints  
  tv: TMDBTVEndpoints
  
  // Person endpoints
  people: TMDBPersonEndpoints
  
  // Search endpoints
  search: TMDBSearchEndpoints
  
  // Discover endpoints
  discover: TMDBDiscoverEndpoints
  
  // Collection endpoints
  collections: TMDBCollectionEndpoints
  
  // Company endpoints
  companies: TMDBCompanyEndpoints
  
  // Keyword endpoints
  keywords: TMDBKeywordEndpoints
  
  // Network endpoints
  networks: TMDBNetworkEndpoints
  
  // Genre endpoints
  genres: TMDBGenreEndpoints
  
  // Configuration endpoints
  configuration: TMDBConfigurationEndpoints
  
  // Account endpoints (requires authentication)
  account: TMDBAccountEndpoints
  
  // Authentication endpoints
  authentication: TMDBAuthenticationEndpoints
  
  // Certification endpoints
  certifications: TMDBCertificationEndpoints
  
  // Credit endpoints
  credits: TMDBCreditEndpoints
  
  // List endpoints
  lists: TMDBListEndpoints
  
  // Review endpoints
  reviews: TMDBReviewEndpoints
  
  // Trending endpoints
  trending: TMDBTrendingEndpoints
  
  // Watch provider endpoints
  watchProviders: TMDBWatchProviderEndpoints

  /**
   * Generic request method with automatic parameter injection
   */
  request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    params?: Record<string, any>,
    data?: any,
    options?: {
      appendToResponse?: string[]
      skipDefaultParams?: boolean
    }
  ): Promise<T>

  /**
   * Update image configuration from TMDB
   */
  updateImageConfiguration(): Promise<void>
}

/**
 * Base request parameters interface
 */
export interface BaseRequestParams {
  api_key?: string
  language?: string
  region?: string
  include_adult?: boolean
  append_to_response?: string
}

/**
 * Request options for TMDB API calls
 */
export interface RequestOptions {
  /** Additional append_to_response values */
  appendToResponse?: string[]
  /** Skip adding default parameters (language, region, etc.) */
  skipDefaultParams?: boolean
  /** Override user preferences for this request */
  preferenceOverrides?: {
    language?: string
    region?: string
    includeAdult?: boolean
  }
}

/**
 * TMDB API client implementation
 */
export class TMDBApiClient implements ITMDBApiClient {
  // Endpoint group implementations will be injected here
  public readonly movies: TMDBMovieEndpoints
  public readonly tv: TMDBTVEndpoints
  public readonly people: TMDBPersonEndpoints
  public readonly search: TMDBSearchEndpoints
  public readonly discover: TMDBDiscoverEndpoints
  public readonly collections: TMDBCollectionEndpoints
  public readonly companies: TMDBCompanyEndpoints
  public readonly keywords: TMDBKeywordEndpoints
  public readonly networks: TMDBNetworkEndpoints
  public readonly genres: TMDBGenreEndpoints
  public readonly configuration: TMDBConfigurationEndpoints
  public readonly account: TMDBAccountEndpoints
  public readonly authentication: TMDBAuthenticationEndpoints
  public readonly certifications: TMDBCertificationEndpoints
  public readonly credits: TMDBCreditEndpoints
  public readonly lists: TMDBListEndpoints
  public readonly reviews: TMDBReviewEndpoints
  public readonly trending: TMDBTrendingEndpoints
  public readonly watchProviders: TMDBWatchProviderEndpoints

  constructor(
    private readonly httpClient: HttpClient,
    private readonly configService: ITMDBConfigService,
    private readonly logger: ILoggingService
  ) {
    // Create bound request method for endpoint implementations
    const boundRequest = this.request.bind(this)

    // Initialize endpoint groups with actual implementations
    this.configuration = createConfigurationEndpoints(boundRequest)
    this.movies = createMovieEndpoints(boundRequest)
    this.tv = createTVEndpoints(boundRequest)
    this.people = createPersonEndpoints(boundRequest)
    this.search = createSearchEndpoints(boundRequest)
    this.discover = createDiscoverEndpoints(boundRequest)
    this.trending = createTrendingEndpoints(boundRequest)
    this.collections = createCollectionEndpoints(boundRequest)
    this.companies = createCompanyEndpoints(boundRequest)
    this.keywords = createKeywordEndpoints(boundRequest)
    this.networks = createNetworkEndpoints(boundRequest)
    this.genres = createGenreEndpoints(boundRequest)
    this.account = createAccountEndpoints(boundRequest)
    this.authentication = createAuthenticationEndpoints(boundRequest)
    this.certifications = createCertificationEndpoints(boundRequest)
    this.credits = createCreditEndpoints(boundRequest)
    this.lists = createListEndpoints(boundRequest)
    this.reviews = createReviewEndpoints(boundRequest)
    this.watchProviders = createWatchProviderEndpoints(boundRequest)
  }

  /**
   * Generic request method with automatic parameter injection
   */
  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    params: Record<string, any> = {},
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    try {
      // Build final parameters
      const finalParams = this.buildRequestParams(params, options)

      this.logger.debug('TMDB API request', undefined, {
        method,
        endpoint,
        params: finalParams,
        hasData: !!data
      })

      // Make the request using the appropriate HTTP method
      let response
      switch (method) {
        case 'GET':
          response = await this.httpClient.get(endpoint, { params: finalParams, timeout: this.configService.getConfig().timeout })
          break
        case 'POST':
          response = await this.httpClient.post(endpoint, data, { params: finalParams, timeout: this.configService.getConfig().timeout })
          break
        case 'PUT':
          response = await this.httpClient.put(endpoint, data, { params: finalParams, timeout: this.configService.getConfig().timeout })
          break
        case 'DELETE':
          response = await this.httpClient.delete(endpoint, { params: finalParams, timeout: this.configService.getConfig().timeout })
          break
        default:
          throw new Error(`Unsupported HTTP method: ${method}`)
      }

      this.logger.debug('TMDB API response', undefined, {
        endpoint,
        status: response.status,
        dataSize: JSON.stringify(response.data).length
      })

      // Check if response is a TMDB error response
      if (TMDBErrorHandler.isErrorResponse(response.data)) {
        const tmdbError = TMDBError.fromApiResponse(response.data, { method, endpoint, params })
        TMDBErrorHandler.logError(tmdbError, this.logger)
        throw tmdbError
      }

      return response.data
    } catch (error) {
      // Handle and transform the error
      const tmdbError = TMDBErrorHandler.handle(error, {
        method,
        endpoint,
        params,
        hasData: !!data
      })
      
      TMDBErrorHandler.logError(tmdbError, this.logger)
      throw tmdbError
    }
  }

  /**
   * Update image configuration from TMDB
   */
  async updateImageConfiguration(): Promise<void> {
    try {
      const config = await this.configuration.getApiConfiguration()
      
      if (config.images) {
        this.configService.updateImageConfig({
          baseUrl: config.images.base_url,
          secureBaseUrl: config.images.secure_base_url,
          backdropSizes: config.images.backdrop_sizes,
          logoSizes: config.images.logo_sizes,
          posterSizes: config.images.poster_sizes,
          profileSizes: config.images.profile_sizes,
          stillSizes: config.images.still_sizes
        })
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to update TMDB image configuration', errorInstance)
      throw errorInstance
    }
  }

  /**
   * Build request parameters with user preferences and append_to_response
   */
  private buildRequestParams(
    params: Record<string, any>,
    options: RequestOptions
  ): Record<string, any> {
    const finalParams = { ...params }

    // Add default parameters unless skipped
    if (!options.skipDefaultParams) {
      const defaultParams = this.configService.getRequestParams(options.preferenceOverrides)
      Object.assign(finalParams, defaultParams, params) // params override defaults
    }

    // Handle append_to_response
    if (options.appendToResponse && options.appendToResponse.length > 0) {
      const existingAppend = finalParams.append_to_response
      const appendValues = existingAppend 
        ? `${existingAppend},${options.appendToResponse.join(',')}`
        : options.appendToResponse.join(',')
      
      finalParams.append_to_response = appendValues
    }

    return finalParams
}
}

/**
 * Create TMDB API client factory
 */
export const createTMDBApiClient = (
  httpClient: HttpClient,
  configService: ITMDBConfigService,
  logger: ILoggingService
): ITMDBApiClient => {
  return new TMDBApiClient(httpClient, configService, logger)
}