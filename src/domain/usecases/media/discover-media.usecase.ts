import { MediaReference, MediaType } from '@/domain/entities/media'
import { IMediaRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export type DiscoveryType = 'popular' | 'trending' | 'top_rated' | 'now_playing' | 'upcoming'

export interface DiscoverMediaRequest {
  type: DiscoveryType
  mediaType?: MediaType
  page?: number
  timeWindow?: 'day' | 'week' // For trending
  userId?: string
}

export interface DiscoverMediaResponse {
  results: MediaReference[]
  total_pages?: number
  page: number
  type: DiscoveryType
  mediaType?: MediaType
}

/**
 * Use case for discovering media content through various discovery methods
 * Handles popular, trending, top-rated, now playing, and upcoming content
 */
export class DiscoverMediaUseCase {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async execute(request: DiscoverMediaRequest): Promise<DiscoverMediaResponse> {
    const { type, mediaType, page = 1, timeWindow = 'week', userId } = request

    const startTime = Date.now()

    try {
      // Log discovery request
      this.loggingService.logUserAction('discover_media', userId || 'anonymous', {
        discoveryType: type,
        mediaType,
        page,
        timeWindow
      })

      let results: MediaReference[] = []
      let totalPages: number | undefined

      // Route to appropriate discovery method
      switch (type) {
        case 'popular':
          if (!mediaType) {
            throw new Error('Media type is required for popular discovery')
          }
          const popularResult = await this.mediaRepository.getPopular(mediaType, page)
          results = popularResult.results
          totalPages = popularResult.total_pages
          break

        case 'trending':
          results = await this.mediaRepository.getTrending(timeWindow, mediaType)
          totalPages = 1 // Trending typically returns a single page
          break

        case 'top_rated':
          if (!mediaType) {
            throw new Error('Media type is required for top rated discovery')
          }
          const topRatedResult = await this.mediaRepository.getTopRated(mediaType, page)
          results = topRatedResult.results
          totalPages = topRatedResult.total_pages
          break

        case 'now_playing':
          const nowPlayingResult = await this.mediaRepository.getNowPlaying(page)
          results = nowPlayingResult.results
          totalPages = nowPlayingResult.total_pages
          break

        case 'upcoming':
          const upcomingResult = await this.mediaRepository.getUpcoming(page)
          results = upcomingResult.results
          totalPages = upcomingResult.total_pages
          break

        default:
          throw new Error(`Unknown discovery type: ${type}`)
      }

      // Log successful discovery
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('discover_media', duration, {
        discoveryType: type,
        mediaType,
        page,
        timeWindow,
        results_count: results.length,
        userId
      })

      this.loggingService.info('Media discovery completed successfully', {
        discoveryType: type,
        mediaType,
        page,
        timeWindow,
        results_count: results.length,
        userId,
        duration_ms: duration
      })

      return {
        results,
        total_pages: totalPages,
        page,
        type,
        mediaType
      }
    } catch (error) {
      // Log discovery error
      this.loggingService.error(
        'Media discovery failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          discoveryType: type,
          mediaType,
          page,
          timeWindow,
          userId,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }
}