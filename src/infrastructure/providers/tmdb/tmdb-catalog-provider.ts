/**
 * Simplified TMDB Catalog Provider - Fixed Interface Compliance
 * 
 * Simplified implementation that matches the actual provider capability interfaces
 * without the over-engineered features that were causing type errors.
 * 
 * @author Claude Code Assistant
 * @version 2.0.0 - Simplified
 */

import { BaseProvider } from '../base-provider'
import type {
  ICatalogProvider,
  BaseProviderConfig,
  PaginationResponse
} from '../provider-interfaces'

import type { ContentType } from '@/src/domain/entities/provider.entity'
import type { 
  Catalog, 
  CatalogItem, 
  CatalogFilters 
} from '@/src/domain/entities/provider-capabilities.entity'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import { TMDBClient } from '@/src/infrastructure/api/tmdb-client'
import { TMDBMapper } from './tmdb-mapper'
import type { TMDBSearchResponse, TMDBMediaResult, TMDBCatalogResponse } from './tmdb-types'

/**
 * Simplified TMDB Catalog Provider implementation
 */
export class TMDBCatalogProvider extends BaseProvider implements ICatalogProvider {
  private readonly tmdbClient: TMDBClient
  private readonly mapper: TMDBMapper

  constructor(config: BaseProviderConfig, logger: ILoggingService, tmdbClient: TMDBClient) {
    super(config, logger)
    this.tmdbClient = tmdbClient
    this.mapper = new TMDBMapper()
    
    this.logger.debug('TMDB Catalog Provider initialized', undefined, {
      providerId: this.id,
      enabled: config.enabled,
      priority: config.priority
    })
  }

  get id(): string {
    return 'tmdb-catalog'
  }

  get name(): string {
    return 'TMDB Catalog Provider'
  }

  get type(): string {
    return 'catalog'
  }

  /**
   * Get available catalogs for a content type
   * If contentType is not specified, returns all available catalogs
   */
  async getCatalogs(contentType?: ContentType): Promise<Catalog[]> {
    return this.executeWithErrorHandling(
      'getCatalogs',
      async () => {
        const catalogs: Catalog[] = []

        // If no content type specified, return all catalogs
        if (!contentType) {
          // Add movie catalogs
          catalogs.push(
            {
              id: 'tmdb-popular-movie',
              title: 'Popular Movies',
              type: 'movie',
              description: 'Most popular movies on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'popular-movie',
                catalogType: 'popular',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-trending-movie',
              title: 'Trending Movies',
              type: 'movie',
              description: 'Currently trending movies on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'trending-movie',
                catalogType: 'trending',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-top_rated-movie',
              title: 'Top Rated Movies',
              type: 'movie',
              description: 'Highest rated movies on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'top_rated-movie',
                catalogType: 'top_rated',
                lastUpdated: new Date()
              }
            }
          )

          // Add TV show catalogs
          catalogs.push(
            {
              id: 'tmdb-popular-tv',
              title: 'Popular TV Shows',
              type: 'tv',
              description: 'Most popular TV shows on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'popular-tv',
                catalogType: 'popular',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-trending-tv',
              title: 'Trending TV Shows',
              type: 'tv',
              description: 'Currently trending TV shows on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'trending-tv',
                catalogType: 'trending',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-top_rated-tv',
              title: 'Top Rated TV Shows',
              type: 'tv',
              description: 'Highest rated TV shows on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'top_rated-tv',
                catalogType: 'top_rated',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-airing_today-tv',
              title: 'Airing Today',
              type: 'tv',
              description: 'TV shows airing today',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'airing_today-tv',
                catalogType: 'airing_today',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-on_the_air-tv',
              title: 'On The Air',
              type: 'tv',
              description: 'TV shows currently on the air',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'on_the_air-tv',
                catalogType: 'on_the_air',
                lastUpdated: new Date()
              }
            }
          )

          return catalogs
        }

        // Handle specific content type requests (backward compatibility)
        if (contentType === 'movie') {
          // Movie catalogs
          catalogs.push(
            {
              id: 'tmdb-popular-movie',
              title: 'Popular Movies',
              type: 'movie',
              description: 'Most popular movies on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'popular-movie',
                catalogType: 'popular',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-trending-movie',
              title: 'Trending Movies',
              type: 'movie',
              description: 'Currently trending movies on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'trending-movie',
                catalogType: 'trending',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-top_rated-movie',
              title: 'Top Rated Movies',
              type: 'movie',
              description: 'Highest rated movies on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'top_rated-movie',
                catalogType: 'top_rated',
                lastUpdated: new Date()
              }
            }
          )
        } else if (contentType === 'tv') {
          // TV show catalogs
          catalogs.push(
            {
              id: 'tmdb-popular-tv',
              title: 'Popular TV Shows',
              type: 'tv',
              description: 'Most popular TV shows on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'popular-tv',
                catalogType: 'popular',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-trending-tv',
              title: 'Trending TV Shows',
              type: 'tv',
              description: 'Currently trending TV shows on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'trending-tv',
                catalogType: 'trending',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-top_rated-tv',
              title: 'Top Rated TV Shows',
              type: 'tv',
              description: 'Highest rated TV shows on TMDB',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'top_rated-tv',
                catalogType: 'top_rated',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-airing_today-tv',
              title: 'Airing Today',
              type: 'tv',
              description: 'TV shows airing today',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'airing_today-tv',
                catalogType: 'airing_today',
                lastUpdated: new Date()
              }
            },
            {
              id: 'tmdb-on_the_air-tv',
              title: 'On The Air',
              type: 'tv',
              description: 'TV shows currently on the air',
              pagination: { currentPage: 1, hasMore: true },
              items: [],
              providerInfo: {
                sourceProvider: 'tmdb',
                sourceId: 'on_the_air-tv',
                catalogType: 'on_the_air',
                lastUpdated: new Date()
              }
            }
          )
        }

        return catalogs
      },
      { contentType }
    )
  }

  /**
   * Get catalog items with optional filters
   */
  async getCatalogItems(
    catalogId: string,
    filters?: CatalogFilters
  ): Promise<PaginationResponse<CatalogItem>> {
    return this.executeWithErrorHandling(
      'getCatalogItems',
      async () => {
        const { contentType, category } = this.parseCatalogId(catalogId)
        const page = filters?.page || 1

        this.logger.debug('Getting catalog items from TMDB', undefined, {
          catalogId,
          contentType,
          category,
          page,
          providerId: this.id
        })

        let tmdbResponse: TMDBCatalogResponse
        
        // Route to appropriate TMDB client method based on content type and category
        if (contentType === 'movie') {
          switch (category) {
            case 'popular':
              tmdbResponse = await this.tmdbClient.getPopularMovies({ page })
              break
            case 'trending':
              tmdbResponse = await this.tmdbClient.getTrendingMovies('week')
              break
            case 'top_rated':
              tmdbResponse = await this.tmdbClient.getTopRatedMovies({ page })
              break
            default:
              this.logger.warn('Unsupported movie catalog category, falling back to popular', undefined, {
                category,
                catalogId,
                providerId: this.id
              })
              tmdbResponse = await this.tmdbClient.getPopularMovies({ page })
              break
          }
        } else if (contentType === 'tv') {
          switch (category) {
            case 'popular':
              tmdbResponse = await this.tmdbClient.getPopularTV({ page })
              break
            case 'trending':
              tmdbResponse = await this.tmdbClient.getTrendingTV('week')
              break
            case 'top_rated':
              tmdbResponse = await this.tmdbClient.getTopRatedTV({ page })
              break
            case 'airing_today':
              tmdbResponse = await this.tmdbClient.getAiringToday({ page })
              break
            case 'on_the_air':
              tmdbResponse = await this.tmdbClient.getOnTheAir({ page })
              break
            default:
              this.logger.warn('Unsupported TV catalog category, falling back to popular', undefined, {
                category,
                catalogId,
                providerId: this.id
              })
              tmdbResponse = await this.tmdbClient.getPopularTV({ page })
              break
          }
        } else {
          // Fallback for unsupported content types
          this.logger.warn('Unsupported content type, falling back to popular movies', undefined, {
            contentType,
            catalogId,
            providerId: this.id
          })
          tmdbResponse = await this.tmdbClient.getPopularMovies({ page })
        }

        this.logger.info('TMDB catalog items retrieved', {
          catalogId,
          itemCount: tmdbResponse.results.length,
          page: tmdbResponse.page,
          totalPages: tmdbResponse.total_pages,
          providerId: this.id
        })

        const catalogItems = tmdbResponse.results.map(tmdbMedia => 
          this.mapToCatalogItem(tmdbMedia, { category, contentType })
        )

        return {
          results: catalogItems,
          page: tmdbResponse.page,
          totalPages: tmdbResponse.total_pages,
          totalResults: tmdbResponse.total_results,
          hasMore: tmdbResponse.page < tmdbResponse.total_pages
        }
      },
      { catalogId, filters }
    )
  }

  /**
   * Get popular content (convenience method)
   */
  async getPopular(
    contentType: ContentType,
    filters?: CatalogFilters
  ): Promise<PaginationResponse<CatalogItem>> {
    const catalogId = `tmdb-popular-${contentType}`
    return this.getCatalogItems(catalogId, filters)
  }

  /**
   * Get trending content with timeframe
   */
  async getTrending(
    contentType: ContentType,
    timeframe: 'day' | 'week' | 'month' = 'week'
  ): Promise<PaginationResponse<CatalogItem>> {
    return this.executeWithErrorHandling(
      'getTrending',
      async () => {
        this.logger.debug('Getting trending content from TMDB', undefined, {
          contentType,
          timeframe,
          providerId: this.id
        })

        const tmdbTimeframe = timeframe === 'month' ? 'week' : timeframe
        const tmdbResponse = await this.tmdbClient.getTrendingMovies(tmdbTimeframe)
        
        this.logger.info('TMDB trending content retrieved', {
          contentType,
          timeframe,
          itemCount: tmdbResponse.results.length,
          providerId: this.id
        })
        const catalogItems = tmdbResponse.results.map(tmdbMedia => 
          this.mapToCatalogItem(tmdbMedia, { category: 'trending', contentType })
        )

        return {
          results: catalogItems,
          page: tmdbResponse.page,
          totalPages: tmdbResponse.total_pages,
          totalResults: tmdbResponse.total_results,
          hasMore: tmdbResponse.page < tmdbResponse.total_pages
        }
      },
      { contentType, timeframe }
    )
  }

  protected async performHealthCheck(): Promise<void> {
    this.logger.debug('Performing TMDB Catalog Provider health check', undefined, {
      providerId: this.id
    })

    const validationResult = await this.executeWithTimeout(
      () => this.tmdbClient.validateCredentials(),
      10000,
      'TMDB credentials validation timeout'
    )

    if (!validationResult.valid) {
      this.logger.error('TMDB Catalog Provider health check failed', undefined, {
        providerId: this.id,
        validationDetails: validationResult.details,
        authMethod: validationResult.method
      })

      throw this.createError(
        `TMDB Catalog API health check failed: ${validationResult.details}`,
        'HEALTH_CHECK_FAILED',
        true,
        { 
          validationResult,
          providerId: this.id
        }
      )
    }

    this.logger.info('TMDB Catalog Provider health check passed', {
      providerId: this.id,
      authMethod: validationResult.method,
      responseTime: validationResult.testResults.configuration.responseTime + validationResult.testResults.genres.responseTime
    })
  }

  private parseCatalogId(catalogId: string): { contentType: ContentType; category: string } {
    const parts = catalogId.split('-')
    
    if (parts.length >= 3 && parts[0] === 'tmdb') {
      const category = parts.slice(1, -1).join('-')
      const contentType = parts[parts.length - 1] as ContentType
      return { contentType, category }
    }

    return { contentType: 'movie', category: 'discover' }
  }

  private mapToCatalogItem(tmdbMedia: TMDBMediaResult, context: { category: string; contentType: ContentType }): CatalogItem {
    this.logger.debug('Mapping TMDB media to catalog item', undefined, {
      tmdbId: tmdbMedia.id,
      category: context.category,
      contentType: context.contentType,
      providerId: this.id
    })

    const enhancedItem = this.mapper.mapToEnhancedCatalogItem(tmdbMedia, context.category)
    
    return {
      id: enhancedItem.id,
      type: enhancedItem.mediaType as ContentType,
      title: enhancedItem.name,
      description: enhancedItem.description,
      year: enhancedItem.year,
      releaseDate: enhancedItem.releaseDate,
      posterUrl: enhancedItem.poster,
      backdropUrl: enhancedItem.background,
      genres: enhancedItem.genres?.map(g => g.name) || [],
      rating: enhancedItem.ratings?.[0]?.value,
      providerInfo: {
        sourceProvider: 'tmdb',
        sourceId: enhancedItem.providerInfo.providerMediaId,
        catalogId: context.category
      }
    }
  }
}