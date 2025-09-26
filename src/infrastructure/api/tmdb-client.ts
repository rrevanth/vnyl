/**
 * TMDB Client - Centralized API Client for TMDB Integration
 * 
 * Handles all TMDB API communication with comprehensive logging, authentication,
 * rate limiting, and error handling. Providers use this client for data fetching
 * and focus solely on data transformation to domain entities.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type {
  ITMDBConfigService,
  ILoggingService,
  ApiResponse
} from '@/src/domain/services'
import type { IApiClient } from '@/src/domain/services/api.service.interface'
import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBExtendedMovieDetails,
  TMDBExtendedTVShowDetails,
  TMDBSeasonDetails,
  TMDBEpisodeDetails,
  TMDBSearchResponse,
  TMDBCatalogResponse,
  TMDBConfiguration,
  TMDBGenreResponse,
  TMDBMultiSearchResult,
  TMDBAdvancedFilters,
  TMDBDiscoverOptions
} from '../providers/tmdb/tmdb-types'

/**
 * TMDB API validation result
 */
export interface TMDBValidationResult {
  valid: boolean
  method: 'bearer' | 'apikey' | 'none'
  details: string
  testResults: {
    configuration: { success: boolean; responseTime: number; error?: string }
    genres: { success: boolean; responseTime: number; error?: string }
  }
  timestamp: Date
}

/**
 * TMDB search options with enhanced capabilities
 */
export interface TMDBSearchOptions {
  page?: number
  includeAdult?: boolean
  region?: string
  year?: number
  primaryReleaseYear?: number
  firstAirDateYear?: number
}

/**
 * TMDB catalog options with extended filtering
 */
export interface TMDBCatalogOptions extends Record<string, unknown> {
  page?: number
  region?: string
  language?: string
  timezone?: string
}

/**
 * TMDB append_to_response options
 */
export interface TMDBAppendToResponseOptions {
  credits?: boolean
  images?: boolean
  videos?: boolean
  external_ids?: boolean
  recommendations?: boolean
  similar?: boolean
  keywords?: boolean
  reviews?: boolean
  watch_providers?: boolean
  release_dates?: boolean // Movies only
  content_ratings?: boolean // TV only
}

/**
 * TMDB Multi-search options
 */
export interface TMDBMultiSearchOptions {
  page?: number
  includeAdult?: boolean
  region?: string
  language?: string
}

/**
 * TMDB request metrics for monitoring
 */
interface TMDBRequestMetrics extends Record<string, unknown> {
  endpoint: string
  method: string
  responseTime: number
  status: number
  fromCache: boolean
  retryCount: number
  authMethod: string
}

/**
 * Centralized TMDB API Client
 * 
 * This client handles all TMDB API complexity including:
 * - Authentication (Bearer token vs API key)
 * - Rate limiting and retry logic
 * - Request/response logging
 * - Error classification and handling
 * - Configuration management
 */
export class TMDBClient {
  private readonly baseApiClient: IApiClient
  private lastConfigRefresh: Date | null = null
  private requestCount = 0
  private errorCount = 0

  constructor(
    private readonly configService: ITMDBConfigService,
    private readonly logger: ILoggingService,
    baseApiClient: IApiClient
  ) {
    this.baseApiClient = baseApiClient
    this.initializeClient()
  }

  // ============================================================================
  // PUBLIC API METHODS - Used by TMDB Providers
  // ============================================================================

  /**
   * Get detailed movie information from TMDB
   */
  async getMovieDetails(tmdbId: number): Promise<TMDBMovieDetails> {
    this.logger.debug('Fetching TMDB movie details', undefined, { tmdbId })

    const response = await this.makeRequest<TMDBMovieDetails>(
      `/movie/${tmdbId}`,
      'GET',
      { append_to_response: 'credits,images,videos,external_ids' }
    )

    this.logger.info('TMDB movie details retrieved', {
      tmdbId,
      title: response.data.title,
      hasCredits: !!(response.data as any).credits,
      hasImages: !!(response.data as any).images
    })

    return response.data
  }

  /**
   * Get comprehensive movie information with full append_to_response support
   * 
   * @param tmdbId - TMDB movie ID
   * @param appendOptions - Optional append_to_response configuration
   * @returns Extended movie details with all requested additional data
   */
  async getMovieFullDetails(
    tmdbId: number, 
    appendOptions?: TMDBAppendToResponseOptions
  ): Promise<TMDBExtendedMovieDetails> {
    this.logger.debug('Fetching TMDB movie full details', undefined, { tmdbId, appendOptions })

    const appendList = this.buildAppendToResponseString(appendOptions, 'movie')
    
    const response = await this.makeRequest<TMDBExtendedMovieDetails>(
      `/movie/${tmdbId}`,
      'GET',
      { append_to_response: appendList }
    )

    this.logger.info('TMDB movie full details retrieved', {
      tmdbId,
      title: response.data.title,
      appendedData: Object.keys(response.data).filter(key => 
        ['credits', 'images', 'videos', 'external_ids', 'recommendations', 
         'similar', 'keywords', 'reviews', 'watch_providers', 'release_dates'].includes(key)
      )
    })

    return response.data
  }

  /**
   * Get detailed TV show information from TMDB
   */
  async getTVDetails(tmdbId: number): Promise<TMDBTVShowDetails> {
    this.logger.debug('Fetching TMDB TV details', undefined, { tmdbId })

    const response = await this.makeRequest<TMDBTVShowDetails>(
      `/tv/${tmdbId}`,
      'GET',
      { append_to_response: 'credits,images,videos,external_ids' }
    )

    this.logger.info('TMDB TV details retrieved', {
      tmdbId,
      name: response.data.name,
      seasons: response.data.number_of_seasons,
      hasCredits: !!(response.data as any).credits
    })

    return response.data
  }

  /**
   * Get comprehensive TV show information with full append_to_response support
   * 
   * @param tmdbId - TMDB TV show ID
   * @param appendOptions - Optional append_to_response configuration
   * @returns Extended TV show details with all requested additional data
   */
  async getTVFullDetails(
    tmdbId: number, 
    appendOptions?: TMDBAppendToResponseOptions
  ): Promise<TMDBExtendedTVShowDetails> {
    this.logger.debug('Fetching TMDB TV full details', undefined, { tmdbId, appendOptions })

    const appendList = this.buildAppendToResponseString(appendOptions, 'tv')
    
    const response = await this.makeRequest<TMDBExtendedTVShowDetails>(
      `/tv/${tmdbId}`,
      'GET',
      { append_to_response: appendList }
    )

    this.logger.info('TMDB TV full details retrieved', {
      tmdbId,
      name: response.data.name,
      seasons: response.data.number_of_seasons,
      appendedData: Object.keys(response.data).filter(key => 
        ['credits', 'images', 'videos', 'external_ids', 'recommendations', 
         'similar', 'keywords', 'reviews', 'watch_providers', 'content_ratings'].includes(key)
      )
    })

    return response.data
  }

  /**
   * Get detailed season information with episodes
   * 
   * @param tvId - TMDB TV show ID
   * @param seasonNumber - Season number to fetch
   * @param appendOptions - Optional append_to_response configuration
   * @returns Season details with episodes and additional data
   */
  async getSeasonDetails(
    tvId: number, 
    seasonNumber: number, 
    appendOptions?: TMDBAppendToResponseOptions
  ): Promise<TMDBSeasonDetails> {
    this.logger.debug('Fetching TMDB season details', undefined, { tvId, seasonNumber, appendOptions })

    const appendList = this.buildAppendToResponseString(appendOptions, 'season')
    
    const response = await this.makeRequest<TMDBSeasonDetails>(
      `/tv/${tvId}/season/${seasonNumber}`,
      'GET',
      appendList ? { append_to_response: appendList } : undefined
    )

    this.logger.info('TMDB season details retrieved', {
      tvId,
      seasonNumber,
      name: response.data.name,
      episodeCount: response.data.episodes?.length || response.data.episode_count
    })

    return response.data
  }

  /**
   * Get detailed episode information
   * 
   * @param tvId - TMDB TV show ID
   * @param seasonNumber - Season number
   * @param episodeNumber - Episode number
   * @param appendOptions - Optional append_to_response configuration
   * @returns Episode details with additional data
   */
  async getEpisodeDetails(
    tvId: number, 
    seasonNumber: number, 
    episodeNumber: number,
    appendOptions?: TMDBAppendToResponseOptions
  ): Promise<TMDBEpisodeDetails> {
    this.logger.debug('Fetching TMDB episode details', undefined, { 
      tvId, seasonNumber, episodeNumber, appendOptions 
    })

    const appendList = this.buildAppendToResponseString(appendOptions, 'episode')
    
    const response = await this.makeRequest<TMDBEpisodeDetails>(
      `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
      'GET',
      appendList ? { append_to_response: appendList } : undefined
    )

    this.logger.info('TMDB episode details retrieved', {
      tvId,
      seasonNumber,
      episodeNumber,
      name: response.data.name,
      runtime: response.data.runtime
    })

    return response.data
  }

  /**
   * Search for movies on TMDB
   */
  async searchMovies(query: string, options: TMDBSearchOptions = {}): Promise<TMDBSearchResponse<TMDBMovie>> {
    this.logger.debug('Searching TMDB movies', undefined, { query, options })

    const params = {
      query,
      page: options.page || 1,
      include_adult: options.includeAdult ?? this.configService.shouldIncludeAdult(),
      region: options.region,
      year: options.year,
      primary_release_year: options.primaryReleaseYear
    }

    const response = await this.makeRequest<TMDBSearchResponse<TMDBMovie>>('/search/movie', 'GET', params)

    this.logger.info('TMDB movie search completed', {
      query,
      resultCount: response.data.results.length,
      totalResults: response.data.total_results,
      page: response.data.page
    })

    return response.data
  }

  /**
   * Search for TV shows on TMDB
   */
  async searchTV(query: string, options: TMDBSearchOptions = {}): Promise<TMDBSearchResponse<TMDBTVShow>> {
    this.logger.debug('Searching TMDB TV shows', undefined, { query, options })

    const params = {
      query,
      page: options.page || 1,
      include_adult: options.includeAdult ?? this.configService.shouldIncludeAdult(),
      first_air_date_year: options.firstAirDateYear
    }

    const response = await this.makeRequest<TMDBSearchResponse<TMDBTVShow>>('/search/tv', 'GET', params)

    this.logger.info('TMDB TV search completed', {
      query,
      resultCount: response.data.results.length,
      totalResults: response.data.total_results
    })

    return response.data
  }

  /**
   * Multi-search across movies, TV shows, and people
   * 
   * @param query - Search query string
   * @param options - Optional search configuration
   * @returns Multi-search results with media type indicators
   */
  async searchMulti(query: string, options: TMDBMultiSearchOptions = {}): Promise<TMDBSearchResponse<TMDBMultiSearchResult>> {
    this.logger.debug('Performing TMDB multi-search', undefined, { query, options })

    const params = {
      query,
      page: options.page || 1,
      include_adult: options.includeAdult ?? this.configService.shouldIncludeAdult(),
      region: options.region,
      language: options.language || this.configService.getEffectiveLanguage()
    }

    const response = await this.makeRequest<TMDBSearchResponse<TMDBMultiSearchResult>>('/search/multi', 'GET', params)

    this.logger.info('TMDB multi-search completed', {
      query,
      resultCount: response.data.results.length,
      totalResults: response.data.total_results,
      page: response.data.page,
      mediaTypes: this.analyzeMultiSearchResults(response.data.results)
    })

    return response.data
  }

  /**
   * Get popular movies from TMDB
   */
  async getPopularMovies(options: TMDBCatalogOptions = {}): Promise<TMDBCatalogResponse> {
    this.logger.debug('Fetching popular movies', undefined, options)

    const params = {
      page: options.page || 1,
      region: options.region,
      language: options.language || this.configService.getEffectiveLanguage()
    }

    const response = await this.makeRequest<TMDBCatalogResponse>('/movie/popular', 'GET', params)

    this.logger.info('Popular movies retrieved', {
      itemCount: response.data.results.length,
      page: response.data.page,
      totalPages: response.data.total_pages
    })

    return response.data
  }

  /**
   * Get trending movies from TMDB
   */
  async getTrendingMovies(timeframe: 'day' | 'week' = 'week'): Promise<TMDBCatalogResponse> {
    this.logger.debug('Fetching trending movies', undefined, { timeframe })

    const response = await this.makeRequest<TMDBCatalogResponse>(
      `/trending/movie/${timeframe}`,
      'GET'
    )

    this.logger.info('Trending movies retrieved', {
      timeframe,
      itemCount: response.data.results.length
    })

    return response.data
  }

  /**
   * Get top rated movies from TMDB
   */
  async getTopRatedMovies(options: TMDBCatalogOptions = {}): Promise<TMDBCatalogResponse> {
    this.logger.debug('Fetching top rated movies', undefined, options)

    const params = {
      page: options.page || 1,
      language: options.language || this.configService.getEffectiveLanguage(),
      region: options.region
    }

    const response = await this.makeRequest<TMDBCatalogResponse>('/movie/top_rated', 'GET', params)

    this.logger.info('Top rated movies retrieved', {
      itemCount: response.data.results.length,
      page: response.data.page
    })

    return response.data
  }

  // ============================================================================
  // TV SHOW CATALOG METHODS
  // ============================================================================

  /**
   * Get popular TV shows from TMDB
   */
  async getPopularTV(options: TMDBCatalogOptions = {}): Promise<TMDBCatalogResponse> {
    this.logger.debug('Fetching popular TV shows', undefined, options)

    const params = {
      page: options.page || 1,
      language: options.language || this.configService.getEffectiveLanguage(),
      region: options.region
    }

    const response = await this.makeRequest<TMDBCatalogResponse>('/tv/popular', 'GET', params)

    this.logger.info('Popular TV shows retrieved', {
      itemCount: response.data.results.length,
      page: response.data.page,
      totalPages: response.data.total_pages
    })

    return response.data
  }

  /**
   * Get top rated TV shows from TMDB
   */
  async getTopRatedTV(options: TMDBCatalogOptions = {}): Promise<TMDBCatalogResponse> {
    this.logger.debug('Fetching top rated TV shows', undefined, options)

    const params = {
      page: options.page || 1,
      language: options.language || this.configService.getEffectiveLanguage(),
      region: options.region
    }

    const response = await this.makeRequest<TMDBCatalogResponse>('/tv/top_rated', 'GET', params)

    this.logger.info('Top rated TV shows retrieved', {
      itemCount: response.data.results.length,
      page: response.data.page
    })

    return response.data
  }

  /**
   * Get TV shows airing today
   */
  async getAiringToday(options: TMDBCatalogOptions = {}): Promise<TMDBCatalogResponse> {
    this.logger.debug('Fetching TV shows airing today', undefined, options)

    const params = {
      page: options.page || 1,
      language: options.language || this.configService.getEffectiveLanguage(),
      timezone: options.timezone || 'UTC'
    }

    const response = await this.makeRequest<TMDBCatalogResponse>('/tv/airing_today', 'GET', params)

    this.logger.info('Airing today TV shows retrieved', {
      itemCount: response.data.results.length,
      page: response.data.page
    })

    return response.data
  }

  /**
   * Get TV shows currently on the air
   */
  async getOnTheAir(options: TMDBCatalogOptions = {}): Promise<TMDBCatalogResponse> {
    this.logger.debug('Fetching TV shows on the air', undefined, options)

    const params = {
      page: options.page || 1,
      language: options.language || this.configService.getEffectiveLanguage(),
      timezone: options.timezone || 'UTC'
    }

    const response = await this.makeRequest<TMDBCatalogResponse>('/tv/on_the_air', 'GET', params)

    this.logger.info('On the air TV shows retrieved', {
      itemCount: response.data.results.length,
      page: response.data.page
    })

    return response.data
  }

  /**
   * Get trending TV shows from TMDB
   */
  async getTrendingTV(timeframe: 'day' | 'week' = 'week'): Promise<TMDBCatalogResponse> {
    this.logger.debug('Fetching trending TV shows', undefined, { timeframe })

    const response = await this.makeRequest<TMDBCatalogResponse>(
      `/trending/tv/${timeframe}`,
      'GET'
    )

    this.logger.info('Trending TV shows retrieved', {
      timeframe,
      itemCount: response.data.results.length
    })

    return response.data
  }

  // ============================================================================
  // DISCOVER AND ADVANCED FILTERING METHODS
  // ============================================================================

  /**
   * Discover movies with advanced filtering
   * 
   * @param options - Simplified discovery options
   * @returns Filtered movie results
   */
  async discoverMovies(options: TMDBDiscoverOptions = {}): Promise<TMDBCatalogResponse> {
    this.logger.debug('Discovering movies with filters', undefined, options)

    const filters = this.buildDiscoverFilters(options, 'movie')
    
    const response = await this.makeRequest<TMDBCatalogResponse>('/discover/movie', 'GET', filters)

    this.logger.info('Movie discovery completed', {
      itemCount: response.data.results.length,
      page: response.data.page,
      totalPages: response.data.total_pages,
      appliedFilters: Object.keys(filters).length
    })

    return response.data
  }

  /**
   * Discover TV shows with advanced filtering
   * 
   * @param options - Simplified discovery options
   * @returns Filtered TV show results
   */
  async discoverTV(options: TMDBDiscoverOptions = {}): Promise<TMDBCatalogResponse> {
    this.logger.debug('Discovering TV shows with filters', undefined, options)

    const filters = this.buildDiscoverFilters(options, 'tv')
    
    const response = await this.makeRequest<TMDBCatalogResponse>('/discover/tv', 'GET', filters)

    this.logger.info('TV show discovery completed', {
      itemCount: response.data.results.length,
      page: response.data.page,
      totalPages: response.data.total_pages,
      appliedFilters: Object.keys(filters).length
    })

    return response.data
  }

  /**
   * Advanced discover with full TMDB filter support
   * 
   * @param contentType - 'movie' or 'tv'
   * @param filters - Advanced TMDB filters
   * @returns Filtered content results
   */
  async discoverWithAdvancedFilters(
    contentType: 'movie' | 'tv',
    filters: TMDBAdvancedFilters = {}
  ): Promise<TMDBCatalogResponse> {
    this.logger.debug('Advanced content discovery', undefined, { contentType, filters })

    const endpoint = `/discover/${contentType}`
    const params = {
      ...filters,
      page: filters.page || 1,
      language: filters.language || this.configService.getEffectiveLanguage()
    }

    const response = await this.makeRequest<TMDBCatalogResponse>(endpoint, 'GET', params)

    this.logger.info('Advanced discovery completed', {
      contentType,
      itemCount: response.data.results.length,
      page: response.data.page,
      totalPages: response.data.total_pages,
      filtersCount: Object.keys(filters).length
    })

    return response.data
  }

  // ============================================================================
  // VALIDATION AND HEALTH CHECK METHODS
  // ============================================================================

  /**
   * Validate TMDB API credentials by testing actual endpoints
   */
  async validateCredentials(): Promise<TMDBValidationResult> {
    this.logger.debug('Starting TMDB API credentials validation')

    const authMethod = this.configService.getAuthenticationMethod()
    const timestamp = new Date()

    // Test public configuration endpoint (no auth required)
    const configTest = await this.testEndpoint('/configuration', 'Configuration endpoint')

    // Test authenticated endpoint that requires valid credentials
    const genresTest = await this.testEndpoint('/genre/movie/list', 'Genres endpoint')

    const valid = configTest.success && genresTest.success
    const details = this.buildValidationDetails(valid, authMethod, configTest, genresTest)

    this.logger.info('TMDB API validation completed', {
      valid,
      authMethod,
      configSuccess: configTest.success,
      genresSuccess: genresTest.success,
      totalResponseTime: configTest.responseTime + genresTest.responseTime
    })

    return {
      valid,
      method: authMethod,
      details,
      testResults: {
        configuration: configTest,
        genres: genresTest
      },
      timestamp
    }
  }

  /**
   * Get current client status and configuration
   */
  getClientStatus() {
    return {
      authMethod: this.configService.getAuthenticationMethod(),
      hasValidCredentials: this.configService.hasValidCredentials(),
      lastConfigRefresh: this.lastConfigRefresh,
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
    }
  }

  /**
   * Refresh client configuration when settings change
   */
  refreshConfiguration(): void {
    this.logger.debug('Refreshing TMDB client configuration')

    try {
      this.configService.refreshConfiguration()
      const config = this.configService.getEffectiveTMDBConfig()
      this.baseApiClient.setDefaultConfig(config)
      this.lastConfigRefresh = new Date()

      this.logger.info('TMDB client configuration refreshed', {
        authMethod: this.configService.getAuthenticationMethod(),
        baseURL: config.baseURL,
        language: this.configService.getEffectiveLanguage()
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to refresh TMDB client configuration', errorInstance)
      throw errorInstance
    }
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  /**
   * Initialize the client with current configuration
   */
  private initializeClient(): void {
    this.logger.debug('Initializing TMDB client')

    try {
      if (!this.configService.hasValidCredentials()) {
        this.logger.warn('TMDB client initialized without valid credentials')
        return
      }

      const config = this.configService.getEffectiveTMDBConfig()
      this.baseApiClient.setDefaultConfig(config)
      this.lastConfigRefresh = new Date()

      this.logger.info('TMDB client initialized successfully', {
        authMethod: this.configService.getAuthenticationMethod(),
        baseURL: config.baseURL,
        hasValidCredentials: true
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB client', errorInstance)
      throw errorInstance
    }
  }

  /**
   * Make a request to TMDB API with comprehensive logging and error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now()
    const authMethod = this.configService.getAuthenticationMethod()

    this.logger.debug('TMDB API request starting', undefined, {
      endpoint,
      method,
      authMethod,
      hasParams: !!params
    })

    try {
      this.requestCount++

      // Make the actual API request
      const response = method === 'GET' 
        ? await this.baseApiClient.get<T>(endpoint, { params })
        : await this.baseApiClient.post<T>(endpoint, params)

      const responseTime = Date.now() - startTime

      // Log successful response
      this.logger.info('TMDB API request successful', {
        endpoint,
        method,
        status: response.status,
        responseTime,
        authMethod
      })

      // Track metrics
      this.trackRequestMetrics({
        endpoint,
        method,
        responseTime,
        status: response.status,
        fromCache: false, // TODO: Implement cache detection
        retryCount: 0,
        authMethod
      })

      return response

    } catch (error) {
      this.errorCount++
      const responseTime = Date.now() - startTime

      await this.handleApiError(error, endpoint, method, responseTime, authMethod)
      throw error
    }
  }

  /**
   * Test a specific TMDB endpoint for validation
   */
  private async testEndpoint(
    endpoint: string,
    description: string
  ): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now()

    try {
      this.logger.debug(`Testing TMDB ${description}`, undefined, { endpoint })

      await this.baseApiClient.get(endpoint)
      const responseTime = Date.now() - startTime

      this.logger.debug(`TMDB ${description} test successful`, undefined, {
        endpoint,
        responseTime
      })

      return { success: true, responseTime }

    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      this.logger.warn(`TMDB ${description} test failed`, error instanceof Error ? error : undefined, {
        endpoint,
        responseTime,
        error: errorMessage
      })

      return { success: false, responseTime, error: errorMessage }
    }
  }

  /**
   * Handle API errors with proper classification and logging
   */
  private async handleApiError(
    error: unknown,
    endpoint: string,
    method: string,
    responseTime: number,
    authMethod: string
  ): Promise<void> {
    let errorContext = {
      endpoint,
      method,
      responseTime,
      authMethod
    }

    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as any).response

      errorContext = {
        ...errorContext,
        ...{
          status: response?.status,
          statusText: response?.statusText,
          retryable: this.isRetryableError(response?.status)
        }
      }

      // Handle specific TMDB error cases
      if (response?.status === 401) {
        this.logger.error('TMDB authentication failed - invalid credentials', undefined, errorContext)
      } else if (response?.status === 429) {
        this.logger.warn('TMDB rate limit exceeded', undefined, {
          ...errorContext,
          retryAfter: response.headers?.['retry-after']
        })
      } else if (response?.status === 404) {
        this.logger.debug('TMDB resource not found', undefined, errorContext)
      } else {
        this.logger.error('TMDB API error', error instanceof Error ? error : new Error(String(error)), errorContext)
      }
    } else {
      this.logger.error('TMDB request failed', error instanceof Error ? error : new Error(String(error)), errorContext)
    }
  }

  /**
   * Determine if an HTTP status code represents a retryable error
   */
  private isRetryableError(status?: number): boolean {
    if (!status) return false
    
    // Network errors, server errors, and rate limiting are retryable
    return status >= 500 || status === 429 || status === 408
  }

  /**
   * Track request metrics for monitoring
   */
  private trackRequestMetrics(metrics: TMDBRequestMetrics): void {
    // TODO: Implement metrics collection/aggregation
    // For now, just log for debugging
    this.logger.debug('TMDB request metrics', undefined, metrics)
  }

  /**
   * Build detailed validation message
   */
  private buildValidationDetails(
    valid: boolean,
    authMethod: string,
    configTest: { success: boolean; error?: string },
    genresTest: { success: boolean; error?: string }
  ): string {
    if (valid) {
      return `TMDB API credentials are valid using ${authMethod} authentication`
    }

    const issues: string[] = []
    
    if (!configTest.success) {
      issues.push(`Configuration endpoint failed: ${configTest.error}`)
    }
    
    if (!genresTest.success) {
      issues.push(`Genres endpoint failed: ${genresTest.error}`)
    }

    return `TMDB API validation failed: ${issues.join(', ')}`
  }

  // ============================================================================
  // HELPER METHODS FOR EXTENDED FUNCTIONALITY
  // ============================================================================

  /**
   * Build append_to_response string based on options and content type
   */
  private buildAppendToResponseString(
    options?: TMDBAppendToResponseOptions,
    contentType: 'movie' | 'tv' | 'season' | 'episode' = 'movie'
  ): string {
    if (!options) {
      // Default comprehensive append for full details
      switch (contentType) {
        case 'movie':
          return 'credits,images,videos,external_ids,recommendations,similar,keywords,reviews,watch/providers,release_dates'
        case 'tv':
          return 'credits,images,videos,external_ids,recommendations,similar,keywords,reviews,watch/providers,content_ratings'
        case 'season':
        case 'episode':
          return 'credits,images,videos,external_ids'
        default:
          return 'credits,images,videos,external_ids'
      }
    }

    const appendList: string[] = []
    
    if (options.credits) appendList.push('credits')
    if (options.images) appendList.push('images')
    if (options.videos) appendList.push('videos')
    if (options.external_ids) appendList.push('external_ids')
    if (options.recommendations) appendList.push('recommendations')
    if (options.similar) appendList.push('similar')
    if (options.keywords) appendList.push('keywords')
    if (options.reviews) appendList.push('reviews')
    if (options.watch_providers) appendList.push('watch/providers')
    
    // Content-type specific appends
    if (contentType === 'movie' && options.release_dates) {
      appendList.push('release_dates')
    }
    if (contentType === 'tv' && options.content_ratings) {
      appendList.push('content_ratings')
    }

    return appendList.join(',')
  }

  /**
   * Build discover filters from simplified options
   */
  private buildDiscoverFilters(
    options: TMDBDiscoverOptions,
    contentType: 'movie' | 'tv'
  ): TMDBAdvancedFilters {
    const filters: TMDBAdvancedFilters = {
      page: options.page || 1,
      language: options.language || this.configService.getEffectiveLanguage(),
      region: options.region,
      include_adult: options.includeAdult ?? this.configService.shouldIncludeAdult()
    }

    // Sort by
    if (options.sortBy) {
      filters.sort_by = options.sortBy
    }

    // Year filter
    if (options.year) {
      if (contentType === 'movie') {
        filters.primary_release_year = options.year
      } else {
        filters.first_air_date_year = options.year
      }
    }

    // Genre filter
    if (options.genres && options.genres.length > 0) {
      filters.with_genres = options.genres.join(',')
    }

    // Rating filters
    if (options.minRating !== undefined) {
      filters.vote_average_gte = options.minRating
    }
    if (options.maxRating !== undefined) {
      filters.vote_average_lte = options.maxRating
    }
    if (options.minVotes !== undefined) {
      filters.vote_count_gte = options.minVotes
    }

    return filters
  }

  /**
   * Analyze multi-search results for logging
   */
  private analyzeMultiSearchResults(results: TMDBMultiSearchResult[]): Record<string, number> {
    const analysis: Record<string, number> = {}
    
    results.forEach(result => {
      const mediaType = result.media_type || 'unknown'
      analysis[mediaType] = (analysis[mediaType] || 0) + 1
    })

    return analysis
  }
}