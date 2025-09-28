/**
 * TMDB Catalog Provider Implementation
 * 
 * Implements ICatalogCapability interface for TMDB service integration
 * Provides TMDB catalogs with proper context handling and data mapping
 */

import { ICatalogCapability } from '@/src/domain/providers/catalog/catalog-capability.interface'
import { Catalog, PaginationInfo, CatalogMetadata, CatalogUtils } from '@/src/domain/entities/media/catalog.entity'
import { CatalogItem, CatalogItemUtils, MovieCatalogItem, TVCatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { MediaType, Genre } from '@/src/domain/entities/media/content-types'
import { CatalogContext, PageInfo } from '@/src/domain/entities/context/catalog-context.entity'
import { ContentContext, ContentContextUtils, ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ExternalIds } from '@/src/domain/entities/media/external-ids.entity'
import { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { MovieSummary } from '@/src/infrastructure/api/tmdb/endpoints/types/movie.endpoints'
import type { TVShowSummary } from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'
import type { PaginatedResponse } from '@/src/infrastructure/api/tmdb/endpoints/types/base.types'

export interface ITMDBCatalogProvider extends ICatalogCapability {
  /** Provider identification */
  readonly providerId: string
  readonly providerName: string
}

/**
 * TMDB catalog provider constants
 */
export const TMDB_CATALOG_TYPES = {
  POPULAR_MOVIES: 'popular_movies',
  TOP_RATED_MOVIES: 'top_rated_movies', 
  POPULAR_TV: 'popular_tv',
  TOP_RATED_TV: 'top_rated_tv',
  TRENDING_MOVIES: 'trending_movies',
  TRENDING_TV: 'trending_tv'
} as const

export type TMDBCatalogType = typeof TMDB_CATALOG_TYPES[keyof typeof TMDB_CATALOG_TYPES]

/**
 * TMDB catalog provider implementation
 */
export class TMDBCatalogProvider implements ITMDBCatalogProvider {
  public readonly id = 'tmdb'
  public readonly name = 'The Movie Database (TMDB)'
  public readonly providerId = 'tmdb'
  public readonly providerName = 'The Movie Database (TMDB)'
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.CATALOG]
  public readonly priority = 10

  constructor(
    private readonly tmdbService: ITMDBService,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Initialize the provider
   */
  async initialize(): Promise<void> {
    try {
      await this.tmdbService.initialize()
      this.logger.info('TMDB catalog provider initialized successfully', { context: 'tmdb_catalog_provider' })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB catalog provider', errorInstance, { context: 'tmdb_catalog_provider' })
      throw new Error(`Failed to initialize TMDB catalog provider: ${errorInstance.message}`)
    }
  }

  /**
   * Get all available catalogs from TMDB
   */
  async getAllCatalogs(): Promise<Catalog[]> {
    try {
      this.logger.info('Fetching all TMDB catalogs', { context: 'tmdb_catalog_provider' })

      const catalogs = await Promise.allSettled([
        this.getCatalog(TMDB_CATALOG_TYPES.POPULAR_MOVIES, 1, 20),
        this.getCatalog(TMDB_CATALOG_TYPES.TOP_RATED_MOVIES, 1, 20),
        this.getCatalog(TMDB_CATALOG_TYPES.POPULAR_TV, 1, 20),
        this.getCatalog(TMDB_CATALOG_TYPES.TOP_RATED_TV, 1, 20)
      ])

      const successfulCatalogs = catalogs
        .filter((result): result is PromiseFulfilledResult<Catalog> => result.status === 'fulfilled')
        .map(result => result.value)

      // Log any failures
      catalogs.forEach((result, index) => {
        if (result.status === 'rejected') {
          const catalogTypes = Object.values(TMDB_CATALOG_TYPES)
          const catalogType = catalogTypes[index]
          this.logger.warn('Failed to fetch TMDB catalog', result.reason instanceof Error ? result.reason : new Error(String(result.reason)), {
            context: 'tmdb_catalog_provider',
            catalogType
          })
        }
      })

      this.logger.info('Successfully fetched TMDB catalogs', {
        context: 'tmdb_catalog_provider',
        catalogCount: successfulCatalogs.length
      })

      return successfulCatalogs
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch all TMDB catalogs', errorInstance, { context: 'tmdb_catalog_provider' })
      throw new Error(`Failed to fetch TMDB catalogs: ${errorInstance.message}`)
    }
  }

  /**
   * Get a specific catalog with pagination
   */
  async getCatalog(catalogId: string, page: number = 1, limit: number = 20): Promise<Catalog> {
    try {
      this.logger.info('Fetching TMDB catalog', {
        context: 'tmdb_catalog_provider',
        catalogId,
        page,
        limit
      })

      const startTime = performance.now()
      let response: PaginatedResponse<MovieSummary | TVShowSummary>
      let mediaType: MediaType
      let catalogName: string

      // Fetch data based on catalog type
      switch (catalogId) {
        case TMDB_CATALOG_TYPES.POPULAR_MOVIES:
          response = await this.tmdbService.client.movies.getPopular({ page })
          mediaType = MediaType.MOVIE
          catalogName = 'Popular Movies'
          break

        case TMDB_CATALOG_TYPES.TOP_RATED_MOVIES:
          response = await this.tmdbService.client.movies.getTopRated({ page })
          mediaType = MediaType.MOVIE
          catalogName = 'Top Rated Movies'
          break

        case TMDB_CATALOG_TYPES.POPULAR_TV:
          response = await this.tmdbService.client.tv.getPopular({ page })
          mediaType = MediaType.TV_SERIES
          catalogName = 'Popular TV Shows'
          break

        case TMDB_CATALOG_TYPES.TOP_RATED_TV:
          response = await this.tmdbService.client.tv.getTopRated({ page })
          mediaType = MediaType.TV_SERIES
          catalogName = 'Top Rated TV Shows'
          break

        case TMDB_CATALOG_TYPES.TRENDING_MOVIES:
          response = await this.tmdbService.getTrendingMovies() as PaginatedResponse<MovieSummary>
          mediaType = MediaType.MOVIE
          catalogName = 'Trending Movies'
          break

        case TMDB_CATALOG_TYPES.TRENDING_TV:
          response = await this.tmdbService.getTrendingTV() as PaginatedResponse<TVShowSummary>
          mediaType = MediaType.TV_SERIES
          catalogName = 'Trending TV Shows'
          break

        default:
          throw new Error(`Unsupported catalog type: ${catalogId}`)
      }

      const fetchTime = performance.now() - startTime

      // Create catalog context
      const pageInfo: PageInfo = {
        currentPage: response.page,
        totalPages: response.total_pages,
        totalItems: response.total_results,
        hasMorePages: response.page < response.total_pages,
        pageSize: response.results.length
      }

      const catalogContext: CatalogContext = {
        providerId: this.providerId,
        providerName: this.providerName,
        catalogId,
        catalogName,
        catalogType: catalogId,
        pageInfo,
        lastFetchAt: new Date(),
        requestId: `${this.providerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      // Convert TMDB items to catalog items
      const items = response.results.slice(0, limit).map((item, index) => 
        this.mapTMDBItemToCatalogItem(item, catalogContext, index, mediaType)
      )

      // Create pagination info
      const pagination: PaginationInfo = {
        page: response.page,
        totalPages: response.total_pages,
        totalItems: response.total_results,
        hasMore: response.page < response.total_pages
      }

      // Create catalog metadata
      const metadata: CatalogMetadata = {
        fetchTime,
        cacheHit: false, // Always false for fresh API calls
        itemCount: items.length,
        quality: this.calculateQualityScore(items)
      }

      const catalog: Catalog = {
        id: CatalogUtils.createCatalogId(catalogId, this.providerId, { page, limit }),
        name: catalogName,
        mediaType,
        items,
        pagination,
        catalogContext,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      this.logger.info('Successfully fetched TMDB catalog', {
        context: 'tmdb_catalog_provider',
        catalogId,
        itemCount: items.length,
        fetchTime: Math.round(fetchTime)
      })

      return catalog
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch TMDB catalog', errorInstance, {
        context: 'tmdb_catalog_provider',
        catalogId,
        page,
        limit
      })
      throw new Error(`Failed to fetch TMDB catalog ${catalogId}: ${errorInstance.message}`)
    }
  }

  /**
   * Load more items for a specific catalog (pagination)
   */
  async loadMoreItems(catalogId: string, page: number, limit: number = 20): Promise<CatalogItem[]> {
    try {
      this.logger.info('Loading more TMDB catalog items', {
        context: 'tmdb_catalog_provider',
        catalogId,
        page,
        limit
      })

      const catalog = await this.getCatalog(catalogId, page, limit)
      return catalog.items
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to load more TMDB catalog items', errorInstance, {
        context: 'tmdb_catalog_provider',
        catalogId,
        page,
        limit
      })
      throw new Error(`Failed to load more items for catalog ${catalogId}: ${errorInstance.message}`)
    }
  }

  /**
   * Get supported media types for this provider
   */
  getSupportedMediaTypes(): MediaType[] {
    return [MediaType.MOVIE, MediaType.TV_SERIES]
  }

  /**
   * Get supported catalog types for this provider
   */
  getSupportedCatalogTypes(): string[] {
    return Object.values(TMDB_CATALOG_TYPES)
  }

  /**
   * Maps TMDB API response to CatalogItem
   */
  private mapTMDBItemToCatalogItem(
    item: MovieSummary | TVShowSummary,
    catalogContext: CatalogContext,
    positionInCatalog: number,
    mediaType: MediaType
  ): CatalogItem {
    const contentContext: ContentContext = ContentContextUtils.createContentContext(
      catalogContext,
      mediaType,
      item.id,
      positionInCatalog,
      item as unknown as Record<string, unknown>
    )

    const baseItem = {
      id: CatalogItemUtils.createCatalogItemId(mediaType, item.id, this.providerId),
      mediaType,
      title: this.getTitle(item),
      originalTitle: this.getOriginalTitle(item),
      overview: item.overview || undefined,
      releaseDate: this.getReleaseDate(item),
      posterUrl: this.getPosterUrl(item),
      backdropUrl: this.getBackdropUrl(item),
      voteAverage: item.vote_average || undefined,
      voteCount: item.vote_count || undefined,
      popularity: item.popularity || undefined,
      originalLanguage: item.original_language as any,
      genres: this.mapGenres(item.genre_ids),
      originalMediaType: mediaType,
      contentContext,
      externalIds: this.createExternalIds(item.id),
      hasDetailedInfo: false,
      isAdult: item.adult || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (mediaType === MediaType.MOVIE) {
      return baseItem as MovieCatalogItem
    } else {
      const tvItem = item as TVShowSummary
      return {
        ...baseItem,
        firstAirDate: tvItem.first_air_date ? new Date(tvItem.first_air_date) : undefined,
        originCountries: tvItem.origin_country as any[]
      } as TVCatalogItem
    }
  }

  /**
   * Gets title from TMDB item
   */
  private getTitle(item: MovieSummary | TVShowSummary): string {
    if ('title' in item) {
      return item.title
    }
    if ('name' in item) {
      return item.name
    }
    return 'Unknown Title'
  }

  /**
   * Gets original title from TMDB item
   */
  private getOriginalTitle(item: MovieSummary | TVShowSummary): string | undefined {
    if ('original_title' in item) {
      return item.original_title
    }
    if ('original_name' in item) {
      return item.original_name
    }
    return undefined
  }

  /**
   * Gets release date from TMDB item
   */
  private getReleaseDate(item: MovieSummary | TVShowSummary): Date | undefined {
    let dateString: string | undefined
    
    if ('release_date' in item) {
      dateString = item.release_date
    } else if ('first_air_date' in item) {
      dateString = item.first_air_date
    }

    return dateString ? new Date(dateString) : undefined
  }

  /**
   * Gets poster URL from TMDB item
   */
  private getPosterUrl(item: MovieSummary | TVShowSummary): string | null {
    return item.poster_path 
      ? this.tmdbService.config.getImageUrl(item.poster_path, 'poster')
      : null
  }

  /**
   * Gets backdrop URL from TMDB item
   */
  private getBackdropUrl(item: MovieSummary | TVShowSummary): string | null {
    return item.backdrop_path 
      ? this.tmdbService.config.getImageUrl(item.backdrop_path, 'backdrop')
      : null
  }

  /**
   * Maps TMDB genre IDs to Genre enum values
   * Note: This is a simplified mapping - in a real implementation,
   * you'd want to fetch the genre list from TMDB and create a proper mapping
   */
  private mapGenres(genreIds: number[]): Genre[] | undefined {
    if (!genreIds || genreIds.length === 0) {
      return undefined
    }

    // Simplified genre mapping - in practice, you'd use TMDB's genre endpoints
    const genreMap: Record<number, Genre> = {
      28: Genre.ACTION,
      12: Genre.ADVENTURE,
      16: Genre.ANIMATION,
      35: Genre.COMEDY,
      80: Genre.CRIME,
      99: Genre.DOCUMENTARY,
      18: Genre.DRAMA,
      10751: Genre.FAMILY,
      14: Genre.FANTASY,
      36: Genre.HISTORY,
      27: Genre.HORROR,
      10402: Genre.MUSIC,
      9648: Genre.MYSTERY,
      10749: Genre.ROMANCE,
      878: Genre.SCIENCE_FICTION,
      10770: Genre.TV_MOVIE,
      53: Genre.THRILLER,
      10752: Genre.WAR,
      37: Genre.WESTERN
    }

    return genreIds
      .map(id => genreMap[id])
      .filter((genre): genre is Genre => genre !== undefined)
  }

  /**
   * Creates external IDs for TMDB item
   */
  private createExternalIds(tmdbId: number): ExternalIds {
    return {
      tmdb: tmdbId
    }
  }

  /**
   * Calculates quality score for catalog items
   */
  private calculateQualityScore(items: CatalogItem[]): number {
    if (items.length === 0) {
      return 0
    }

    let totalScore = 0
    let scoredItems = 0

    items.forEach(item => {
      let itemScore = 0
      let factors = 0

      // Title completeness
      if (item.title) {
        itemScore += 1
        factors += 1
      }

      // Overview completeness
      if (item.overview) {
        itemScore += 1
        factors += 1
      }

      // Image availability
      if (item.posterUrl || item.backdropUrl) {
        itemScore += 1
        factors += 1
      }

      // Release date availability
      if (item.releaseDate) {
        itemScore += 1
        factors += 1
      }

      // Rating availability
      if (item.voteAverage && item.voteCount) {
        itemScore += 1
        factors += 1
      }

      if (factors > 0) {
        totalScore += itemScore / factors
        scoredItems += 1
      }
    })

    return scoredItems > 0 ? totalScore / scoredItems : 0
  }
}

/**
 * Factory function to create TMDB catalog provider
 */
export const createTMDBCatalogProvider = (
  tmdbService: ITMDBService,
  logger: ILoggingService
): ITMDBCatalogProvider => {
  return new TMDBCatalogProvider(tmdbService, logger)
}