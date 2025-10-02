import { MediaReference } from '@/domain/entities/media'
import { IMediaRepository, IUserRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface GetMediaRecommendationsRequest {
  mediaId: string
  userId?: string
  page?: number
  includeUserPreferences?: boolean
}

export interface GetMediaRecommendationsResponse {
  recommendations: MediaReference[]
  total_pages: number
  page: number
  source: 'tmdb' | 'user_preferences' | 'hybrid'
}

/**
 * Use case for getting media recommendations
 * Handles both algorithmic and user-preference-based recommendations
 */
export class GetMediaRecommendationsUseCase {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly userRepository: IUserRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async execute(request: GetMediaRecommendationsRequest): Promise<GetMediaRecommendationsResponse> {
    const { mediaId, userId, page = 1, includeUserPreferences = true } = request

    // Validate input
    if (!mediaId.trim()) {
      throw new Error('Media ID cannot be empty')
    }

    const startTime = Date.now()

    try {
      // Log recommendation request
      this.loggingService.logUserAction('get_recommendations', userId || 'anonymous', {
        mediaId,
        page,
        includeUserPreferences
      })

      let recommendations: MediaReference[] = []
      let totalPages = 0
      let source: 'tmdb' | 'user_preferences' | 'hybrid' = 'tmdb'

      // Get basic recommendations from TMDB
      const tmdbRecommendations = await this.mediaRepository.getRecommendations(mediaId, page)
      recommendations = tmdbRecommendations.results
      totalPages = tmdbRecommendations.total_pages

      // If user is provided and preferences should be included, enhance with user data
      if (userId && includeUserPreferences) {
        try {
          const user = await this.userRepository.findById(userId)
          if (user) {
            // Filter recommendations based on user preferences
            recommendations = await this.filterByUserPreferences(recommendations, user.content_preferences)
            source = 'hybrid'

            this.loggingService.debug('Applied user preference filtering to recommendations', {
              mediaId,
              userId,
              originalCount: tmdbRecommendations.results.length,
              filteredCount: recommendations.length
            })
          }
        } catch (error) {
          // Log but don't fail if user preferences can't be loaded
          this.loggingService.warn('Failed to load user preferences for recommendations', {
            mediaId,
            userId,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }

      // Log successful retrieval
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('get_media_recommendations', duration, {
        mediaId,
        userId,
        page,
        recommendations_count: recommendations.length,
        source
      })

      this.loggingService.info('Media recommendations retrieved successfully', {
        mediaId,
        userId,
        page,
        recommendations_count: recommendations.length,
        source,
        duration_ms: duration
      })

      return {
        recommendations,
        total_pages: totalPages,
        page,
        source
      }
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to get media recommendations',
        error instanceof Error ? error : new Error(String(error)),
        {
          mediaId,
          userId,
          page,
          includeUserPreferences,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }

  private async filterByUserPreferences(
    recommendations: MediaReference[],
    preferences: {
      favorite_genres: string[]
      blocked_genres: string[]
      favorite_languages: string[]
      mature_content: boolean
    }
  ): Promise<MediaReference[]> {
    // This is a simplified filtering example
    // In a real implementation, you would need genre and language data
    return recommendations.filter(media => {
      // Filter out content that doesn't match preferences
      // This would require additional media metadata
      return true // Placeholder implementation
    })
  }
}