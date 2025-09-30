/**
 * TMDB Recommendations Provider
 * 
 * Implementation for The Movie Database (TMDB) recommendations enrichment
 * Provides recommendations and similar content following clean architecture principles
 */

import { 
  IRecommendationsProvider
} from '@/src/domain/providers/recommendations/recommendations-provider.interface'
import { PaginationOptions } from '@/src/domain/providers/base/pagination-options.interface'
import { CatalogItem, MovieCatalogItem, TVCatalogItem, CatalogItemUtils } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ITMDBService, TMDBUtils } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { TMDBMovieDetails } from '@/src/infrastructure/api/tmdb/endpoints/types/movie.endpoints'
import type { TMDBTVShowDetails } from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'

export class TMDBRecommendationsProvider implements IRecommendationsProvider {
  public readonly id = 'tmdb-recommendations'
  public readonly name = 'TMDB Recommendations Provider'
  public readonly sourceId: string
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.RECOMMENDATIONS]
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
      this.logger.info('TMDB recommendations provider initialized successfully', {
        provider: 'tmdb_recommendations'
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB recommendations provider', errorInstance, {
        provider: 'tmdb_recommendations'
      })
      throw new Error(`TMDB recommendations provider initialization failed: ${errorInstance.message}`)
    }
  }

  /**
   * Get recommendations based on a catalog item
   * Returns multiple catalogs containing different types of recommendations
   * Implements IRecommendationsProvider.getRecommendations
   */
  async getRecommendations(
    catalogItem: CatalogItem,
    options?: PaginationOptions
  ): Promise<{ recommendations: Catalog[] }> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Fetching recommendations', {
        provider: 'tmdb_recommendations',
        mediaId: catalogItem.id,
        mediaType: catalogItem.mediaType
      })

      // Use the TMDB ID directly from external IDs
      const tmdbId = catalogItem.externalIds?.tmdb
      if (!tmdbId) {
        throw new Error('No TMDB ID found in catalog item external IDs')
      }
      
      let recommendationsData: { page: number; results: any[]; total_pages: number; total_results: number } | undefined
      let similarData: { page: number; results: any[]; total_pages: number; total_results: number } | undefined

      const page = options?.page || 1
      const limit = options?.limit || 20
      
      // Fetch recommendations and similar content from TMDB
      if (catalogItem.mediaType === MediaType.MOVIE) {
        // For first page, use details endpoint with append_to_response for efficiency
        if (page === 1) {
          const response: TMDBMovieDetails = await this.tmdbService.client.movies.getDetails(tmdbId, {
            append_to_response: 'recommendations,similar'
          })
          recommendationsData = response.recommendations
          similarData = response.similar
        } else {
          // For subsequent pages, fetch directly from endpoints
          const [recResponse, simResponse] = await Promise.allSettled([
            this.tmdbService.client.movies.getRecommendations(tmdbId, { page }),
            this.tmdbService.client.movies.getSimilar(tmdbId, { page })
          ])
          
          recommendationsData = recResponse.status === 'fulfilled' ? recResponse.value : undefined
          similarData = simResponse.status === 'fulfilled' ? simResponse.value : undefined
        }
      } else if (catalogItem.mediaType === MediaType.TV_SERIES) {
        // For first page, use details endpoint with append_to_response for efficiency
        if (page === 1) {
          const response: TMDBTVShowDetails = await this.tmdbService.client.tv.getDetails(tmdbId, {
            append_to_response: 'recommendations,similar'
          })
          recommendationsData = response.recommendations
          similarData = response.similar
        } else {
          // For subsequent pages, fetch directly from endpoints
          const [recResponse, simResponse] = await Promise.allSettled([
            this.tmdbService.client.tv.getRecommendations(tmdbId, { page }),
            this.tmdbService.client.tv.getSimilar(tmdbId, { page })
          ])
          
          recommendationsData = recResponse.status === 'fulfilled' ? recResponse.value : undefined
          similarData = simResponse.status === 'fulfilled' ? simResponse.value : undefined
        }
      } else {
        throw new Error(`Unsupported media type for recommendations: ${catalogItem.mediaType}`)
      }

      const catalogs: Catalog[] = []

      // Create Recommendations catalog
      if (recommendationsData && recommendationsData.results.length > 0) {
        const filteredResults = recommendationsData.results
        const recommendedItems = this.transformToCatalogItems(
          filteredResults.slice(0, limit),
          catalogItem.mediaType
        )
        
        // Calculate if there are more pages available
        const hasMorePages = recommendationsData.total_pages > page && page < 1000 // TMDB API limit
        const hasMoreItems = filteredResults.length > limit
        
        const recommendationsCatalog: Catalog = {
          id: `recommendations-${catalogItem.id}`,
          name: `Recommendations`,
          mediaType: catalogItem.mediaType,
          items: recommendedItems,
          pagination: {
            page: page,
            totalPages: Math.min(recommendationsData.total_pages, 1000),
            totalItems: recommendationsData.total_results,
            hasMore: hasMorePages || hasMoreItems
          },
          catalogContext: {
            catalogId: `recommendations-${catalogItem.id}`,
            catalogName: 'Recommendations',
            catalogType: 'recommendations',
            providerId: this.id,
            providerName: this.name,
            pageInfo: {
              currentPage: page,
              pageSize: recommendedItems.length,
              hasMorePages: hasMorePages || hasMoreItems
            },
            lastFetchAt: new Date(),
            requestId: `rec-${Date.now()}`
          },
          metadata: {
            fetchTime: Date.now() - startTime,
            cacheHit: false,
            itemCount: recommendedItems.length
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
        catalogs.push(recommendationsCatalog)
      }

      // Create Similar catalog
      if (similarData && similarData.results.length > 0) {
        const filteredResults = similarData.results
        const similarItems = this.transformToCatalogItems(
          filteredResults.slice(0, limit),
          catalogItem.mediaType
        )
        
        // Calculate if there are more pages available
        const hasMorePages = similarData.total_pages > page && page < 1000 // TMDB API limit
        const hasMoreItems = filteredResults.length > limit

        const similarCatalog: Catalog = {
          id: `similar-${catalogItem.id}`,
          name: `Similar`,
          mediaType: catalogItem.mediaType,
          items: similarItems,
          pagination: {
            page: page,
            totalPages: Math.min(similarData.total_pages, 1000),
            totalItems: similarData.total_results,
            hasMore: hasMorePages || hasMoreItems
          },
          catalogContext: {
            catalogId: `similar-${catalogItem.id}`,
            catalogName: 'Similar',
            catalogType: 'recommendations',
            providerId: this.id,
            providerName: this.name,
            pageInfo: {
              currentPage: page,
              pageSize: similarItems.length,
              hasMorePages: hasMorePages || hasMoreItems
            },
            lastFetchAt: new Date(),
            requestId: `sim-${Date.now()}`
          },
          metadata: {
            fetchTime: Date.now() - startTime,
            cacheHit: false,
            itemCount: similarItems.length
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
        catalogs.push(similarCatalog)
      }

      this.logger.info('Successfully fetched recommendations', {
        provider: 'tmdb_recommendations',
        mediaId: catalogItem.id,
        catalogCount: catalogs.length,
        totalItems: catalogs.reduce((sum, cat) => sum + cat.items.length, 0),
        generationTime: Date.now() - startTime
      })

      return { recommendations: catalogs }

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch recommendations', errorInstance, {
        provider: 'tmdb_recommendations',
        mediaId: catalogItem.id
      })
      throw errorInstance
    }
  }


  /**
   * Load more items for a specific catalog (pagination)
   * Uses the catalog object to access context and metadata for proper pagination
   * Includes the original media item context for API calls that require it
   * Follows the ICatalogProvider.loadMoreItems pattern for consistency
   */
  async loadMoreItems(
    catalog: Catalog,
    originalMediaItem: CatalogItem,
    page: number,
    limit?: number
  ): Promise<CatalogItem[]> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Loading more items for catalog using loadMoreItems method', {
        provider: 'tmdb_recommendations',
        catalogId: catalog.id,
        catalogType: catalog.catalogContext?.catalogType,
        page,
        limit
      })

      // Use the TMDB ID directly from external IDs
      const tmdbId = originalMediaItem.externalIds?.tmdb
      if (!tmdbId) {
        throw new Error('No TMDB ID found in original media item external IDs')
      }
      
      // Determine which catalog type we're loading more for using catalog ID prefix
      const isSimilar = catalog.id.startsWith('similar-')
      const isRecommendations = catalog.id.startsWith('recommendations-')
      
      if (!isSimilar && !isRecommendations) {
        throw new Error(`Unknown catalog type for ID: ${catalog.id}`)
      }

      let data: { page: number; results: any[]; total_pages: number; total_results: number } | undefined

      // Fetch the appropriate data based on catalog type and media type
      if (originalMediaItem.mediaType === MediaType.MOVIE) {
        if (isRecommendations) {
          data = await this.tmdbService.client.movies.getRecommendations(tmdbId, { page })
        } else {
          data = await this.tmdbService.client.movies.getSimilar(tmdbId, { page })
        }
      } else if (originalMediaItem.mediaType === MediaType.TV_SERIES) {
        if (isRecommendations) {
          data = await this.tmdbService.client.tv.getRecommendations(tmdbId, { page })
        } else {
          data = await this.tmdbService.client.tv.getSimilar(tmdbId, { page })
        }
      } else {
        throw new Error(`Unsupported media type for recommendations: ${originalMediaItem.mediaType}`)
      }

      if (!data || !data.results.length) {
        return []
      }

      // Transform and return items
      const items = this.transformToCatalogItems(data.results, originalMediaItem.mediaType)
      
      this.logger.info('Successfully loaded more items for catalog', {
        provider: 'tmdb_recommendations',
        catalogId: catalog.id,
        page,
        itemCount: items.length,
        loadTime: Date.now() - startTime
      })
      
      return items

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to load more items for catalog', errorInstance, {
        provider: 'tmdb_recommendations',
        catalogId: catalog.id,
        page
      })
      throw errorInstance
    }
  }

  /**
   * Check if recommendations are supported for a given media type
   * Implements IRecommendationsProvider.supportsRecommendationsForMediaType
   */
  supportsRecommendationsForMediaType(mediaType: MediaType): boolean {
    return mediaType === MediaType.MOVIE || mediaType === MediaType.TV_SERIES
  }





  /**
   * Validate if recommendations can be generated for a catalog item
   * Implements IRecommendationsProvider.canGenerateRecommendations
   */
  canGenerateRecommendations(catalogItem: CatalogItem): boolean {
    return this.supportsRecommendationsForMediaType(catalogItem.mediaType) &&
           catalogItem.externalIds?.tmdb !== undefined
  }


  /**
   * Transform TMDB response items to CatalogItems
   */
  private transformToCatalogItems(items: any[], mediaType: MediaType): CatalogItem[] {
    return items.map(item => {
      const contentContext = {
        catalogContext: {
          catalogId: 'recommendations',
          catalogName: 'Recommendations',
          catalogType: 'recommendations',
          providerId: this.id,
          providerName: this.name,
          pageInfo: {
            currentPage: 1,
            pageSize: 20,
            hasMorePages: false
          },
          lastFetchAt: new Date(),
          requestId: `item-${item.id}-${Date.now()}`
        },
        originalMediaType: mediaType,
        originalMediaId: item.id,
        providerId: this.id,
        providerName: this.name,
        positionInCatalog: 0,
        fetchedAt: new Date(),
        requestId: `item-${item.id}-${Date.now()}`
      }

      if (mediaType === MediaType.MOVIE) {
        return {
          id: CatalogItemUtils.createCatalogItemId(MediaType.MOVIE, item.id, 'tmdb'),
          mediaType: MediaType.MOVIE,
          title: item.title,
          originalTitle: item.original_title,
          overview: item.overview,
          releaseDate: item.release_date ? new Date(item.release_date) : undefined,
          posterUrl: this.getImageUrl(item.poster_path, 'poster'),
          backdropUrl: this.getImageUrl(item.backdrop_path, 'backdrop'),
          voteAverage: item.vote_average,
          voteCount: item.vote_count,
          popularity: item.popularity,
          originalLanguage: item.original_language,
          genres: [],
          originalMediaType: MediaType.MOVIE,
          contentContext,
          externalIds: { tmdb: item.id },
          hasDetailedInfo: false,
          isAdult: item.adult,
          createdAt: new Date(),
          updatedAt: new Date()
        } as MovieCatalogItem
      } else {
        return {
          id: CatalogItemUtils.createCatalogItemId(MediaType.TV_SERIES, item.id, 'tmdb'),
          mediaType: MediaType.TV_SERIES,
          title: item.name,
          originalTitle: item.original_name,
          overview: item.overview,
          releaseDate: item.first_air_date ? new Date(item.first_air_date) : undefined,
          firstAirDate: item.first_air_date ? new Date(item.first_air_date) : undefined,
          posterUrl: this.getImageUrl(item.poster_path, 'poster'),
          backdropUrl: this.getImageUrl(item.backdrop_path, 'backdrop'),
          voteAverage: item.vote_average,
          voteCount: item.vote_count,
          popularity: item.popularity,
          originalLanguage: item.original_language,
          originCountries: item.origin_country,
          genres: [],
          originalMediaType: MediaType.TV_SERIES,
          contentContext,
          externalIds: { tmdb: item.id },
          hasDetailedInfo: false,
          isAdult: item.adult,
          createdAt: new Date(),
          updatedAt: new Date()
        } as TVCatalogItem
      }
    })
  }





  /**
   * Check if TMDB ID can be extracted from catalog item ID
   */
  private canExtractTmdbId(catalogItemId: string): boolean {
    try {
      this.extractTmdbId(catalogItemId)
      return true
    } catch {
      return false
    }
  }

  /**
   * Extract TMDB ID from catalog item ID
   */
  private extractTmdbId(catalogItemId: string): number {
    const parts = catalogItemId.split('_')
    const tmdbId = parseInt(parts[1], 10)
    if (isNaN(tmdbId)) {
      throw new Error(`Invalid TMDB ID in catalog item: ${catalogItemId}`)
    }
    return tmdbId
  }

  /**
   * Get properly formatted image URL using TMDB service configuration
   */
  private getImageUrl(path: string | null, type: 'poster' | 'backdrop' | 'profile'): string | null {
    return TMDBUtils.getImageUrl(this.tmdbService.config, path, type)
  }
}