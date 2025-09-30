import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { PaginationOptions } from '@/src/domain/providers/base/pagination-options.interface'

/**
 * People provider interface
 * Providers with this capability can retrieve people information associated with media items
 * Returns catalogs containing different types of people organization (cast, crew, directors, producers, etc.)
 * Supports pagination for infinite scroll and loadMore functionality
 */
export interface IPeopleProvider extends IProvider {
  /**
   * Get people associated with a catalog item
   * Returns catalogs containing different types of people (cast, crew, directors, etc.)
   * Providers organize people into semantic catalogs for flexibility
   * 
   * @param catalogItem - The catalog item to get people for
   * @param options - Optional pagination parameters
   * @returns Promise that resolves to people result with catalogs array
   * 
   * @example
   * ```typescript
   * // Initial load
   * const result = await provider.getPeople(movieItem, { page: 1, limit: 20 })
   * result.people.forEach(catalog => {
   *   console.log(`${catalog.name}: ${catalog.items.length} people`)
   *   console.log(`Has more: ${catalog.pagination.hasMore}`)
   * })
   * ```
   */
  getPeople(
    catalogItem: CatalogItem, 
    options?: PaginationOptions
  ): Promise<{ people: Catalog[] }>


  /**
   * Load more items for a specific catalog (pagination)
   * Uses the catalog object to access context and metadata for proper pagination
   * Includes the original media item context for API calls that require it
   * Follows the ICatalogProvider.loadMoreItems pattern for consistency
   * 
   * @param catalog - The catalog to load more items for (contains pagination state)
   * @param originalMediaItem - The media item the people are associated with
   * @param page - The page number to load
   * @param limit - Optional limit for items per page
   * @returns Promise that resolves to array of catalog items
   * 
   * @example
   * ```typescript
   * // Load more cast members for a movie
   * const moreCast = await provider.loadMoreItems(
   *   castCatalog,
   *   movieItem,
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