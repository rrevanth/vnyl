/**
 * TMDB Metadata Provider
 * 
 * Implementation of IMetadataProvider for The Movie Database (TMDB)
 * Provides detailed metadata using TMDB's comprehensive API endpoints with append_to_response optimization
 */

import { IMetadataProvider } from '@/src/domain/providers/metadata/metadata-provider.interface'
import { CatalogItem, CatalogItemUtils, MovieCatalogItem, TVCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { MediaType, Genre } from '@/src/domain/entities/media/content-types'
import { ExternalIds } from '@/src/domain/entities/media/external-ids.entity'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ITMDBService, TMDBOptimizer, TMDBUtils } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { TMDBMovieDetails } from '@/src/infrastructure/api/tmdb/endpoints/types/movie.endpoints'
import type { TMDBTVShowDetails } from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'

/**
 * TMDB metadata fields that can be included via append_to_response
 */
export const TMDB_METADATA_FIELDS = {
  VIDEOS: 'videos',
  CREDITS: 'credits',
  IMAGES: 'images',
  EXTERNAL_IDS: 'external_ids',
  KEYWORDS: 'keywords',
  RECOMMENDATIONS: 'recommendations',
  SIMILAR: 'similar',
  REVIEWS: 'reviews',
  WATCH_PROVIDERS: 'watch/providers',
  RELEASE_DATES: 'release_dates',
  CONTENT_RATINGS: 'content_ratings',
  ALTERNATIVE_TITLES: 'alternative_titles'
} as const

export type TMDBMetadataField = typeof TMDB_METADATA_FIELDS[keyof typeof TMDB_METADATA_FIELDS]

/**
 * TMDB Metadata Provider - Implementation of IMetadataProvider
 */
export class TMDBMetadataProvider implements IMetadataProvider {
  public readonly id = 'tmdb-metadata'
  public readonly name = 'TMDB Metadata Provider'
  public readonly sourceId: string
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.METADATA]
  public readonly priority = 10

  constructor(
    private readonly tmdbService: ITMDBService,
    private readonly logger: ILoggingService,
    sourceId: string
  ) {
    this.sourceId = sourceId
  }

  async initialize(): Promise<void> {
    try {
      await this.tmdbService.initialize()
      this.logger.info('TMDB metadata provider initialized successfully', { 
        context: 'tmdb_metadata_provider' 
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB metadata provider', errorInstance, { 
        context: 'tmdb_metadata_provider' 
      })
      throw new Error(`TMDB metadata provider initialization failed: ${errorInstance.message}`)
    }
  }

  async getMediaMetadata(mediaId: string, mediaType: MediaType): Promise<CatalogItem> {
    try {
      this.logger.info('Fetching TMDB media metadata', {
        context: 'tmdb_metadata_provider',
        mediaId,
        mediaType
      })

      const startTime = performance.now()
      const tmdbId = parseInt(mediaId, 10)
      
      if (isNaN(tmdbId)) {
        throw new Error(`Invalid TMDB ID: ${mediaId}`)
      }

      let catalogItem: CatalogItem

      if (mediaType === MediaType.MOVIE) {
        const movieDetails = await this.fetchMovieDetails(tmdbId)
        catalogItem = this.mapMovieDetailsToCatalogItem(movieDetails)
      } else if (mediaType === MediaType.TV_SERIES) {
        const tvDetails = await this.fetchTVDetails(tmdbId)
        catalogItem = this.mapTVDetailsToCatalogItem(tvDetails)
      } else {
        throw new Error(`Unsupported media type for metadata: ${mediaType}`)
      }

      const fetchTime = performance.now() - startTime

      this.logger.info('Successfully fetched TMDB media metadata', {
        context: 'tmdb_metadata_provider',
        mediaId,
        mediaType,
        fetchTime: Math.round(fetchTime),
        hasDetailedInfo: catalogItem.hasDetailedInfo
      })

      return catalogItem
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TMDB media metadata', errorInstance, {
        context: 'tmdb_metadata_provider',
        mediaId,
        mediaType
      })
      throw new Error(`Failed to fetch TMDB metadata for ${mediaType} ${mediaId}: ${errorInstance.message}`)
    }
  }

  async getBulkMetadata(mediaIds: string[], mediaType: MediaType): Promise<CatalogItem[]> {
    try {
      this.logger.info('Fetching bulk TMDB metadata', {
        context: 'tmdb_metadata_provider',
        mediaType,
        count: mediaIds.length
      })

      const startTime = performance.now()
      
      // Process in parallel with proper error handling
      const metadataPromises = mediaIds.map(mediaId =>
        this.getMediaMetadata(mediaId, mediaType).catch(error => {
          this.logger.warn('Failed to fetch individual metadata', error instanceof Error ? error : new Error(String(error)), {
            context: 'tmdb_metadata_provider',
            mediaId,
            mediaType
          })
          return null
        })
      )

      const results = await Promise.allSettled(metadataPromises)
      
      const successfulResults = results
        .filter((result): result is PromiseFulfilledResult<CatalogItem | null> => result.status === 'fulfilled')
        .map(result => result.value)
        .filter((item): item is CatalogItem => item !== null)

      const fetchTime = performance.now() - startTime

      this.logger.info('Successfully fetched bulk TMDB metadata', {
        context: 'tmdb_metadata_provider',
        mediaType,
        requestedCount: mediaIds.length,
        successfulCount: successfulResults.length,
        fetchTime: Math.round(fetchTime)
      })

      return successfulResults
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch bulk TMDB metadata', errorInstance, {
        context: 'tmdb_metadata_provider',
        mediaType,
        count: mediaIds.length
      })
      throw new Error(`Failed to fetch bulk TMDB metadata: ${errorInstance.message}`)
    }
  }

  async getEnhancedMetadata(mediaId: string, mediaType: MediaType, includeExtras?: string[]): Promise<CatalogItem> {
    try {
      this.logger.info('Fetching enhanced TMDB metadata', {
        context: 'tmdb_metadata_provider',
        mediaId,
        mediaType,
        includeExtras
      })

      const startTime = performance.now()
      const tmdbId = parseInt(mediaId, 10)
      
      if (isNaN(tmdbId)) {
        throw new Error(`Invalid TMDB ID: ${mediaId}`)
      }

      let catalogItem: CatalogItem

      if (mediaType === MediaType.MOVIE) {
        const appendToResponse = this.buildAppendToResponse(mediaType, includeExtras)
        const movieDetails = await this.tmdbService.client.movies.getDetails(tmdbId, {
          append_to_response: appendToResponse
        })
        catalogItem = this.mapMovieDetailsToCatalogItem(movieDetails, true)
      } else if (mediaType === MediaType.TV_SERIES) {
        const appendToResponse = this.buildAppendToResponse(mediaType, includeExtras)
        const tvDetails = await this.tmdbService.client.tv.getDetails(tmdbId, {
          append_to_response: appendToResponse
        })
        catalogItem = this.mapTVDetailsToCatalogItem(tvDetails, true)
      } else {
        throw new Error(`Unsupported media type for enhanced metadata: ${mediaType}`)
      }

      const fetchTime = performance.now() - startTime

      this.logger.info('Successfully fetched enhanced TMDB metadata', {
        context: 'tmdb_metadata_provider',
        mediaId,
        mediaType,
        fetchTime: Math.round(fetchTime),
        enhancedFields: includeExtras?.length || 0
      })

      return catalogItem
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch enhanced TMDB metadata', errorInstance, {
        context: 'tmdb_metadata_provider',
        mediaId,
        mediaType,
        includeExtras
      })
      throw new Error(`Failed to fetch enhanced TMDB metadata for ${mediaType} ${mediaId}: ${errorInstance.message}`)
    }
  }

  getSupportedMetadataFields(): string[] {
    return Object.values(TMDB_METADATA_FIELDS)
  }

  getSupportedMediaTypes(): MediaType[] {
    return [MediaType.MOVIE, MediaType.TV_SERIES]
  }

  private async fetchMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const appendToResponse = TMDBOptimizer.getOptimizedAppend('movie', 'essential')
    return this.tmdbService.client.movies.getDetails(movieId, {
      append_to_response: appendToResponse
    })
  }

  private async fetchTVDetails(tvId: number): Promise<TMDBTVShowDetails> {
    const appendToResponse = TMDBOptimizer.getOptimizedAppend('tv', 'essential')
    return this.tmdbService.client.tv.getDetails(tvId, {
      append_to_response: appendToResponse
    })
  }

  private buildAppendToResponse(mediaType: MediaType, includeExtras?: string[]): string {
    let baseAppend: string

    if (mediaType === MediaType.MOVIE) {
      baseAppend = TMDBOptimizer.MOVIE_FULL_APPEND
    } else if (mediaType === MediaType.TV_SERIES) {
      baseAppend = TMDBOptimizer.TV_FULL_APPEND
    } else {
      baseAppend = 'videos,images,external_ids'
    }

    if (includeExtras && includeExtras.length > 0) {
      const validExtras = includeExtras.filter(extra => 
        Object.values(TMDB_METADATA_FIELDS).includes(extra as TMDBMetadataField)
      )
      
      if (validExtras.length > 0) {
        return `${baseAppend},${validExtras.join(',')}`
      }
    }

    return baseAppend
  }

  private mapMovieDetailsToCatalogItem(movieDetails: TMDBMovieDetails, enhanced: boolean = false): MovieCatalogItem {
    const baseItem = {
      id: CatalogItemUtils.createCatalogItemId(MediaType.MOVIE, movieDetails.id, 'tmdb'),
      mediaType: MediaType.MOVIE,
      title: movieDetails.title,
      originalTitle: movieDetails.original_title,
      overview: movieDetails.overview || undefined,
      releaseDate: movieDetails.release_date ? new Date(movieDetails.release_date) : undefined,
      posterUrl: this.getImageUrl(movieDetails.poster_path, 'poster'),
      backdropUrl: this.getImageUrl(movieDetails.backdrop_path, 'backdrop'),
      voteAverage: movieDetails.vote_average || undefined,
      voteCount: movieDetails.vote_count || undefined,
      popularity: movieDetails.popularity || undefined,
      originalLanguage: movieDetails.original_language as any,
      genres: this.mapDetailedGenres(movieDetails.genres),
      originalMediaType: MediaType.MOVIE,
      externalIds: this.mapExternalIds((movieDetails as any).external_ids, movieDetails.id),
      hasDetailedInfo: true,
      isAdult: movieDetails.adult || undefined,
      
      // Movie-specific fields
      runtime: movieDetails.runtime || undefined,
      budget: movieDetails.budget || undefined,
      revenue: movieDetails.revenue || undefined,
      status: movieDetails.status as any,
      tagline: movieDetails.tagline || undefined,
      homepage: movieDetails.homepage || undefined,
      
      // Enhanced fields (when available)
      ...((movieDetails as any).videos && {
        trailerUrl: TMDBUtils.getTrailer((movieDetails as any).videos.results)
      }),
      
      ...((movieDetails as any).credits && {
        cast: this.mapCast((movieDetails as any).credits.cast?.slice(0, 20)),
        crew: this.mapCrew((movieDetails as any).credits.crew?.slice(0, 10))
      }),
      
      createdAt: new Date(),
      updatedAt: new Date()
    } as MovieCatalogItem

    return baseItem
  }

  private mapTVDetailsToCatalogItem(tvDetails: TMDBTVShowDetails, enhanced: boolean = false): TVCatalogItem {
    const baseItem = {
      id: CatalogItemUtils.createCatalogItemId(MediaType.TV_SERIES, tvDetails.id, 'tmdb'),
      mediaType: MediaType.TV_SERIES,
      title: tvDetails.name,
      originalTitle: tvDetails.original_name,
      overview: tvDetails.overview || undefined,
      releaseDate: tvDetails.first_air_date ? new Date(tvDetails.first_air_date) : undefined,
      posterUrl: this.getImageUrl(tvDetails.poster_path, 'poster'),
      backdropUrl: this.getImageUrl(tvDetails.backdrop_path, 'backdrop'),
      voteAverage: tvDetails.vote_average || undefined,
      voteCount: tvDetails.vote_count || undefined,
      popularity: tvDetails.popularity || undefined,
      originalLanguage: tvDetails.original_language as any,
      genres: this.mapDetailedGenres(tvDetails.genres),
      originalMediaType: MediaType.TV_SERIES,
      externalIds: this.mapExternalIds((tvDetails as any).external_ids, tvDetails.id),
      hasDetailedInfo: true,
      isAdult: tvDetails.adult || undefined,
      
      // TV-specific fields
      firstAirDate: tvDetails.first_air_date ? new Date(tvDetails.first_air_date) : undefined,
      lastAirDate: tvDetails.last_air_date ? new Date(tvDetails.last_air_date) : undefined,
      numberOfSeasons: tvDetails.number_of_seasons || undefined,
      numberOfEpisodes: tvDetails.number_of_episodes || undefined,
      episodeRunTime: tvDetails.episode_run_time || undefined,
      status: tvDetails.status as any,
      type: tvDetails.type || undefined,
      originCountries: tvDetails.origin_country as any[],
      networks: tvDetails.networks?.map((network: any) => ({
        id: network.id,
        name: network.name,
        logoPath: network.logo_path,
        originCountry: network.origin_country
      })),
      homepage: tvDetails.homepage || undefined,
      
      // Enhanced fields (when available)
      ...((tvDetails as any).videos && {
        trailerUrl: TMDBUtils.getTrailer((tvDetails as any).videos.results)
      }),
      
      ...((tvDetails as any).credits && {
        cast: this.mapCast((tvDetails as any).credits.cast?.slice(0, 20)),
        crew: this.mapCrew((tvDetails as any).credits.crew?.slice(0, 10))
      }),
      
      createdAt: new Date(),
      updatedAt: new Date()
    } as TVCatalogItem

    return baseItem
  }

  private getImageUrl(path: string | null, type: 'poster' | 'backdrop' | 'profile'): string | null {
    return TMDBUtils.getImageUrl(this.tmdbService.config, path, type)
  }

  private mapDetailedGenres(genres: { id: number; name: string }[]): Genre[] | undefined {
    if (!genres || genres.length === 0) return undefined

    // Map TMDB genre names to our Genre enum
    const genreNameMap: Record<string, Genre> = {
      'Action': Genre.ACTION,
      'Adventure': Genre.ADVENTURE,
      'Animation': Genre.ANIMATION,
      'Comedy': Genre.COMEDY,
      'Crime': Genre.CRIME,
      'Documentary': Genre.DOCUMENTARY,
      'Drama': Genre.DRAMA,
      'Family': Genre.FAMILY,
      'Fantasy': Genre.FANTASY,
      'History': Genre.HISTORY,
      'Horror': Genre.HORROR,
      'Music': Genre.MUSIC,
      'Mystery': Genre.MYSTERY,
      'Romance': Genre.ROMANCE,
      'Science Fiction': Genre.SCIENCE_FICTION,
      'TV Movie': Genre.TV_MOVIE,
      'Thriller': Genre.THRILLER,
      'War': Genre.WAR,
      'Western': Genre.WESTERN,
      'News': Genre.NEWS,
      'Reality': Genre.REALITY,
      'Talk': Genre.TALK
    }

    return genres
      .map(genre => genreNameMap[genre.name])
      .filter((genre): genre is Genre => genre !== undefined)
  }

  private mapExternalIds(externalIds: any, tmdbId: number): ExternalIds {
    const ids: Partial<ExternalIds> = { tmdb: tmdbId }

    if (externalIds) {
      if (externalIds.imdb_id) {
        (ids as any).imdb = externalIds.imdb_id
      }
      if (externalIds.tvdb_id) {
        (ids as any).tvdb = externalIds.tvdb_id
      }
      if (externalIds.wikidata_id) {
        (ids as any).wikidata = externalIds.wikidata_id
      }
      if (externalIds.facebook_id) {
        (ids as any).facebook = externalIds.facebook_id
      }
      if (externalIds.instagram_id) {
        (ids as any).instagram = externalIds.instagram_id
      }
      if (externalIds.twitter_id) {
        (ids as any).twitter = externalIds.twitter_id
      }
    }

    return ids as ExternalIds
  }

  private mapCast(cast: any[]): any[] | undefined {
    if (!cast || cast.length === 0) return undefined

    return cast.map(member => ({
      id: member.id,
      name: member.name,
      character: member.character,
      order: member.order,
      profilePath: this.getImageUrl(member.profile_path, 'profile'),
      creditId: member.credit_id
    }))
  }

  private mapCrew(crew: any[]): any[] | undefined {
    if (!crew || crew.length === 0) return undefined

    return crew.map(member => ({
      id: member.id,
      name: member.name,
      job: member.job,
      department: member.department,
      profilePath: this.getImageUrl(member.profile_path, 'profile'),
      creditId: member.credit_id
    }))
  }
}

/**
 * Factory function to create the TMDB metadata provider
 */
export const createTMDBMetadataProvider = (
  tmdbService: ITMDBService,
  logger: ILoggingService,
  sourceId: string
): TMDBMetadataProvider => {
  return new TMDBMetadataProvider(tmdbService, logger, sourceId)
}