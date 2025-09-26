/**
 * Simplified TMDB Search Provider - Fixed Interface Compliance
 * 
 * Simplified implementation that matches the actual provider capability interfaces
 * without the over-engineered features that were causing type errors.
 * 
 * @author Claude Code Assistant
 * @version 2.0.0 - Simplified
 */

import { BaseProvider } from '../base-provider'
import type {
  ISearchProvider,
  BaseProviderConfig,
  PaginationResponse
} from '../provider-interfaces'

import type { ContentType } from '@/src/domain/entities/provider.entity'
import type { 
  SearchResult, 
  SearchFilters, 
  CatalogItem 
} from '@/src/domain/entities/provider-capabilities.entity'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import { TMDBClient } from '@/src/infrastructure/api/tmdb-client'
import { TMDBMapper } from './tmdb-mapper'
import type {
  TMDBSearchResponse,
  TMDBMultiSearchResult,
  TMDBMediaResult,
  TMDBMovie,
  TMDBTVShow
} from './tmdb-types'

/**
 * Simplified TMDB Search Provider implementation
 */
export class TMDBSearchProvider extends BaseProvider implements ISearchProvider {
  private readonly tmdbClient: TMDBClient
  private readonly mapper: TMDBMapper

  constructor(config: BaseProviderConfig, logger: ILoggingService, tmdbClient: TMDBClient) {
    super(config, logger)
    this.tmdbClient = tmdbClient
    this.mapper = new TMDBMapper()
    
    this.logger.debug('TMDB Search Provider initialized', undefined, {
      providerId: this.id,
      enabled: config.enabled,
      priority: config.priority
    })
  }

  get id(): string {
    return 'tmdb-search'
  }

  get name(): string {
    return 'TMDB Search Provider'
  }

  get type(): string {
    return 'search'
  }

  /**
   * Multi-search across all content types
   */
  async search(query: string, filters?: SearchFilters): Promise<SearchResult> {
    return this.executeWithErrorHandling(
      'search',
      async () => {
        if (!query || query.trim().length < 2) {
          return {
            query: query.trim(),
            totalResults: 0,
            page: 1,
            totalPages: 0,
            results: [],
            searchTime: 0,
            providerInfo: {
              sourceProvider: 'tmdb',
              lastUpdated: new Date()
            }
          }
        }

        const startTime = Date.now()
        const page = filters?.page || 1

        // Use the new multi-search functionality from TMDB client
        const tmdbResponse = await this.tmdbClient.searchMulti(query.trim(), {
          page,
          language: filters?.language,
          includeAdult: false
        })

        const searchTime = Date.now() - startTime

        const catalogItems = tmdbResponse.results
          .filter((result: TMDBMultiSearchResult) => result.media_type === 'movie' || result.media_type === 'tv')
          .map((result: TMDBMultiSearchResult) => this.mapToCatalogItem(result))

        return {
          query: query.trim(),
          totalResults: tmdbResponse.total_results,
          page: tmdbResponse.page,
          totalPages: tmdbResponse.total_pages,
          results: catalogItems,
          searchTime,
          providerInfo: {
            sourceProvider: 'tmdb',
            lastUpdated: new Date()
          }
        }
      },
      { query, filters }
    )
  }

  /**
   * Search by specific content type
   */
  async searchByType(
    query: string,
    contentType: ContentType,
    filters?: SearchFilters
  ): Promise<PaginationResponse<CatalogItem>> {
    return this.executeWithErrorHandling(
      'searchByType',
      async () => {
        if (!query || query.trim().length < 2) {
          return {
            results: [],
            page: 1,
            totalPages: 0,
            totalResults: 0,
            hasMore: false
          }
        }

        const page = filters?.page || 1

        const tmdbResponse = contentType === 'movie'
          ? await this.tmdbClient.searchMovies(query.trim(), { page, includeAdult: false })
          : await this.tmdbClient.searchTV(query.trim(), { page, includeAdult: false })
        const catalogItems = tmdbResponse.results.map((tmdbMedia: TMDBMediaResult) => 
          this.mapToCatalogItemFromMedia(tmdbMedia)
        )

        return {
          results: catalogItems,
          page: tmdbResponse.page,
          totalPages: tmdbResponse.total_pages,
          totalResults: tmdbResponse.total_results,
          hasMore: tmdbResponse.page < tmdbResponse.total_pages
        }
      },
      { query, contentType, filters }
    )
  }

  /**
   * Get search suggestions for auto-complete
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    return this.executeWithErrorHandling(
      'getSearchSuggestions',
      async () => {
        if (!query || query.trim().length < 2) {
          return []
        }

        // Use the new multi-search functionality from TMDB client
        const tmdbResponse = await this.tmdbClient.searchMulti(query.trim(), {
          page: 1,
          language: 'en-US'
        })

        const suggestions = tmdbResponse.results
          .slice(0, 10)
          .map((result: TMDBMultiSearchResult) => {
            if (result.media_type === 'movie') {
              return (result as TMDBMovie).title
            } else if (result.media_type === 'tv') {
              return (result as TMDBTVShow).name
            }
            return result.name || ''
          })
          .filter((suggestion: string) => suggestion && suggestion.length > 0)
          .filter((suggestion: string, index: number, array: string[]) => array.indexOf(suggestion) === index)

        return suggestions
      },
      { query }
    )
  }

  protected async performHealthCheck(): Promise<void> {
    this.logger.debug('Performing TMDB Search Provider health check', undefined, {
      providerId: this.id
    })

    const validationResult = await this.executeWithTimeout(
      () => this.tmdbClient.validateCredentials(),
      10000,
      'TMDB credentials validation timeout'
    )

    if (!validationResult.valid) {
      this.logger.error('TMDB Search Provider health check failed', undefined, {
        providerId: this.id,
        validationDetails: validationResult.details,
        authMethod: validationResult.method
      })

      throw this.createError(
        `TMDB Search API health check failed: ${validationResult.details}`,
        'HEALTH_CHECK_FAILED',
        true,
        { 
          validationResult,
          providerId: this.id
        }
      )
    }

    this.logger.info('TMDB Search Provider health check passed', {
      providerId: this.id,
      authMethod: validationResult.method,
      responseTime: validationResult.testResults.configuration.responseTime + validationResult.testResults.genres.responseTime
    })
  }

  private mapToCatalogItem(result: TMDBMultiSearchResult): CatalogItem {
    const mediaType = result.media_type === 'movie' ? 'movie' : 'tv'
    const enhancedItem = this.mapper.mapToEnhancedCatalogItem(result as TMDBMediaResult, 'search')
    
    return {
      id: enhancedItem.id,
      type: mediaType as ContentType,
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
        sourceId: enhancedItem.providerInfo.providerMediaId
      }
    }
  }

  private mapToCatalogItemFromMedia(tmdbMedia: TMDBMediaResult): CatalogItem {
    const enhancedItem = this.mapper.mapToEnhancedCatalogItem(tmdbMedia, 'search')
    
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
        sourceId: enhancedItem.providerInfo.providerMediaId
      }
    }
  }
}