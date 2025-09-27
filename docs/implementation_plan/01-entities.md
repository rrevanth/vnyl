# Entity Definitions

## Overview

This document defines the core content entities with provider tracking and traceability. Each entity maintains information about its data sources, enabling cross-provider aggregation and audit trails.

## Core Principles

- **Provider Awareness**: Every entity knows its data sources
- **Traceability**: MediaItems can trace back to source ContentRows
- **External ID Mapping**: Cross-provider identification system
- **Immutable Design**: Entities are readonly with transformation methods

## Entity Hierarchy

```
ContentRow (Catalog section with provider info)
├── Provider metadata and catalog source info
├── Collection of ContentItems
└── Unique ID with UUID suffix for React rendering

ContentItem (Lightweight list item)
├── Essential display information
├── External IDs for cross-provider mapping
├── Provider source information
└── Optional reference to source ContentRow

MediaItem (Detailed information)
├── Comprehensive media details
├── Aggregated data from multiple providers
├── Array of contributing providers
├── Optional reference to source ContentRow
└── Raw provider data for debugging
```

## ProviderInfo Entity

```typescript
/**
 * Provider information entity
 * Tracks data source and metadata for traceability
 */
export interface ProviderInfo {
  /** Provider ID (e.g., 'tmdb', 'trakt-tmdb-123') */
  readonly id: string

  /** Provider source ID (e.g., 'tmdb', 'trakt', 'stremio') */
  readonly sourceId: string

  /** Human-readable provider name */
  readonly name: string

  /** Provider type/category */
  readonly type: ProviderType

  /** Capabilities this provider supports */
  readonly capabilities: ProviderCapability[]

  /** Priority/weight for data merging (lower = higher priority) */
  readonly priority: number

  /** Data freshness timestamp */
  readonly dataTimestamp: Date

  /** API version used */
  readonly apiVersion?: string

  /** Additional provider-specific metadata */
  readonly metadata?: Record<string, unknown>
}

export enum ProviderType {
  METADATA = 'metadata',
  CATALOG = 'catalog',  
  IMAGES = 'images',
  RATINGS = 'ratings',
  STREAMS = 'streams',
  TRACKING = 'tracking',
  ADDON_CATALOG = 'addon_catalog'
}

export enum ProviderCapability {
  CATALOG = 'catalog',
  METADATA = 'metadata',
  IMAGES = 'images',
  RATINGS = 'ratings',
  REVIEWS = 'reviews',
  RECOMMENDATIONS = 'recommendations',
  PEOPLE = 'people',
  STREAMS = 'streams',
  SUBTITLES = 'subtitles',
  WATCHLIST = 'watchlist',
  ACTIVITY = 'activity',
  ADDON_CATALOG = 'addon_catalog'
}
```

## ContentRow Entity

```typescript
/**
 * Content row entity representing a provider-aware catalog section
 * Contains collection of items with full provider traceability
 */
export interface ContentRow {
  /** Unique identifier with UUID suffix for React rendering */
  readonly id: string

  /** Internal row name for identification */
  readonly name: string

  /** Display title for users */
  readonly title: string

  /** Optional description */
  readonly description?: string

  /** Row type/category */
  readonly type: ContentRowType

  /** Items in this row */
  readonly items: ContentItem[]

  /** Provider that generated this row */
  readonly provider: ProviderInfo

  /** Original catalog/source information */
  readonly catalogSource: CatalogSourceInfo

  /** Pagination information if applicable */
  readonly pagination?: PaginationInfo

  /** Row metadata */
  readonly metadata: ContentRowMetadata

  /** Created timestamp */
  readonly createdAt: Date

  /** Last updated timestamp */
  readonly updatedAt: Date

  /** Cache expiration */
  readonly expiresAt?: Date
}

export enum ContentRowType {
  TRENDING = 'trending',
  POPULAR = 'popular',
  TOP_RATED = 'top_rated',
  NOW_PLAYING = 'now_playing',
  UPCOMING = 'upcoming',
  RECOMMENDATIONS = 'recommendations',
  SIMILAR = 'similar',
  WATCHLIST = 'watchlist',
  SEARCH_RESULTS = 'search_results',
  CUSTOM = 'custom'
}

export interface CatalogSourceInfo {
  /** Source catalog ID from provider */
  readonly catalogId: string

  /** Source catalog name */
  readonly catalogName: string

  /** Provider-specific catalog type */
  readonly providerCatalogType: string

  /** Additional catalog parameters */
  readonly catalogParams?: Record<string, unknown>

  /** Genre filters applied */
  readonly genreFilters?: string[]

  /** Search query if applicable */
  readonly searchQuery?: string
}

export interface ContentRowMetadata {
  /** Total items available from provider */
  readonly totalItems?: number

  /** Items processed vs requested */
  readonly processingStats?: {
    readonly requested: number
    readonly processed: number
    readonly failed: number
  }

  /** Quality metrics */
  readonly quality?: {
    readonly averageVoteCount: number
    readonly averageRating: number
    readonly hasImages: number
    readonly missingData: string[]
  }

  /** Performance metrics */
  readonly performance?: {
    readonly fetchTime: number
    readonly transformTime: number
    readonly cacheHit: boolean
  }

  /** Provider-specific metadata */
  readonly providerMetadata?: Record<string, unknown>
}
```

## ContentItem Entity

```typescript
/**
 * Content item entity for lightweight catalog display
 * Provider-aware with external ID mapping for cross-provider queries
 */
export interface ContentItem {
  /** Unique identifier (format: mediaType_providerId_externalId) */
  readonly id: string

  /** Media type */
  readonly mediaType: MediaType

  /** Primary title */
  readonly title: string

  /** Original title in original language */
  readonly originalTitle?: string

  /** Brief overview/synopsis */
  readonly overview?: string

  /** Primary release date */
  readonly releaseDate?: Date

  /** Poster image URL */
  readonly posterUrl?: string

  /** Backdrop image URL */
  readonly backdropUrl?: string

  /** Average rating (0-10) */
  readonly voteAverage?: number

  /** Total number of votes */
  readonly voteCount?: number

  /** Popularity score */
  readonly popularity?: number

  /** Primary language code */
  readonly originalLanguage?: LanguageCode

  /** Origin country codes */
  readonly originCountries?: CountryCode[]

  /** Primary genres */
  readonly genres?: Genre[]

  /** Content rating */
  readonly contentRating?: ContentRating

  /** Adult content flag */
  readonly isAdult?: boolean

  /** External service identifiers for cross-provider mapping */
  readonly externalIds: ExternalIds

  /** Provider that supplied this item */
  readonly provider: ProviderInfo

  /** Reference to source ContentRow (if derived from catalog) */
  readonly sourceContentRow?: ContentRowReference

  /** Item position in source catalog */
  readonly catalogPosition?: number

  /** Data quality indicators */
  readonly dataQuality: DataQualityInfo

  /** Created timestamp */
  readonly createdAt: Date

  /** Last updated timestamp */
  readonly updatedAt: Date
}

export interface ContentRowReference {
  /** ContentRow ID */
  readonly id: string

  /** ContentRow title */
  readonly title: string

  /** Catalog source info */
  readonly catalogSource: CatalogSourceInfo

  /** Provider info */
  readonly provider: ProviderInfo
}

export interface DataQualityInfo {
  /** Completeness score (0-1) */
  readonly completeness: number

  /** Missing fields */
  readonly missingFields: string[]

  /** Data confidence score (0-1) */
  readonly confidence: number

  /** Whether item has minimum required data */
  readonly hasMinimumData: boolean

  /** Quality flags */
  readonly flags: DataQualityFlag[]
}

export enum DataQualityFlag {
  MISSING_POSTER = 'missing_poster',
  MISSING_OVERVIEW = 'missing_overview',
  MISSING_RELEASE_DATE = 'missing_release_date',
  LOW_VOTE_COUNT = 'low_vote_count',
  INCOMPLETE_EXTERNAL_IDS = 'incomplete_external_ids',
  STALE_DATA = 'stale_data'
}
```

## MediaItem Entity

```typescript
/**
 * Media item entity for detailed information display
 * Aggregates data from multiple providers with full traceability
 */
export interface MediaItem {
  /** Unique identifier */
  readonly id: string

  /** Media type */
  readonly mediaType: MediaType

  /** Core media information */
  readonly core: MediaItemCore

  /** Aggregated data from multiple providers */
  readonly aggregated: MediaItemAggregated

  /** All providers that contributed data */
  readonly providers: ProviderInfo[]

  /** Reference to source ContentRow (if applicable) */
  readonly sourceContentRow?: ContentRowReference

  /** Cross-provider external ID mapping */
  readonly externalIds: ExternalIds

  /** Aggregation metadata */
  readonly aggregationInfo: AggregationInfo

  /** Raw provider data (for debugging/audit) */
  readonly providerData?: Record<string, unknown>

  /** Created timestamp */
  readonly createdAt: Date

  /** Last updated timestamp */
  readonly updatedAt: Date

  /** Next refresh time */
  readonly nextRefreshAt?: Date
}

export interface MediaItemCore {
  /** Primary title */
  readonly title: string

  /** Original title */
  readonly originalTitle?: string

  /** Comprehensive overview */
  readonly overview?: string

  /** Primary release date */
  readonly releaseDate?: Date

  /** Primary language */
  readonly originalLanguage?: LanguageCode

  /** Origin countries */
  readonly originCountries?: CountryCode[]

  /** Genres */
  readonly genres?: Genre[]

  /** Content rating */
  readonly contentRating?: ContentRating

  /** Adult content flag */
  readonly isAdult?: boolean

  /** Status */
  readonly status?: MediaStatus
}

export interface MediaItemAggregated {
  /** Images from all providers */
  readonly images: {
    readonly posters: ImageInfo[]
    readonly backdrops: ImageInfo[]
    readonly logos: ImageInfo[]
  }

  /** Ratings from multiple sources */
  readonly ratings: {
    readonly weighted: RatingInfo
    readonly byProvider: Record<string, RatingInfo>
  }

  /** Cast and crew */
  readonly people: {
    readonly cast: CastMember[]
    readonly crew: CrewMember[]
  }

  /** Reviews from multiple sources */
  readonly reviews: ReviewInfo[]

  /** Recommendations */
  readonly recommendations: ContentItem[]

  /** Similar content */
  readonly similar: ContentItem[]

  /** Streaming availability */
  readonly streaming?: StreamingInfo

  /** Videos (trailers, clips, etc.) */
  readonly videos: VideoInfo[]

  /** Production information */
  readonly production: ProductionInfo

  /** Runtime/duration information */
  readonly runtime?: RuntimeInfo

  /** Watch providers */
  readonly watchProviders?: WatchProviderInfo[]
}

export interface AggregationInfo {
  /** Aggregation strategy used */
  readonly strategy: AggregationStrategy

  /** Data merge timestamp */
  readonly mergedAt: Date

  /** Provider priority order used */
  readonly providerPriority: string[]

  /** Conflicts encountered during merge */
  readonly conflicts: DataConflict[]

  /** Data coverage by provider */
  readonly coverage: Record<string, string[]>

  /** Quality score of aggregated data */
  readonly qualityScore: number
}

export enum AggregationStrategy {
  PRIORITY_BASED = 'priority_based',
  WEIGHTED_AVERAGE = 'weighted_average',
  MOST_RECENT = 'most_recent',
  HIGHEST_CONFIDENCE = 'highest_confidence'
}

export interface DataConflict {
  /** Field that had conflicting data */
  readonly field: string

  /** Values from different providers */
  readonly values: Record<string, unknown>

  /** Resolution strategy used */
  readonly resolution: ConflictResolution

  /** Final chosen value */
  readonly resolvedValue: unknown
}

export enum ConflictResolution {
  PRIORITY_PROVIDER = 'priority_provider',
  MOST_VOTES = 'most_votes',
  NEWEST_DATA = 'newest_data',
  MANUAL_OVERRIDE = 'manual_override'
}
```

## Supporting Types

```typescript
export interface ImageInfo {
  readonly url: string
  readonly type: ImageType
  readonly width?: number
  readonly height?: number
  readonly aspectRatio?: number
  readonly language?: LanguageCode
  readonly provider: ProviderInfo
  readonly voteAverage?: number
  readonly voteCount?: number
}

export interface RatingInfo {
  readonly average: number
  readonly count: number
  readonly scale: RatingScale
  readonly provider?: ProviderInfo
  readonly lastUpdated: Date
}

export interface ReviewInfo {
  readonly id: string
  readonly author: string
  readonly content: string
  readonly rating?: number
  readonly createdAt: Date
  readonly provider: ProviderInfo
  readonly url?: string
  readonly helpful?: number
}

export interface StreamingInfo {
  readonly available: boolean
  readonly providers: StreamingProvider[]
  readonly region: CountryCode
  readonly lastChecked: Date
}

export interface StreamingProvider {
  readonly id: string
  readonly name: string
  readonly type: StreamingType
  readonly url?: string
  readonly price?: string
  readonly quality?: VideoQuality
}

export enum StreamingType {
  SUBSCRIPTION = 'subscription',
  RENTAL = 'rental',
  PURCHASE = 'purchase',
  FREE = 'free',
  AD_SUPPORTED = 'ad_supported'
}

export interface RuntimeInfo {
  readonly total?: number
  readonly episodes?: number[]
  readonly seasons?: SeasonRuntimeInfo[]
}

export interface SeasonRuntimeInfo {
  readonly seasonNumber: number
  readonly episodes: EpisodeRuntimeInfo[]
  readonly totalRuntime: number
}

export interface EpisodeRuntimeInfo {
  readonly episodeNumber: number
  readonly runtime: number
}
```

## Entity Utilities

```typescript
export class ContentRowUtils {
  /**
   * Creates a unique ContentRow ID with UUID suffix
   */
  static createId(providerId: string, catalogId: string, type: ContentRowType): string {
    const uuid = generateUUID()
    return `contentrow_${type}_${providerId}_${catalogId}_${uuid}`
  }

  /**
   * Validates ContentRow has minimum required data
   */
  static isValid(contentRow: ContentRow): boolean {
    return !!(
      contentRow.id &&
      contentRow.title &&
      contentRow.provider &&
      contentRow.catalogSource &&
      contentRow.items.length > 0
    )
  }

  /**
   * Calculates data quality score for ContentRow
   */
  static calculateQualityScore(contentRow: ContentRow): number {
    const itemScores = contentRow.items.map(item => item.dataQuality.completeness)
    return itemScores.reduce((sum, score) => sum + score, 0) / itemScores.length
  }
}

export class ContentItemUtils {
  /**
   * Creates ContentItem ID from provider and external ID
   */
  static createId(mediaType: MediaType, providerId: string, externalId: string | number): string {
    return `${mediaType}_${providerId}_${externalId}`
  }

  /**
   * Calculates data completeness score
   */
  static calculateCompleteness(item: ContentItem): number {
    const requiredFields = ['title', 'mediaType', 'externalIds']
    const optionalFields = ['overview', 'posterUrl', 'releaseDate', 'voteAverage']
    
    const requiredCount = requiredFields.filter(field => item[field as keyof ContentItem]).length
    const optionalCount = optionalFields.filter(field => item[field as keyof ContentItem]).length
    
    return (requiredCount + (optionalCount * 0.5)) / (requiredFields.length + optionalFields.length)
  }

  /**
   * Extracts best external ID for cross-provider queries
   */
  static getBestExternalId(item: ContentItem): { source: ExternalIdSource; id: string | number } | null {
    const priority = [ExternalIdSource.IMDB, ExternalIdSource.TMDB, ExternalIdSource.TVDB]
    
    for (const source of priority) {
      const id = item.externalIds[source as keyof ExternalIds]
      if (id != null) {
        return { source, id }
      }
    }
    
    return null
  }
}

export class MediaItemUtils {
  /**
   * Merges data from multiple providers based on priority
   */
  static mergeProviderData(items: ContentItem[], providers: ProviderInfo[]): MediaItemAggregated {
    // Implementation for smart data merging
    // Priority-based conflict resolution
    // Quality-weighted averaging for ratings
    // Comprehensive image and video aggregation
  }

  /**
   * Detects and resolves data conflicts
   */
  static resolveConflicts(field: string, values: Record<string, unknown>): DataConflict {
    // Implementation for conflict detection and resolution
  }

  /**
   * Calculates overall quality score for aggregated data
   */
  static calculateQualityScore(mediaItem: MediaItem): number {
    // Implementation for quality scoring
  }
}
```

## Migration Strategy

### From Existing Entities

1. **Current CatalogItem** → **ContentItem**
   - Add provider tracking
   - Add external IDs mapping
   - Add data quality metrics
   - Add source ContentRow reference

2. **Current Catalog** → **ContentRow**
   - Add provider information
   - Add catalog source tracking
   - Restructure items as ContentItem array
   - Add metadata and quality metrics

3. **New MediaItem** 
   - Aggregate existing metadata sources
   - Implement provider data merging
   - Add comprehensive audit trail

### Implementation Order

1. Create ProviderInfo and supporting types
2. Implement ContentItem with provider tracking
3. Implement ContentRow with catalog source info
4. Implement MediaItem with aggregation logic
5. Update existing use cases to use new entities
6. Migrate existing data transformation logic

This entity design provides complete provider traceability while enabling efficient cross-provider data aggregation and maintaining the performance needed for smooth UI rendering.