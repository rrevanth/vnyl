import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { PaginationOptions } from '@/src/domain/providers/base/pagination-options.interface'

/**
 * Recommendations provider interface
 * Providers with this capability can generate content recommendations based on catalog items
 * Returns catalogs containing different types of recommendations (similar, trending, etc.)
 * Supports pagination for infinite scroll and loadMore functionality
 */
export interface IRecommendationsProvider extends IProvider {
  /**
   * Get recommendations based on a catalog item
   * Returns catalogs containing recommendations, similar content, trending items, etc.
   * Providers organize recommendations into semantic catalogs for flexibility
   * 
   * @param catalogItem - The source item to base recommendations on
   * @param options - Optional pagination parameters
   * @returns Promise that resolves to recommendations result with catalogs array
   * 
   * @example
   * ```typescript
   * // Initial load
   * const result = await provider.getRecommendations(movieItem, { page: 1, limit: 20 })
   * result.recommendations.forEach(catalog => {
   *   console.log(`${catalog.name}: ${catalog.items.length} items`)
   *   console.log(`Has more: ${catalog.pagination.hasMore}`)
   * })
   * ```
   */
  getRecommendations(
    catalogItem: CatalogItem, 
    options?: PaginationOptions
  ): Promise<{ recommendations: Catalog[] }>


  /**
   * Load more items for a specific catalog (pagination)
   * Uses the catalog object to access context and metadata for proper pagination
   * Includes the original media item context for API calls that require it
   * Follows the ICatalogProvider.loadMoreItems pattern for consistency
   * 
   * @param catalog - The catalog to load more items for (contains pagination state)
   * @param originalMediaItem - The media item the recommendations are based on
   * @param page - The page number to load
   * @param limit - Optional limit for items per page
   * @returns Promise that resolves to array of catalog items
   * 
   * @example
   * ```typescript
   * // Load more similar movies based on a source movie
   * const moreSimilar = await provider.loadMoreItems(
   *   similarCatalog,
   *   sourceMovieItem,
   *   2,
   *   20
   * )
   * ```
   */
  loadMoreItems(
    catalog: Catalog,
    originalMediaItem: CatalogItem,
    page: number,
    limit?: number
  ): Promise<CatalogItem[]>
}