import { MediaEntity, MediaWithStreams } from '@/domain/entities/media'
import { IMediaRepository } from '@/domain/repositories'
import { ILoggingService } from '@/domain/services'

export interface GetMediaDetailsRequest {
  mediaId: string
  includeStreams?: boolean
  userId?: string
}

export interface GetMediaDetailsResponse {
  media: MediaEntity | MediaWithStreams
  cached: boolean
}

/**
 * Use case for getting detailed media information
 * Handles caching, stream inclusion, and error handling
 */
export class GetMediaDetailsUseCase {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly loggingService: ILoggingService
  ) {}

  async execute(request: GetMediaDetailsRequest): Promise<GetMediaDetailsResponse> {
    const { mediaId, includeStreams = false, userId } = request

    // Validate input
    if (!mediaId.trim()) {
      throw new Error('Media ID cannot be empty')
    }

    const startTime = Date.now()

    try {
      // Log media access
      this.loggingService.logUserAction('view_media', userId || 'anonymous', {
        mediaId,
        includeStreams
      })

      let media: MediaEntity | MediaWithStreams | null

      // Get media with or without streams
      if (includeStreams) {
        media = await this.mediaRepository.findWithStreams(mediaId)
      } else {
        media = await this.mediaRepository.findById(mediaId)
      }

      // Handle not found
      if (!media) {
        this.loggingService.warn('Media not found', {
          mediaId,
          userId,
          includeStreams
        })
        throw new Error(`Media with ID ${mediaId} not found`)
      }

      // Log successful retrieval
      const duration = Date.now() - startTime
      this.loggingService.logPerformance('get_media_details', duration, {
        mediaId,
        mediaType: media.type,
        includeStreams,
        userId
      })

      this.loggingService.info('Media details retrieved successfully', {
        mediaId,
        mediaTitle: media.title,
        mediaType: media.type,
        includeStreams,
        userId,
        duration_ms: duration
      })

      return {
        media,
        cached: false // Will be determined by repository implementation
      }
    } catch (error) {
      // Log error
      this.loggingService.error(
        'Failed to get media details',
        error instanceof Error ? error : new Error(String(error)),
        {
          mediaId,
          includeStreams,
          userId,
          duration_ms: Date.now() - startTime
        }
      )

      throw error
    }
  }
}