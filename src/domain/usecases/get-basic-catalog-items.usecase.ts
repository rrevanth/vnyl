/**
 * Get Basic Catalog Items Use Case - Business Logic for Loading Catalog Items
 * 
 * Loads lightweight catalog items for home screen and catalog displays.
 * Focuses on performance with minimal data for list/grid views.
 * 
 * CLEAN Architecture: Domain layer business logic
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { ProviderRegistry } from '@/src/infrastructure/providers/provider-registry'
import type { BasicCatalogItem, EnhancedCatalog } from '@/src/domain/entities/enhanced-catalog-item.entity'
import { ProviderCapability } from '@/src/infrastructure/providers/provider-interfaces'

/**
 * Catalog loading request parameters
 */
export interface CatalogItemsRequest {
  catalogType: string // 'popular', 'trending', 'top_rated', etc.
  contentType?: string // 'movie', 'tv', 'series', etc.
  page?: number
  limit?: number
  region?: string
  language?: string
  genre?: string
  year?: number
}

/**
 * Catalog loading result
 */
export interface CatalogItemsResult {
  catalog: EnhancedCatalog
  items: BasicCatalogItem[]
  totalItems: number
  hasMore: boolean
  loadingTime: number
  errors: {
    providerId: string
    error: string
  }[]
}

/**
 * Get Basic Catalog Items Use Case
 * 
 * Encapsulates the business logic for loading lightweight catalog items
 * optimized for list and grid displays.
 */
export class GetBasicCatalogItemsUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly logger: ILoggingService
  ) {}

  /**
   * Load basic catalog items for display
   */
  async execute(request: CatalogItemsRequest): Promise<CatalogItemsResult> {
    const startTime = Date.now()
    const { catalogType, contentType = 'movie', page = 1, limit = 20 } = request
    
    this.logger.info('Loading basic catalog items', {
      catalogType,
      contentType,
      page,
      limit
    })

    try {
      // Get providers that support catalog listing
      const providers = this.providerRegistry.getProvidersForCapability(
        ProviderCapability.CATALOG
      )

      if (providers.length === 0) {
        throw new Error('No providers available for catalog loading')
      }

      // Try providers in priority order for catalog data
      const errors: CatalogItemsResult['errors'] = []
      
      for (const provider of providers) {
        try {
          // Check if provider supports this catalog type
          if (!this.providerSupportsCatalogType(provider, catalogType)) {
            continue
          }

          const catalogData = await this.loadCatalogFromProvider(
            provider,
            request
          )

          if (catalogData && catalogData.items.length > 0) {
            const loadingTime = Date.now() - startTime
            
            this.logger.info('Basic catalog items loaded successfully', {
              providerId: provider.config.id,
              itemCount: catalogData.items.length,
              hasMore: catalogData.hasMore,
              loadingTime
            })

            return {
              catalog: this.createEnhancedCatalog(catalogData, provider.config.id),
              items: catalogData.items,
              totalItems: catalogData.totalItems || catalogData.items.length,
              hasMore: catalogData.hasMore || false,
              loadingTime,
              errors
            }
          }
        } catch (providerError) {
          const errorMessage = providerError instanceof Error 
            ? providerError.message 
            : 'Unknown provider error'
          
          this.logger.warn(`Provider ${provider.config.id} failed for catalog loading`, undefined, {
            error: errorMessage,
            catalogType,
            contentType
          })
          
          errors.push({
            providerId: provider.config.id,
            error: errorMessage
          })
        }
      }

      // If all providers failed, return empty result with errors
      const loadingTime = Date.now() - startTime
      
      this.logger.warn('All providers failed for catalog loading', undefined, {
        catalogType,
        contentType,
        errorCount: errors.length,
        loadingTime
      })

      return {
        catalog: this.createEmptyCatalog(catalogType, contentType),
        items: [],
        totalItems: 0,
        hasMore: false,
        loadingTime,
        errors
      }

    } catch (error) {
      const loadingTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      this.logger.error('Catalog loading failed', error instanceof Error ? error : new Error(String(error)), {
        catalogType,
        contentType,
        loadingTime
      })

      throw new Error(`Failed to load catalog items: ${errorMessage}`)
    }
  }

  /**
   * Check if provider supports the requested catalog type
   */
  private providerSupportsCatalogType(provider: any, catalogType: string): boolean {
    // Basic validation - extend based on provider capabilities
    const supportedCatalogs = ['popular', 'trending', 'top_rated', 'now_playing', 'upcoming']
    return supportedCatalogs.includes(catalogType)
  }

  /**
   * Load catalog data from a specific provider
   */
  private async loadCatalogFromProvider(
    provider: any,
    request: CatalogItemsRequest
  ): Promise<{
    items: BasicCatalogItem[]
    totalItems?: number
    hasMore?: boolean
  } | null> {
    try {
      // Check if provider has catalog loading capability
      if (!('getCatalog' in provider)) {
        return null
      }

      const catalogData = await (provider as any).getCatalog({
        catalogType: request.catalogType,
        contentType: request.contentType,
        page: request.page,
        limit: request.limit,
        filters: {
          region: request.region,
          language: request.language,
          genre: request.genre,
          year: request.year
        }
      })

      // Convert provider-specific data to BasicCatalogItem format
      if (catalogData?.results && Array.isArray(catalogData.results)) {
        const items: BasicCatalogItem[] = catalogData.results.map((item: any) => 
          this.convertToBasicCatalogItem(item, provider.id)
        )

        return {
          items,
          totalItems: catalogData.total_results || catalogData.totalResults,
          hasMore: catalogData.page < catalogData.total_pages
        }
      }

      return null
    } catch (error) {
      this.logger.warn(`Failed to load catalog from provider ${provider.id}`, undefined, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }

  /**
   * Convert provider-specific item to BasicCatalogItem
   */
  private convertToBasicCatalogItem(providerItem: any, providerId: string): BasicCatalogItem {
    // Basic conversion - extend based on provider format
    return {
      id: String(providerItem.id || providerItem.imdb_id || providerItem.tmdb_id),
      mediaType: providerItem.media_type || 'movie',
      name: providerItem.title || providerItem.name || providerItem.original_title,
      poster: providerItem.poster_path,
      background: providerItem.backdrop_path,
      year: providerItem.release_date 
        ? new Date(providerItem.release_date).getFullYear()
        : providerItem.first_air_date
        ? new Date(providerItem.first_air_date).getFullYear()
        : undefined,
      releaseDate: providerItem.release_date || providerItem.first_air_date,
      description: providerItem.overview,
      popularity: providerItem.popularity,
      providerInfo: {
        providerId,
        providerMediaId: providerItem.id,
        mediaType: providerItem.media_type || 'movie',
        lastUpdated: new Date(),
        confidence: 0.9,
        sourceMetadata: {
          vote_average: providerItem.vote_average,
          vote_count: providerItem.vote_count,
          adult: providerItem.adult,
          original_language: providerItem.original_language
        }
      },
      enhancementLevel: 'basic',
      lastEnhanced: new Date()
    }
  }

  /**
   * Create enhanced catalog wrapper
   */
  private createEnhancedCatalog(catalogData: any, providerId: string): EnhancedCatalog {
    return {
      id: `${providerId}-${catalogData.catalogType || 'catalog'}`,
      title: this.getCatalogTitle(catalogData.catalogType || 'popular'),
      name: catalogData.catalogType || 'catalog',
      mediaType: catalogData.contentType || 'movie',
      rowType: 'default',
      providerId,
      items: catalogData.items,
      hasMore: catalogData.hasMore,
      page: catalogData.page || 1,
      totalPages: catalogData.totalPages,
      totalItems: catalogData.totalItems,
      lastUpdated: new Date(),
      enhancementLevel: 'basic'
    }
  }

  /**
   * Create empty catalog for error cases
   */
  private createEmptyCatalog(catalogType: string, contentType: string): EnhancedCatalog {
    return {
      id: `empty-${catalogType}`,
      title: this.getCatalogTitle(catalogType),
      name: catalogType,
      mediaType: contentType,
      rowType: 'default',
      providerId: 'system',
      items: [],
      hasMore: false,
      page: 1,
      totalPages: 0,
      totalItems: 0,
      lastUpdated: new Date(),
      enhancementLevel: 'basic'
    }
  }

  /**
   * Get human-readable catalog title
   */
  private getCatalogTitle(catalogType: string): string {
    const titles: Record<string, string> = {
      popular: 'Popular',
      trending: 'Trending',
      top_rated: 'Top Rated',
      now_playing: 'Now Playing',
      upcoming: 'Upcoming',
      latest: 'Latest'
    }
    
    return titles[catalogType] || catalogType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}