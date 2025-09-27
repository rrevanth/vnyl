/**
 * TMDB Service Factory
 * 
 * Main factory for creating a fully configured TMDB API client
 */

import { createHttpClient } from './base/http.client'
import { createTMDBConfigService } from './config/tmdb-config.service'
import { createTMDBApiClient } from './client/tmdb-api.client'
import type { IEnvironmentService } from '@/src/domain/services/environment.service.interface'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { IUserPreferenceService } from '@/src/domain/services/user-preference.service.interface'
import type { ITMDBApiClient } from './client/tmdb-api.client'
import type { ITMDBConfigService } from './config/tmdb-config.service'

/**
 * TMDB service interface combining all TMDB functionality
 */
export interface ITMDBService {
  /** TMDB API client */
  readonly client: ITMDBApiClient
  /** TMDB configuration service */
  readonly config: ITMDBConfigService
  
  /**
   * Initialize the service (fetch image configuration, etc.)
   */
  initialize(): Promise<void>
}

/**
 * TMDB service implementation
 */
export class TMDBService implements ITMDBService {
  public readonly client: ITMDBApiClient
  public readonly config: ITMDBConfigService

  constructor(
    environmentService: IEnvironmentService,
    logger: ILoggingService,
    userPreferenceService: IUserPreferenceService
  ) {
    // Create configuration service
    this.config = createTMDBConfigService(environmentService, logger, userPreferenceService)

    // Create HTTP client with TMDB configuration
    const httpClient = createHttpClient(this.config.getHttpConfig())

    // Create TMDB API client
    this.client = createTMDBApiClient(httpClient, this.config, logger)
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    try {
      // Fetch and update image configuration from TMDB
      await this.client.updateImageConfiguration()
    } catch (error) {
      // Log error but don't fail initialization - use defaults
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      console.warn('Failed to fetch TMDB image configuration, using defaults:', errorInstance.message)
    }
  }
}

/**
 * Create TMDB service factory
 */
export const createTMDBService = (
  environmentService: IEnvironmentService,
  logger: ILoggingService,
  userPreferenceService: IUserPreferenceService
): ITMDBService => {
  return new TMDBService(environmentService, logger, userPreferenceService)
}

/**
 * TMDB append_to_response optimization helpers
 */
export class TMDBOptimizer {
  /**
   * Common movie append_to_response values for maximum data in single request
   */
  static readonly MOVIE_FULL_APPEND = [
    'credits',
    'videos', 
    'images',
    'external_ids',
    'keywords',
    'recommendations',
    'similar',
    'release_dates',
    'watch/providers'
  ].join(',')

  /**
   * Essential movie data for catalog/list views
   */
  static readonly MOVIE_ESSENTIAL_APPEND = [
    'videos',
    'images',
    'external_ids'
  ].join(',')

  /**
   * Common TV append_to_response values
   */
  static readonly TV_FULL_APPEND = [
    'credits',
    'videos',
    'images', 
    'external_ids',
    'keywords',
    'recommendations',
    'similar',
    'content_ratings',
    'watch/providers'
  ].join(',')

  /**
   * Person append_to_response values
   */
  static readonly PERSON_FULL_APPEND = [
    'movie_credits',
    'tv_credits',
    'combined_credits',
    'external_ids',
    'images'
  ].join(',')

  /**
   * Get optimized append_to_response string based on use case
   */
  static getOptimizedAppend(mediaType: 'movie' | 'tv' | 'person', useCase: 'full' | 'essential' | 'minimal'): string {
    switch (mediaType) {
      case 'movie':
        return useCase === 'full' 
          ? this.MOVIE_FULL_APPEND
          : useCase === 'essential' 
            ? this.MOVIE_ESSENTIAL_APPEND
            : 'videos,images'
      
      case 'tv':
        return useCase === 'full'
          ? this.TV_FULL_APPEND
          : useCase === 'essential'
            ? 'videos,images,external_ids'
            : 'videos,images'
      
      case 'person':
        return useCase === 'full'
          ? this.PERSON_FULL_APPEND
          : useCase === 'essential'
            ? 'movie_credits,tv_credits,external_ids'
            : 'movie_credits,tv_credits'
      
      default:
        return ''
    }
  }
}

/**
 * TMDB utility functions
 */
export class TMDBUtils {
  /**
   * Extract video trailer from videos array
   */
  static getTrailer(videos: { type: string; site: string; key: string; official: boolean }[]): string | null {
    const trailer = videos.find(v => 
      v.type === 'Trailer' && 
      v.site === 'YouTube' && 
      v.official
    ) || videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
  }

  /**
   * Get optimal image URL using config service
   */
  static getImageUrl(
    configService: ITMDBConfigService, 
    path: string | null, 
    type: 'poster' | 'backdrop' | 'profile' | 'logo' | 'still',
    size?: string
  ): string | null {
    if (!path) return null
    return configService.getImageUrl(path, type, size)
  }

  /**
   * Extract IMDb ID from external IDs
   */
  static getIMDbId(externalIds: { imdb_id?: string | null }): string | null {
    return externalIds.imdb_id || null
  }

  /**
   * Format runtime (minutes) to human readable format
   */
  static formatRuntime(runtime: number | null): string | null {
    if (!runtime) return null
    
    const hours = Math.floor(runtime / 60)
    const minutes = runtime % 60
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    
    return `${minutes}m`
  }

  /**
   * Calculate age from birth date
   */
  static calculateAge(birthDate: string | null, deathDate?: string | null): number | null {
    if (!birthDate) return null
    
    const birth = new Date(birthDate)
    const end = deathDate ? new Date(deathDate) : new Date()
    
    const age = end.getFullYear() - birth.getFullYear()
    const monthDiff = end.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      return age - 1
    }
    
    return age
  }
}