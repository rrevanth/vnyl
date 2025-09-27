# Provider Capability Interfaces

## Overview

This document defines the specific capability interfaces that providers can implement. Each capability represents a distinct piece of functionality that a provider can offer, allowing for fine-grained discovery and usage of provider services.

## Capability Design Principles

- **Single Responsibility**: Each capability interface focuses on one specific functionality
- **Provider Agnostic**: Interfaces work with any provider implementation
- **Type Safety**: Full TypeScript support with generic constraints
- **Request/Response Pattern**: Consistent pattern across all capabilities
- **Error Handling**: Standardized error handling and retry mechanisms
- **Caching Support**: Built-in caching hints and invalidation

## Core Capability Interfaces

### ICatalogProvider

```typescript
/**
 * Catalog provider capability
 * Provides browseable content collections (trending, popular, etc.)
 */
export interface ICatalogProvider extends IProvider {
  readonly capabilities: ProviderCapability.CATALOG[]

  /**
   * Get available catalogs
   */
  getCatalogs(request: GetCatalogsRequest): Promise<ProviderResponse<AvailableCatalog[]>>

  /**
   * Get catalog items
   */
  getCatalogItems(request: GetCatalogItemsRequest): Promise<ProviderResponse<ContentRow>>

  /**
   * Search within catalogs
   */
  searchCatalog(request: SearchCatalogRequest): Promise<ProviderResponse<ContentRow>>
}

export interface GetCatalogsRequest extends ProviderRequest {
  /** Media types to include */
  readonly mediaTypes?: MediaType[]

  /** Language for catalog names */
  readonly language?: LanguageCode

  /** Region for regional catalogs */
  readonly region?: CountryCode
}

export interface AvailableCatalog {
  /** Catalog identifier */
  readonly id: string

  /** Catalog name */
  readonly name: string

  /** Catalog description */
  readonly description?: string

  /** Catalog type */
  readonly type: CatalogType

  /** Supported media types */
  readonly mediaTypes: MediaType[]

  /** Supported extra parameters */
  readonly extraParams?: CatalogExtraParam[]

  /** Genre filters available */
  readonly genres?: string[]

  /** Estimated item count */
  readonly estimatedItemCount?: number
}

export interface CatalogExtraParam {
  readonly name: string
  readonly required: boolean
  readonly type: 'string' | 'number' | 'boolean' | 'array'
  readonly options?: string[]
  readonly description?: string
}

export interface GetCatalogItemsRequest extends ProviderRequest {
  /** Catalog identifier */
  readonly catalogId: string

  /** Pagination */
  readonly pagination?: {
    readonly page?: number
    readonly limit?: number
    readonly offset?: number
  }

  /** Filters */
  readonly filters?: {
    readonly genre?: string
    readonly year?: number
    readonly rating?: { min?: number; max?: number }
    readonly sortBy?: string
    readonly sortOrder?: 'asc' | 'desc'
  }

  /** Extra parameters */
  readonly extra?: Record<string, unknown>
}

export interface SearchCatalogRequest extends ProviderRequest {
  /** Search query */
  readonly query: string

  /** Media types to search */
  readonly mediaTypes?: MediaType[]

  /** Pagination */
  readonly pagination?: {
    readonly page?: number
    readonly limit?: number
  }

  /** Additional filters */
  readonly filters?: Record<string, unknown>
}
```

### IMetadataProvider

```typescript
/**
 * Metadata provider capability
 * Provides detailed information about specific media items
 */
export interface IMetadataProvider extends IProvider {
  readonly capabilities: ProviderCapability.METADATA[]

  /**
   * Get media metadata by ID
   */
  getMetadata(request: GetMetadataRequest): Promise<ProviderResponse<ContentItem>>

  /**
   * Get detailed media information
   */
  getDetailedMetadata(request: GetDetailedMetadataRequest): Promise<ProviderResponse<MediaItem>>

  /**
   * Batch get metadata for multiple items
   */
  batchGetMetadata(request: BatchGetMetadataRequest): Promise<ProviderResponse<ContentItem[]>>

  /**
   * Find metadata by external IDs
   */
  findByExternalId(request: FindByExternalIdRequest): Promise<ProviderResponse<ContentItem | null>>
}

export interface GetMetadataRequest extends ProviderRequest {
  /** Media ID in provider's system */
  readonly mediaId: string | number

  /** Media type */
  readonly mediaType: MediaType

  /** Language for metadata */
  readonly language?: LanguageCode

  /** Include external IDs */
  readonly includeExternalIds?: boolean
}

export interface GetDetailedMetadataRequest extends GetMetadataRequest {
  /** Include cast and crew */
  readonly includeCast?: boolean

  /** Include videos */
  readonly includeVideos?: boolean

  /** Include images */
  readonly includeImages?: boolean

  /** Include reviews */
  readonly includeReviews?: boolean

  /** Include recommendations */
  readonly includeRecommendations?: boolean

  /** Include similar content */
  readonly includeSimilar?: boolean

  /** Include watch providers */
  readonly includeWatchProviders?: boolean
}

export interface BatchGetMetadataRequest extends ProviderRequest {
  /** Array of media identifiers */
  readonly mediaIds: Array<{
    readonly id: string | number
    readonly mediaType: MediaType
  }>

  /** Maximum items to return */
  readonly limit?: number

  /** Language preference */
  readonly language?: LanguageCode
}

export interface FindByExternalIdRequest extends ProviderRequest {
  /** External ID value */
  readonly externalId: string | number

  /** External ID source */
  readonly externalSource: ExternalIdSource

  /** Media type hint */
  readonly mediaType?: MediaType
}
```

### IImagesProvider

```typescript
/**
 * Images provider capability
 * Provides media images (posters, backdrops, profiles, etc.)
 */
export interface IImagesProvider extends IProvider {
  readonly capabilities: ProviderCapability.IMAGES[]

  /**
   * Get images for media item
   */
  getImages(request: GetImagesRequest): Promise<ProviderResponse<MediaImages>>

  /**
   * Get specific image configuration
   */
  getImageConfiguration(): Promise<ProviderResponse<ImageConfiguration>>

  /**
   * Search images
   */
  searchImages(request: SearchImagesRequest): Promise<ProviderResponse<ImageSearchResult[]>>
}

export interface GetImagesRequest extends ProviderRequest {
  /** Media ID */
  readonly mediaId: string | number

  /** Media type */
  readonly mediaType: MediaType

  /** Image types to include */
  readonly imageTypes?: ImageType[]

  /** Language for images */
  readonly language?: LanguageCode

  /** Include all languages */
  readonly includeAllLanguages?: boolean
}

export interface MediaImages {
  /** Poster images */
  readonly posters: ImageInfo[]

  /** Backdrop images */
  readonly backdrops: ImageInfo[]

  /** Logo images */
  readonly logos: ImageInfo[]

  /** Profile images (for people) */
  readonly profiles: ImageInfo[]

  /** Still images (for episodes) */
  readonly stills: ImageInfo[]
}

export interface ImageConfiguration {
  /** Base URL for images */
  readonly baseUrl: string

  /** Secure base URL */
  readonly secureBaseUrl: string

  /** Available sizes for each image type */
  readonly sizes: {
    readonly poster: string[]
    readonly backdrop: string[]
    readonly profile: string[]
    readonly logo: string[]
    readonly still: string[]
  }

  /** Change keys for cache invalidation */
  readonly changeKeys?: string[]
}

export interface SearchImagesRequest extends ProviderRequest {
  /** Search query */
  readonly query: string

  /** Image type filter */
  readonly imageType?: ImageType

  /** Media type filter */
  readonly mediaType?: MediaType

  /** Pagination */
  readonly pagination?: {
    readonly page?: number
    readonly limit?: number
  }
}

export interface ImageSearchResult {
  /** Media ID */
  readonly mediaId: string | number

  /** Media title */
  readonly mediaTitle: string

  /** Media type */
  readonly mediaType: MediaType

  /** Available images */
  readonly images: ImageInfo[]
}
```

### IRatingsProvider

```typescript
/**
 * Ratings provider capability
 * Provides user ratings and scores for media content
 */
export interface IRatingsProvider extends IProvider {
  readonly capabilities: ProviderCapability.RATINGS[]

  /**
   * Get ratings for media item
   */
  getRatings(request: GetRatingsRequest): Promise<ProviderResponse<MediaRatings>>

  /**
   * Submit user rating
   */
  submitRating(request: SubmitRatingRequest): Promise<ProviderResponse<RatingSubmissionResult>>

  /**
   * Get user's ratings
   */
  getUserRatings(request: GetUserRatingsRequest): Promise<ProviderResponse<UserRating[]>>

  /**
   * Delete user rating
   */
  deleteRating(request: DeleteRatingRequest): Promise<ProviderResponse<void>>
}

export interface GetRatingsRequest extends ProviderRequest {
  /** Media ID */
  readonly mediaId: string | number

  /** Media type */
  readonly mediaType: MediaType

  /** Include breakdown by rating scale */
  readonly includeBreakdown?: boolean
}

export interface MediaRatings {
  /** Average rating */
  readonly average: number

  /** Total vote count */
  readonly voteCount: number

  /** Rating scale (e.g., 0-10, 0-5) */
  readonly scale: RatingScale

  /** Rating breakdown by score */
  readonly breakdown?: Record<number, number>

  /** Provider-specific ratings */
  readonly providerRatings: ProviderRating[]
}

export interface ProviderRating {
  /** Rating source/provider */
  readonly source: string

  /** Rating value */
  readonly rating: number

  /** Rating scale */
  readonly scale: RatingScale

  /** Vote count */
  readonly voteCount?: number

  /** Last updated */
  readonly lastUpdated: Date
}

export interface RatingScale {
  /** Minimum value */
  readonly min: number

  /** Maximum value */
  readonly max: number

  /** Scale type */
  readonly type: 'integer' | 'decimal'

  /** Step size */
  readonly step?: number
}

export interface SubmitRatingRequest extends ProviderRequest {
  /** Media ID */
  readonly mediaId: string | number

  /** Media type */
  readonly mediaType: MediaType

  /** Rating value */
  readonly rating: number

  /** Optional review text */
  readonly review?: string
}

export interface RatingSubmissionResult {
  /** Submission success */
  readonly success: boolean

  /** New average rating */
  readonly newAverage?: number

  /** New vote count */
  readonly newVoteCount?: number

  /** Submission ID */
  readonly submissionId?: string
}

export interface GetUserRatingsRequest extends ProviderRequest {
  /** User ID */
  readonly userId: string

  /** Media type filter */
  readonly mediaType?: MediaType

  /** Date range */
  readonly dateRange?: {
    readonly from: Date
    readonly to: Date
  }

  /** Pagination */
  readonly pagination?: {
    readonly page?: number
    readonly limit?: number
  }
}

export interface UserRating {
  /** Media ID */
  readonly mediaId: string | number

  /** Media type */
  readonly mediaType: MediaType

  /** Media title */
  readonly mediaTitle: string

  /** User's rating */
  readonly rating: number

  /** Rating scale */
  readonly scale: RatingScale

  /** Optional review */
  readonly review?: string

  /** Rated date */
  readonly ratedAt: Date
}

export interface DeleteRatingRequest extends ProviderRequest {
  /** Media ID */
  readonly mediaId: string | number

  /** Media type */
  readonly mediaType: MediaType

  /** User ID */
  readonly userId: string
}
```

### IStreamsProvider

```typescript
/**
 * Streams provider capability
 * Provides streaming links and sources for media content
 */
export interface IStreamsProvider extends IProvider {
  readonly capabilities: ProviderCapability.STREAMS[]

  /**
   * Get streams for media item
   */
  getStreams(request: GetStreamsRequest): Promise<ProviderResponse<StreamCollection>>

  /**
   * Get stream details
   */
  getStreamDetails(request: GetStreamDetailsRequest): Promise<ProviderResponse<StreamDetails>>

  /**
   * Check stream availability
   */
  checkAvailability(request: CheckAvailabilityRequest): Promise<ProviderResponse<StreamAvailability>>
}

export interface GetStreamsRequest extends ProviderRequest {
  /** Media ID */
  readonly mediaId: string | number

  /** Media type */
  readonly mediaType: MediaType

  /** Season number (for TV series) */
  readonly season?: number

  /** Episode number (for TV series) */
  readonly episode?: number

  /** Quality preferences */
  readonly qualityPreferences?: QualityFilter[]

  /** Language preferences */
  readonly languagePreferences?: LanguageCode[]

  /** Include free sources only */
  readonly freeOnly?: boolean
}

export interface StreamCollection {
  /** Available streams */
  readonly streams: StreamInfo[]

  /** Total count */
  readonly totalCount: number

  /** Quality breakdown */
  readonly qualityBreakdown: Record<VideoQuality, number>

  /** Language breakdown */
  readonly languageBreakdown: Record<LanguageCode, number>

  /** Provider breakdown */
  readonly providerBreakdown: Record<string, number>
}

export interface StreamInfo {
  /** Stream ID */
  readonly id: string

  /** Stream title */
  readonly title: string

  /** Stream URL */
  readonly url: string

  /** Stream quality */
  readonly quality: VideoQuality

  /** Audio quality */
  readonly audioQuality?: AudioQuality

  /** Language */
  readonly language?: LanguageCode

  /** Subtitles available */
  readonly subtitles?: SubtitleInfo[]

  /** Stream type */
  readonly type: StreamType

  /** File size (bytes) */
  readonly fileSize?: number

  /** Stream provider */
  readonly provider: StreamProvider

  /** Availability */
  readonly availability: StreamAvailability

  /** Seeds/peers (for P2P) */
  readonly seeders?: number
  readonly leechers?: number
}

export enum StreamType {
  HTTP = 'http',
  TORRENT = 'torrent',
  MAGNET = 'magnet',
  HLS = 'hls',
  DASH = 'dash',
  YOUTUBE = 'youtube'
}

export interface StreamProvider {
  /** Provider name */
  readonly name: string

  /** Provider reliability score */
  readonly reliability?: number

  /** Provider type */
  readonly type: 'official' | 'community' | 'p2p'
}

export interface StreamAvailability {
  /** Is stream currently available */
  readonly available: boolean

  /** Availability regions */
  readonly regions?: CountryCode[]

  /** Expires at */
  readonly expiresAt?: Date

  /** Requires subscription */
  readonly requiresSubscription?: boolean

  /** Cost information */
  readonly cost?: StreamCost
}

export interface StreamCost {
  /** Cost amount */
  readonly amount: number

  /** Currency */
  readonly currency: string

  /** Cost type */
  readonly type: 'rental' | 'purchase' | 'subscription'

  /** Rental duration (hours) */
  readonly rentalDuration?: number
}

export interface QualityFilter {
  readonly quality: VideoQuality
  readonly priority: number
}

export interface GetStreamDetailsRequest extends ProviderRequest {
  /** Stream ID */
  readonly streamId: string

  /** Include technical details */
  readonly includeTechnicalDetails?: boolean
}

export interface StreamDetails extends StreamInfo {
  /** Technical details */
  readonly technicalDetails?: {
    readonly codec: string
    readonly resolution: string
    readonly framerate: number
    readonly bitrate: number
    readonly audioCodec: string
    readonly audioChannels: string
  }

  /** Stream metadata */
  readonly metadata?: Record<string, unknown>
}

export interface CheckAvailabilityRequest extends ProviderRequest {
  /** Stream IDs to check */
  readonly streamIds: string[]
}
```

### ISubtitlesProvider

```typescript
/**
 * Subtitles provider capability
 * Provides subtitle tracks for media content
 */
export interface ISubtitlesProvider extends IProvider {
  readonly capabilities: ProviderCapability.SUBTITLES[]

  /**
   * Get subtitles for media item
   */
  getSubtitles(request: GetSubtitlesRequest): Promise<ProviderResponse<SubtitleCollection>>

  /**
   * Download subtitle file
   */
  downloadSubtitle(request: DownloadSubtitleRequest): Promise<ProviderResponse<SubtitleFile>>

  /**
   * Search subtitles
   */
  searchSubtitles(request: SearchSubtitlesRequest): Promise<ProviderResponse<SubtitleSearchResult[]>>
}

export interface GetSubtitlesRequest extends ProviderRequest {
  /** Media ID */
  readonly mediaId: string | number

  /** Media type */
  readonly mediaType: MediaType

  /** Season number (for TV) */
  readonly season?: number

  /** Episode number (for TV) */
  readonly episode?: number

  /** Language preferences */
  readonly languages?: LanguageCode[]

  /** Include auto-generated subtitles */
  readonly includeAutoGenerated?: boolean
}

export interface SubtitleCollection {
  /** Available subtitles */
  readonly subtitles: SubtitleInfo[]

  /** Language breakdown */
  readonly languageBreakdown: Record<LanguageCode, number>

  /** Total count */
  readonly totalCount: number
}

export interface SubtitleInfo {
  /** Subtitle ID */
  readonly id: string

  /** Language */
  readonly language: LanguageCode

  /** Language name */
  readonly languageName: string

  /** Subtitle format */
  readonly format: SubtitleFormat

  /** Download URL */
  readonly downloadUrl: string

  /** Subtitle quality/rating */
  readonly rating?: number

  /** Download count */
  readonly downloadCount?: number

  /** Is auto-generated */
  readonly autoGenerated: boolean

  /** Hearing impaired support */
  readonly hearingImpaired: boolean

  /** Release info */
  readonly release?: string

  /** Uploader info */
  readonly uploader?: {
    readonly name: string
    readonly rating?: number
  }

  /** File size */
  readonly fileSize?: number

  /** Created date */
  readonly createdAt: Date
}

export enum SubtitleFormat {
  SRT = 'srt',
  VTT = 'vtt',
  ASS = 'ass',
  SSA = 'ssa',
  TTML = 'ttml'
}

export interface DownloadSubtitleRequest extends ProviderRequest {
  /** Subtitle ID */
  readonly subtitleId: string

  /** Preferred format */
  readonly format?: SubtitleFormat
}

export interface SubtitleFile {
  /** File content */
  readonly content: string

  /** File format */
  readonly format: SubtitleFormat

  /** File encoding */
  readonly encoding: string

  /** File size */
  readonly size: number
}

export interface SearchSubtitlesRequest extends ProviderRequest {
  /** Search query */
  readonly query: string

  /** Language filter */
  readonly language?: LanguageCode

  /** Media type filter */
  readonly mediaType?: MediaType

  /** Season/episode filters */
  readonly season?: number
  readonly episode?: number

  /** Pagination */
  readonly pagination?: {
    readonly page?: number
    readonly limit?: number
  }
}

export interface SubtitleSearchResult {
  /** Media info */
  readonly mediaId: string | number
  readonly mediaTitle: string
  readonly mediaType: MediaType

  /** Available subtitles */
  readonly subtitles: SubtitleInfo[]
}
```

### IAddonCatalogProvider

```typescript
/**
 * Addon catalog provider capability
 * Stremio-specific capability for discovering addons
 */
export interface IAddonCatalogProvider extends IProvider {
  readonly capabilities: ProviderCapability.ADDON_CATALOG[]

  /**
   * Get addon catalogs
   */
  getAddonCatalogs(request: GetAddonCatalogsRequest): Promise<ProviderResponse<AddonCatalog[]>>

  /**
   * Get addon details
   */
  getAddonDetails(request: GetAddonDetailsRequest): Promise<ProviderResponse<AddonDetails>>

  /**
   * Search addons
   */
  searchAddons(request: SearchAddonsRequest): Promise<ProviderResponse<AddonSearchResult[]>>
}

export interface GetAddonCatalogsRequest extends ProviderRequest {
  /** Catalog types to include */
  readonly catalogTypes?: AddonCatalogType[]

  /** Sort by */
  readonly sortBy?: AddonSortBy

  /** Include community addons */
  readonly includeCommunity?: boolean
}

export enum AddonCatalogType {
  ALL = 'all',
  MOVIE = 'movie',
  SERIES = 'series',
  CHANNEL = 'channel',
  TV = 'tv',
  PODCASTS = 'podcasts',
  OTHER = 'other'
}

export enum AddonSortBy {
  TOP = 'top',
  TRENDING = 'trending',
  RECENT = 'recent',
  NAME = 'name'
}

export interface AddonCatalog {
  /** Catalog ID */
  readonly id: string

  /** Catalog name */
  readonly name: string

  /** Addon count */
  readonly addonCount: number

  /** Catalog type */
  readonly type: AddonCatalogType

  /** Addons in this catalog */
  readonly addons: AddonInfo[]
}

export interface AddonInfo {
  /** Addon ID */
  readonly id: string

  /** Addon name */
  readonly name: string

  /** Addon description */
  readonly description: string

  /** Addon version */
  readonly version: string

  /** Addon logo */
  readonly logo?: string

  /** Addon URL */
  readonly transportUrl: string

  /** Supported types */
  readonly types: MediaType[]

  /** Supported catalogs */
  readonly catalogs: string[]

  /** Supported resources */
  readonly resources: string[]

  /** Addon popularity */
  readonly popularity?: number

  /** Installation count */
  readonly installs?: number

  /** Official addon flag */
  readonly official: boolean
}

export interface GetAddonDetailsRequest extends ProviderRequest {
  /** Addon ID */
  readonly addonId: string
}

export interface AddonDetails extends AddonInfo {
  /** Full manifest */
  readonly manifest: Record<string, unknown>

  /** Addon stats */
  readonly stats?: {
    readonly totalContent: number
    readonly lastUpdated: Date
    readonly averageResponseTime: number
    readonly reliability: number
  }

  /** User reviews */
  readonly reviews?: AddonReview[]

  /** Similar addons */
  readonly similar?: AddonInfo[]
}

export interface AddonReview {
  readonly user: string
  readonly rating: number
  readonly comment: string
  readonly createdAt: Date
}

export interface SearchAddonsRequest extends ProviderRequest {
  /** Search query */
  readonly query: string

  /** Type filter */
  readonly type?: AddonCatalogType

  /** Official only */
  readonly officialOnly?: boolean

  /** Pagination */
  readonly pagination?: {
    readonly page?: number
    readonly limit?: number
  }
}

export interface AddonSearchResult {
  /** Addon info */
  readonly addon: AddonInfo

  /** Match score */
  readonly matchScore: number

  /** Matched fields */
  readonly matchedFields: string[]
}
```

## Additional Capability Interfaces

### IReviewsProvider

```typescript
/**
 * Reviews provider capability
 * Provides user reviews and comments for media content
 */
export interface IReviewsProvider extends IProvider {
  readonly capabilities: ProviderCapability.REVIEWS[]

  /**
   * Get reviews for media item
   */
  getReviews(request: GetReviewsRequest): Promise<ProviderResponse<ReviewCollection>>

  /**
   * Submit a review
   */
  submitReview(request: SubmitReviewRequest): Promise<ProviderResponse<ReviewSubmissionResult>>

  /**
   * Get user reviews
   */
  getUserReviews(request: GetUserReviewsRequest): Promise<ProviderResponse<UserReview[]>>
}

export interface ReviewCollection {
  readonly reviews: ReviewInfo[]
  readonly totalCount: number
  readonly averageRating?: number
  readonly ratingDistribution?: Record<number, number>
}
```

### IRecommendationsProvider

```typescript
/**
 * Recommendations provider capability
 * Provides personalized content recommendations
 */
export interface IRecommendationsProvider extends IProvider {
  readonly capabilities: ProviderCapability.RECOMMENDATIONS[]

  /**
   * Get recommendations for user
   */
  getRecommendations(request: GetRecommendationsRequest): Promise<ProviderResponse<ContentRow>>

  /**
   * Get similar content
   */
  getSimilar(request: GetSimilarRequest): Promise<ProviderResponse<ContentItem[]>>

  /**
   * Record user interaction for recommendation training
   */
  recordInteraction(request: RecordInteractionRequest): Promise<ProviderResponse<void>>
}
```

### IPeopleProvider

```typescript
/**
 * People provider capability
 * Provides information about cast, crew, and other people
 */
export interface IPeopleProvider extends IProvider {
  readonly capabilities: ProviderCapability.PEOPLE[]

  /**
   * Get person details
   */
  getPersonDetails(request: GetPersonDetailsRequest): Promise<ProviderResponse<PersonInfo>>

  /**
   * Get person credits
   */
  getPersonCredits(request: GetPersonCreditsRequest): Promise<ProviderResponse<PersonCredits>>

  /**
   * Search people
   */
  searchPeople(request: SearchPeopleRequest): Promise<ProviderResponse<PersonSearchResult[]>>
}
```

### IWatchlistProvider

```typescript
/**
 * Watchlist provider capability
 * Manages user watchlists and favorites
 */
export interface IWatchlistProvider extends IProvider {
  readonly capabilities: ProviderCapability.WATCHLIST[]

  /**
   * Get user watchlist
   */
  getWatchlist(request: GetWatchlistRequest): Promise<ProviderResponse<ContentRow>>

  /**
   * Add to watchlist
   */
  addToWatchlist(request: AddToWatchlistRequest): Promise<ProviderResponse<void>>

  /**
   * Remove from watchlist
   */
  removeFromWatchlist(request: RemoveFromWatchlistRequest): Promise<ProviderResponse<void>>

  /**
   * Check if item is in watchlist
   */
  isInWatchlist(request: IsInWatchlistRequest): Promise<ProviderResponse<boolean>>
}
```

### IActivityProvider

```typescript
/**
 * Activity provider capability
 * Tracks watch progress and provides scrobbling functionality
 */
export interface IActivityProvider extends IProvider {
  readonly capabilities: ProviderCapability.ACTIVITY[]

  /**
   * Get watch history
   */
  getWatchHistory(request: GetWatchHistoryRequest): Promise<ProviderResponse<WatchHistoryItem[]>>

  /**
   * Record watch progress
   */
  recordProgress(request: RecordProgressRequest): Promise<ProviderResponse<void>>

  /**
   * Get watch progress
   */
  getProgress(request: GetProgressRequest): Promise<ProviderResponse<WatchProgress | null>>

  /**
   * Mark as watched
   */
  markAsWatched(request: MarkAsWatchedRequest): Promise<ProviderResponse<void>>
}
```

## Capability Utilities

### Capability Detection

```typescript
/**
 * Utility functions for working with provider capabilities
 */
export class CapabilityUtils {
  /**
   * Check if provider supports capability
   */
  static hasCapability(provider: IProvider, capability: ProviderCapability): boolean {
    return provider.capabilities.includes(capability)
  }

  /**
   * Get providers that support specific capabilities
   */
  static filterByCapabilities(
    providers: IProvider[],
    requiredCapabilities: ProviderCapability[]
  ): IProvider[] {
    return providers.filter(provider =>
      requiredCapabilities.every(capability =>
        this.hasCapability(provider, capability)
      )
    )
  }

  /**
   * Group providers by capabilities
   */
  static groupByCapabilities(providers: IProvider[]): Record<ProviderCapability, IProvider[]> {
    const groups = {} as Record<ProviderCapability, IProvider[]>

    for (const capability of Object.values(ProviderCapability)) {
      groups[capability] = providers.filter(provider =>
        this.hasCapability(provider, capability)
      )
    }

    return groups
  }

  /**
   * Get capability coverage for providers
   */
  static getCapabilityCoverage(providers: IProvider[]): CapabilityCoverage {
    const coverage = {} as Record<ProviderCapability, number>
    const total = providers.length

    for (const capability of Object.values(ProviderCapability)) {
      const count = providers.filter(provider =>
        this.hasCapability(provider, capability)
      ).length

      coverage[capability] = total > 0 ? count / total : 0
    }

    return {
      byCapability: coverage,
      totalProviders: total,
      averageCoverage: Object.values(coverage).reduce((sum, val) => sum + val, 0) / Object.keys(coverage).length
    }
  }
}

export interface CapabilityCoverage {
  readonly byCapability: Record<ProviderCapability, number>
  readonly totalProviders: number
  readonly averageCoverage: number
}
```

### Capability Validation

```typescript
/**
 * Validates provider capability implementations
 */
export class CapabilityValidator {
  /**
   * Validate provider implements declared capabilities
   */
  static async validateProvider(provider: IProvider): Promise<ValidationResult> {
    const results: CapabilityValidationResult[] = []

    for (const capability of provider.capabilities) {
      try {
        const result = await this.validateCapability(provider, capability)
        results.push(result)
      } catch (error) {
        results.push({
          capability,
          valid: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const validCount = results.filter(r => r.valid).length

    return {
      valid: validCount === results.length,
      coverage: validCount / results.length,
      results
    }
  }

  private static async validateCapability(
    provider: IProvider,
    capability: ProviderCapability
  ): Promise<CapabilityValidationResult> {
    // Implementation-specific validation logic
    // Check if provider correctly implements capability interface
    // Validate required methods exist and work correctly
    
    return {
      capability,
      valid: true
    }
  }
}

export interface ValidationResult {
  readonly valid: boolean
  readonly coverage: number
  readonly results: CapabilityValidationResult[]
}

export interface CapabilityValidationResult {
  readonly capability: ProviderCapability
  readonly valid: boolean
  readonly error?: string
  readonly warnings?: string[]
}
```

This capability interface design provides a comprehensive, type-safe foundation for implementing provider functionality while maintaining flexibility and extensibility. Each capability is focused on a specific domain, making it easy to implement, test, and maintain provider integrations.