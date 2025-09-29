/**
 * TMDB Configuration Service
 * 
 * Manages TMDB API configuration including authentication, user preferences,
 * and regional settings
 */

import type { IEnvironmentService } from '@/src/domain/services/environment.service.interface'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { IUserPreferenceService } from '@/src/domain/services/user-preference.service.interface'
import type { HttpClientConfig } from '@/src/infrastructure/api/tmdb/base/http.types'

/**
 * TMDB API configuration interface
 */
export interface TMDBConfig {
  /** Base URL for TMDB API */
  baseURL: string
  /** API key for authentication (TMDB v3 uses query parameter only) */
  apiKey: string
  /** Default language for requests */
  language: string
  /** Default region for requests */
  region: string
  /** Include adult content in results */
  includeAdult: boolean
  /** Request timeout in milliseconds */
  timeout: number
  /** Number of retry attempts */
  retries: number
  /** Default image configuration */
  imageConfig?: TMDBImageConfig
}

/**
 * TMDB image configuration
 */
export interface TMDBImageConfig {
  /** Base URL for images */
  baseUrl: string
  /** Secure base URL for images */
  secureBaseUrl: string
  /** Available backdrop sizes */
  backdropSizes: string[]
  /** Available logo sizes */
  logoSizes: string[]
  /** Available poster sizes */
  posterSizes: string[]
  /** Available profile sizes */
  profileSizes: string[]
  /** Available still sizes */
  stillSizes: string[]
}

/**
 * User preferences for TMDB
 */
export interface TMDBUserPreferences {
  /** Preferred language (ISO 639-1) */
  language?: string
  /** Preferred region (ISO 3166-1) */
  region?: string
  /** Include adult content */
  includeAdult?: boolean
  /** Preferred image quality */
  imageQuality?: 'low' | 'medium' | 'high' | 'original'
}

/**
 * TMDB configuration service interface
 */
export interface ITMDBConfigService {
  /**
   * Get the current TMDB configuration
   */
  getConfig(): TMDBConfig

  /**
   * Get HTTP client configuration for TMDB
   */
  getHttpConfig(): HttpClientConfig

  /**
   * Update user preferences
   */
  updatePreferences(preferences: TMDBUserPreferences): void

  /**
   * Get current user preferences
   */
  getPreferences(): TMDBUserPreferences

  /**
   * Get request parameters with user preferences applied
   */
  getRequestParams(overrides?: Partial<TMDBUserPreferences>): Record<string, string>

  /**
   * Get image URL with optimal size selection
   */
  getImageUrl(path: string, type: 'poster' | 'backdrop' | 'profile' | 'logo' | 'still', size?: string): string

  /**
   * Update image configuration (called after fetching from TMDB)
   */
  updateImageConfig(config: TMDBImageConfig): void

  /**
   * Get API key for query parameter authentication
   */
  getApiKey(): string

}

/**
 * TMDB configuration service implementation
 */
export class TMDBConfigService implements ITMDBConfigService {
  private config: TMDBConfig
  private userPreferences: TMDBUserPreferences = {}

  constructor(
    private readonly environmentService: IEnvironmentService,
    private readonly logger: ILoggingService,
    private readonly userPreferenceService: IUserPreferenceService
  ) {
    this.config = this.initializeConfig()
    this.loadUserPreferences()
  }

  private initializeConfig(): TMDBConfig {
    const apiKey = this.environmentService.getTmdbApiKey()
    const baseURL = this.environmentService.getTmdbBaseUrl()!

    this.logger.debug('TMDB Config Service: Initializing configuration', undefined, {
      hasApiKey: !!apiKey,
      baseURL,
      environmentService: typeof this.environmentService
    })

    if (!apiKey) {
      this.logger.error('TMDB Config Service: API key not found', new Error('TMDB API key not found in environment variables'), {
        checkedVariable: 'EXPO_PUBLIC_TMDB_API_KEY',
        suggestion: 'Create a .env file with EXPO_PUBLIC_TMDB_API_KEY=your_api_key_here'
      })
      throw new Error('TMDB API key not found in environment variables')
    }

    return {
      baseURL,
      apiKey,
      language: 'en-US',
      region: 'US',
      includeAdult: false,
      timeout: 10000,
      retries: 3,
      imageConfig: {
        baseUrl: 'http://image.tmdb.org/t/p/',
        secureBaseUrl: 'https://image.tmdb.org/t/p/',
        backdropSizes: ['w300', 'w780', 'w1280', 'original'],
        logoSizes: ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original'],
        posterSizes: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
        profileSizes: ['w45', 'w185', 'h632', 'original'],
        stillSizes: ['w92', 'w185', 'w300', 'original']
      }
    }
  }

  private loadUserPreferences(): void {
    try {
      if (this.userPreferenceService.isReady()) {
        const tmdbSettings = this.userPreferenceService.getTMDBSettings()
        
        this.userPreferences = {
          language: tmdbSettings.language,
          region: tmdbSettings.region,
          includeAdult: tmdbSettings.includeAdult,
          imageQuality: tmdbSettings.imageQuality
        }
        
        // Override config with user's API key if provided
        if (tmdbSettings.apiKey) {
          this.config.apiKey = tmdbSettings.apiKey
        }
        
        this.logger.debug('TMDB user preferences loaded successfully', undefined, {
          tmdbLanguage: this.userPreferences.language,
          tmdbRegion: this.userPreferences.region,
          includeAdult: this.userPreferences.includeAdult,
          imageQuality: this.userPreferences.imageQuality,
          hasApiKey: !!tmdbSettings.apiKey
        })
      } else {
        this.logger.debug('User preference service not ready, using default TMDB preferences')
        this.userPreferences = {
          language: this.config.language,
          region: this.config.region,
          includeAdult: this.config.includeAdult,
          imageQuality: 'high'
        }
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to load TMDB user preferences', errorInstance, {
        context: 'TMDBConfigService.loadUserPreferences'
      })
      this.userPreferences = {
        language: this.config.language,
        region: this.config.region,
        includeAdult: this.config.includeAdult,
        imageQuality: 'high'
      }
    }
  }

  getConfig(): TMDBConfig {
    return {
      ...this.config,
      language: this.userPreferences.language || this.config.language,
      region: this.userPreferences.region || this.config.region,
      includeAdult: this.userPreferences.includeAdult ?? this.config.includeAdult
    }
  }

  getHttpConfig(): HttpClientConfig {
    const config = this.getConfig()
    
    return {
      baseURL: config.baseURL,
      timeout: config.timeout,
      retries: config.retries,
      retryDelay: 1000,
      logger: this.logger,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  }

  updatePreferences(preferences: TMDBUserPreferences): void {
    this.userPreferences = { ...this.userPreferences, ...preferences }
    
    this.logger.info('TMDB preferences updated', {
      preferences: this.userPreferences
    })
  }

  getPreferences(): TMDBUserPreferences {
    return { ...this.userPreferences }
  }

  getRequestParams(overrides?: Partial<TMDBUserPreferences>): Record<string, string> {
    const config = this.getConfig()
    const preferences = { ...this.userPreferences, ...overrides }

    const params: Record<string, string> = {
      api_key: config.apiKey,
      language: preferences.language || config.language,
      region: preferences.region || config.region
    }

    if (preferences.includeAdult !== undefined) {
      params.include_adult = preferences.includeAdult.toString()
    }

    return params
  }

  getImageUrl(
    path: string, 
    type: 'poster' | 'backdrop' | 'profile' | 'logo' | 'still', 
    size?: string
  ): string {
    if (!path) {
      return ''
    }

    const imageConfig = this.config.imageConfig
    if (!imageConfig) {
      // Fallback to default secure base URL
      return `https://image.tmdb.org/t/p/w500${path}`
    }

    let selectedSize = size
    if (!selectedSize) {
      // Auto-select size based on user preference and type
      selectedSize = this.getOptimalImageSize(type, this.userPreferences.imageQuality || 'high')
    }

    return `${imageConfig.secureBaseUrl}${selectedSize}${path}`
  }

  private getOptimalImageSize(
    type: 'poster' | 'backdrop' | 'profile' | 'logo' | 'still',
    quality: 'low' | 'medium' | 'high' | 'original'
  ): string {
    const imageConfig = this.config.imageConfig
    if (!imageConfig) {
      return 'w500' // Fallback
    }

    const sizeMap = {
      poster: imageConfig.posterSizes,
      backdrop: imageConfig.backdropSizes,
      profile: imageConfig.profileSizes,
      logo: imageConfig.logoSizes,
      still: imageConfig.stillSizes
    }

    const sizes = sizeMap[type]
    if (!sizes || sizes.length === 0) {
      return 'w500' // Fallback
    }

    switch (quality) {
      case 'low':
        return sizes[0] || 'w92'
      case 'medium':
        return sizes[Math.floor(sizes.length / 2)] || 'w300'
      case 'high':
        return sizes[sizes.length - 2] || 'w500' // Second to last (before 'original')
      case 'original':
        return 'original'
      default:
        return sizes[Math.floor(sizes.length / 2)] || 'w300'
    }
  }

  updateImageConfig(config: TMDBImageConfig): void {
    this.config.imageConfig = config
    
    this.logger.info('TMDB image configuration updated', {
      baseUrl: config.baseUrl,
      secureBaseUrl: config.secureBaseUrl,
      availableSizes: {
        backdrop: config.backdropSizes.length,
        poster: config.posterSizes.length,
        profile: config.profileSizes.length,
        logo: config.logoSizes.length,
        still: config.stillSizes.length
      }
    })
  }

  getApiKey(): string {
    return this.config.apiKey
  }
}

/**
 * Create TMDB config service factory
 */
export const createTMDBConfigService = (
  environmentService: IEnvironmentService,
  logger: ILoggingService,
  userPreferenceService: IUserPreferenceService
): ITMDBConfigService => {
  return new TMDBConfigService(environmentService, logger, userPreferenceService)
}