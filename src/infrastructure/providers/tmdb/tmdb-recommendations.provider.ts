/**
 * TMDB Recommendations Provider
 * 
 * Implementation for The Movie Database (TMDB) recommendations enrichment
 * Provides recommendations and similar content following clean architecture principles
 */

import { 
  IRecommendationsProvider, 
  RecommendationParams, 
  RecommendationResult, 
  RecommendationMetadata, 
  RecommendationAlgorithm 
} from '@/src/domain/providers/recommendations/recommendations-provider.interface'
import { CatalogItem, MovieCatalogItem, TVCatalogItem, CatalogItemUtils } from '@/src/domain/entities/media/catalog-item.entity'
import { Catalog } from '@/src/domain/entities/media/catalog.entity'
import { MediaType } from '@/src/domain/entities/media/content-types'
import { ProviderCapability } from '@/src/domain/entities/context/content-context.entity'
import { ITMDBService } from '@/src/infrastructure/api/tmdb/tmdb.service'
import { ILoggingService } from '@/src/domain/services/logging.service.interface'
import type { TMDBMovieDetails } from '@/src/infrastructure/api/tmdb/endpoints/types/movie.endpoints'
import type { TMDBTVShowDetails } from '@/src/infrastructure/api/tmdb/endpoints/types/tv.endpoints'

export class TMDBRecommendationsProvider implements IRecommendationsProvider {
  public readonly id = 'tmdb-recommendations'
  public readonly name = 'TMDB Recommendations Provider'
  public readonly sourceId: string
  public readonly capabilities: ProviderCapability[] = [ProviderCapability.RECOMMENDATIONS]
  public readonly priority = 10

  constructor(
    private readonly tmdbService: ITMDBService,
    private readonly logger: ILoggingService,
    sourceId: string
  ) {
    this.sourceId = sourceId
  }

  async initialize(): Promise<void> {
    try {
      await this.tmdbService.initialize()
      this.logger.info('TMDB recommendations provider initialized successfully', {
        provider: 'tmdb_recommendations'
      })
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to initialize TMDB recommendations provider', errorInstance, {
        provider: 'tmdb_recommendations'
      })
      throw new Error(`TMDB recommendations provider initialization failed: ${errorInstance.message}`)
    }
  }

  /**
   * Get recommendations based on a catalog item
   * Implements IRecommendationsProvider.getRecommendations
   */
  async getRecommendations(
    catalogItem: CatalogItem,
    params?: RecommendationParams
  ): Promise<RecommendationResult> {
    return this.getRecommendationsByAlgorithm(
      catalogItem,
      RecommendationAlgorithm.HYBRID,
      params
    )
  }

  /**
   * Get recommendations using a specific algorithm
   * Implements IRecommendationsProvider.getRecommendationsByAlgorithm
   */
  async getRecommendationsByAlgorithm(
    catalogItem: CatalogItem,
    algorithm: RecommendationAlgorithm,
    params?: RecommendationParams
  ): Promise<RecommendationResult> {
    const startTime = Date.now()
    
    try {
      this.logger.info('Fetching recommendations by algorithm', {
        provider: 'tmdb_recommendations',
        mediaId: catalogItem.id,
        mediaType: catalogItem.mediaType,
        algorithm
      })

      const tmdbId = this.extractTmdbId(catalogItem.id)
      
      let recommendationsData: { page: number; results: any[]; total_pages: number; total_results: number } | undefined
      let similarData: { page: number; results: any[]; total_pages: number; total_results: number } | undefined

      // Fetch recommendations and similar content from TMDB
      if (catalogItem.mediaType === MediaType.MOVIE) {
        const response: TMDBMovieDetails = await this.tmdbService.client.movies.getDetails(tmdbId, {
          append_to_response: 'recommendations,similar'
        })
        recommendationsData = response.recommendations
        similarData = response.similar
      } else if (catalogItem.mediaType === MediaType.TV_SERIES) {
        const response: TMDBTVShowDetails = await this.tmdbService.client.tv.getDetails(tmdbId, {
          append_to_response: 'recommendations,similar'
        })
        recommendationsData = response.recommendations
        similarData = response.similar
      } else {
        throw new Error(`Unsupported media type for recommendations: ${catalogItem.mediaType}`)
      }

      // Select data based on algorithm
      let resultsData: { page: number; results: any[]; total_pages: number; total_results: number }
      let algorithmUsed: RecommendationAlgorithm

      switch (algorithm) {
        case RecommendationAlgorithm.SIMILAR:
          resultsData = similarData || { page: 1, results: [], total_pages: 1, total_results: 0 }
          algorithmUsed = RecommendationAlgorithm.SIMILAR
          break
        case RecommendationAlgorithm.CONTENT_BASED:
          // Use recommendations as they're more content-based
          resultsData = recommendationsData || { page: 1, results: [], total_pages: 1, total_results: 0 }
          algorithmUsed = RecommendationAlgorithm.CONTENT_BASED
          break
        case RecommendationAlgorithm.HYBRID:
        default:
          // Combine both sources, prioritize recommendations
          const recResults = recommendationsData?.results || []
          const simResults = similarData?.results || []
          
          // Take top results from both, deduplicating by ID
          const seenIds = new Set<number>()
          const hybridResults: any[] = []
          
          // Add recommendations first
          for (const item of recResults.slice(0, 10)) {
            if (!seenIds.has(item.id)) {
              hybridResults.push({ ...item, _source: 'recommendations' })
              seenIds.add(item.id)
            }
          }
          
          // Add similar items to fill gaps
          for (const item of simResults.slice(0, 10)) {
            if (!seenIds.has(item.id) && hybridResults.length < 20) {
              hybridResults.push({ ...item, _source: 'similar' })
              seenIds.add(item.id)
            }
          }

          resultsData = {
            page: 1,
            results: hybridResults,
            total_pages: 1,
            total_results: hybridResults.length
          }
          algorithmUsed = RecommendationAlgorithm.HYBRID
          break
      }

      // Apply filters if provided
      let filteredResults = resultsData.results
      if (params) {
        filteredResults = this.applyFilters(filteredResults, params)
      }

      // Limit results
      const limit = params?.limit || 20
      const limitedResults = filteredResults.slice(0, limit)

      // Transform to CatalogItems
      const recommendedItems = this.transformToCatalogItems(limitedResults, catalogItem.mediaType)

      // Create catalog
      const catalog: Catalog = {
        id: `recommendations-${catalogItem.id}-${algorithm}-${Date.now()}`,
        name: `${this.getAlgorithmDisplayName(algorithmUsed)} for "${catalogItem.title}"`,
        mediaType: catalogItem.mediaType,
        items: recommendedItems,
        pagination: {
          page: 1,
          totalItems: limitedResults.length,
          hasMore: false
        },
        catalogContext: {
          catalogId: `recommendations-${catalogItem.id}-${algorithm}`,
          catalogName: `${this.getAlgorithmDisplayName(algorithmUsed)} for "${catalogItem.title}"`,
          catalogType: 'recommendations',
          providerId: this.id,
          providerName: this.name,
          pageInfo: {
            currentPage: 1,
            pageSize: recommendedItems.length,
            hasMorePages: false
          },
          lastFetchAt: new Date(),
          requestId: `rec-${Date.now()}`
        },
        metadata: {
          fetchTime: Date.now() - startTime,
          cacheHit: false,
          itemCount: recommendedItems.length
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Create metadata
      const metadata: RecommendationMetadata = {
        algorithm: algorithmUsed,
        sourceItem: catalogItem,
        confidenceScore: this.calculateConfidenceScore(limitedResults, algorithmUsed),
        generationTime: Date.now() - startTime,
        fromCache: false,
        diversityScore: this.calculateDiversityScore(limitedResults),
        explanations: this.generateExplanations(limitedResults, catalogItem, algorithmUsed),
        providerMetadata: {
          tmdb_recommendations_count: recommendationsData?.results.length || 0,
          tmdb_similar_count: similarData?.results.length || 0,
          algorithm_used: algorithmUsed,
          filters_applied: !!params,
          provider: 'tmdb'
        }
      }

      const result: RecommendationResult = {
        catalog,
        metadata,
        generatedAt: new Date()
      }

      this.logger.info('Successfully fetched recommendations', {
        provider: 'tmdb_recommendations',
        mediaId: catalogItem.id,
        algorithm: algorithmUsed,
        resultCount: recommendedItems.length,
        confidenceScore: metadata.confidenceScore,
        generationTime: metadata.generationTime
      })

      return result

    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error))
      this.logger.error('Failed to fetch recommendations', errorInstance, {
        provider: 'tmdb_recommendations',
        mediaId: catalogItem.id,
        algorithm
      })
      throw errorInstance
    }
  }

  /**
   * Get similar items to a catalog item
   * Implements IRecommendationsProvider.getSimilarItems
   */
  async getSimilarItems(
    catalogItem: CatalogItem,
    params?: RecommendationParams
  ): Promise<RecommendationResult> {
    return this.getRecommendationsByAlgorithm(
      catalogItem,
      RecommendationAlgorithm.SIMILAR,
      params
    )
  }

  /**
   * Check if recommendations are supported for a given media type
   * Implements IRecommendationsProvider.supportsRecommendationsForMediaType
   */
  supportsRecommendationsForMediaType(mediaType: MediaType): boolean {
    return mediaType === MediaType.MOVIE || mediaType === MediaType.TV_SERIES
  }

  /**
   * Get supported recommendation algorithms
   * Implements IRecommendationsProvider.getSupportedAlgorithms
   */
  getSupportedAlgorithms(): RecommendationAlgorithm[] {
    return [
      RecommendationAlgorithm.HYBRID,
      RecommendationAlgorithm.SIMILAR,
      RecommendationAlgorithm.CONTENT_BASED
    ]
  }

  /**
   * Check if explanations are provided with recommendations
   * Implements IRecommendationsProvider.providesExplanations
   */
  providesExplanations(): boolean {
    return true
  }

  /**
   * Get the maximum number of recommendations supported per request
   * Implements IRecommendationsProvider.getMaxRecommendationsPerRequest
   */
  getMaxRecommendationsPerRequest(): number {
    return 50
  }

  /**
   * Check if the provider supports recommendation filtering
   * Implements IRecommendationsProvider.supportsRecommendationFiltering
   */
  supportsRecommendationFiltering(): boolean {
    return true
  }

  /**
   * Validate if recommendations can be generated for a catalog item
   * Implements IRecommendationsProvider.canGenerateRecommendations
   */
  canGenerateRecommendations(catalogItem: CatalogItem): boolean {
    return this.supportsRecommendationsForMediaType(catalogItem.mediaType) &&
           catalogItem.id.includes('tmdb') &&
           this.canExtractTmdbId(catalogItem.id)
  }

  /**
   * Get recommendation confidence threshold
   * Implements IRecommendationsProvider.getConfidenceThreshold
   */
  getConfidenceThreshold(): number {
    return 0.6
  }

  /**
   * Apply filters to recommendation results
   */
  private applyFilters(results: any[], params: RecommendationParams): any[] {
    let filtered = results

    // Apply vote average filter
    if (params.minVoteAverage !== undefined) {
      filtered = filtered.filter(item => item.vote_average >= params.minVoteAverage!)
    }

    // Apply vote count filter
    if (params.minVoteCount !== undefined) {
      filtered = filtered.filter(item => item.vote_count >= params.minVoteCount!)
    }

    // Apply release date range filter
    if (params.releaseDateRange) {
      filtered = filtered.filter(item => {
        const releaseDate = new Date(item.release_date || item.first_air_date)
        
        if (params.releaseDateRange!.from && releaseDate < params.releaseDateRange!.from) {
          return false
        }
        
        if (params.releaseDateRange!.to && releaseDate > params.releaseDateRange!.to) {
          return false
        }
        
        return true
      })
    }

    return filtered
  }

  /**
   * Transform TMDB response items to CatalogItems
   */
  private transformToCatalogItems(items: any[], mediaType: MediaType): CatalogItem[] {
    return items.map(item => {
      const contentContext = {
        catalogContext: {
          catalogId: 'recommendations',
          catalogName: 'Recommendations',
          catalogType: 'recommendations',
          providerId: this.id,
          providerName: this.name,
          pageInfo: {
            currentPage: 1,
            pageSize: 20,
            hasMorePages: false
          },
          lastFetchAt: new Date(),
          requestId: `item-${item.id}-${Date.now()}`
        },
        originalMediaType: mediaType,
        originalMediaId: item.id,
        providerId: this.id,
        providerName: this.name,
        positionInCatalog: 0,
        fetchedAt: new Date(),
        requestId: `item-${item.id}-${Date.now()}`
      }

      if (mediaType === MediaType.MOVIE) {
        return {
          id: CatalogItemUtils.createCatalogItemId(MediaType.MOVIE, item.id, 'tmdb'),
          mediaType: MediaType.MOVIE,
          title: item.title,
          originalTitle: item.original_title,
          overview: item.overview,
          releaseDate: item.release_date ? new Date(item.release_date) : undefined,
          posterUrl: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : undefined,
          backdropUrl: item.backdrop_path 
            ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` 
            : undefined,
          voteAverage: item.vote_average,
          voteCount: item.vote_count,
          popularity: item.popularity,
          originalLanguage: item.original_language,
          genres: [],
          originalMediaType: MediaType.MOVIE,
          contentContext,
          externalIds: { tmdb_id: item.id },
          hasDetailedInfo: false,
          isAdult: item.adult,
          createdAt: new Date(),
          updatedAt: new Date()
        } as MovieCatalogItem
      } else {
        return {
          id: CatalogItemUtils.createCatalogItemId(MediaType.TV_SERIES, item.id, 'tmdb'),
          mediaType: MediaType.TV_SERIES,
          title: item.name,
          originalTitle: item.original_name,
          overview: item.overview,
          releaseDate: item.first_air_date ? new Date(item.first_air_date) : undefined,
          firstAirDate: item.first_air_date ? new Date(item.first_air_date) : undefined,
          posterUrl: item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
            : undefined,
          backdropUrl: item.backdrop_path 
            ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` 
            : undefined,
          voteAverage: item.vote_average,
          voteCount: item.vote_count,
          popularity: item.popularity,
          originalLanguage: item.original_language,
          originCountries: item.origin_country,
          genres: [],
          originalMediaType: MediaType.TV_SERIES,
          contentContext,
          externalIds: { tmdb_id: item.id },
          hasDetailedInfo: false,
          isAdult: item.adult,
          createdAt: new Date(),
          updatedAt: new Date()
        } as TVCatalogItem
      }
    })
  }

  /**
   * Calculate confidence score for recommendations
   */
  private calculateConfidenceScore(results: any[], algorithm: RecommendationAlgorithm): number {
    if (results.length === 0) return 0

    let totalScore = 0
    for (const item of results) {
      let score = 0.5 // Base score
      
      // Higher vote average = higher confidence
      if (item.vote_average && item.vote_average > 7) score += 0.2
      if (item.vote_average && item.vote_average > 8) score += 0.1
      
      // More votes = higher confidence
      if (item.vote_count && item.vote_count > 100) score += 0.1
      if (item.vote_count && item.vote_count > 500) score += 0.1
      
      // Algorithm-specific adjustments
      if (algorithm === RecommendationAlgorithm.HYBRID && item._source === 'recommendations') {
        score += 0.1 // Prefer TMDB recommendations in hybrid mode
      }
      
      totalScore += Math.min(score, 1.0)
    }

    return totalScore / results.length
  }

  /**
   * Calculate diversity score for recommendations
   */
  private calculateDiversityScore(results: any[]): number {
    if (results.length === 0) return 0

    // Simple diversity calculation based on genre variety
    const genres = new Set()
    const languages = new Set()
    
    for (const item of results) {
      if (item.genre_ids) {
        item.genre_ids.forEach((genreId: number) => genres.add(genreId))
      }
      if (item.original_language) {
        languages.add(item.original_language)
      }
    }

    // Normalize diversity score
    const genreDiversity = Math.min(genres.size / 10, 1) // Assume 10 is max reasonable genres
    const languageDiversity = Math.min(languages.size / 5, 1) // Assume 5 is max reasonable languages
    
    return (genreDiversity + languageDiversity) / 2
  }

  /**
   * Generate explanations for recommendations
   */
  private generateExplanations(
    results: any[], 
    sourceItem: CatalogItem, 
    algorithm: RecommendationAlgorithm
  ): Record<string, string> {
    const explanations: Record<string, string> = {}

    for (const item of results) {
      const itemId = CatalogItemUtils.createCatalogItemId(sourceItem.mediaType, item.id, 'tmdb')
      
      switch (algorithm) {
        case RecommendationAlgorithm.SIMILAR:
          explanations[itemId] = `Similar to "${sourceItem.title}" based on themes and style`
          break
        case RecommendationAlgorithm.CONTENT_BASED:
          explanations[itemId] = `Recommended based on your interest in "${sourceItem.title}"`
          break
        case RecommendationAlgorithm.HYBRID:
          if (item._source === 'recommendations') {
            explanations[itemId] = `Recommended for fans of "${sourceItem.title}"`
          } else {
            explanations[itemId] = `Similar themes and style to "${sourceItem.title}"`
          }
          break
        default:
          explanations[itemId] = `Related to "${sourceItem.title}"`
      }
    }

    return explanations
  }

  /**
   * Get display name for algorithm
   */
  private getAlgorithmDisplayName(algorithm: RecommendationAlgorithm): string {
    switch (algorithm) {
      case RecommendationAlgorithm.SIMILAR:
        return 'Similar Content'
      case RecommendationAlgorithm.CONTENT_BASED:
        return 'Recommended'
      case RecommendationAlgorithm.HYBRID:
        return 'Recommendations'
      default:
        return 'Related Content'
    }
  }

  /**
   * Check if TMDB ID can be extracted from catalog item ID
   */
  private canExtractTmdbId(catalogItemId: string): boolean {
    try {
      this.extractTmdbId(catalogItemId)
      return true
    } catch {
      return false
    }
  }

  /**
   * Extract TMDB ID from catalog item ID
   */
  private extractTmdbId(catalogItemId: string): number {
    const parts = catalogItemId.split('_')
    const tmdbId = parseInt(parts[parts.length - 1], 10)
    if (isNaN(tmdbId)) {
      throw new Error(`Invalid TMDB ID in catalog item: ${catalogItemId}`)
    }
    return tmdbId
  }
}