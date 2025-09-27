/**
 * Catalog entity for organizing and managing collections of media items
 * Provides pagination, filtering, and metadata for content organization
 */

import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { 
  CatalogType, 
  MediaType, 
  Genre, 
  SortBy, 
  SortOrder, 
  LanguageCode, 
  CountryCode, 
  TimeWindow 
} from '@/src/domain/entities/media/content-types'

/**
 * Catalog entity
 * Represents a collection of media items with metadata and organization
 */
export interface Catalog {
  /** Unique catalog identifier (UUID) */
  readonly id: string

  /** Internal catalog name for identification */
  readonly name: string

  /** Display title for users */
  readonly title: string

  /** Catalog description */
  readonly description?: string

  /** Type of catalog */
  readonly type: CatalogType

  /** Media items in this catalog */
  readonly items: CatalogItem[]

  /** Pagination information */
  readonly pagination: PaginationInfo

  /** Applied filters */
  readonly filters: CatalogFilters

  /** Catalog metadata */
  readonly metadata: CatalogMetadata

  /** Cache information */
  readonly cacheInfo?: CacheInfo

  /** Created timestamp */
  readonly createdAt: Date

  /** Last updated timestamp */
  readonly updatedAt: Date

  /** Expiration timestamp */
  readonly expiresAt?: Date
}

/**
 * Pagination information for catalog results
 */
export interface PaginationInfo {
  /** Current page number (1-based) */
  readonly currentPage: number

  /** Total number of pages */
  readonly totalPages: number

  /** Total number of items across all pages */
  readonly totalItems: number

  /** Number of items per page */
  readonly itemsPerPage: number

  /** Number of items on current page */
  readonly itemsOnPage: number

  /** Whether there is a next page */
  readonly hasNextPage: boolean

  /** Whether there is a previous page */
  readonly hasPreviousPage: boolean

  /** Next page number if available */
  readonly nextPage?: number

  /** Previous page number if available */
  readonly previousPage?: number
}

/**
 * Catalog filters applied to content
 */
export interface CatalogFilters {
  /** Search query */
  readonly query?: string

  /** Media types filter */
  readonly mediaTypes?: MediaType[]

  /** Genres filter */
  readonly genres?: Genre[]

  /** Language filter */
  readonly languages?: LanguageCode[]

  /** Country filter */
  readonly countries?: CountryCode[]

  /** Release date range */
  readonly releaseDateRange?: DateRange

  /** Vote average range */
  readonly voteAverageRange?: NumberRange

  /** Vote count minimum */
  readonly minVoteCount?: number

  /** Include adult content */
  readonly includeAdult?: boolean

  /** Minimum popularity */
  readonly minPopularity?: number

  /** Maximum popularity */
  readonly maxPopularity?: number

  /** Content rating filters */
  readonly contentRatings?: string[]

  /** Keywords filter */
  readonly keywords?: string[]

  /** Production companies filter */
  readonly productionCompanies?: number[]

  /** Networks filter (for TV) */
  readonly networks?: number[]

  /** Runtime range (in minutes) */
  readonly runtimeRange?: NumberRange

  /** Revenue range */
  readonly revenueRange?: NumberRange

  /** Budget range */
  readonly budgetRange?: NumberRange

  /** Custom provider filters */
  readonly providerFilters?: Record<string, unknown>
}

/**
 * Catalog metadata
 */
export interface CatalogMetadata {
  /** Source of the catalog data */
  readonly source: CatalogSource

  /** Sorting configuration */
  readonly sorting: SortingInfo

  /** Time window for trending content */
  readonly timeWindow?: TimeWindow

  /** Region/market for content */
  readonly region?: CountryCode

  /** Language for content */
  readonly language?: LanguageCode

  /** Catalog generation timestamp */
  readonly generatedAt: Date

  /** Data freshness score (0-1) */
  readonly freshnessScore?: number

  /** Catalog tags */
  readonly tags?: string[]

  /** User context information */
  readonly userContext?: UserContext

  /** Performance metrics */
  readonly performance?: PerformanceMetrics

  /** Error information if applicable */
  readonly errors?: CatalogError[]

  /** Warnings */
  readonly warnings?: CatalogWarning[]
}

/**
 * Cache information
 */
export interface CacheInfo {
  /** Cache key */
  readonly cacheKey: string

  /** Cache hit/miss indicator */
  readonly cacheHit: boolean

  /** Time to live in seconds */
  readonly ttl: number

  /** Time until refresh */
  readonly refreshIn?: number

  /** Background refresh enabled */
  readonly backgroundRefresh?: boolean

  /** Cache generation time */
  readonly cachedAt: Date

  /** Cache version */
  readonly version?: number
}

/**
 * Date range filter
 */
export interface DateRange {
  /** Start date */
  readonly from?: Date

  /** End date */
  readonly to?: Date
}

/**
 * Number range filter
 */
export interface NumberRange {
  /** Minimum value */
  readonly min?: number

  /** Maximum value */
  readonly max?: number
}

/**
 * Catalog source types
 */
export enum CatalogSource {
  API = 'api',
  CACHE = 'cache',
  USER_GENERATED = 'user_generated',
  SYSTEM_GENERATED = 'system_generated',
  IMPORTED = 'imported',
  AGGREGATED = 'aggregated'
}

/**
 * Sorting information
 */
export interface SortingInfo {
  /** Sort field */
  readonly sortBy: SortBy

  /** Sort order */
  readonly sortOrder: SortOrder

  /** Secondary sort field */
  readonly secondarySortBy?: SortBy

  /** Secondary sort order */
  readonly secondarySortOrder?: SortOrder
}

/**
 * User context for personalization
 */
export interface UserContext {
  /** User ID */
  readonly userId?: string

  /** User preferences */
  readonly preferences?: UserPreferences

  /** User location */
  readonly location?: LocationInfo

  /** Device information */
  readonly device?: DeviceInfo

  /** Session information */
  readonly session?: SessionInfo
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** Preferred genres */
  readonly preferredGenres?: Genre[]

  /** Excluded genres */
  readonly excludedGenres?: Genre[]

  /** Preferred languages */
  readonly preferredLanguages?: LanguageCode[]

  /** Preferred content ratings */
  readonly preferredContentRatings?: string[]

  /** Adult content preference */
  readonly allowAdultContent?: boolean

  /** Quality preferences */
  readonly qualityPreferences?: QualityPreferences
}

/**
 * Quality preferences
 */
export interface QualityPreferences {
  /** Minimum vote average */
  readonly minVoteAverage?: number

  /** Minimum vote count */
  readonly minVoteCount?: number

  /** Prefer recent content */
  readonly preferRecentContent?: boolean

  /** Prefer popular content */
  readonly preferPopularContent?: boolean
}

/**
 * Location information
 */
export interface LocationInfo {
  /** Country code */
  readonly country?: CountryCode

  /** Region/state */
  readonly region?: string

  /** City */
  readonly city?: string

  /** Timezone */
  readonly timezone?: string
}

/**
 * Device information
 */
export interface DeviceInfo {
  /** Device type */
  readonly type?: DeviceType

  /** Platform */
  readonly platform?: string

  /** Screen size */
  readonly screenSize?: ScreenSize

  /** Capabilities */
  readonly capabilities?: DeviceCapabilities
}

/**
 * Device types
 */
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
  TV = 'tv',
  SMART_SPEAKER = 'smart_speaker'
}

/**
 * Screen sizes
 */
export enum ScreenSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large'
}

/**
 * Device capabilities
 */
export interface DeviceCapabilities {
  /** Supports high-definition content */
  readonly supportsHD?: boolean

  /** Supports 4K content */
  readonly supports4K?: boolean

  /** Supports HDR */
  readonly supportsHDR?: boolean

  /** Supports offline download */
  readonly supportsOffline?: boolean

  /** Network connection type */
  readonly connectionType?: ConnectionType
}

/**
 * Connection types
 */
export enum ConnectionType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  OFFLINE = 'offline'
}

/**
 * Session information
 */
export interface SessionInfo {
  /** Session ID */
  readonly sessionId: string

  /** Session start time */
  readonly startedAt: Date

  /** Request count in session */
  readonly requestCount?: number

  /** User agent */
  readonly userAgent?: string
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Query execution time in milliseconds */
  readonly queryTime: number

  /** Total processing time in milliseconds */
  readonly totalTime: number

  /** Number of items processed */
  readonly itemsProcessed: number

  /** Memory usage in bytes */
  readonly memoryUsage?: number

  /** Cache efficiency ratio */
  readonly cacheEfficiency?: number

  /** API calls made */
  readonly apiCalls?: number
}

/**
 * Catalog error information
 */
export interface CatalogError {
  /** Error code */
  readonly code: string

  /** Error message */
  readonly message: string

  /** Error details */
  readonly details?: Record<string, unknown>

  /** Timestamp */
  readonly timestamp: Date

  /** Severity level */
  readonly severity: ErrorSeverity
}

/**
 * Catalog warning information
 */
export interface CatalogWarning {
  /** Warning code */
  readonly code: string

  /** Warning message */
  readonly message: string

  /** Warning details */
  readonly details?: Record<string, unknown>

  /** Timestamp */
  readonly timestamp: Date
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Catalog statistics
 */
export interface CatalogStatistics {
  /** Total items count */
  readonly totalItems: number

  /** Items by media type */
  readonly itemsByMediaType: Record<MediaType, number>

  /** Items by genre */
  readonly itemsByGenre: Record<Genre, number>

  /** Items by language */
  readonly itemsByLanguage: Record<LanguageCode, number>

  /** Items by country */
  readonly itemsByCountry: Record<CountryCode, number>

  /** Items by release year */
  readonly itemsByYear: Record<number, number>

  /** Average vote */
  readonly averageVote?: number

  /** Total vote count */
  readonly totalVotes?: number

  /** Most popular item */
  readonly mostPopularItem?: CatalogItem

  /** Highest rated item */
  readonly highestRatedItem?: CatalogItem

  /** Most recent item */
  readonly mostRecentItem?: CatalogItem
}

/**
 * Catalog utilities
 */
export class CatalogUtils {
  /**
   * Creates a unique catalog ID
   * @param catalogType - Type of catalog
   * @param providerId - Provider identifier
   * @param additionalParams - Additional parameters for uniqueness
   * @returns Unique catalog ID
   */
  static createCatalogId(
    catalogType: CatalogType,
    providerId: string,
    additionalParams?: Record<string, string | number>
  ): string {
    const timestamp = Date.now()
    const params = additionalParams ? Object.entries(additionalParams).map(([k, v]) => `${k}:${v}`).join('_') : ''
    const suffix = params ? `_${params}` : ''
    
    return `catalog_${catalogType}_${providerId}_${timestamp}${suffix}`
  }

  /**
   * Calculates pagination info
   * @param totalItems - Total number of items
   * @param currentPage - Current page number (1-based)
   * @param itemsPerPage - Items per page
   * @returns Pagination information
   */
  static calculatePagination(
    totalItems: number,
    currentPage: number,
    itemsPerPage: number
  ): PaginationInfo {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const hasNextPage = currentPage < totalPages
    const hasPreviousPage = currentPage > 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    const itemsOnPage = Math.max(0, endIndex - startIndex)

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      itemsOnPage,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? currentPage + 1 : undefined,
      previousPage: hasPreviousPage ? currentPage - 1 : undefined
    }
  }

  /**
   * Checks if catalog data is fresh
   * @param catalog - Catalog to check
   * @param maxAgeSeconds - Maximum age in seconds
   * @returns Whether catalog is fresh
   */
  static isCatalogFresh(catalog: Catalog, maxAgeSeconds: number): boolean {
    const now = new Date()
    const ageSeconds = (now.getTime() - catalog.updatedAt.getTime()) / 1000
    return ageSeconds <= maxAgeSeconds
  }

  /**
   * Gets catalog statistics
   * @param catalog - Catalog to analyze
   * @returns Catalog statistics
   */
  static getCatalogStatistics(catalog: Catalog): CatalogStatistics {
    const itemsByMediaType = {} as Record<MediaType, number>
    const itemsByGenre = {} as Record<Genre, number>
    const itemsByLanguage = {} as Record<LanguageCode, number>
    const itemsByCountry = {} as Record<CountryCode, number>
    const itemsByYear = {} as Record<number, number>

    let totalVotes = 0
    let voteSum = 0
    let mostPopular: CatalogItem | undefined
    let highestRated: CatalogItem | undefined
    let mostRecent: CatalogItem | undefined

    catalog.items.forEach(item => {
      // Count by media type
      itemsByMediaType[item.mediaType] = (itemsByMediaType[item.mediaType] || 0) + 1

      // Count by genres
      item.genres?.forEach(genre => {
        itemsByGenre[genre] = (itemsByGenre[genre] || 0) + 1
      })

      // Count by language
      if (item.originalLanguage) {
        itemsByLanguage[item.originalLanguage] = (itemsByLanguage[item.originalLanguage] || 0) + 1
      }

      // Count by country
      item.originCountries?.forEach(country => {
        itemsByCountry[country] = (itemsByCountry[country] || 0) + 1
      })

      // Count by year
      if (item.releaseDate) {
        const year = item.releaseDate.getFullYear()
        itemsByYear[year] = (itemsByYear[year] || 0) + 1
      }

      // Calculate averages and find notable items
      if (item.voteAverage != null && item.voteCount != null) {
        voteSum += item.voteAverage * item.voteCount
        totalVotes += item.voteCount

        if (!highestRated || (item.voteAverage > (highestRated.voteAverage || 0))) {
          highestRated = item
        }
      }

      if (item.popularity != null && (!mostPopular || item.popularity > (mostPopular.popularity || 0))) {
        mostPopular = item
      }

      if (item.releaseDate && (!mostRecent || item.releaseDate > (mostRecent.releaseDate || new Date(0)))) {
        mostRecent = item
      }
    })

    // Build the final statistics object
    const stats: CatalogStatistics = {
      totalItems: catalog.items.length,
      itemsByMediaType,
      itemsByGenre,
      itemsByLanguage,
      itemsByCountry,
      itemsByYear,
      averageVote: totalVotes > 0 ? voteSum / totalVotes : undefined,
      totalVotes: totalVotes > 0 ? totalVotes : undefined,
      mostPopularItem: mostPopular,
      highestRatedItem: highestRated,
      mostRecentItem: mostRecent
    }

    return stats
  }

  /**
   * Filters catalog items based on criteria
   * @param items - Items to filter
   * @param filters - Filter criteria
   * @returns Filtered items
   */
  static filterItems(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
    return items.filter(item => {
      // Media type filter
      if (filters.mediaTypes && filters.mediaTypes.length > 0) {
        if (!filters.mediaTypes.includes(item.mediaType)) {
          return false
        }
      }

      // Genre filter
      if (filters.genres && filters.genres.length > 0) {
        if (!item.genres || !filters.genres.some(genre => item.genres!.includes(genre))) {
          return false
        }
      }

      // Language filter
      if (filters.languages && filters.languages.length > 0) {
        if (!item.originalLanguage || !filters.languages.includes(item.originalLanguage)) {
          return false
        }
      }

      // Vote average range
      if (filters.voteAverageRange) {
        const voteAverage = item.voteAverage || 0
        if (filters.voteAverageRange.min != null && voteAverage < filters.voteAverageRange.min) {
          return false
        }
        if (filters.voteAverageRange.max != null && voteAverage > filters.voteAverageRange.max) {
          return false
        }
      }

      // Vote count minimum
      if (filters.minVoteCount != null) {
        const voteCount = item.voteCount || 0
        if (voteCount < filters.minVoteCount) {
          return false
        }
      }

      // Adult content filter
      if (filters.includeAdult === false && item.isAdult === true) {
        return false
      }

      // Release date range
      if (filters.releaseDateRange && item.releaseDate) {
        if (filters.releaseDateRange.from && item.releaseDate < filters.releaseDateRange.from) {
          return false
        }
        if (filters.releaseDateRange.to && item.releaseDate > filters.releaseDateRange.to) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Sorts catalog items
   * @param items - Items to sort
   * @param sorting - Sorting configuration
   * @returns Sorted items
   */
  static sortItems(items: CatalogItem[], sorting: SortingInfo): CatalogItem[] {
    return [...items].sort((a, b) => {
      const primaryComparison = this.compareItems(a, b, sorting.sortBy, sorting.sortOrder)
      
      if (primaryComparison !== 0) {
        return primaryComparison
      }

      // Use secondary sort if primary comparison is equal
      if (sorting.secondarySortBy) {
        return this.compareItems(a, b, sorting.secondarySortBy, sorting.secondarySortOrder || SortOrder.ASC)
      }

      return 0
    })
  }

  /**
   * Compares two catalog items for sorting
   * @param a - First item
   * @param b - Second item
   * @param sortBy - Sort field
   * @param sortOrder - Sort order
   * @returns Comparison result
   */
  private static compareItems(a: CatalogItem, b: CatalogItem, sortBy: SortBy, sortOrder: SortOrder): number {
    let comparison = 0

    switch (sortBy) {
      case SortBy.POPULARITY:
        comparison = (a.popularity || 0) - (b.popularity || 0)
        break
      case SortBy.RELEASE_DATE:
      case SortBy.PRIMARY_RELEASE_DATE:
        const dateA = a.releaseDate?.getTime() || 0
        const dateB = b.releaseDate?.getTime() || 0
        comparison = dateA - dateB
        break
      case SortBy.VOTE_AVERAGE:
        comparison = (a.voteAverage || 0) - (b.voteAverage || 0)
        break
      case SortBy.VOTE_COUNT:
        comparison = (a.voteCount || 0) - (b.voteCount || 0)
        break
      case SortBy.ORIGINAL_TITLE:
        comparison = (a.originalTitle || a.title).localeCompare(b.originalTitle || b.title)
        break
      default:
        comparison = a.title.localeCompare(b.title)
    }

    return sortOrder === SortOrder.DESC ? -comparison : comparison
  }
}