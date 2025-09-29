import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'

/**
 * Recommendation parameters
 */
export interface RecommendationParams {
  /** Page number for pagination (1-based, defaults to 1) */
  readonly page?: number

  /** Number of results per page (defaults to provider default) */
  readonly limit?: number

  /** Include adult content in results (defaults to false) */
  readonly includeAdult?: boolean

  /** Language preference for results (ISO 639-1 code) */
  readonly language?: string

  /** Region preference for results (ISO 3166-1 code) */
  readonly region?: string

  /** Minimum vote average filter */
  readonly minVoteAverage?: number

  /** Minimum vote count filter */
  readonly minVoteCount?: number

  /** Release date range filter */
  readonly releaseDateRange?: {
    readonly from?: Date
    readonly to?: Date
  }

  /** Genre filters to include */
  readonly includeGenres?: string[]

  /** Genre filters to exclude */
  readonly excludeGenres?: string[]
}

/**
 * Recommendations provider interface
 * Providers with this capability can generate content recommendations based on catalog items
 * Returns multiple catalogs to allow flexibility in recommendation types (recommendations, similar, trending, etc.)
 */
export interface IRecommendationsProvider extends IProvider {
  /**
   * Get recommendations based on a catalog item
   * Returns multiple catalogs containing different types of recommendations
   * Providers can return recommendations, similar content, trending, etc. as separate catalogs
   * 
   * @param catalogItem - The source item to base recommendations on
   * @param params - Optional parameters to customize recommendations
   * @returns Promise that resolves to array of recommendation catalogs
   * 
   * @example
   * ```typescript
   * const catalogs = await provider.getRecommendations(movieItem, {
   *   limit: 20,
   *   minVoteAverage: 7.0,
   *   excludeGenres: ['Horror']
   * })
   * 
   * catalogs.forEach(catalog => {
   *   console.log(`${catalog.name}: ${catalog.items.length} items`)
   *   console.log(`Type: ${catalog.catalogContext.catalogType}`)
   * })
   * ```
   */
  getRecommendations(
    catalogItem: CatalogItem,
    params?: RecommendationParams
  ): Promise<Catalog[]>

  /**
   * Check if recommendations are supported for a given media type
   * Determines if the provider can generate recommendations for specific content types
   * 
   * @param mediaType - The media type to check support for
   * @returns Whether recommendations are supported for this media type
   * 
   * @example
   * ```typescript
   * if (provider.supportsRecommendationsForMediaType(MediaType.MOVIE)) {
   *   const catalogs = await provider.getRecommendations(movieItem)
   * }
   * ```
   */
  supportsRecommendationsForMediaType(mediaType: MediaType): boolean

  /**
   * Validate if recommendations can be generated for a catalog item
   * Performs pre-flight checks without making expensive API calls
   * 
   * @param catalogItem - The catalog item to validate
   * @returns Whether recommendations can be generated for this item
   * 
   * @example
   * ```typescript
   * if (provider.canGenerateRecommendations(item)) {
   *   const catalogs = await provider.getRecommendations(item)
   * } else {
   *   console.log('Recommendations not available for this item')
   * }
   * ```
   */
  canGenerateRecommendations(catalogItem: CatalogItem): boolean
}