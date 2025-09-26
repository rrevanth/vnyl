/**
 * Simplified TMDB Metadata Provider - Fixed Interface Compliance
 * 
 * Simplified implementation that matches the actual provider capability interfaces
 * without the over-engineered features that were causing type errors.
 * 
 * @author Claude Code Assistant
 * @version 2.0.0 - Simplified
 */

import { BaseProvider } from '../base-provider'
import type {
  IMetadataProvider,
  BaseProviderConfig
} from '../provider-interfaces'

import type { ContentType } from '@/src/domain/entities/provider.entity'
import type { EnhancedMediaContext } from '@/src/domain/entities/media-context.entity'
import type { MediaMetadata, Season, Episode } from '@/src/domain/entities/provider-capabilities.entity'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import { TMDBClient } from '@/src/infrastructure/api/tmdb-client'
import { TMDBMapper } from './tmdb-mapper'
import type {
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBCredits,
  TMDBImages,
  TMDBVideos,
  TMDBExternalIds
} from './tmdb-types'

/**
 * Simplified TMDB Metadata Provider implementation
 */
export class TMDBMetadataProvider extends BaseProvider implements IMetadataProvider {
  private readonly tmdbClient: TMDBClient
  private readonly mapper: TMDBMapper

  constructor(config: BaseProviderConfig, logger: ILoggingService, tmdbClient: TMDBClient) {
    super(config, logger)
    this.tmdbClient = tmdbClient
    this.mapper = new TMDBMapper()
    
    this.logger.debug('TMDB Metadata Provider initialized', undefined, {
      providerId: this.id,
      enabled: config.enabled,
      priority: config.priority
    })
  }

  get id(): string {
    return 'tmdb-metadata'
  }

  get name(): string {
    return 'TMDB Metadata Provider'
  }

  get type(): string {
    return 'metadata'
  }

  /**
   * Get detailed metadata for media using enhanced media context
   */
  async getMetadata(context: EnhancedMediaContext): Promise<MediaMetadata | null> {
    return this.executeWithErrorHandling(
      'getMetadata',
      async () => {
        const tmdbId = this.extractTMDBId(context)
        if (!tmdbId) {
          this.log('warn', 'No TMDB ID found in media context', { context })
          return null
        }

        const contentType = this.mapContentType(context.type)
        if (!contentType) {
          this.log('warn', 'Unsupported media type', { mediaType: context.type })
          return null
        }

        return this.fetchDetailedMetadata(tmdbId, contentType)
      },
      { mediaId: context.id, mediaType: context.type }
    )
  }

  /**
   * Get metadata by external ID and type
   */
  async getMetadataByExternalId(
    externalId: string,
    idType: string,
    contentType: ContentType
  ): Promise<MediaMetadata | null> {
    return this.executeWithErrorHandling(
      'getMetadataByExternalId',
      async () => {
        if (idType === 'tmdb') {
          return this.fetchDetailedMetadata(parseInt(externalId), contentType)
        }

        this.log('debug', 'External ID lookup not directly supported', { 
          externalId, 
          idType, 
          contentType 
        })
        return null
      },
      { externalId, idType, contentType }
    )
  }

  /**
   * Get season details for TV shows
   */
  async getSeasonDetails(context: EnhancedMediaContext, seasonNumber: number): Promise<Season | null> {
    return this.executeWithErrorHandling(
      'getSeasonDetails',
      async () => {
        const tmdbId = this.extractTMDBId(context)
        if (!tmdbId) {
          return null
        }

        if (context.type !== 'tv') {
          this.log('warn', 'Season details requested for non-TV content', { 
            mediaType: context.type 
          })
          return null
        }

        this.logger.debug('Fetching TMDB season details', undefined, {
          tmdbId,
          seasonNumber,
          providerId: this.id
        })

        // Use the new centralized season details method
        const seasonData = await this.tmdbClient.getSeasonDetails(tmdbId, seasonNumber, {
          credits: true,
          images: true,
          videos: true,
          external_ids: true
        })

        return {
          id: seasonData.id.toString(),
          seasonNumber: seasonData.season_number,
          name: seasonData.name,
          overview: seasonData.overview,
          airDate: seasonData.air_date || undefined,
          episodeCount: seasonData.episodes?.length || seasonData.episode_count,
          posterPath: seasonData.poster_path || undefined,
          episodes: seasonData.episodes?.map(ep => ({
            id: ep.id.toString(),
            episodeNumber: ep.episode_number,
            seasonNumber: ep.season_number,
            name: ep.name,
            overview: ep.overview,
            airDate: ep.air_date || undefined,
            runtime: ep.runtime || undefined,
            stillPath: ep.still_path || undefined,
            voteAverage: ep.vote_average,
            voteCount: ep.vote_count,
            productionCode: ep.production_code || undefined
          }))
        }
      },
      { mediaId: context.id, seasonNumber }
    )
  }

  /**
   * Get episode details for TV shows
   */
  async getEpisodeDetails(
    context: EnhancedMediaContext,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<Episode | null> {
    return this.executeWithErrorHandling(
      'getEpisodeDetails',
      async () => {
        const tmdbId = this.extractTMDBId(context)
        if (!tmdbId) {
          return null
        }

        if (context.type !== 'tv') {
          this.log('warn', 'Episode details requested for non-TV content', { 
            mediaType: context.type 
          })
          return null
        }

        this.logger.debug('Fetching TMDB episode details', undefined, {
          tmdbId,
          seasonNumber,
          episodeNumber,
          providerId: this.id
        })

        // Use the new centralized episode details method
        const episodeData = await this.tmdbClient.getEpisodeDetails(tmdbId, seasonNumber, episodeNumber, {
          credits: true,
          images: true,
          videos: true,
          external_ids: true
        })

        return {
          id: episodeData.id.toString(),
          episodeNumber: episodeData.episode_number,
          seasonNumber: episodeData.season_number,
          name: episodeData.name,
          overview: episodeData.overview,
          airDate: episodeData.air_date || undefined,
          runtime: episodeData.runtime || undefined,
          stillPath: episodeData.still_path || undefined,
          voteAverage: episodeData.vote_average,
          voteCount: episodeData.vote_count,
          productionCode: episodeData.production_code || undefined,
          cast: (episodeData as any).credits?.cast?.slice(0, 10).map((c: any) => ({
            id: c.id.toString(),
            name: c.name,
            character: c.character,
            profileUrl: c.profile_path || undefined
          })),
          crew: (episodeData as any).credits?.crew?.slice(0, 5).map((c: any) => ({
            id: c.id.toString(),
            name: c.name,
            job: c.job,
            department: c.department,
            profileUrl: c.profile_path || undefined
          }))
        }
      },
      { mediaId: context.id, seasonNumber, episodeNumber }
    )
  }

  protected async performHealthCheck(): Promise<void> {
    this.logger.debug('Performing TMDB Metadata Provider health check', undefined, {
      providerId: this.id
    })

    const validationResult = await this.executeWithTimeout(
      () => this.tmdbClient.validateCredentials(),
      10000,
      'TMDB credentials validation timeout'
    )

    if (!validationResult.valid) {
      this.logger.error('TMDB Metadata Provider health check failed', undefined, {
        providerId: this.id,
        validationDetails: validationResult.details,
        authMethod: validationResult.method
      })

      throw this.createError(
        `TMDB Metadata API health check failed: ${validationResult.details}`,
        'HEALTH_CHECK_FAILED',
        true,
        { 
          validationResult,
          providerId: this.id
        }
      )
    }

    this.logger.info('TMDB Metadata Provider health check passed', {
      providerId: this.id,
      authMethod: validationResult.method,
      responseTime: validationResult.testResults.configuration.responseTime + validationResult.testResults.genres.responseTime
    })
  }

  private async fetchDetailedMetadata(tmdbId: number, contentType: ContentType): Promise<MediaMetadata> {
    this.logger.debug('Fetching detailed TMDB metadata', undefined, {
      tmdbId,
      contentType,
      providerId: this.id
    })

    // Use the new comprehensive methods with full append_to_response support
    const detailedMedia = contentType === 'movie' 
      ? await this.tmdbClient.getMovieFullDetails(tmdbId, {
          credits: true,
          images: true,
          videos: true,
          external_ids: true,
          recommendations: true,
          similar: true,
          keywords: true,
          reviews: true,
          watch_providers: true,
          release_dates: true
        })
      : await this.tmdbClient.getTVFullDetails(tmdbId, {
          credits: true,
          images: true,
          videos: true,
          external_ids: true,
          recommendations: true,
          similar: true,
          keywords: true,
          reviews: true,
          watch_providers: true,
          content_ratings: true
        })

    this.logger.info('TMDB metadata retrieved successfully', {
      tmdbId,
      contentType,
      title: contentType === 'movie' ? (detailedMedia as any).title : (detailedMedia as any).name,
      hasExtendedData: !!(detailedMedia as any).credits && !!(detailedMedia as any).images,
      providerId: this.id
    })

    // Create enhanced catalog item and convert to metadata
    const catalogItem = this.mapper.mapToEnhancedCatalogItem(detailedMedia as any, 'metadata')
    const enhancedItem = this.mapper.enhanceWithDetailedData(
      catalogItem,
      detailedMedia as any,
      (detailedMedia as any).credits,
      (detailedMedia as any).images,
      (detailedMedia as any).videos?.results,
      (detailedMedia as any).external_ids
    )

    // Return as MediaMetadata (simplified mapping)
    return {
      id: enhancedItem.id,
      type: enhancedItem.mediaType as ContentType,
      title: enhancedItem.name,
      originalTitle: enhancedItem.mediaDetail?.originalTitle,
      description: enhancedItem.description,
      tagline: enhancedItem.mediaDetail?.tagline,
      year: enhancedItem.year,
      releaseDate: enhancedItem.releaseDate,
      runtime: enhancedItem.mediaDetail?.runtime,
      genres: enhancedItem.genres?.map(g => g.name) || [],
      rating: enhancedItem.ratings?.[0]?.value,
      posterUrl: enhancedItem.poster,
      backdropUrl: enhancedItem.background,
      status: enhancedItem.mediaDetail?.status,
      language: enhancedItem.mediaDetail?.originalLanguage,
      cast: enhancedItem.mediaDetail?.cast?.slice(0, 10).map(c => ({
        id: c.id.toString(),
        name: c.name,
        character: c.character,
        profileUrl: c.profilePath
      })),
      crew: enhancedItem.mediaDetail?.crew?.slice(0, 5).map(c => ({
        id: c.id.toString(),
        name: c.name,
        job: c.job,
        department: c.department,
        profileUrl: c.profilePath
      })),
      videos: enhancedItem.mediaDetail?.videos?.slice(0, 5).map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        site: v.site,
        key: v.key,
        official: v.official
      })),
      images: {
        posters: enhancedItem.images?.posters?.slice(0, 10) || [],
        backdrops: enhancedItem.images?.backdrops?.slice(0, 10) || [],
        logos: enhancedItem.images?.logos?.slice(0, 5) || []
      },
      externalIds: enhancedItem.externalIds,
      providerInfo: {
        sourceProvider: 'tmdb',
        sourceId: enhancedItem.providerInfo.providerMediaId,
        lastUpdated: new Date()
      }
    } as MediaMetadata
  }

  private extractTMDBId(context: EnhancedMediaContext): number | null {
    if (context.externalIds?.tmdb) {
      const tmdbId = typeof context.externalIds.tmdb === 'number' 
        ? context.externalIds.tmdb
        : parseInt(String(context.externalIds.tmdb))
      if (!isNaN(tmdbId)) {
        return tmdbId
      }
    }

    if (context.providerInfo?.sourceProvider === 'tmdb' && context.providerInfo.sourceId) {
      const tmdbId = typeof context.providerInfo.sourceId === 'number' 
        ? context.providerInfo.sourceId
        : parseInt(String(context.providerInfo.sourceId))
      
      if (!isNaN(tmdbId)) {
        return tmdbId
      }
    }

    if (context.id.startsWith('tmdb:')) {
      const parts = context.id.split(':')
      if (parts.length >= 3) {
        const tmdbId = parseInt(parts[2])
        if (!isNaN(tmdbId)) {
          return tmdbId
        }
      }
    }

    return null
  }

  private mapContentType(mediaType: string): ContentType | null {
    const typeMap: Record<string, ContentType> = {
      'movie': 'movie',
      'film': 'movie',
      'series': 'tv',
      'tv': 'tv',
      'show': 'tv'
    }

    return typeMap[mediaType.toLowerCase()] || null
  }
}