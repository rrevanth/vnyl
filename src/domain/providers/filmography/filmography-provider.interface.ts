import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { PersonCatalogItem, CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { PaginationOptions } from '@/src/domain/providers/base/pagination-options.interface'

/**
 * Filmography provider interface
 * Providers with this capability can retrieve filmography information for person entities
 * Returns catalogs containing different types of filmography organization (Movies, TV Shows, As Director, As Producer, etc.)
 * Supports pagination for infinite scroll and loadMore functionality
 */
export interface IFilmographyProvider extends IProvider {
  /**
   * Get filmography associated with a person
   * Returns catalogs containing different types of filmography (movies, TV shows, directing credits, etc.)
   * Providers organize filmography into semantic catalogs for flexibility
   * 
   * @param person - The person to get filmography for
   * @param options - Optional pagination parameters
   * @returns Promise that resolves to filmography result with catalogs array
   * 
   * @example
   * ```typescript
   * // Initial load
   * const result = await provider.getFilmography(personItem, { page: 1, limit: 20 })
   * result.filmography.forEach(catalog => {
   *   console.log(`${catalog.name}: ${catalog.items.length} items`)
   *   console.log(`Has more: ${catalog.pagination.hasMore}`)
   * })
   * ```
   */
  getFilmography(
    person: PersonCatalogItem, 
    options?: PaginationOptions
  ): Promise<{ filmography: Catalog[] }>


  /**
   * Load more items for a specific filmography catalog (pagination)
   * Uses the catalog object to access context and metadata for proper pagination
   * Includes the original person context for API calls that require it
   * Follows the ICatalogProvider.loadMoreItems pattern for consistency
   * 
   * @param catalog - The catalog to load more items for (contains pagination state)
   * @param originalPerson - The person the filmography is based on
   * @param page - The page number to load
   * @param limit - Optional limit for items per page
   * @returns Promise that resolves to array of catalog items
   * 
   * @example
   * ```typescript
   * // Load more movies for a person
   * const moreMovies = await provider.loadMoreItems(
   *   moviesCatalog,
   *   personItem,
   *   2,
   *   20
   * )
   * ```
   */
  loadMoreItems(
    catalog: Catalog,
    originalPerson: PersonCatalogItem,
    page: number,
    limit?: number
  ): Promise<CatalogItem[]>
}