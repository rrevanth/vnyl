import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { ExternalIds } from '@/src/domain/entities/media/external-ids.entity'

/**
 * External IDs result with provider context
 */
export interface ExternalIdsResult {
  /** The complete external IDs map */
  readonly externalIds: ExternalIds

  /** Source item that provided the IDs */
  readonly sourceItem: CatalogItem

  /** Timestamp when the external IDs were fetched */
  readonly fetchedAt: Date

  /** Whether the result was from cache */
  readonly fromCache: boolean

  /** Data quality score (0-1) indicating completeness */
  readonly qualityScore: number
}

/**
 * External IDs provider interface
 * Providers with this capability can fetch external service identifiers for media content
 * Enables cross-platform content identification and linking
 */
export interface IExternalIdsProvider extends IProvider {
  /**
   * Get external IDs for a specific catalog item
   * Fetches identifiers from external services (IMDb, TVDb, social media, etc.)
   * 
   * @param catalogItem - The catalog item to get external IDs for
   * @returns Promise that resolves to external IDs result
   * 
   * @example
   * ```typescript
   * const result = await provider.getExternalIds(movieItem)
   * console.log(result.externalIds.imdb) // "tt1234567"
   * console.log(result.externalIds.tvdb) // 12345
   * ```
   */
  getExternalIds(catalogItem: CatalogItem): Promise<ExternalIdsResult>

  /**
   * Get external IDs for multiple catalog items
   * Enables bulk fetching for performance optimization
   * 
   * @param catalogItems - Array of catalog items to get external IDs for
   * @returns Promise that resolves to a map of item IDs to external IDs results
   * 
   * @example
   * ```typescript
   * const results = await provider.getBulkExternalIds([item1, item2])
   * Object.entries(results).forEach(([itemId, result]) => {
   *   console.log(`${itemId}: IMDb ${result.externalIds.imdb}`)
   * })
   * ```
   */
  getBulkExternalIds(catalogItems: CatalogItem[]): Promise<Record<string, ExternalIdsResult>>

  /**
   * Check if external IDs are supported for a given media type
   * Allows consumers to determine provider capability before making requests
   * 
   * @param mediaType - The media type to check support for
   * @returns Whether external IDs are supported for this media type
   * 
   * @example
   * ```typescript
   * if (provider.supportsMediaType(MediaType.MOVIE)) {
   *   const result = await provider.getExternalIds(movieItem)
   * }
   * ```
   */
  supportsMediaType(mediaType: string): boolean

  /**
   * Get the list of external ID sources this provider can fetch
   * Enables consumers to understand which external services are available
   * 
   * @returns Array of external ID source identifiers
   * 
   * @example
   * ```typescript
   * const sources = provider.getSupportedExternalSources()
   * console.log(sources) // ['imdb', 'tvdb', 'wikidata', 'facebook']
   * ```
   */
  getSupportedExternalSources(): string[]

  /**
   * Validate if external IDs can be fetched for a catalog item
   * Performs pre-flight checks without making expensive API calls
   * 
   * @param catalogItem - The catalog item to validate
   * @returns Whether external IDs can be fetched for this item
   * 
   * @example
   * ```typescript
   * if (provider.canFetchExternalIds(item)) {
   *   const result = await provider.getExternalIds(item)
   * } else {
   *   console.log('External IDs not available for this item')
   * }
   * ```
   */
  canFetchExternalIds(catalogItem: CatalogItem): boolean
}