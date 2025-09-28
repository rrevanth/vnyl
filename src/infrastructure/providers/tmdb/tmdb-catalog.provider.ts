/**
 * TMDB Catalog Provider
 * 
 * Implementation of ICatalogProvider for The Movie Database (TMDB)
 * Provides catalog functionality using TMDB's comprehensive API endpoints
 */

import { ICatalogProvider } from '@/src/domain/providers/catalog/catalog-provider.interface'
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

/**
 * TMDB catalog types with comprehensive endpoint support
 */
export const TMDB_CATALOG_TYPES = {
  // Movie catalogs
  POPULAR_MOVIES: 'popular_movies',
  TOP_RATED_MOVIES: 'top_rated_movies',
  UPCOMING_MOVIES: 'upcoming_movies',
  NOW_PLAYING_MOVIES: 'now_playing_movies',
  TRENDING_MOVIES: 'trending_movies',
  
  // TV catalogs
  POPULAR_TV: 'popular_tv',
  TOP_RATED_TV: 'top_rated_tv',
  AIRING_TODAY_TV: 'airing_today_tv',
  ON_THE_AIR_TV: 'on_the_air_tv',
  TRENDING_TV: 'trending_tv'
} as const

export type TMDBCatalogType = typeof TMDB_CATALOG_TYPES[keyof typeof TMDB_CATALOG_TYPES]

/**
 * TMDB Catalog Provider - Implementation of ICatalogProvider
 */
export class TMDBCatalogProvider implements ICatalogProvider {
  public readonly id = 'tmdb-catalog'
  public readonly name = 'TMDB Catalog Provider'
  public readonly sourceId: string
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.CATALOG]
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
      this.logger.info('TMDB catalog provider initialized successfully', { 
        context: 'tmdb_catalog_provider' 
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB catalog provider', errorInstance, { 
        context: 'tmdb_catalog_provider' 
      })
      throw new Error(`TMDB catalog provider initialization failed: ${errorInstance.message}`)
    }
  }

  async getAllCatalogs(): Promise<Catalog[]> {
    try {
      this.logger.info('Fetching all TMDB catalogs', { 
        context: 'tmdb_catalog_provider' 
      })

      const startTime = performance.now()
      
      // Get a sample of each catalog type with optimized API calls
      const catalogPromises = Object.values(TMDB_CATALOG_TYPES).map(catalogType =>
        this.getCatalog(catalogType, 1, 20).catch(error => {
          this.logger.warn('Failed to fetch catalog sample', error instanceof Error ? error : new Error(String(error)), {
            context: 'tmdb_catalog_provider',
            catalogType
          })
          return null
        })
      )

      const catalogResults = await Promise.allSettled(catalogPromises)
      
      const successfulCatalogs = catalogResults
        .filter((result): result is PromiseFulfilledResult<Catalog | null> => result.status === 'fulfilled')
        .map(result => result.value)
        .filter((catalog): catalog is Catalog => catalog !== null)

      const fetchTime = performance.now() - startTime

      this.logger.info('Successfully fetched TMDB catalogs', {
        context: 'tmdb_catalog_provider',
        catalogCount: successfulCatalogs.length,
        totalAttempted: Object.values(TMDB_CATALOG_TYPES).length,
        fetchTime: Math.round(fetchTime)
      })

      return successfulCatalogs
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch all TMDB catalogs', errorInstance, { 
        context: 'tmdb_catalog_provider' 
      })
      throw new Error(`Failed to fetch TMDB catalogs: ${errorInstance.message}`)
    }
  }

  async getCatalog(catalogId: string, page: number = 1, limit: number = 20): Promise<Catalog> {
    try {
      this.logger.info('Fetching TMDB catalog', {
        context: 'tmdb_catalog_provider',
        catalogId,
        page,
        limit
      })

      const startTime = performance.now()
      const { response, mediaType, catalogName } = await this.fetchCatalogData(catalogId, page)
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
        providerId: this.id,
        providerName: 'The Movie Database (TMDB)',
        catalogId,
        catalogName,
        catalogType: catalogId,
        pageInfo,
        lastFetchAt: new Date(),
        requestId: `tmdb-catalog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      // Convert TMDB items to catalog items with essential data
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
        cacheHit: false,
        itemCount: items.length,
        quality: this.calculateQualityScore(items)
      }

      const catalog: Catalog = {
        id: CatalogUtils.createCatalogId(catalogId, 'tmdb', { page, limit }),
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
        fetchTime: Math.round(fetchTime),
        quality: metadata.quality
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

  async loadMoreItems(catalog: Catalog, page: number, limit: number = 20): Promise<CatalogItem[]> {
    const catalogType = catalog.catalogContext?.catalogType || ''

    this.logger.info('Loading more TMDB catalog items', {
      context: 'tmdb_catalog_provider',
      catalogId: catalog.id,
      catalogType,
      page,
      limit
    })

    try {
      if (!catalogType) {
        throw new Error(`No catalog type found in catalog context for ${catalog.id}`)
      }

      // Fetch data directly using catalog context
      const startTime = performance.now()
      const { response, mediaType } = await this.fetchCatalogData(catalogType, page)
      const fetchTime = performance.now() - startTime

      // Create updated catalog context for the new items
      const pageInfo: PageInfo = {
        currentPage: response.page,
        totalPages: response.total_pages,
        totalItems: response.total_results,
        hasMorePages: response.page < response.total_pages,
        pageSize: response.results.length
      }

      const updatedCatalogContext: CatalogContext = {
        ...catalog.catalogContext,
        pageInfo,
        lastFetchAt: new Date(),
        requestId: `tmdb-catalog-loadmore-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      // Convert TMDB items to catalog items
      const items = response.results.slice(0, limit).map((item, index) => 
        this.mapTMDBItemToCatalogItem(item, updatedCatalogContext, index, mediaType)
      )
      
      this.logger.info('Successfully loaded more TMDB catalog items', {
        context: 'tmdb_catalog_provider',
        catalogId: catalog.id,
        catalogType,
        page,
        itemCount: items.length,
        fetchTime: Math.round(fetchTime)
      })

      return items
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to load more TMDB catalog items', errorInstance, {
        context: 'tmdb_catalog_provider',
        catalogId: catalog.id,
        page,
        limit
      })
      throw new Error(`Failed to load more items for catalog ${catalog.id}: ${errorInstance.message}`)
    }
  }

  getSupportedMediaTypes(): MediaType[] {
    return [MediaType.MOVIE, MediaType.TV_SERIES]
  }

  getSupportedCatalogTypes(): string[] {
    return Object.values(TMDB_CATALOG_TYPES)
  }

  private async fetchCatalogData(catalogId: string, page: number): Promise<{
    response: PaginatedResponse<MovieSummary | TVShowSummary>
    mediaType: MediaType
    catalogName: string
  }> {
    const client = this.tmdbService.client

    switch (catalogId) {
      // Movie catalogs
      case TMDB_CATALOG_TYPES.POPULAR_MOVIES:
        return {
          response: await client.movies.getPopular({ page }),
          mediaType: MediaType.MOVIE,
          catalogName: 'Popular Movies'
        }
      case TMDB_CATALOG_TYPES.TOP_RATED_MOVIES:
        return {
          response: await client.movies.getTopRated({ page }),
          mediaType: MediaType.MOVIE,
          catalogName: 'Top Rated Movies'
        }
      case TMDB_CATALOG_TYPES.UPCOMING_MOVIES:
        return {
          response: await client.movies.getUpcoming({ page }),
          mediaType: MediaType.MOVIE,
          catalogName: 'Upcoming Movies'
        }
      case TMDB_CATALOG_TYPES.NOW_PLAYING_MOVIES:
        return {
          response: await client.movies.getNowPlaying({ page }),
          mediaType: MediaType.MOVIE,
          catalogName: 'Now Playing Movies'
        }
      case TMDB_CATALOG_TYPES.TRENDING_MOVIES:
        return {
          response: await client.trending.getTrendingMovies('week', { page }),
          mediaType: MediaType.MOVIE,
          catalogName: 'Trending Movies'
        }
      
      // TV catalogs
      case TMDB_CATALOG_TYPES.POPULAR_TV:
        return {
          response: await client.tv.getPopular({ page }),
          mediaType: MediaType.TV_SERIES,
          catalogName: 'Popular TV Shows'
        }
      case TMDB_CATALOG_TYPES.TOP_RATED_TV:
        return {
          response: await client.tv.getTopRated({ page }),
          mediaType: MediaType.TV_SERIES,
          catalogName: 'Top Rated TV Shows'
        }
      case TMDB_CATALOG_TYPES.AIRING_TODAY_TV:
        return {
          response: await client.tv.getAiringToday({ page }),
          mediaType: MediaType.TV_SERIES,
          catalogName: 'Airing Today'
        }
      case TMDB_CATALOG_TYPES.ON_THE_AIR_TV:
        return {
          response: await client.tv.getOnTheAir({ page }),
          mediaType: MediaType.TV_SERIES,
          catalogName: 'On The Air'
        }
      case TMDB_CATALOG_TYPES.TRENDING_TV:
        return {
          response: await client.trending.getTrendingTV('week', { page }),
          mediaType: MediaType.TV_SERIES,
          catalogName: 'Trending TV Shows'
        }

      default:
        throw new Error(`Unsupported catalog type: ${catalogId}`)
    }
  }

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
      id: CatalogItemUtils.createCatalogItemId(mediaType, item.id, 'tmdb'),
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

  private getTitle(item: MovieSummary | TVShowSummary): string {
    if ('title' in item) return item.title
    if ('name' in item) return item.name
    return 'Unknown Title'
  }

  private getOriginalTitle(item: MovieSummary | TVShowSummary): string | undefined {
    if ('original_title' in item) return item.original_title
    if ('original_name' in item) return item.original_name
    return undefined
  }

  private getReleaseDate(item: MovieSummary | TVShowSummary): Date | undefined {
    let dateString: string | undefined
    
    if ('release_date' in item) {
      dateString = item.release_date
    } else if ('first_air_date' in item) {
      dateString = item.first_air_date
    }

    return dateString ? new Date(dateString) : undefined
  }

  private getPosterUrl(item: MovieSummary | TVShowSummary): string | null {
    return item.poster_path 
      ? this.tmdbService.config.getImageUrl(item.poster_path, 'poster')
      : null
  }

  private getBackdropUrl(item: MovieSummary | TVShowSummary): string | null {
    return item.backdrop_path 
      ? this.tmdbService.config.getImageUrl(item.backdrop_path, 'backdrop')
      : null
  }

  private mapGenres(genreIds: number[]): Genre[] | undefined {
    if (!genreIds || genreIds.length === 0) return undefined

    // TMDB genre mapping
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

  private createExternalIds(tmdbId: number): ExternalIds {
    return { tmdb: tmdbId }
  }

  private calculateQualityScore(items: CatalogItem[]): number {
    if (items.length === 0) return 0

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
 * Factory function to create the TMDB catalog provider
 */
export const createTMDBCatalogProvider = (
  tmdbService: ITMDBService,
  logger: ILoggingService,
  sourceId: string
): TMDBCatalogProvider => {
  return new TMDBCatalogProvider(tmdbService, logger, sourceId)
}