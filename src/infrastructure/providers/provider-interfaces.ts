/**
 * Provider Interfaces - Registration-Based Provider System
 * 
 * Interface segregation for provider capabilities following the principle:
 * Registration = Capability (no boolean flags)
 * 
 * Each interface represents a specific capability that providers can implement.
 * Providers register constructors for each capability they support.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

import type { ContentType } from '@/src/domain/entities/provider.entity'
import type { EnhancedMediaContext } from '@/src/domain/entities/media-context.entity'
import type { ILoggingService } from '@/src/domain/services/logging.service.interface'

// Re-export capability types for convenience
export type {
  CatalogItem,
  Catalog,
  CatalogFilters,
  MediaMetadata,
  Person,
  PersonCredit,
  SearchResult,
  SearchFilters,
  RecommendationRequest,
  RecommendationResult,
  RatingsData,
  RatingSource,
  Comment,
  CommentsData,
  WatchProgress,
  WatchlistItem,
  TrackingData,
  AddonCatalogItem,
  AddonCatalog,
  MediaImage,
  ImagesData,
  StreamSource,
  StreamsData,
  SubtitleFile,
  SubtitlesData
} from '@/src/domain/entities/provider-capabilities.entity'

// Additional types needed by capability implementations
export interface CatalogSort {
  field: 'title' | 'year' | 'rating' | 'popularity' | 'releaseDate'
  direction: 'asc' | 'desc'
}

export interface CatalogRequest {
  type: ContentType
  filters?: import('@/src/domain/entities/provider-capabilities.entity').CatalogFilters
  sort?: CatalogSort
  page?: number
  limit?: number
}

export interface CommentThread {
  id: string
  mediaId: string
  parentId?: string
  comments: Comment[]
  totalCount: number
  isLocked?: boolean
  lastUpdated: Date
}

/**
 * Base provider configuration for DI container integration
 */
export interface BaseProviderConfig {
  id: string
  name: string
  type: string
  enabled: boolean
  priority: number
  apiKey?: string
  bearerToken?: string
  baseUrl?: string
  settings?: Record<string, unknown>
}

/**
 * Base provider interface with common functionality
 */
export interface IBaseProvider {
  readonly id: string
  readonly name: string
  readonly type: string
  
  // Configuration
  getConfig(): BaseProviderConfig
  isEnabled(): boolean
  getPriority(): number
  
  // Health and validation
  healthCheck(): Promise<ProviderHealthResult>
  validateConfig(): Promise<ProviderValidationResult>
}

/**
 * Provider health check result
 */
export interface ProviderHealthResult {
  healthy: boolean
  latency?: number
  error?: string
  lastCheck: Date
  responseTime?: number
}

/**
 * Provider validation result
 */
export interface ProviderValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Pagination wrapper for provider results
 */
export interface PaginationResponse<T> {
  results: T[]
  page: number
  totalPages?: number
  totalResults?: number
  hasMore: boolean
}

// ============================================================================
// CAPABILITY INTERFACES - Each represents a specific provider capability
// ============================================================================

/**
 * Metadata Provider - Detailed media information
 */
export interface IMetadataProvider extends IBaseProvider {
  getMetadata(context: EnhancedMediaContext): Promise<import('@/src/domain/entities/provider-capabilities.entity').MediaMetadata | null>
  getMetadataByExternalId(externalId: string, idType: string, contentType: ContentType): Promise<import('@/src/domain/entities/provider-capabilities.entity').MediaMetadata | null>
  getSeasonDetails?(context: EnhancedMediaContext, seasonNumber: number): Promise<import('@/src/domain/entities/provider-capabilities.entity').Season | null>
  getEpisodeDetails?(context: EnhancedMediaContext, seasonNumber: number, episodeNumber: number): Promise<import('@/src/domain/entities/provider-capabilities.entity').Episode | null>
}

/**
 * Catalog Provider - Media catalog listings
 */
export interface ICatalogProvider extends IBaseProvider {
  getCatalogs(contentType?: ContentType): Promise<import('@/src/domain/entities/provider-capabilities.entity').Catalog[]>
  getCatalogItems(catalogId: string, filters?: import('@/src/domain/entities/provider-capabilities.entity').CatalogFilters): Promise<PaginationResponse<import('@/src/domain/entities/provider-capabilities.entity').CatalogItem>>
  getPopular?(contentType: ContentType, filters?: import('@/src/domain/entities/provider-capabilities.entity').CatalogFilters): Promise<PaginationResponse<import('@/src/domain/entities/provider-capabilities.entity').CatalogItem>>
  getTrending?(contentType: ContentType, timeframe?: 'day' | 'week' | 'month'): Promise<PaginationResponse<import('@/src/domain/entities/provider-capabilities.entity').CatalogItem>>
}

/**
 * Search Provider - Content search functionality
 */
export interface ISearchProvider extends IBaseProvider {
  search(query: string, filters?: import('@/src/domain/entities/provider-capabilities.entity').SearchFilters): Promise<import('@/src/domain/entities/provider-capabilities.entity').SearchResult>
  searchByType(query: string, contentType: ContentType, filters?: import('@/src/domain/entities/provider-capabilities.entity').SearchFilters): Promise<PaginationResponse<import('@/src/domain/entities/provider-capabilities.entity').CatalogItem>>
  getSearchSuggestions?(query: string): Promise<string[]>
}

/**
 * Stream Provider - Media streaming links (Stremio compatibility)
 */
export interface IStreamProvider extends IBaseProvider {
  getStreams(context: EnhancedMediaContext): Promise<import('@/src/domain/entities/provider-capabilities.entity').StreamsData>
  getStreamsByQuality?(context: EnhancedMediaContext, quality: string): Promise<import('@/src/domain/entities/provider-capabilities.entity').StreamSource[]>
  validateStream?(streamUrl: string): Promise<boolean>
}

/**
 * Recommendation Provider - Content recommendations
 */
export interface IRecommendationProvider extends IBaseProvider {
  getRecommendations(context: EnhancedMediaContext, request?: import('@/src/domain/entities/provider-capabilities.entity').RecommendationRequest): Promise<import('@/src/domain/entities/provider-capabilities.entity').RecommendationResult[]>
  getSimilarContent(context: EnhancedMediaContext): Promise<import('@/src/domain/entities/provider-capabilities.entity').RecommendationResult[]>
  getTrendingRecommendations?(contentType: ContentType): Promise<import('@/src/domain/entities/provider-capabilities.entity').RecommendationResult[]>
}

/**
 * Collection Provider - User collections management
 */
export interface ICollectionProvider extends IBaseProvider {
  getCollections(userId: string): Promise<import('@/src/domain/entities/provider-capabilities.entity').Catalog[]>
  createCollection(userId: string, name: string, description?: string): Promise<string>
  addToCollection(userId: string, collectionId: string, context: EnhancedMediaContext): Promise<boolean>
  removeFromCollection(userId: string, collectionId: string, mediaId: string): Promise<boolean>
  deleteCollection(userId: string, collectionId: string): Promise<boolean>
}

/**
 * Watchlist Provider - Watchlist management
 */
export interface IWatchlistProvider extends IBaseProvider {
  getWatchlist(userId: string): Promise<import('@/src/domain/entities/provider-capabilities.entity').WatchlistItem[]>
  addToWatchlist(userId: string, context: EnhancedMediaContext): Promise<boolean>
  removeFromWatchlist(userId: string, mediaId: string): Promise<boolean>
  isInWatchlist(userId: string, mediaId: string): Promise<boolean>
  getWatchlistSummary?(userId: string): Promise<{ total: number; byType: Record<ContentType, number> }>
}

/**
 * Progress Provider - Watch progress tracking
 */
export interface IProgressProvider extends IBaseProvider {
  getWatchProgress(userId: string, mediaId: string): Promise<import('@/src/domain/entities/provider-capabilities.entity').WatchProgress | null>
  updateWatchProgress(userId: string, progress: import('@/src/domain/entities/provider-capabilities.entity').WatchProgress): Promise<boolean>
  getRecentlyWatched(userId: string, limit?: number): Promise<import('@/src/domain/entities/provider-capabilities.entity').WatchProgress[]>
  markAsCompleted(userId: string, mediaId: string): Promise<boolean>
  removeProgress(userId: string, mediaId: string): Promise<boolean>
}

/**
 * Rating Provider - Rating and review functionality
 */
export interface IRatingProvider extends IBaseProvider {
  getRatings(context: EnhancedMediaContext): Promise<import('@/src/domain/entities/provider-capabilities.entity').RatingsData>
  getUserRating?(userId: string, mediaId: string): Promise<number | null>
  setUserRating?(userId: string, mediaId: string, rating: number): Promise<boolean>
  removeUserRating?(userId: string, mediaId: string): Promise<boolean>
}

/**
 * Image Provider - Media images and artwork
 */
export interface IImageProvider extends IBaseProvider {
  getImages(context: EnhancedMediaContext): Promise<import('@/src/domain/entities/provider-capabilities.entity').ImagesData>
  getImagesByType(context: EnhancedMediaContext, imageType: 'poster' | 'backdrop' | 'logo'): Promise<import('@/src/domain/entities/provider-capabilities.entity').MediaImage[]>
  getHighQualityImages?(context: EnhancedMediaContext): Promise<import('@/src/domain/entities/provider-capabilities.entity').MediaImage[]>
}

/**
 * Video Provider - Trailers and video content
 */
export interface IVideoProvider extends IBaseProvider {
  getVideos(context: EnhancedMediaContext): Promise<VideoData>
  getTrailers(context: EnhancedMediaContext): Promise<VideoItem[]>
  getClips?(context: EnhancedMediaContext): Promise<VideoItem[]>
  getBehindTheScenes?(context: EnhancedMediaContext): Promise<VideoItem[]>
}

/**
 * Subtitle Provider - Subtitle support
 */
export interface ISubtitleProvider extends IBaseProvider {
  getSubtitles(context: EnhancedMediaContext): Promise<import('@/src/domain/entities/provider-capabilities.entity').SubtitlesData>
  getSubtitlesByLanguage(context: EnhancedMediaContext, language: string): Promise<import('@/src/domain/entities/provider-capabilities.entity').SubtitleFile[]>
  searchSubtitles?(context: EnhancedMediaContext, query: string): Promise<import('@/src/domain/entities/provider-capabilities.entity').SubtitleFile[]>
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

/**
 * Video data structure
 */
export interface VideoData {
  trailers: VideoItem[]
  clips: VideoItem[]
  behindTheScenes: VideoItem[]
  featurettes: VideoItem[]
  providerInfo: {
    sourceProvider: string
    lastUpdated?: Date
  }
}

/**
 * Video item
 */
export interface VideoItem {
  id: string
  name: string
  key: string
  site: 'YouTube' | 'Vimeo' | 'Dailymotion' | string
  type: 'Trailer' | 'Clip' | 'Behind the Scenes' | 'Featurette' | string
  size: number
  official: boolean
  publishedAt?: string
  iso_639_1?: string
  iso_3166_1?: string
}

/**
 * Provider constructor type for factory registration
 */
export type ProviderConstructor<T extends IBaseProvider> = new (
  config: BaseProviderConfig,
  logger: ILoggingService
) => T

/**
 * Capability type enumeration for type safety
 */
export enum ProviderCapability {
  METADATA = 'metadata',
  CATALOG = 'catalog',
  SEARCH = 'search',
  STREAM = 'stream',
  RECOMMENDATION = 'recommendation',
  COLLECTION = 'collection',
  WATCHLIST = 'watchlist',
  PROGRESS = 'progress',
  RATING = 'rating',
  IMAGE = 'image',
  VIDEO = 'video',
  SUBTITLE = 'subtitle'
}

/**
 * Provider capability map for type safety
 */
export interface ProviderCapabilityMap {
  [ProviderCapability.METADATA]: IMetadataProvider
  [ProviderCapability.CATALOG]: ICatalogProvider
  [ProviderCapability.SEARCH]: ISearchProvider
  [ProviderCapability.STREAM]: IStreamProvider
  [ProviderCapability.RECOMMENDATION]: IRecommendationProvider
  [ProviderCapability.COLLECTION]: ICollectionProvider
  [ProviderCapability.WATCHLIST]: IWatchlistProvider
  [ProviderCapability.PROGRESS]: IProgressProvider
  [ProviderCapability.RATING]: IRatingProvider
  [ProviderCapability.IMAGE]: IImageProvider
  [ProviderCapability.VIDEO]: IVideoProvider
  [ProviderCapability.SUBTITLE]: ISubtitleProvider
}

/**
 * Provider instance interface for registry management
 */
export interface ProviderInstance<T extends IBaseProvider = IBaseProvider> {
  provider: T
  capability: ProviderCapability
  config: BaseProviderConfig
  lastAccessed: Date
  accessCount: number
  errorCount: number
  lastError?: Error
}

/**
 * Provider registration info
 */
export interface ProviderRegistrationInfo {
  providerId: string
  capability: ProviderCapability
  constructor: ProviderConstructor<IBaseProvider>
  registrationDate: Date
}