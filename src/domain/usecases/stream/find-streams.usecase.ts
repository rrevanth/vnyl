import { StreamEntity, StreamSearchCriteria } from '@/domain/entities/stream'
import { IStreamRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface FindStreamsRequest extends StreamSearchCriteria {
  userId?: string
}

export interface FindStreamsResponse {
  streams: StreamEntity[]
  criteria: StreamSearchCriteria
  searchTime: number
}

/**
 * Use case for finding available streams for media content
 * Handles stream discovery across multiple addons with quality filtering
 */
export class FindStreamsUseCase {
  constructor(
    private readonly streamRepository: IStreamRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async execute(request: FindStreamsRequest): Promise<FindStreamsResponse> {
    const { userId, ...criteria } = request

    // Validate input
    if (!criteria.media_id.trim()) {
      throw new Error('Media ID cannot be empty')
    }

    if (!criteria.media_type) {
      throw new Error('Media type is required')
    }

    // For series, validate season/episode
    if (criteria.media_type === 'series') {
      if (criteria.season === undefined || criteria.season < 1) {
        throw new Error('Valid season number is required for series')
      }
      if (criteria.episode === undefined || criteria.episode < 1) {
        throw new Error('Valid episode number is required for series')
      }
    }

    const startTime = Date.now()

    try {
      // Log stream search
      this.loggingService.logUserAction('search_streams', userId || 'anonymous', {
        mediaId: criteria.media_id,
        mediaType: criteria.media_type,
        season: criteria.season,
        episode: criteria.episode,
        qualityPreference: criteria.quality_preference
      })

      const streams = await this.streamRepository.findStreamsForMedia(criteria)

      // Sort streams by quality and availability
      const sortedStreams = this.sortStreamsByPreference(streams, criteria)

      // Log successful search
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('find_streams', duration, {
        mediaId: criteria.media_id,
        mediaType: criteria.media_type,
        season: criteria.season,
        episode: criteria.episode,
        streamsFound: sortedStreams.length,
        userId
      })

      this.loggingService.info('Streams found successfully', {
        mediaId: criteria.media_id,
        mediaType: criteria.media_type,
        season: criteria.season,
        episode: criteria.episode,
        streamsFound: sortedStreams.length,
        userId,
        duration_ms: duration
      })

      return {
        streams: sortedStreams,
        criteria,
        searchTime: duration
      }
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to find streams',
        error instanceof Error ? error : new Error(String(error)),
        {
          mediaId: criteria.media_id,
          mediaType: criteria.media_type,
          season: criteria.season,
          episode: criteria.episode,
          userId,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }

  private sortStreamsByPreference(streams: StreamEntity[], criteria: StreamSearchCriteria): StreamEntity[] {
    return streams.sort((a, b) => {
      // Primary sort: availability (higher is better)
      if (a.availability !== b.availability) {
        return b.availability - a.availability
      }

      // Secondary sort: quality preference
      if (criteria.quality_preference && criteria.quality_preference.length > 0) {
        const aQualityIndex = criteria.quality_preference.indexOf(a.quality)
        const bQualityIndex = criteria.quality_preference.indexOf(b.quality)
        
        if (aQualityIndex !== -1 && bQualityIndex !== -1) {
          return aQualityIndex - bQualityIndex
        }
        
        if (aQualityIndex !== -1) return -1
        if (bQualityIndex !== -1) return 1
      }

      // Tertiary sort: file size (smaller is often better for streaming)
      if (a.size_gb && b.size_gb) {
        return a.size_gb - b.size_gb
      }

      return 0
    })
  }
}