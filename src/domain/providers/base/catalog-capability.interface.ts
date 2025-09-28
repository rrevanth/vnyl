/**
 * Catalog Capability Interface
 * 
 * Interface for providers that support catalog operations (discovering and retrieving
 * collections of media items). This extends the base IProvider interface with 
 * catalog-specific methods for content discovery and organization.
 * 
 * @module Domain/Providers/Base
 */

import { IProvider } from './provider.interface'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { CatalogItem, CatalogItemSearchCriteria } from '@/src/domain/entities/media/catalog-item.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'

/**
 * Catalog request parameters for flexible catalog discovery
 */
export interface CatalogRequest {
  /** Catalog type identifier (e.g., 'popular', 'trending', 'top_rated', 'upcoming') */
  readonly catalogType: string

  /** Media type filter */
  readonly mediaType?: MediaType

  /** Page number for pagination (1-based) */
  readonly page?: number

  /** Number of items per page */
  readonly limit?: number

  /** Additional query parameters specific to the catalog type */
  readonly parameters?: Record<string, string | number | boolean>

  /** Search criteria for filtering results */
  readonly searchCriteria?: CatalogItemSearchCriteria

  /** Language code for localized results */
  readonly language?: string

  /** Region/country code for geo-specific results */
  readonly region?: string
}

/**
 * Catalog configuration for provider-specific settings
 */
export interface CatalogConfiguration {
  /** Available catalog types supported by this provider */
  readonly supportedCatalogTypes: CatalogTypeInfo[]

  /** Maximum items per page this provider supports */
  readonly maxItemsPerPage: number

  /** Default items per page */
  readonly defaultItemsPerPage: number

  /** Whether this provider supports search functionality */
  readonly supportsSearch: boolean

  /** Whether this provider supports pagination */
  readonly supportsPagination: boolean

  /** Supported media types for catalog operations */
  readonly supportedMediaTypes: MediaType[]

  /** Cache TTL settings for different catalog types */
  readonly cacheTtlByType?: Record<string, number>

  /** Rate limiting configuration specific to catalog operations */
  readonly rateLimiting?: CatalogRateLimiting
}

/**
 * Information about a specific catalog type
 */
export interface CatalogTypeInfo {
  /** Catalog type identifier */
  readonly type: string

  /** Human-readable name */
  readonly name: string

  /** Description of what this catalog contains */
  readonly description: string

  /** Supported media types for this catalog */
  readonly supportedMediaTypes: MediaType[]

  /** Whether this catalog supports pagination */
  readonly supportsPagination: boolean

  /** Whether this catalog supports search/filtering */
  readonly supportsFiltering: boolean

  /** Required parameters for this catalog type */
  readonly requiredParameters?: string[]

  /** Optional parameters for this catalog type */
  readonly optionalParameters?: string[]

  /** Estimated refresh frequency in minutes */
  readonly refreshFrequencyMinutes?: number
}

/**
 * Rate limiting configuration specific to catalog operations
 */
export interface CatalogRateLimiting {
  /** Requests per minute for catalog listing */
  readonly catalogRequestsPerMinute: number

  /** Requests per minute for search operations */
  readonly searchRequestsPerMinute: number

  /** Burst allowance for catalog operations */
  readonly burstAllowance?: number

  /** Cool down period after hitting rate limit (seconds) */
  readonly coolDownSeconds?: number
}

/**
 * Catalog operation result with metadata
 */
export interface CatalogResult {
  /** The catalog containing the items */
  readonly catalog: Catalog

  /** Whether the result came from cache */
  readonly fromCache: boolean

  /** Time taken to fetch the data (milliseconds) */
  readonly fetchTimeMs: number

  /** Provider-specific metadata */
  readonly providerMetadata?: Record<string, unknown>

  /** Rate limiting information */
  readonly rateLimitInfo?: RateLimitInfo

  /** Next page token for pagination (if applicable) */
  readonly nextPageToken?: string
}

/**
 * Rate limiting information in response
 */
export interface RateLimitInfo {
  /** Remaining requests in current window */
  readonly remaining: number

  /** Rate limit reset time */
  readonly resetAt: Date

  /** Rate limit window in seconds */
  readonly windowSeconds: number

  /** Whether request was throttled */
  readonly throttled: boolean
}

/**
 * Catalog search result
 */
export interface CatalogSearchResult {
  /** Search result items */
  readonly items: CatalogItem[]

  /** Total number of results across all pages */
  readonly totalResults: number

  /** Current page number */
  readonly currentPage: number

  /** Total number of pages */
  readonly totalPages: number

  /** Whether there are more results available */
  readonly hasMoreResults: boolean

  /** Search metadata */
  readonly searchMetadata: SearchMetadata

  /** Time taken for search operation */
  readonly searchTimeMs: number
}

/**
 * Search operation metadata
 */
export interface SearchMetadata {
  /** Original search query */
  readonly query: string

  /** Applied filters */
  readonly appliedFilters: CatalogItemSearchCriteria

  /** Search suggestions (if query had no results) */
  readonly suggestions?: string[]

  /** Search algorithm used */
  readonly algorithm?: string

  /** Search confidence score (0-1) */
  readonly confidence?: number
}

/**
 * Catalog Capability Interface
 * 
 * Providers implementing this interface can discover and retrieve collections
 * of media items organized into catalogs. This includes popular lists, trending
 * content, genre-based collections, and search functionality.
 */
export interface ICatalogCapability extends IProvider {
  /** This provider must support catalog capability */
  readonly capabilities: [ProviderCapability.CATALOG, ...ProviderCapability[]]

  /** Catalog configuration for this provider */
  readonly catalogConfig: CatalogConfiguration

  /**
   * Get available catalog types supported by this provider
   * 
   * @returns Promise resolving to array of supported catalog types
   * @throws {ProviderError} When catalog types cannot be retrieved
   */
  getCatalogTypes(): Promise<CatalogTypeInfo[]>

  /**
   * Retrieve a catalog by type and parameters
   * 
   * @param request - Catalog request parameters
   * @returns Promise resolving to catalog result
   * @throws {ProviderError} When catalog cannot be retrieved
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {ValidationError} When request parameters are invalid
   */
  getCatalog(request: CatalogRequest): Promise<CatalogResult>

  /**
   * Search for media items across catalogs
   * 
   * @param query - Search query string
   * @param searchCriteria - Additional search filters
   * @param page - Page number for pagination (1-based)
   * @param limit - Number of results per page
   * @returns Promise resolving to search results
   * @throws {ProviderError} When search operation fails
   * @throws {RateLimitError} When rate limit is exceeded
   * @throws {ValidationError} When search parameters are invalid
   */
  searchCatalogItems(
    query: string,
    searchCriteria?: CatalogItemSearchCriteria,
    page?: number,
    limit?: number
  ): Promise<CatalogSearchResult>

  /**
   * Get a specific catalog item by ID
   * 
   * @param itemId - Catalog item identifier
   * @param mediaType - Media type for validation
   * @returns Promise resolving to catalog item or null if not found
   * @throws {ProviderError} When item retrieval fails
   * @throws {ValidationError} When itemId is invalid
   */
  getCatalogItem(itemId: string, mediaType?: MediaType): Promise<CatalogItem | null>

  /**
   * Refresh/invalidate cached catalog data
   * 
   * @param catalogType - Specific catalog type to refresh (optional)
   * @returns Promise resolving when refresh is complete
   * @throws {ProviderError} When refresh operation fails
   */
  refreshCatalogCache(catalogType?: string): Promise<void>

  /**
   * Get catalog statistics and health information
   * 
   * @returns Promise resolving to catalog statistics
   * @throws {ProviderError} When statistics cannot be retrieved
   */
  getCatalogStats(): Promise<CatalogStats>

  /**
   * Validate catalog request parameters
   * 
   * @param request - Catalog request to validate
   * @returns Promise resolving to validation result
   */
  validateCatalogRequest(request: CatalogRequest): Promise<CatalogRequestValidation>
}

/**
 * Catalog statistics and health information
 */
export interface CatalogStats {
  /** Provider ID */
  readonly providerId: string

  /** Total number of catalog types supported */
  readonly totalCatalogTypes: number

  /** Total number of items across all catalogs (estimated) */
  readonly estimatedTotalItems: number

  /** Cache hit rate (0-1) */
  readonly cacheHitRate: number

  /** Average response time in milliseconds */
  readonly averageResponseTimeMs: number

  /** Number of requests in last hour */
  readonly requestsLastHour: number

  /** Number of errors in last hour */
  readonly errorsLastHour: number

  /** Last successful catalog fetch timestamp */
  readonly lastSuccessfulFetch: Date

  /** Rate limiting status */
  readonly rateLimitStatus: {
    readonly current: number
    readonly limit: number
    readonly resetAt: Date
  }

  /** Health status per catalog type */
  readonly catalogTypeHealth: Record<string, CatalogTypeHealth>
}

/**
 * Health information for a specific catalog type
 */
export interface CatalogTypeHealth {
  /** Catalog type identifier */
  readonly catalogType: string

  /** Whether this catalog type is healthy */
  readonly healthy: boolean

  /** Last successful fetch */
  readonly lastSuccessfulFetch?: Date

  /** Last error encountered */
  readonly lastError?: string

  /** Error count in last hour */
  readonly errorCount: number

  /** Average items per page */
  readonly averageItemsPerPage: number

  /** Cache hit rate for this catalog type */
  readonly cacheHitRate: number
}

/**
 * Catalog request validation result
 */
export interface CatalogRequestValidation {
  /** Whether the request is valid */
  readonly valid: boolean

  /** Validation errors if any */
  readonly errors: ValidationError[]

  /** Validated and normalized request */
  readonly normalizedRequest?: CatalogRequest

  /** Warnings about the request */
  readonly warnings?: string[]
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Field that failed validation */
  readonly field: string

  /** Error message */
  readonly message: string

  /** Error code for programmatic handling */
  readonly code: string

  /** Suggested fix */
  readonly suggestion?: string
}