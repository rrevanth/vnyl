import { IProvider } from '@/src/domain/providers/base/provider.interface'
import { CatalogItem } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'

/**
 * Recommendation parameters
 */
export interface RecommendationParams {
  /** Page number for pagination (1-based, defaults to 1) */
  readonly page?: number

  /** Number of results per page (defaults to provider default) */
  readonly limit?: number

  /** Include adult content in results (defaults to false) */
  readonly includeAdult?: boolean

  /** Language preference for results (ISO 639-1 code) */
  readonly language?: string

  /** Region preference for results (ISO 3166-1 code) */
  readonly region?: string

  /** Minimum vote average filter */
  readonly minVoteAverage?: number

  /** Minimum vote count filter */
  readonly minVoteCount?: number

  /** Release date range filter */
  readonly releaseDateRange?: {
    readonly from?: Date
    readonly to?: Date
  }

  /** Genre filters to include */
  readonly includeGenres?: string[]

  /** Genre filters to exclude */
  readonly excludeGenres?: string[]
}

/**
 * Recommendation algorithm types
 */
export enum RecommendationAlgorithm {
  /** Content-based filtering using item features */
  CONTENT_BASED = 'content_based',
  
  /** Collaborative filtering using user behavior */
  COLLABORATIVE = 'collaborative',
  
  /** Popularity-based recommendations */
  POPULARITY = 'popularity',
  
  /** Similar content based on metadata */
  SIMILAR = 'similar',
  
  /** Trending content */
  TRENDING = 'trending',
  
  /** Provider's hybrid algorithm */
  HYBRID = 'hybrid'
}

/**
 * Recommendation result metadata
 */
export interface RecommendationMetadata {
  /** Algorithm used for recommendations */
  readonly algorithm: RecommendationAlgorithm

  /** Source item that generated recommendations */
  readonly sourceItem: CatalogItem

  /** Confidence score for recommendations quality (0-1) */
  readonly confidenceScore: number

  /** Recommendation generation time in milliseconds */
  readonly generationTime: number

  /** Whether results were returned from cache */
  readonly fromCache: boolean

  /** Diversity score of recommendations (0-1) */
  readonly diversityScore?: number

  /** Explanation of why items were recommended */
  readonly explanations?: Record<string, string>

  /** Provider-specific metadata */
  readonly providerMetadata?: Record<string, any>
}

/**
 * Recommendation result
 */
export interface RecommendationResult {
  /** Catalog containing recommended items */
  readonly catalog: Catalog

  /** Recommendation metadata */
  readonly metadata: RecommendationMetadata

  /** Timestamp when recommendations were generated */
  readonly generatedAt: Date
}

/**
 * Recommendations provider interface
 * Providers with this capability can generate content recommendations based on catalog items
 * Enables personalized content discovery and similar content suggestions
 */
export interface IRecommendationsProvider extends IProvider {
  /**
   * Get recommendations based on a catalog item
   * Returns similar or related content that users might be interested in
   * 
   * @param catalogItem - The source item to base recommendations on
   * @param params - Optional parameters to customize recommendations
   * @returns Promise that resolves to recommendation results
   * 
   * @example
   * ```typescript
   * const result = await provider.getRecommendations(movieItem, {
   *   limit: 20,
   *   minVoteAverage: 7.0,
   *   excludeGenres: ['Horror']
   * })
   * 
   * console.log(`Found ${result.catalog.items.length} recommendations`)
   * console.log(`Algorithm: ${result.metadata.algorithm}`)
   * console.log(`Confidence: ${result.metadata.confidenceScore}`)
   * 
   * result.catalog.items.forEach(item => {
   *   const explanation = result.metadata.explanations?.[item.id]
   *   console.log(`${item.title}: ${explanation || 'Similar content'}`)
   * })
   * ```
   */
  getRecommendations(
    catalogItem: CatalogItem,
    params?: RecommendationParams
  ): Promise<RecommendationResult>

  /**
   * Get recommendations using a specific algorithm
   * Allows consumers to request recommendations using a particular approach
   * 
   * @param catalogItem - The source item to base recommendations on
   * @param algorithm - The recommendation algorithm to use
   * @param params - Optional parameters to customize recommendations
   * @returns Promise that resolves to recommendation results
   * 
   * @example
   * ```typescript
   * const contentBased = await provider.getRecommendationsByAlgorithm(
   *   movieItem,
   *   RecommendationAlgorithm.CONTENT_BASED,
   *   { limit: 10 }
   * )
   * 
   * const trending = await provider.getRecommendationsByAlgorithm(
   *   movieItem,
   *   RecommendationAlgorithm.TRENDING,
   *   { limit: 10 }
   * )
   * ```
   */
  getRecommendationsByAlgorithm(
    catalogItem: CatalogItem,
    algorithm: RecommendationAlgorithm,
    params?: RecommendationParams
  ): Promise<RecommendationResult>

  /**
   * Get similar items to a catalog item
   * Finds content that is similar based on metadata, genre, cast, etc.
   * 
   * @param catalogItem - The source item to find similar content for
   * @param params - Optional parameters to customize results
   * @returns Promise that resolves to similar content results
   * 
   * @example
   * ```typescript
   * const similar = await provider.getSimilarItems(tvSeriesItem, {
   *   limit: 15,
   *   minVoteCount: 100
   * })
   * 
   * console.log(`Found ${similar.catalog.items.length} similar items`)
   * ```
   */
  getSimilarItems(
    catalogItem: CatalogItem,
    params?: RecommendationParams
  ): Promise<RecommendationResult>

  /**
   * Check if recommendations are supported for a given media type
   * Determines if the provider can generate recommendations for specific content types
   * 
   * @param mediaType - The media type to check support for
   * @returns Whether recommendations are supported for this media type
   * 
   * @example
   * ```typescript
   * if (provider.supportsRecommendationsForMediaType(MediaType.MOVIE)) {
   *   const recs = await provider.getRecommendations(movieItem)
   * }
   * ```
   */
  supportsRecommendationsForMediaType(mediaType: MediaType): boolean

  /**
   * Get supported recommendation algorithms
   * Returns the list of algorithms this provider can use for recommendations
   * 
   * @returns Array of supported recommendation algorithms
   * 
   * @example
   * ```typescript
   * const algorithms = provider.getSupportedAlgorithms()
   * console.log('Available algorithms:', algorithms)
   * 
   * if (algorithms.includes(RecommendationAlgorithm.CONTENT_BASED)) {
   *   const recs = await provider.getRecommendationsByAlgorithm(
   *     item,
   *     RecommendationAlgorithm.CONTENT_BASED
   *   )
   * }
   * ```
   */
  getSupportedAlgorithms(): RecommendationAlgorithm[]

  /**
   * Check if explanations are provided with recommendations
   * Determines if the provider can explain why items were recommended
   * 
   * @returns Whether recommendation explanations are available
   * 
   * @example
   * ```typescript
   * if (provider.providesExplanations()) {
   *   const result = await provider.getRecommendations(item)
   *   Object.entries(result.metadata.explanations || {}).forEach(([itemId, explanation]) => {
   *     console.log(`${itemId}: ${explanation}`)
   *   })
   * }
   * ```
   */
  providesExplanations(): boolean

  /**
   * Get the maximum number of recommendations supported per request
   * Helps UI set appropriate limits for recommendation requests
   * 
   * @returns Maximum number of recommendations per request
   * 
   * @example
   * ```typescript
   * const maxRecs = provider.getMaxRecommendationsPerRequest()
   * const safeLimit = Math.min(requestedLimit, maxRecs)
   * ```
   */
  getMaxRecommendationsPerRequest(): number

  /**
   * Check if the provider supports recommendation filtering
   * Determines if advanced filtering options are available
   * 
   * @returns Whether recommendation filtering is supported
   * 
   * @example
   * ```typescript
   * if (provider.supportsRecommendationFiltering()) {
   *   const recs = await provider.getRecommendations(item, {
   *     minVoteAverage: 8.0,
   *     excludeGenres: ['Horror', 'Thriller']
   *   })
   * }
   * ```
   */
  supportsRecommendationFiltering(): boolean

  /**
   * Validate if recommendations can be generated for a catalog item
   * Performs pre-flight checks without making expensive API calls
   * 
   * @param catalogItem - The catalog item to validate
   * @returns Whether recommendations can be generated for this item
   * 
   * @example
   * ```typescript
   * if (provider.canGenerateRecommendations(item)) {
   *   const recs = await provider.getRecommendations(item)
   * } else {
   *   console.log('Recommendations not available for this item')
   * }
   * ```
   */
  canGenerateRecommendations(catalogItem: CatalogItem): boolean

  /**
   * Get recommendation confidence threshold
   * Returns the minimum confidence score used for recommendation quality
   * 
   * @returns Minimum confidence threshold (0-1)
   * 
   * @example
   * ```typescript
   * const threshold = provider.getConfidenceThreshold()
   * console.log(`Recommendations have at least ${threshold * 100}% confidence`)
   * ```
   */
  getConfidenceThreshold(): number
}