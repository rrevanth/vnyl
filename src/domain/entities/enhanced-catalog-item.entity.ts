/**
 * Enhanced Catalog Item Entity - Universal Context Object with Progressive Enhancement
 * 
 * Provides a comprehensive yet performance-conscious structure for media content
 * that supports progressive loading and universal context passing throughout the app.
 * 
 * DESIGN PRINCIPLES:
 * - Lightweight base structure for catalog/list displays
 * - Progressive enhancement with mediaDetail for detail pages
 * - Provider context tracking for cross-provider operations
 * - Stremio compatibility with string-based mediaType
 * - Full TypeScript strict mode compliance
 * 
 * @author Claude Code Assistant
 * @version 2.0.0
 */

import type { ExternalIds } from './external-ids.entity'
import type { Images } from './images.entity'
import type { Rating } from './genre-rating.entity'

/**
 * Enhanced Genre object with extensible properties
 * Converts from simple interface to extensible object for provider compatibility
 */
export interface Genre {
  id?: number | string // Provider-specific genre ID (TMDB, Trakt, etc.)
  name: string
  slug?: string
  description?: string
  parentGenre?: string
  subGenres?: string[]
  providerSpecific?: Record<string, unknown> // Provider-specific extensions
  [key: string]: unknown // Make it fully extensible
}

/**
 * Lightweight provider context for efficient tracking
 * Contains essential provider information without heavy metadata
 */
export interface ProviderInfo {
  providerId: string // Provider identifier (e.g., 'tmdb', 'trakt', 'stremio')
  catalogId?: string // Catalog within provider (e.g., 'popular', 'trending')
  providerMediaId: string | number // Media ID within provider
  mediaType: string // Provider's media type classification
  addonId?: string // For Stremio addons
  manifestUrl?: string // For Stremio addons
  lastUpdated?: Date
  confidence?: number // 0-1 confidence in data accuracy
  sourceMetadata?: Record<string, unknown> // Provider-specific metadata
}

/**
 * Person entity for cast, crew, and other people
 */
export interface Person {
  id: string | number
  name: string
  originalName?: string
  profilePath?: string
  biography?: string
  birthday?: string
  deathday?: string
  placeOfBirth?: string
  knownForDepartment?: string
  popularity?: number
  adult?: boolean
  externalIds?: ExternalIds
  images?: {
    profiles: {
      filePath: string
      width?: number
      height?: number
      aspectRatio?: number
      voteAverage?: number
      voteCount?: number
    }[]
  }
}

/**
 * Cast member with role information
 */
export interface CastMember extends Person {
  character?: string
  order?: number
  episodeCount?: number // For TV shows
  seasons?: number[] // Which seasons this person appears in
}

/**
 * Crew member with job information
 */
export interface CrewMember extends Person {
  job: string
  department: string
  episodeCount?: number // For TV shows
  seasons?: number[] // Which seasons this person worked on
}

/**
 * Episode information for TV shows
 */
export interface Episode {
  id: string | number
  episodeNumber: number
  seasonNumber: number
  name: string
  overview?: string
  airDate?: string
  runtime?: number
  stillPath?: string
  voteAverage?: number
  voteCount?: number
  productionCode?: string
  externalIds?: ExternalIds
  crew?: CrewMember[]
  guestStars?: CastMember[]
  watchProgress?: WatchProgress
}

/**
 * Season information for TV shows
 */
export interface Season {
  id: string | number
  seasonNumber: number
  name: string
  overview?: string
  airDate?: string
  episodeCount: number
  posterPath?: string
  episodes?: Episode[]
  externalIds?: ExternalIds
}

/**
 * Watch progress information from Trakt and other services
 */
export interface WatchProgress {
  watched: boolean
  watchedAt?: Date
  progress?: number // 0-1 for partial progress
  runtime?: number // Total runtime in minutes
  watchedRuntime?: number // Watched runtime in minutes
  lastWatchedAt?: Date
  playCount?: number
  source: string // 'trakt', 'local', etc.
}

/**
 * Video content (trailers, clips, etc.)
 */
export interface VideoContent {
  id: string
  type: 'trailer' | 'teaser' | 'clip' | 'featurette' | 'behind_scenes' | 'bloopers' | 'other'
  name: string
  key: string // Video key/ID for the platform
  site: string // 'youtube', 'vimeo', etc.
  language?: string
  country?: string
  publishedAt?: Date
  official?: boolean
  size?: number // Video resolution (720, 1080, etc.)
}

/**
 * Review/recommendation information
 */
export interface Review {
  id: string
  author: string
  authorDetails?: {
    name?: string
    username?: string
    avatarPath?: string
    rating?: number
  }
  content: string
  createdAt: Date
  updatedAt?: Date
  url?: string
  source: string // 'tmdb', 'trakt', 'letterboxd', etc.
  rating?: number
  helpful?: number // Number of helpful votes
  total?: number // Total votes
}

/**
 * Collection information (movie collections, TV franchises)
 */
export interface Collection {
  id: string | number
  name: string
  overview?: string
  posterPath?: string
  backdropPath?: string
  parts?: {
    id: string | number
    title: string
    releaseDate?: string
    posterPath?: string
  }[]
  externalIds?: ExternalIds
}

/**
 * Network information for TV shows
 */
export interface Network {
  id: string | number
  name: string
  logoPath?: string
  originCountry?: string
  headquarters?: string
  homepage?: string
}

/**
 * Production company information
 */
export interface ProductionCompany {
  id: string | number
  name: string
  logoPath?: string
  originCountry?: string
  description?: string
  headquarters?: string
  homepage?: string
}

/**
 * Comprehensive media detail object - the "uber object" for detail pages
 * Contains all detailed information aggregated from multiple providers
 */
export interface MediaDetail {
  // Enhanced basic information
  originalTitle?: string
  tagline?: string
  overview?: string
  status?: string // 'released', 'in_production', 'post_production', etc.
  
  // Runtime and duration
  runtime?: number // Minutes for movies
  episodeRunTime?: number[] // Average episode runtime for TV
  
  // Language and localization
  originalLanguage?: string
  spokenLanguages?: {
    englishName: string
    iso6391: string
    name: string
  }[]
  
  // Countries and certification
  originCountry?: string[]
  productionCountries?: {
    iso31661: string
    name: string
  }[]
  contentRating?: string // 'PG-13', 'TV-MA', etc.
  
  // Financial information
  budget?: number
  revenue?: number
  
  // TV-specific information
  numberOfSeasons?: number
  numberOfEpisodes?: number
  seasons?: Season[]
  episodes?: Episode[] // Current season episodes or recent episodes
  networks?: Network[]
  
  // People
  cast?: CastMember[]
  crew?: CrewMember[]
  directors?: Person[]
  writers?: Person[]
  producers?: Person[]
  creators?: Person[] // TV show creators
  
  // Media content
  videos?: VideoContent[]
  images?: Images
  
  // Social and community
  reviews?: Review[]
  recommendations?: string[] // IDs of recommended content
  similar?: string[] // IDs of similar content
  
  // Collections and franchises
  belongsToCollection?: Collection
  franchise?: Collection
  
  // Production information
  productionCompanies?: ProductionCompany[]
  
  // Watch progress and user data
  watchProgress?: WatchProgress
  userRating?: number
  inWatchlist?: boolean
  isFavorite?: boolean
  personalNotes?: string
  
  // Availability and streaming
  streamingProviders?: {
    providerId: string
    providerName: string
    logoPath?: string
    link?: string
    type: 'subscription' | 'rent' | 'buy' | 'free' | 'ads'
    price?: number
    currency?: string
    quality?: string[]
    audio?: string[]
    subtitles?: string[]
    region: string
    availableUntil?: Date
  }[]
  
  // Provider-specific data
  providerData?: Record<string, unknown>
  
  // Data quality and source tracking
  lastUpdated?: Date
  completenessScore?: number // 0-1 score for data completeness
  sourceProviders?: string[] // Which providers contributed to this data
}

/**
 * Enhanced CatalogItem - Universal context object with progressive enhancement
 * 
 * USAGE PATTERNS:
 * - Light version for catalog/list displays (base properties only)
 * - Enhanced version with mediaDetail for detail pages
 * - Progressive loading: fetch mediaDetail on-demand
 */
export interface EnhancedCatalogItem {
  // Core identification (always present)
  id: string
  mediaType: string // String-based for Stremio compatibility: 'movie', 'series', 'channel', 'tv', etc.
  name: string
  
  // Basic display information (lightweight for lists)
  poster?: string // Primary poster URL
  background?: string // Primary background URL
  genres?: Genre[] // Enhanced genre objects
  ratings?: Rating[] // Multiple rating sources
  year?: number
  releaseDate?: string
  
  // Brief description for cards/previews
  description?: string // Short description for cards
  tagline?: string // Brief tagline
  
  // Visual indicators
  badge?: string // 'New', 'Popular', 'Award Winner', etc.
  popularity?: number
  
  // Provider context (always present for tracking)
  providerInfo: ProviderInfo
  
  // External IDs for cross-provider lookups
  externalIds?: ExternalIds
  
  // Progressive enhancement - detailed information (loaded on-demand)
  mediaDetail?: MediaDetail
  
  // Basic images for performance
  images?: Images
  
  // Cache and performance metadata
  sourceInformation?: {
    retrievedAt: Date
    cacheExpiresAt?: Date
    dataVersion?: number
    providerVersion?: string
    [key: string]: unknown
  }
  
  // Enhancement status
  enhancementLevel?: 'basic' | 'partial' | 'complete'
  lastEnhanced?: Date
}

/**
 * Factory function for creating lightweight catalog items
 */
export interface CatalogItemFactory {
  createBasic(
    id: string,
    mediaType: string,
    name: string,
    providerInfo: ProviderInfo
  ): EnhancedCatalogItem
  
  enhanceWithDetail(
    item: EnhancedCatalogItem,
    mediaDetail: MediaDetail
  ): EnhancedCatalogItem
  
  createFromProvider(
    providerData: unknown,
    providerInfo: ProviderInfo
  ): EnhancedCatalogItem
}

/**
 * Progressive loading strategy for catalog items
 */
export interface ProgressiveLoadingStrategy {
  shouldEnhance(item: EnhancedCatalogItem, context: 'list' | 'card' | 'detail'): boolean
  getRequiredFields(context: 'list' | 'card' | 'detail'): string[]
  getPriority(field: string): number
  getCacheStrategy(field: string): 'memory' | 'disk' | 'network'
}

/**
 * Catalog with enhanced items
 */
export interface EnhancedCatalog {
  id: string
  title: string
  name: string
  mediaType: string // Media type this catalog contains
  rowType: 'default' | 'top10' | 'special' | 'hero' | 'continue_watching'
  providerId: string
  items: EnhancedCatalogItem[]
  
  // Pagination and loading
  hasMore?: boolean
  page?: number
  totalPages?: number
  totalItems?: number
  
  // Provider context
  providerInfo?: ProviderInfo
  
  // Metadata
  description?: string
  lastUpdated?: Date
  
  // Enhancement tracking
  enhancementLevel?: 'basic' | 'partial' | 'complete'
  supportedEnhancements?: string[]
}

/**
 * Type guards for enhanced catalog items
 */
export const isEnhancedCatalogItem = (item: unknown): item is EnhancedCatalogItem => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'mediaType' in item &&
    'name' in item &&
    'providerInfo' in item
  )
}

export const hasMediaDetail = (item: EnhancedCatalogItem): item is EnhancedCatalogItem & { mediaDetail: MediaDetail } => {
  return item.mediaDetail !== undefined
}

export const isFullyEnhanced = (item: EnhancedCatalogItem): boolean => {
  return item.enhancementLevel === 'complete' && hasMediaDetail(item)
}

/**
 * Utility types for working with enhanced catalog items
 */
export type BasicCatalogItem = Omit<EnhancedCatalogItem, 'mediaDetail'>
export type DetailedCatalogItem = EnhancedCatalogItem & { mediaDetail: MediaDetail }

/**
 * Default values and constants
 */
export const DEFAULT_ENHANCEMENT_LEVEL = 'basic'
export const DEFAULT_MEDIA_TYPE = 'movie'
export const SUPPORTED_MEDIA_TYPES = ['movie', 'series', 'tv', 'channel', 'anime', 'documentary', 'short'] as const
export const SUPPORTED_ENHANCEMENT_LEVELS = ['basic', 'partial', 'complete'] as const

export type SupportedMediaType = typeof SUPPORTED_MEDIA_TYPES[number]
export type SupportedEnhancementLevel = typeof SUPPORTED_ENHANCEMENT_LEVELS[number]