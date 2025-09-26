/**
 * Media Context Entity - Enhanced Cross-Provider Data Flow
 * 
 * Provides comprehensive context structures for media operations across
 * different providers, enabling efficient data sharing and provider coordination.
 * 
 * @author Claude Code
 * @version 2.0.0
 */

import type { ContentType } from './provider.entity'
import type { ExternalIds } from './external-ids.entity'
import type { MediaMetadata, Person, RatingSource } from './provider-capabilities.entity'

/**
 * Enhanced media context for provider operations
 * Contains all necessary information for cross-provider data flow
 */
export interface EnhancedMediaContext {
  // Primary identification
  id: string
  type: ContentType
  
  // Core metadata
  title: string
  originalTitle?: string
  year?: number
  releaseDate?: string
  
  // TV-specific context
  season?: number
  episode?: number
  episodeName?: string
  
  // External identifiers for cross-provider lookups
  externalIds: ExternalIds
  
  // Provider source information
  providerInfo: ProviderSourceInfo
  
  // Aggregated data from multiple providers
  aggregatedData?: AggregatedMediaData
  
  // Context metadata
  contextMetadata: ContextMetadata
}

/**
 * Provider source information
 */
export interface ProviderSourceInfo {
  sourceProvider: string
  sourceId: string | number
  sourceType?: string
  catalogId?: string
  addonId?: string
  manifestUrl?: string
  lastUpdated: Date
  confidence?: number // 0-1 confidence in data accuracy
}

/**
 * Aggregated data from multiple providers
 */
export interface AggregatedMediaData {
  // Basic information aggregated from multiple sources
  titles: TitleVariations
  descriptions: DescriptionVariations
  dates: DateVariations
  
  // Visual assets from multiple providers
  images: AggregatedImages
  
  // Ratings from multiple sources
  ratings: AggregatedRatings
  
  // People information aggregated
  people: AggregatedPeople
  
  // External IDs consolidated
  consolidatedExternalIds: ExternalIds
  
  // Availability across providers
  availability: ProviderAvailability[]
  
  // Data quality metrics
  dataQuality: DataQualityMetrics
}

/**
 * Title variations from different providers
 */
export interface TitleVariations {
  primary: string
  original?: string
  translations: Record<string, string>
  aliases: string[]
  romanized?: string
  searchTitles: string[]
}

/**
 * Description variations from different providers
 */
export interface DescriptionVariations {
  primary: string
  short?: string
  extended?: string
  translations: Record<string, string>
  taglines: string[]
  summaries: Record<string, string> // provider -> summary
}

/**
 * Date variations from different sources
 */
export interface DateVariations {
  releaseDate?: string
  releaseDates: Record<string, string> // region -> date
  airDate?: string
  premiereDate?: string
  digitalReleaseDate?: string
  dvdReleaseDate?: string
  theatricalReleaseDate?: string
}

/**
 * Aggregated images from multiple providers
 */
export interface AggregatedImages {
  posters: ImageVariation[]
  backdrops: ImageVariation[]
  logos: ImageVariation[]
  screenshots: ImageVariation[]
  stills: ImageVariation[]
  profiles: ImageVariation[]
}

export interface ImageVariation {
  url: string
  provider: string
  width?: number
  height?: number
  aspectRatio?: number
  language?: string
  quality: 'low' | 'medium' | 'high' | 'original'
  voteAverage?: number
  voteCount?: number
}

/**
 * Aggregated ratings from multiple sources
 */
export interface AggregatedRatings {
  sources: RatingSource[]
  averageRating?: number
  weightedAverage?: number
  totalVotes: number
  distribution?: Record<number, number> // rating -> count
  consensus?: RatingConsensus
}

export interface RatingConsensus {
  level: 'unanimous' | 'majority' | 'mixed' | 'polarized'
  description: string
  confidence: number
}

/**
 * Aggregated people information
 */
export interface AggregatedPeople {
  cast: AggregatedPerson[]
  crew: AggregatedPerson[]
  directors: AggregatedPerson[]
  writers: AggregatedPerson[]
  producers: AggregatedPerson[]
}

export interface AggregatedPerson extends Person {
  sources: string[] // list of providers that have this person
  roles: PersonRole[]
  confidence: number
}

export interface PersonRole {
  role: string
  character?: string
  job?: string
  department?: string
  provider: string
  episodeCount?: number
  seasonNumbers?: number[]
}

/**
 * Provider availability information
 */
export interface ProviderAvailability {
  provider: string
  type: 'metadata' | 'streaming' | 'rental' | 'purchase' | 'addon'
  available: boolean
  region?: string
  price?: number
  currency?: string
  quality?: string[]
  audio?: string[]
  subtitles?: string[]
  url?: string
  lastChecked: Date
}

/**
 * Data quality metrics
 */
export interface DataQualityMetrics {
  completeness: number // 0-1 score for data completeness
  accuracy: number // 0-1 score for data accuracy
  freshness: number // 0-1 score for data freshness
  consistency: number // 0-1 score for cross-provider consistency
  providerCount: number // number of providers contributing data
  lastUpdated: Date
  qualityFlags: QualityFlag[]
}

export interface QualityFlag {
  type: 'missing_data' | 'conflicting_data' | 'stale_data' | 'low_confidence' | 'single_source'
  field: string
  description: string
  severity: 'low' | 'medium' | 'high'
  providers?: string[]
}

/**
 * Context metadata for tracking and optimization
 */
export interface ContextMetadata {
  createdAt: Date
  lastUpdated: Date
  version: number
  
  // Usage tracking
  accessCount: number
  lastAccessTime: Date
  
  // Provider contribution tracking
  contributingProviders: string[]
  primaryProvider: string
  
  // Cache information
  cacheKey: string
  cacheTtl?: number
  cacheHits: number
  
  // Context flags
  flags: ContextFlag[]
  
  // Performance metrics
  performance: ContextPerformance
}

export interface ContextFlag {
  type: 'incomplete' | 'experimental' | 'deprecated' | 'premium' | 'adult_content' | 'region_locked'
  description?: string
  timestamp: Date
  provider?: string
}

export interface ContextPerformance {
  fetchTime: number // milliseconds to fetch data
  aggregationTime: number // milliseconds to aggregate data
  providerResponseTimes: Record<string, number>
  totalProviderCalls: number
  cachedResponses: number
}

/**
 * Context resolution strategies
 */
export enum ContextResolutionStrategy {
  FIRST_AVAILABLE = 'first_available',
  BEST_QUALITY = 'best_quality',
  MOST_RECENT = 'most_recent',
  HIGHEST_RATED = 'highest_rated',
  PROVIDER_PRIORITY = 'provider_priority',
  WEIGHTED_AVERAGE = 'weighted_average',
  CONSENSUS = 'consensus'
}

/**
 * Context builder for creating enhanced media contexts
 */
export interface ContextBuilder {
  setBaseContext(id: string, type: ContentType, title: string): ContextBuilder
  addExternalId(source: string, id: string | number): ContextBuilder
  addProviderInfo(provider: string, sourceId: string | number, lastUpdated?: Date): ContextBuilder
  addMetadata(metadata: Partial<MediaMetadata>): ContextBuilder
  addImages(images: ImageVariation[]): ContextBuilder
  addRatings(ratings: RatingSource[]): ContextBuilder
  addPeople(cast: Person[], crew: Person[]): ContextBuilder
  setResolutionStrategy(strategy: ContextResolutionStrategy): ContextBuilder
  build(): EnhancedMediaContext
}

/**
 * Context validation results
 */
export interface ContextValidationResult {
  valid: boolean
  errors: ContextValidationError[]
  warnings: ContextValidationWarning[]
  score: number // 0-100 quality score
  suggestions: ContextSuggestion[]
}

export interface ContextValidationError {
  field: string
  message: string
  severity: 'critical' | 'major' | 'minor'
  suggestedFix?: string
}

export interface ContextValidationWarning {
  field: string
  message: string
  impact: 'high' | 'medium' | 'low'
  suggestion?: string
}

export interface ContextSuggestion {
  type: 'enhancement' | 'optimization' | 'correction'
  description: string
  provider?: string
  implementation?: string
}

/**
 * Context search and filtering
 */
export interface ContextSearchFilter {
  providers?: string[]
  contentTypes?: ContentType[]
  dateRange?: {
    from: Date
    to: Date
  }
  qualityThreshold?: number
  includeIncomplete?: boolean
  includeStale?: boolean
  maxAge?: number // in hours
}

export interface ContextSearchResult {
  contexts: EnhancedMediaContext[]
  totalCount: number
  searchTime: number
  filters: ContextSearchFilter
  aggregations?: {
    providerCounts: Record<string, number>
    typeCounts: Record<ContentType, number>
    qualityDistribution: Record<string, number>
  }
}

/**
 * Context update strategies
 */
export interface ContextUpdateStrategy {
  updateType: 'incremental' | 'full_refresh' | 'merge' | 'replace'
  conflictResolution: 'prefer_newer' | 'prefer_higher_quality' | 'prefer_provider' | 'manual'
  preserveUserData: boolean
  validateAfterUpdate: boolean
  notifyOnChange: boolean
}

/**
 * Context merge operations
 */
export interface ContextMergeOperation {
  sourceContext: EnhancedMediaContext
  targetContext: EnhancedMediaContext
  strategy: ContextUpdateStrategy
  fieldsToMerge?: string[]
  fieldsToIgnore?: string[]
}

export interface ContextMergeResult {
  mergedContext: EnhancedMediaContext
  conflicts: ContextConflict[]
  changes: ContextChange[]
  success: boolean
  errors?: string[]
}

export interface ContextConflict {
  field: string
  sourceValue: unknown
  targetValue: unknown
  resolution: 'source' | 'target' | 'merged' | 'manual'
  reason: string
}

export interface ContextChange {
  field: string
  oldValue: unknown
  newValue: unknown
  changeType: 'added' | 'updated' | 'removed'
  provider: string
}

/**
 * Default context configurations
 */
export const DEFAULT_CONTEXT_METADATA: Partial<ContextMetadata> = {
  version: 1,
  accessCount: 0,
  contributingProviders: [],
  cacheHits: 0,
  flags: [],
  performance: {
    fetchTime: 0,
    aggregationTime: 0,
    providerResponseTimes: {},
    totalProviderCalls: 0,
    cachedResponses: 0
  }
}

export const DEFAULT_DATA_QUALITY_METRICS: Partial<DataQualityMetrics> = {
  completeness: 0,
  accuracy: 0,
  freshness: 0,
  consistency: 0,
  providerCount: 0,
  qualityFlags: []
}